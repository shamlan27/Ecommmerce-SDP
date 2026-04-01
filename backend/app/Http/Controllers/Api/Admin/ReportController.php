<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    private function monthExpression(): string
    {
        return DB::connection()->getDriverName() === 'pgsql'
            ? "to_char(created_at, 'YYYY-MM')"
            : "strftime('%Y-%m', created_at)";
    }

    private function dayExpression(): string
    {
        return DB::connection()->getDriverName() === 'pgsql'
            ? "to_char(created_at, 'YYYY-MM-DD')"
            : "strftime('%Y-%m-%d', created_at)";
    }

    public function overview()
    {
        $totalRevenue = Order::where('payment_status', 'paid')->sum('total');
        $totalOrders = Order::count();
        $totalCustomers = User::where('role', 'customer')->count();
        $totalProducts = Product::count();
        $pendingOrders = Order::where('status', 'pending')->count();
        $lowStockProducts = Product::where('stock_quantity', '<', 10)->where('is_active', true)->count();

        // Monthly revenue (last 6 months)
        $monthExpr = $this->monthExpression();
        $monthlyRevenue = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', now()->subMonths(6))
            ->selectRaw("{$monthExpr} as month, SUM(total) as revenue, COUNT(*) as orders")
            ->groupBy(DB::raw($monthExpr))
            ->orderBy('month')
            ->get();

        // Top selling products
        $topProducts = Product::withCount(['reviews'])
            ->withSum('reviews', 'rating')
            ->orderBy('stock_quantity', 'asc') // Most sold = least stock
            ->limit(5)
            ->get();

        // Recent orders
        $recentOrders = Order::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'stats' => [
                'total_revenue' => round($totalRevenue, 2),
                'total_orders' => $totalOrders,
                'total_customers' => $totalCustomers,
                'total_products' => $totalProducts,
                'pending_orders' => $pendingOrders,
                'low_stock_products' => $lowStockProducts,
            ],
            'monthly_revenue' => $monthlyRevenue,
            'top_products' => $topProducts,
            'recent_orders' => $recentOrders,
        ]);
    }

    public function salesReport(Request $request)
    {
        $from = $request->input('from', now()->subMonth()->format('Y-m-d'));
        $to = $request->input('to', now()->format('Y-m-d'));
        $dayExpr = $this->dayExpression();

        $orders = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw("{$dayExpr} as date, SUM(total) as revenue, COUNT(*) as orders, SUM(subtotal) as subtotal, SUM(tax) as tax")
            ->groupBy(DB::raw($dayExpr))
            ->orderBy('date')
            ->get();

        $summary = [
            'total_revenue' => $orders->sum('revenue'),
            'total_orders' => $orders->sum('orders'),
            'average_order_value' => $orders->sum('orders') > 0 ? round($orders->sum('revenue') / $orders->sum('orders'), 2) : 0,
        ];

        return response()->json([
            'daily' => $orders,
            'summary' => $summary,
        ]);
    }
}
