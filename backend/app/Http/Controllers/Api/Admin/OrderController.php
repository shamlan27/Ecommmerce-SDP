<?php

namespace App\Http\Controllers\Api\Admin;

use App\Events\OrderTrackingUpdated;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderTracking;
use App\Services\LogisticsIntegrationService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(private readonly LogisticsIntegrationService $logistics)
    {
    }

    public function index(Request $request)
    {
        $query = Order::with(['user', 'items']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('user', fn($q2) => $q2->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
            });
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($orders);
    }

    public function show(Order $order)
    {
        return response()->json($order->load(['user', 'items.product', 'tracking']));
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
            'description' => 'nullable|string',
        ]);

        $order->update(['status' => $request->status]);

        $tracking = OrderTracking::create([
            'order_id' => $order->id,
            'status' => $request->status,
            'description' => $request->input('description', "Order status updated to {$request->status}."),
            'tracked_at' => now(),
        ]);

        broadcast(new OrderTrackingUpdated($order->fresh(), $tracking));

        // Update payment status if cancelled
        if ($request->status === 'cancelled') {
            $order->update(['payment_status' => 'refunded']);
        }

        if ($request->status === 'shipped') {
            $this->logistics->createShipment($order->fresh());
        }

        if (in_array($request->status, ['processing', 'shipped'], true)) {
            $this->logistics->syncTracking($order->fresh());
        }

        return response()->json($order->load('tracking'));
    }

    public function syncTracking(Order $order)
    {
        $entries = $this->logistics->syncTracking($order);

        return response()->json([
            'message' => 'Tracking sync completed.',
            'entries_synced' => count($entries),
            'tracking' => $order->fresh()->tracking,
        ]);
    }
}
