'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import type { Order } from '@/lib/types';
import { formatCurrency, formatDate, formatDateTime, getStatusColor, getImageUrl } from '@/lib/utils';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle, MapPin } from 'lucide-react';

const statusIcons: Record<string, any> = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      api.get<Order>(`/orders/${params.id}`)
        .then(setOrder)
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  if (loading || !order) {
    return <div className="max-w-4xl mx-auto px-4 py-8"><div className="space-y-4"><div className="h-8 skeleton w-1/3 rounded-xl" /><div className="h-40 skeleton rounded-2xl" /><div className="h-60 skeleton rounded-2xl" /></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary mb-6"><ArrowLeft className="w-4 h-4" /> Back to Orders</Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">{order.order_number}</h1>
          <p className="text-sm text-muted">Placed on {formatDate(order.created_at)}</p>
        </div>
        <span className={`px-4 py-1.5 text-sm font-semibold rounded-full capitalize self-start ${getStatusColor(order.status)}`}>{order.status}</span>
      </div>

      {/* Order Tracking Timeline */}
      {order.tracking && order.tracking.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
          <h2 className="font-bold mb-4">Order Tracking</h2>
          <div className="relative">
            {order.tracking.map((track, i) => {
              const Icon = statusIcons[track.status] || Clock;
              const isLast = i === order.tracking!.length - 1;
              return (
                <div key={track.id} className="flex gap-4 pb-6 last:pb-0">
                  <div className="relative flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isLast ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {i < order.tracking!.length - 1 && <div className="w-0.5 flex-1 bg-border mt-2" />}
                  </div>
                  <div className="pt-2">
                    <p className="text-sm font-semibold capitalize">{track.status.replace('_', ' ')}</p>
                    <p className="text-sm text-muted">{track.description}</p>
                    <p className="text-xs text-muted mt-1">{formatDateTime(track.tracked_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Items */}
        <div className="bg-background border border-border rounded-2xl p-6">
          <h2 className="font-bold mb-4">Items ({order.items?.length})</h2>
          <div className="space-y-3">
            {order.items?.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-surface overflow-hidden shrink-0">
                  <img src={getImageUrl(item.product?.primary_image?.image_path || item.product?.images?.[0]?.image_path)} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.product_name}</p>
                  <p className="text-xs text-muted">Qty: {item.quantity} × {formatCurrency(Number(item.unit_price))}</p>
                </div>
                <span className="text-sm font-bold">{formatCurrency(Number(item.total))}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Shipping */}
          <div className="bg-background border border-border rounded-2xl p-6">
            <h2 className="font-bold mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Shipping Address</h2>
            <p className="text-sm">{order.shipping_name}</p>
            <p className="text-sm text-muted">{order.shipping_address}</p>
            <p className="text-sm text-muted">{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</p>
          </div>

          {/* Summary */}
          <div className="bg-background border border-border rounded-2xl p-6">
            <h2 className="font-bold mb-3">Payment Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatCurrency(Number(order.subtotal))}</span></div>
              <div className="flex justify-between"><span className="text-muted">Shipping</span><span>{Number(order.shipping_cost) === 0 ? <span className="text-success">FREE</span> : formatCurrency(Number(order.shipping_cost))}</span></div>
              <div className="flex justify-between"><span className="text-muted">Tax</span><span>{formatCurrency(Number(order.tax))}</span></div>
              <div className="pt-2 border-t border-border flex justify-between"><span className="font-bold">Total</span><span className="font-bold text-lg text-primary">{formatCurrency(Number(order.total))}</span></div>
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Payment</span>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${getStatusColor(order.payment_status)}`}>{order.payment_status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
