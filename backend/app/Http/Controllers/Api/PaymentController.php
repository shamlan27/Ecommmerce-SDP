<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StripePaymentService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(private readonly StripePaymentService $stripe)
    {
    }

    public function createIntent(Request $request)
    {
        $request->validate([
            'currency' => 'sometimes|string|size:3',
        ]);

        if (!$this->stripe->isConfigured()) {
            return response()->json([
                'message' => 'Payment gateway is not configured. Add STRIPE_SECRET and STRIPE_KEY in environment variables.',
            ], 422);
        }

        $cartItems = $request->user()->cartItems()->with('product')->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty.'], 422);
        }

        $subtotal = $cartItems->sum(fn($item) => $item->product->price * $item->quantity);
        $tax = round($subtotal * 0.08, 2);
        $shippingCost = $subtotal >= 100 ? 0 : 9.99;
        $total = $subtotal + $tax + $shippingCost;

        try {
            $intent = $this->stripe->createPaymentIntent(
                (int) round($total * 100),
                $request->input('currency', 'usd'),
                $request->user()->id
            );

            return response()->json([
                'payment_intent_id' => $intent['id'] ?? null,
                'client_secret' => $intent['client_secret'] ?? null,
                'amount' => round($total, 2),
                'currency' => strtolower($request->input('currency', 'usd')),
            ]);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Could not initialize payment.'], 502);
        }
    }
}
