'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Order, PaginatedResponse } from '@/lib/types';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { Search, Package, MapPin, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    api.get<PaginatedResponse<Order>>(`/admin/orders?search=${search}&per_page=50`)
      .then(res => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [search]);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      fetchOrders();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Orders</h1>

      <div className="bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-surface">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by order number or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase text-muted bg-surface border-b border-border">
              <tr>
                <th className="px-6 py-4">Order Details</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted">No orders found.</td></tr>
              ) : orders.map(order => (
                <tr key={order.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold font-mono">{order.order_number}</p>
                    <p className="text-xs text-muted mt-1">{formatDate(order.created_at)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold">{order.shipping_name}</p>
                    <p className="text-xs text-muted">{order.user?.email}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-primary">{formatCurrency(Number(order.total))}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize cursor-pointer border-0 outline-none appearance-none ${getStatusColor(order.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(order.payment_status)}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/orders/${order.id}`} className="inline-flex p-2 text-muted hover:text-primary bg-surface hover:bg-primary/10 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
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
