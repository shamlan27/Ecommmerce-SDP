'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { ArrowLeft } from 'lucide-react';

export default function NewTicketPage() {
  const router = useRouter();
  const [form, setForm] = useState({ subject: '', type: 'inquiry', priority: 'medium', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const ticket = await api.post<any>('/tickets', form);
      router.push(`/help/${ticket.id}`);
    } catch (err: any) {
      setError(err.data?.message || 'Failed to create ticket');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Link href="/help" className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary mb-6"><ArrowLeft className="w-4 h-4" /> Back to Help Center</Link>
      <h1 className="text-2xl font-bold mb-6">Create Support Ticket</h1>

      {error && <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl p-3 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-background border border-border rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Subject</label>
          <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Brief description of your issue" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Type</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="inquiry">Inquiry</option>
              <option value="complaint">Complaint</option>
              <option value="return">Return Request</option>
              <option value="feedback">Feedback</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Priority</label>
            <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Message</label>
          <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} required rows={5} className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" placeholder="Describe your issue in detail..." />
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors btn-press disabled:opacity-50">
          {loading ? 'Creating...' : 'Submit Ticket'}
        </button>
      </form>
    </div>
  );
}
