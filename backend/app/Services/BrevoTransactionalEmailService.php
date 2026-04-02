<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BrevoTransactionalEmailService
{
    public function sendPasswordReset(User $user, string $resetUrl): void
    {
        $apiKey = (string) config('services.brevo.api_key');
        $templateId = (int) config('services.brevo.password_reset_template_id', 1);

        if ($apiKey === '' || $templateId <= 0) {
            return;
        }

        $payload = [
            'to' => [[
                'email' => $user->email,
                'name' => $user->name,
            ]],
            'templateId' => $templateId,
            'params' => [
                'APP_NAME' => config('app.name'),
                'USER_NAME' => $user->name,
                'RESET_URL' => $resetUrl,
                'reset_url' => $resetUrl,
            ],
        ];

        try {
            Http::timeout(10)
                ->withHeaders([
                    'api-key' => $apiKey,
                    'accept' => 'application/json',
                    'content-type' => 'application/json',
                ])
                ->post('https://api.brevo.com/v3/smtp/email', $payload)
                ->throw();
        } catch (\Throwable $e) {
            Log::warning('Brevo password reset email failed', [
                'user_id' => $user->id,
                'email' => $user->email,
                'template_id' => $templateId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
