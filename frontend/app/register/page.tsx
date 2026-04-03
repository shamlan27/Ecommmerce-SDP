'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import type { User as UserType } from '@/lib/types';
import { Mail, Lock, User, Store, Phone } from 'lucide-react';

const sriLankaPhoneRegex = /^(?:\+94|0)[\s\-]?\d{9,10}$/;
const strongPasswordRegex = /^.{6,}$/;

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    shipping_name: '',
    shipping_line1: '',
    shipping_line2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    shipping_country: 'LK',
    payment_default_method: 'card',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getErrorMessage = (err: unknown): string => {
    if (typeof err === 'object' && err !== null) {
      const errorObj = err as { data?: { errors?: Record<string, string[]>; message?: string }; message?: string };
      const validation = errorObj.data?.errors;
      if (validation) {
        return Object.values(validation).flat().join(', ');
      }
      return errorObj.data?.message || errorObj.message || 'Registration failed';
    }
    return 'Registration failed';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      return setError('Passwords do not match');
    }
    if (!strongPasswordRegex.test(form.password)) {
      return setError('Password must be at least 6 characters long.');
    }
    if (!sriLankaPhoneRegex.test(form.phone.trim())) {
      return setError('Use a valid Sri Lankan phone number (e.g. 0771234567 or +94771234567).');
    }
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.password_confirmation, form.phone);

      await api.post<UserType>('/user/complete-profile', {
        name: form.name,
        phone: form.phone,
        payment_preferences: {
          default_method: form.payment_default_method,
        },
        shipping: {
          name: form.shipping_name || form.name,
          line1: form.shipping_line1,
          line2: form.shipping_line2 || null,
          city: form.shipping_city,
          state: form.shipping_state,
          zip: form.shipping_zip,
          country: form.shipping_country,
          phone: form.phone,
        },
      });

      router.push('/account/dashboard');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({...form, [e.target.id]: e.target.value});
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background border border-border p-8 rounded-3xl shadow-2xl animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <div className="relative text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <Store className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Create Account</h1>
          <p className="text-muted text-sm">Join ShopNest today</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 text-danger text-sm text-center rounded-xl border border-danger/20 font-medium animate-slide-up">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-sm font-semibold mb-1.5 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input id="name" type="text" value={form.name} onChange={handleChange} required className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="John Doe" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input id="email" type="email" value={form.email} onChange={handleChange} required className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 ml-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input id="phone" type="tel" value={form.phone} onChange={handleChange} required className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="0771234567" pattern="^(?:\\+94|0)[\\s\\-]?\\d{9,10}$" title="Use 0771234567 or +94771234567" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 ml-1">Shipping Full Name</label>
            <input id="shipping_name" type="text" value={form.shipping_name} onChange={handleChange} required className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 ml-1">Shipping Address</label>
            <input id="shipping_line1" type="text" value={form.shipping_line1} onChange={handleChange} required className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="No. 25, Galle Road" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 ml-1">Address Line 2 (Optional)</label>
            <input id="shipping_line2" type="text" value={form.shipping_line2} onChange={handleChange} className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="Apartment, suite, etc." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1.5 ml-1">City</label>
              <input id="shipping_city" type="text" value={form.shipping_city} onChange={handleChange} required className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="Colombo" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 ml-1">Province</label>
              <input id="shipping_state" type="text" value={form.shipping_state} onChange={handleChange} required className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="Western" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1.5 ml-1">Postal Code (Optional)</label>
              <input id="shipping_zip" type="text" value={form.shipping_zip} onChange={handleChange} className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="10100" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 ml-1">Country (2 letters)</label>
              <input id="shipping_country" type="text" value={form.shipping_country} onChange={(e) => setForm({ ...form, shipping_country: e.target.value.toUpperCase() })} required maxLength={2} className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="LK" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 ml-1">Payment Preference</label>
            <select id="payment_default_method" value={form.payment_default_method} onChange={(e) => setForm({ ...form, payment_default_method: e.target.value })} className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
              <option value="card">Card</option>
              <option value="paypal">PayPal</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input id="password" type="password" value={form.password} onChange={handleChange} required className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="Minimum 6 chars" pattern=".{6,}" title="Password must be at least 6 characters long" />
            </div>
            <p className="mt-1 text-xs text-muted">Use at least 6 characters.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 ml-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input id="password_confirmation" type="password" value={form.password_confirmation} onChange={handleChange} required className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50 btn-press shadow-lg shadow-primary/25 mt-4" id="register-submit">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted relative z-10">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
