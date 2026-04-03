<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\BrevoTransactionalEmailService;
use App\Services\MarketingWebhookService;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        private readonly MarketingWebhookService $marketing,
        private readonly BrevoTransactionalEmailService $brevoEmail
    )
    {
    }

    public function register(Request $request)
    {
        $request->merge([
            'email' => strtolower(trim((string) $request->input('email'))),
        ]);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', 'min:6'],
            'phone' => 'required|string|max:20',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'phone' => $request->phone,
            'role' => 'customer',
            'profile_completed' => false,
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        $this->marketing->syncCustomerRegistered($user);

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->merge([
            'email' => strtolower(trim((string) $request->input('email'))),
        ]);

        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->merge([
            'email' => strtolower(trim((string) $request->input('email'))),
        ]);

        $request->validate([
            'email' => 'required|string|email',
        ]);

        $user = User::where('email', $request->email)->first();
        $emailHash = sha1($request->email);

        if ($user) {
            $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                ['token' => $otp, 'created_at' => now()]
            );

            Log::info('Forgot password processed', [
                'email_hash' => $emailHash,
                'user_found' => true,
                'otp_generated' => true,
            ]);
        } else {
            Log::info('Forgot password processed', [
                'email_hash' => $emailHash,
                'user_found' => false,
            ]);
        }

        return response()->json([
            'message' => 'If an account with that email exists, an OTP has been sent.',
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->merge([
            'email' => strtolower(trim((string) $request->input('email'))),
        ]);

        $request->validate([
            'otp' => 'required|string|size:6',
            'email' => 'required|string|email',
            'password' => ['required', 'confirmed', 'min:6'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found.',
            ], 422);
        }

        $user->forceFill([
            'password' => Hash::make($request->password),
            'remember_token' => Str::random(60),
        ])->save();

        event(new PasswordReset($user));

        return response()->json([
            'message' => 'Password has been reset successfully. Please sign in.',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function user(Request $request)
    {
        return response()->json($request->user()->load('addresses'));
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'avatar' => 'nullable|string',
            'payment_preferences' => 'nullable|array',
        ]);

        $request->user()->update($request->only(['name', 'phone', 'avatar', 'payment_preferences']));

        return response()->json($request->user());
    }

    public function completeProfile(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'payment_preferences' => 'required|array',
            'payment_preferences.default_method' => 'required|string|in:card,paypal,bank_transfer,cod',
            'shipping' => 'required|array',
            'shipping.name' => 'required|string|max:255',
            'shipping.line1' => 'required|string|max:255',
            'shipping.line2' => 'nullable|string|max:255',
            'shipping.city' => 'required|string|max:255',
            'shipping.state' => 'required|string|max:255',
            'shipping.zip' => 'nullable|string|max:20',
            'shipping.country' => 'sometimes|string|max:2',
            'shipping.phone' => 'nullable|string|max:20',
        ]);

        $user = $request->user();

        DB::transaction(function () use ($request, $user) {
            $user->update([
                'name' => $request->name,
                'phone' => $request->phone,
                'payment_preferences' => $request->payment_preferences,
                'profile_completed' => true,
            ]);

            $user->addresses()
                ->where('type', 'shipping')
                ->update(['is_default' => false]);

            $user->addresses()->create([
                'type' => 'shipping',
                'name' => $request->input('shipping.name'),
                'line1' => $request->input('shipping.line1'),
                'line2' => $request->input('shipping.line2'),
                'city' => $request->input('shipping.city'),
                'state' => $request->input('shipping.state'),
                'zip' => $request->filled('shipping.zip') ? $request->input('shipping.zip') : null,
                'country' => strtoupper($request->input('shipping.country', 'LK')),
                'phone' => $request->input('shipping.phone'),
                'is_default' => true,
            ]);
        });

        return response()->json($user->fresh()->load('addresses'));
    }
}
