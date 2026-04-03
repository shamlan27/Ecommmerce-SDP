'use client';

import Link from 'next/link';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background border border-border p-8 rounded-3xl shadow-2xl text-center">
        <h1 className="text-2xl font-bold mb-2">Password Reset</h1>
        <p className="text-muted mb-6">Password reset is now handled through OTP verification for better security.</p>
        <Link href="/forgot-password" className="inline-flex px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors">
          Reset Password with OTP
        </Link>
      </div>
    </div>
  );
}
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$"
              title="Include uppercase, lowercase, and at least one number"
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              placeholder="Minimum 8 characters"
            />
            <p className="mt-1 text-xs text-muted">Use at least 8 characters with uppercase, lowercase, and a number.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              placeholder="Repeat new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Back to{' '}
          <Link href="/login" className="font-bold text-primary hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
