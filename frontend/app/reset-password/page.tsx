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
