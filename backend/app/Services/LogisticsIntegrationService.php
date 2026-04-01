<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderTracking;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LogisticsIntegrationService
{
    public function createShipment(Order $order): void
    {
        $url = config('services.logistics.webhook_url');

        if (!$url) {
            return;
        }

        try {
            Http::timeout(10)->post($url, [
                'event' => 'shipment.create',
                'order' => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'shipping_name' => $order->shipping_name,
                    'shipping_address' => $order->shipping_address,
                    'shipping_city' => $order->shipping_city,
                    'shipping_state' => $order->shipping_state,
                    'shipping_zip' => $order->shipping_zip,
                    'shipping_country' => $order->shipping_country,
                    'shipping_phone' => $order->shipping_phone,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::warning('Logistics shipment hook failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function syncTracking(Order $order): array
    {
        $url = config('services.logistics.webhook_url');

        if (!$url) {
            return [];
        }

        try {
            $response = Http::timeout(10)->post($url, [
                'event' => 'tracking.sync',
                'order' => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                ],
            ]);

            if (!$response->ok()) {
                return [];
            }

            $entries = $response->json('tracking_updates', []);

            foreach ($entries as $entry) {
                if (empty($entry['status'])) {
                    continue;
                }

                OrderTracking::create([
                    'order_id' => $order->id,
                    'status' => (string) $entry['status'],
                    'description' => $entry['description'] ?? 'Status synced from logistics provider.',
                    'tracked_at' => $entry['tracked_at'] ?? now(),
                ]);
            }

            return $entries;
        } catch (\Throwable $e) {
            Log::warning('Logistics tracking sync failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return [];
        }
    }
}
