<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('orders.{orderId}', function ($user, int $orderId): bool {
    if (in_array($user->role, ['admin', 'support'], true)) {
        return true;
    }

    return $user->orders()->whereKey($orderId)->exists();
});
