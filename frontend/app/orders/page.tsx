'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Order, PaginatedResponse } from '@/lib/types';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { Package, ChevronRight, Eye } from 'lucide-react';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get<PaginatedResponse<Order>>('/orders')
      .then(data => setOrders(data.data))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fade-in">
        <Package className="w-16 h-16 text-muted mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Sign in to view orders</h1>
        <Link href="/login" className="inline-flex px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors mt-4">Sign In</Link>
      </div>
    );
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8"><div className="space-y-4">{[...Array(5)].map((_,i) => <div key={i} className="h-20 skeleton rounded-2xl" />)}</div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No orders yet</h2>
          <p className="text-muted mb-6">Start shopping to see your orders here.</p>
          <Link href="/products" className="inline-flex px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order.id} href={`/orders/${order.id}`} className="block border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg transition-all" id={`order-${order.id}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-sm">{order.order_number}</h3>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${getStatusColor(order.status)}`}>{order.status}</span>
                  </div>
                  <p className="text-sm text-muted">{formatDate(order.created_at)} · {order.items?.length || 0} items</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-primary">{formatCurrency(Number(order.total))}</span>
                  <ChevronRight className="w-5 h-5 text-muted" />
                </div>
              </div>
              {/* Item thumbnails */}
              {order.items && order.items.length > 0 && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  {order.items.slice(0, 4).map(item => (
                    <div key={item.id} className="w-10 h-10 rounded-lg bg-surface overflow-hidden">
                      {item.product?.primary_image && <img src={item.product.primary_image.image_path} alt="" className="w-full h-full object-cover" />}
                    </div>
                  ))}
                  {(order.items.length) > 4 && <span className="text-xs text-muted">+{order.items.length - 4} more</span>}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
