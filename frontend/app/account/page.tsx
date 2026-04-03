'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import type { User as UserType } from '@/lib/types';
import { User, Mail, Phone, Save, CheckCircle } from 'lucide-react';

export default function AccountPage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileForm, setProfileForm] = useState({
    shipping_name: user?.name || '',
    shipping_line1: '',
    shipping_line2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    shipping_country: 'LK',
    payment_default_method: 'card',
  });

  const getErrorMessage = (err: unknown): string => {
    if (typeof err === 'object' && err !== null && 'data' in err) {
      const data = (err as { data?: { message?: string } }).data;
      return data?.message || 'Unable to complete profile.';
    }
    return 'Unable to complete profile.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.put<UserType>('/user/profile', form);
      updateUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompleting(true);
    setProfileError('');
    try {
      const updated = await api.post<UserType>('/user/complete-profile', {
        name: form.name,
        phone: form.phone,
        payment_preferences: {
          default_method: profileForm.payment_default_method,
        },
        shipping: {
          name: profileForm.shipping_name,
          line1: profileForm.shipping_line1,
          line2: profileForm.shipping_line2 || null,
          city: profileForm.shipping_city,
          state: profileForm.shipping_state,
          zip: profileForm.shipping_zip,
          country: profileForm.shipping_country,
        },
      });
      updateUser(updated);
    } catch (err: unknown) {
      setProfileError(getErrorMessage(err));
    }
    setCompleting(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Account Settings</h1>

      {saved && (
        <div className="flex items-center gap-2 bg-success/10 border border-success/20 text-success text-sm rounded-xl p-3 mb-6 animate-fade-in">
          <CheckCircle className="w-4 h-4" /> Profile updated successfully!
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-background border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/25">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold">{user.name}</h2>
            <p className="text-sm text-muted">{user.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full capitalize">{user.role}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Full Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email Address</label>
            <input value={user.email} disabled className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-surface text-muted" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone Number</label>
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" placeholder="0771234567" pattern="^(?:\\+94|0)[\\s\\-]?\\d{9,10}$" title="Use 0771234567 or +94771234567" />
          </div>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors btn-press disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Account Info */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h3 className="font-bold mb-3">Account Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted">Member Since</span><span className="font-medium">{new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span></div>
          <div className="flex justify-between"><span className="text-muted">Account Type</span><span className="font-medium capitalize">{user.role}</span></div>
          <div className="flex justify-between"><span className="text-muted">Profile Completion</span><span className="font-medium">{user.profile_completed ? 'Completed' : 'Pending'}</span></div>
        </div>
      </div>

      {!user.profile_completed && (
        <div className="bg-background border border-border rounded-2xl p-6 mt-6">
          <h3 className="font-bold mb-1">Complete Your Profile</h3>
          <p className="text-sm text-muted mb-5">Add shipping and payment preferences to speed up checkout.</p>

          {profileError && <div className="mb-4 p-3 rounded-xl bg-danger/10 text-danger text-sm">{profileError}</div>}

          <form onSubmit={handleCompleteProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={profileForm.shipping_name} onChange={e => setProfileForm({ ...profileForm, shipping_name: e.target.value })} required className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-background" placeholder="Shipping full name" />
              <select value={profileForm.payment_default_method} onChange={e => setProfileForm({ ...profileForm, payment_default_method: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-background">
                <option value="card">Card</option>
                <option value="paypal">PayPal</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cod">Cash on Delivery</option>
              </select>
            </div>
            <input value={profileForm.shipping_line1} onChange={e => setProfileForm({ ...profileForm, shipping_line1: e.target.value })} required className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-background" placeholder="No. 25, Galle Road" />
            <input value={profileForm.shipping_line2} onChange={e => setProfileForm({ ...profileForm, shipping_line2: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-background" placeholder="Address line 2 (optional)" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <input value={profileForm.shipping_city} onChange={e => setProfileForm({ ...profileForm, shipping_city: e.target.value })} required className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-background" placeholder="Colombo" />
              <input value={profileForm.shipping_state} onChange={e => setProfileForm({ ...profileForm, shipping_state: e.target.value })} required className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-background" placeholder="Western" />
              <input value={profileForm.shipping_zip} onChange={e => setProfileForm({ ...profileForm, shipping_zip: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-background" placeholder="Postal (optional)" />
              <input value={profileForm.shipping_country} onChange={e => setProfileForm({ ...profileForm, shipping_country: e.target.value.toUpperCase() })} required className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-background" placeholder="LK" maxLength={2} />
            </div>

            <button type="submit" disabled={completing} className="px-6 py-3 bg-primary text-white rounded-xl font-semibold disabled:opacity-50">
              {completing ? 'Saving...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
