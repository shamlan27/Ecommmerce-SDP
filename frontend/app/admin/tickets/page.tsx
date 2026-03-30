'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Ticket, PaginatedResponse } from '@/lib/types';
import { formatDate, getStatusColor } from '@/lib/utils';
import { MessageSquare, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

export default function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = () => {
    setLoading(true);
    api.get<PaginatedResponse<Ticket>>('/admin/tickets?per_page=50')
      .then(res => setTickets(res.data))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/admin/tickets/${id}/status`, { status });
      fetchTickets();
    } catch(e) { console.error(e); }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Support Tickets</h1>

      <div className="bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase text-muted bg-surface border-b border-border">
              <tr>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Type / Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div></td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted">No tickets found.</td></tr>
              ) : tickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold flex items-center gap-2">
                      #{ticket.id} {ticket.subject}
                    </p>
                    <p className="text-xs text-muted mt-1">{formatDate(ticket.created_at)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold">{ticket.user?.name}</p>
                    <p className="text-xs text-muted">{ticket.user?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className="text-xs uppercase font-semibold text-muted tracking-wider">{ticket.type}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full capitalize ${getStatusColor(ticket.priority)}`}>{ticket.priority}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={ticket.status}
                      onChange={(e) => updateStatus(ticket.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize cursor-pointer border-0 outline-none appearance-none ${getStatusColor(ticket.status)}`}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/help/${ticket.id}`} className="inline-flex p-2 text-primary hover:text-white bg-primary/10 hover:bg-primary rounded-lg transition-colors items-center gap-1.5 font-semibold text-xs">
                      <MessageSquare className="w-4 h-4" /> Reply
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
