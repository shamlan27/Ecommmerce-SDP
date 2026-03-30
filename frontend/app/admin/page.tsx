'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { AdminOverview } from '@/lib/types';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AdminOverview>('/admin/reports/overview')
      .then(setData)
      .catch((err) => {
        console.error(err);
        setData({
          stats: { total_revenue: 0, total_orders: 0, total_customers: 0, total_products: 0, pending_orders: 0, low_stock_products: 0 },
          monthly_revenue: [],
          recent_orders: [],
          top_products: []
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[...Array(6)].map((_,i) => <div key={i} className="h-32 skeleton rounded-2xl" />)}</div>;
  }

  const statCards = [
    { title: 'Total Revenue', value: formatCurrency(data.stats.total_revenue), icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Total Orders', value: data.stats.total_orders, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Customers', value: data.stats.total_customers, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Products', value: data.stats.total_products, icon: Package, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { title: 'Pending Orders', value: data.stats.pending_orders, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'Low Stock Items', value: data.stats.low_stock_products || 0, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-background border border-border rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold leading-tight">{stat.value}</p>
              <p className="text-sm font-medium text-muted">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-background border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-primary font-semibold hover:underline">View All</Link>
          </div>
          <div className="space-y-4 text-sm">
            {data.recent_orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border">
                <div>
                  <Link href={`/admin/orders?id=${order.id}`} className="font-semibold text-primary hover:underline">{order.order_number}</Link>
                  <p className="text-xs text-muted">{order.shipping_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(Number(order.total))}</p>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 inline-block ${order.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-background border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Top Products</h2>
            <Link href="/admin/products" className="text-sm text-primary font-semibold hover:underline">View All</Link>
          </div>
          <div className="space-y-4 text-sm">
            {data.top_products.slice(0, 5).map(product => (
              <div key={product.id} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border">
                <div className="w-12 h-12 rounded-lg bg-background border border-border overflow-hidden">
                  <img src={getImageUrl(product.primary_image?.image_path || product.images?.[0]?.image_path)} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{product.name}</p>
                  <p className="text-xs text-muted">{formatCurrency(Number(product.price))} • Stock: {product.stock_quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
