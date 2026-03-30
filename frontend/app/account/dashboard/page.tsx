'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { DashboardData } from '@/lib/types';
import { formatCurrency, formatDate, getStatusColor, getImageUrl } from '@/lib/utils';
import { Package, DollarSign, Clock, MessageSquare, ArrowRight, Heart, TrendingUp, ShoppingBag } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.get<DashboardData>('/dashboard')
        .then(setData)
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user) return null;

  if (loading || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">{[...Array(4)].map((_,i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}</div>
        <div className="h-64 skeleton rounded-2xl" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Orders', value: data.stats.total_orders, icon: Package, color: 'bg-blue-500/10 text-blue-600' },
    { label: 'Total Spent', value: formatCurrency(data.stats.total_spent), icon: DollarSign, color: 'bg-emerald-500/10 text-emerald-600' },
    { label: 'Pending Orders', value: data.stats.pending_orders, icon: Clock, color: 'bg-amber-500/10 text-amber-600' },
    { label: 'Open Tickets', value: data.stats.open_tickets, icon: MessageSquare, color: 'bg-purple-500/10 text-purple-600' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
        <p className="text-muted mt-1">Here&apos;s what&apos;s happening with your account</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-background border border-border rounded-2xl p-5 card-hover">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { href: '/products', label: 'Shop Now', icon: ShoppingBag },
          { href: '/orders', label: 'My Orders', icon: Package },
          { href: '/wishlist', label: 'Wishlist', icon: Heart },
          { href: '/help', label: 'Get Help', icon: MessageSquare },
        ].map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex items-center gap-3 p-4 border border-border rounded-xl hover:border-primary/30 hover:bg-surface transition-all">
            <Icon className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold">{label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Recent Orders</h2>
          <Link href="/orders" className="text-sm text-primary font-medium flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
        </div>
        {data.recent_orders.length > 0 ? (
          <div className="space-y-3">
            {data.recent_orders.slice(0, 5).map(order => (
              <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between p-4 border border-border rounded-xl hover:border-primary/30 transition-all">
                <div>
                  <p className="text-sm font-semibold">{order.order_number}</p>
                  <p className="text-xs text-muted">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${getStatusColor(order.status)}`}>{order.status}</span>
                  <span className="text-sm font-bold">{formatCurrency(Number(order.total))}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted text-sm py-4">No orders yet.</p>
        )}
      </div>

      {/* Recommended Products */}
      {data.recommended.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Recommended for You</h2>
            <Link href="/products?featured=1" className="text-sm text-primary font-medium flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.recommended.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
