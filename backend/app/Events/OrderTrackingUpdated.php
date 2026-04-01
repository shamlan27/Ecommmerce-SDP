<?php

namespace App\Events;

use App\Models\Order;
use App\Models\OrderTracking;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderTrackingUpdated implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(public Order $order, public OrderTracking $tracking)
    {
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel('orders.' . $this->order->id)];
    }

    public function broadcastAs(): string
    {
        return 'tracking.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'status' => $this->order->status,
            'tracking' => [
                'id' => $this->tracking->id,
                'status' => $this->tracking->status,
                'description' => $this->tracking->description,
                'tracked_at' => optional($this->tracking->tracked_at)->toIso8601String(),
            ],
        ];
    }
}
