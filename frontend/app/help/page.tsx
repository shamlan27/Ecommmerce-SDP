'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Ticket, PaginatedResponse } from '@/lib/types';
import { formatDate, getStatusColor } from '@/lib/utils';
import { MessageSquare, Plus, ChevronRight } from 'lucide-react';

export default function HelpPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.get<PaginatedResponse<Ticket>>('/tickets')
        .then(data => setTickets(data.data))
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fade-in">
        <MessageSquare className="w-16 h-16 text-muted mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Sign in to access Help Center</h1>
        <Link href="/login" className="inline-flex px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors mt-4">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Help Center</h1>
          <p className="text-muted mt-1">Manage your support tickets</p>
        </div>
        <Link href="/help/new" className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors btn-press shadow-lg shadow-primary/25" id="new-ticket-btn">
          <Plus className="w-4 h-4" /> New Ticket
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="h-20 skeleton rounded-2xl" />)}</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare className="w-16 h-16 text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No tickets yet</h2>
          <p className="text-muted mb-6">Need help? Create a support ticket.</p>
          <Link href="/help/new" className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"><Plus className="w-4 h-4" /> Create Ticket</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => (
            <Link key={ticket.id} href={`/help/${ticket.id}`} className="flex items-center justify-between p-5 border border-border rounded-2xl hover:border-primary/30 hover:shadow-lg transition-all">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm">{ticket.subject}</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize ${getStatusColor(ticket.status)}`}>{ticket.status.replace('_', ' ')}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize ${getStatusColor(ticket.priority)}`}>{ticket.priority}</span>
                </div>
                <p className="text-xs text-muted">{formatDate(ticket.created_at)} · {ticket.type}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
