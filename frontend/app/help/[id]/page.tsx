'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Ticket, TicketMessage } from '@/lib/types';
import { formatDateTime, getStatusColor } from '@/lib/utils';
import { ArrowLeft, Send } from 'lucide-react';

export default function TicketDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTicket = () => {
    api.get<Ticket>(`/tickets/${params.id}`)
      .then(setTicket)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (params.id) fetchTicket();
  }, [params.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      await api.post(`/tickets/${params.id}/messages`, { message });
      setMessage('');
      fetchTicket();
    } catch {}
    setSending(false);
  };

  if (loading || !ticket) return <div className="max-w-3xl mx-auto px-4 py-8"><div className="h-40 skeleton rounded-2xl" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Link href="/help" className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary mb-6"><ArrowLeft className="w-4 h-4" /> Back to Help Center</Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">{ticket.subject}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${getStatusColor(ticket.status)}`}>{ticket.status.replace('_', ' ')}</span>
            <span className="text-xs text-muted capitalize">{ticket.type} · {ticket.priority} priority</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-4 mb-6">
        {ticket.messages?.map(msg => (
          <div key={msg.id} className={`flex ${msg.is_staff_reply ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${msg.is_staff_reply ? 'bg-surface border border-border' : 'bg-primary text-white'}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-xs font-semibold ${msg.is_staff_reply ? '' : 'text-white/80'}`}>{msg.user?.name || 'You'}</span>
                {msg.is_staff_reply && <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded">Staff</span>}
              </div>
              <p className="text-sm leading-relaxed">{msg.message}</p>
              <p className={`text-[10px] mt-2 ${msg.is_staff_reply ? 'text-muted' : 'text-white/60'}`}>{formatDateTime(msg.created_at)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Form */}
      {!['resolved', 'closed'].includes(ticket.status) && (
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your message..." className="flex-1 px-4 py-3 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <button type="submit" disabled={sending || !message.trim()} className="px-5 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2">
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}
