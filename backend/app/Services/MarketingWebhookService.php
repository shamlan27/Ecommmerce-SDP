<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MarketingWebhookService
{
    public function syncCustomerRegistered(User $user): void
    {
        $this->send('customer.created', [
            'customer' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'created_at' => optional($user->created_at)->toIso8601String(),
            ],
        ]);
    }

    public function syncOrderCreated(Order $order): void
    {
        $this->send('order.created', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'user_id' => $order->user_id,
                'status' => $order->status,
                'total' => $order->total,
                'payment_status' => $order->payment_status,
                'created_at' => optional($order->created_at)->toIso8601String(),
            ],
        ]);
    }

    private function send(string $event, array $payload): void
    {
        $url = config('services.marketing.webhook_url');

        if (!$url) {
            return;
        }

        try {
            Http::timeout(10)->post($url, array_merge(['event' => $event], $payload));
        } catch (\Throwable $e) {
            Log::warning('Marketing webhook failed', [
                'event' => $event,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
