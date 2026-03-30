'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { User, Mail, Phone, Save, CheckCircle } from 'lucide-react';

export default function AccountPage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.put<any>('/user/profile', form);
      updateUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
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
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" placeholder="+1 (555) 000-0000" />
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
        </div>
      </div>
    </div>
  );
}
