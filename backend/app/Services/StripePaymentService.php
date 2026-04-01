<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class StripePaymentService
{
    public function isConfigured(): bool
    {
        return !empty(config('services.stripe.secret'));
    }

    public function createPaymentIntent(int $amountInCents, string $currency, int $userId): array
    {
        $payload = [
            'amount' => $amountInCents,
            'currency' => strtolower($currency),
            'automatic_payment_methods[enabled]' => 'true',
            'metadata[user_id]' => (string) $userId,
        ];

        // Local development shortcut: auto-confirm with Stripe test payment method.
        if (config('app.env') === 'local') {
            $payload['payment_method'] = 'pm_card_visa';
            $payload['confirm'] = 'true';
        }

        $response = Http::withToken((string) config('services.stripe.secret'))
            ->asForm()
            ->post('https://api.stripe.com/v1/payment_intents', $payload);

        if (!$response->ok()) {
            throw new \RuntimeException('Unable to create payment intent.');
        }

        return $response->json();
    }

    public function verifySucceeded(string $paymentIntentId): bool
    {
        $response = Http::withToken((string) config('services.stripe.secret'))
            ->get('https://api.stripe.com/v1/payment_intents/' . $paymentIntentId);

        if (!$response->ok()) {
            return false;
        }

        return ($response->json('status') ?? '') === 'succeeded';
    }
}
