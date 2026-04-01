'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post<{ message: string }>('/forgot-password', { email });
      setMessage(res.message || 'If an account exists, a reset link has been sent.');
    } catch (err: any) {
      setError(err.data?.message || 'Unable to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background border border-border p-8 rounded-3xl shadow-2xl animate-fade-in">
        <h1 className="text-2xl font-bold mb-2 text-center">Forgot Password</h1>
        <p className="text-muted text-sm text-center mb-6">Enter your email to receive a password reset link.</p>

        {message && (
          <div className="mb-4 p-3 bg-success/10 text-success text-sm rounded-xl border border-success/20">{message}</div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-danger/10 text-danger text-sm rounded-xl border border-danger/20">{error}</div>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
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
