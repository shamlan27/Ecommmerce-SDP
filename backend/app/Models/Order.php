<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $user_id
 * @property string $order_number
 * @property string $status
 * @property string $payment_status
 */
class Order extends Model
{
    protected $fillable = [
        'user_id', 'order_number', 'status', 'shipping_name', 'shipping_address',
        'shipping_city', 'shipping_state', 'shipping_zip', 'shipping_country',
        'shipping_phone', 'subtotal', 'tax', 'shipping_cost', 'discount',
        'total', 'payment_method', 'payment_status', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'tax' => 'decimal:2',
            'shipping_cost' => 'decimal:2',
            'discount' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function tracking(): HasMany
    {
        return $this->hasMany(OrderTracking::class)->orderBy('tracked_at');
    }

    public static function generateOrderNumber(): string
    {
        return 'ORD-' . strtoupper(uniqid());
    }
}
