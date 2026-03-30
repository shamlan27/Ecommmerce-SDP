<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderTracking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = $request->user()->orders()
            ->with('items.product.primaryImage')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($orders);
    }

    public function show(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $order->load(['items.product.primaryImage', 'tracking']);

        return response()->json($order);
    }

    public function store(Request $request)
    {
        $request->validate([
            'shipping_name' => 'required|string|max:255',
            'shipping_address' => 'required|string',
            'shipping_city' => 'required|string|max:255',
            'shipping_state' => 'required|string|max:255',
            'shipping_zip' => 'required|string|max:20',
            'shipping_country' => 'sometimes|string|max:2',
            'shipping_phone' => 'nullable|string|max:20',
            'payment_method' => 'sometimes|string',
            'notes' => 'nullable|string',
        ]);

        $cartItems = $request->user()->cartItems()->with('product')->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty.'], 422);
        }

        // Check stock availability
        foreach ($cartItems as $item) {
            if ($item->product->stock_quantity < $item->quantity) {
                return response()->json([
                    'message' => "Insufficient stock for {$item->product->name}. Available: {$item->product->stock_quantity}",
                ], 422);
            }
        }

        $order = DB::transaction(function () use ($request, $cartItems) {
            $subtotal = $cartItems->sum(fn($item) => $item->product->price * $item->quantity);
            $tax = round($subtotal * 0.08, 2); // 8% tax
            $shippingCost = $subtotal >= 100 ? 0 : 9.99;
            $total = $subtotal + $tax + $shippingCost;

            $order = Order::create([
                'user_id' => $request->user()->id,
                'order_number' => Order::generateOrderNumber(),
                'status' => 'pending',
                'shipping_name' => $request->shipping_name,
                'shipping_address' => $request->shipping_address,
                'shipping_city' => $request->shipping_city,
                'shipping_state' => $request->shipping_state,
                'shipping_zip' => $request->shipping_zip,
                'shipping_country' => $request->input('shipping_country', 'US'),
                'shipping_phone' => $request->shipping_phone,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'shipping_cost' => $shippingCost,
                'total' => $total,
                'payment_method' => $request->input('payment_method', 'card'),
                'payment_status' => 'paid', // Mock payment
                'notes' => $request->notes,
            ]);

            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->product->price,
                    'total' => $item->product->price * $item->quantity,
                ]);

                // Decrease stock
                $item->product->decrement('stock_quantity', $item->quantity);
            }

            // Create initial tracking
            OrderTracking::create([
                'order_id' => $order->id,
                'status' => 'pending',
                'description' => 'Order placed successfully.',
                'tracked_at' => now(),
            ]);

            // Clear cart
            $request->user()->cartItems()->delete();

            return $order;
        });

        return response()->json($order->load('items'), 201);
    }

    public function tracking(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json($order->tracking);
    }
}
