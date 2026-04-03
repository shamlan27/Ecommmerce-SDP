'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Mail, Lock } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post<{ message: string }>('/forgot-password', { email });
      setMessage(res.message || 'OTP sent to your email. Enter it to reset your password.');
      setStep(2);
    } catch (err: any) {
      setError(err.data?.message || 'Unable to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      return setError('Please enter OTP');
    }
    setError('');
    setMessage('');
    setStep(3);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      return setError('Please enter new password');
    }
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post<{ message: string }>('/reset-password', {
        email,
        otp,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err: any) {
      setError(err.data?.message || 'Unable to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background border border-border p-8 rounded-3xl shadow-2xl animate-fade-in">
        
        {step === 1 && (
          <>
            <h1 className="text-2xl font-bold mb-2 text-center">Forgot Password</h1>
            <p className="text-muted text-sm text-center mb-6">Enter your email to receive an OTP.</p>

            {message && (
              <div className="mb-4 p-3 bg-success/10 text-success text-sm rounded-xl border border-success/20">{message}</div>
            )}
            {error && (
              <div className="mb-4 p-3 bg-danger/10 text-danger text-sm rounded-xl border border-danger/20">{error}</div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-bold mb-2 text-center">Verify OTP</h1>
            <p className="text-muted text-sm text-center mb-6">Enter the OTP sent to {email}</p>

            {message && (
              <div className="mb-4 p-3 bg-success/10 text-success text-sm rounded-xl border border-success/20">{message}</div>
            )}
            {error && (
              <div className="mb-4 p-3 bg-danger/10 text-danger text-sm rounded-xl border border-danger/20">{error}</div>
            )}

            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
                <p className="mt-2 text-xs text-muted text-center">Enter any number to verify</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>

            <button
              onClick={() => setStep(1)}
              className="mt-4 w-full py-2 text-primary font-semibold text-sm hover:underline"
            >
              Back to Email
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-2xl font-bold mb-2 text-center">Reset Password</h1>
            <p className="text-muted text-sm text-center mb-6">Enter your new password</p>

            {message && (
              <div className="mb-4 p-3 bg-success/10 text-success text-sm rounded-xl border border-success/20">{message}</div>
            )}
            {error && (
              <div className="mb-4 p-3 bg-danger/10 text-danger text-sm rounded-xl border border-danger/20">{error}</div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Minimum 6 characters"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <button
              onClick={() => setStep(2)}
              className="mt-4 w-full py-2 text-primary font-semibold text-sm hover:underline"
            >
              Back to OTP
            </button>
          </>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          Back to{' '}
          <Link href="/login" className="font-bold text-primary hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
