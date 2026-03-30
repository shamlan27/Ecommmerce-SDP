<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Recent orders
        $recentOrders = $user->orders()
            ->with('items.product.primaryImage')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Wishlist count
        $wishlistCount = $user->wishlists()->withCount('items')->get()->sum('items_count');

        // Recommended products (featured products not yet ordered)
        $orderedProductIds = $user->orders()
            ->with('items')
            ->get()
            ->flatMap(fn($order) => $order->items->pluck('product_id'))
            ->unique();

        $recommended = Product::with('primaryImage')
            ->where('is_active', true)
            ->where('is_featured', true)
            ->whereNotIn('id', $orderedProductIds)
            ->limit(8)
            ->get();

        // Stats
        $totalOrders = $user->orders()->count();
        $totalSpent = $user->orders()->where('payment_status', 'paid')->sum('total');
        $pendingOrders = $user->orders()->whereIn('status', ['pending', 'processing'])->count();
        $openTickets = $user->tickets()->whereIn('status', ['open', 'in_progress'])->count();

        return response()->json([
            'recent_orders' => $recentOrders,
            'recommended' => $recommended,
            'wishlist_count' => $wishlistCount,
            'stats' => [
                'total_orders' => $totalOrders,
                'total_spent' => round($totalSpent, 2),
                'pending_orders' => $pendingOrders,
                'open_tickets' => $openTickets,
            ],
        ]);
    }
}
