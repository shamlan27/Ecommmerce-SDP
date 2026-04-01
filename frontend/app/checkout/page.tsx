'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import type { PaymentIntentResponse } from '@/lib/types';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import { CheckCircle, CreditCard, MapPin, Truck } from 'lucide-react';

interface CreatedOrder {
  id: number;
}

export default function CheckoutPage() {
    const getErrorMessage = (err: unknown, fallback: string): string => {
      if (typeof err === 'object' && err !== null && 'data' in err) {
        const data = (err as { data?: { message?: string } }).data;
        return data?.message || fallback;
      }
      return fallback;
    };

  const router = useRouter();
  const { user } = useAuth();
  const { items, subtotal, clearCart, loading: cartLoading } = useCart();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [initializingPayment, setInitializingPayment] = useState(false);
  
  const [form, setForm] = useState({
    shipping_name: user?.name || '',
    shipping_phone: user?.phone || '',
    shipping_country: 'US',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    payment_method: 'credit_card',
    notes: ''
  });

  const selectedBackendPaymentMethod = form.payment_method === 'credit_card' ? 'card' : 'cod';

  const shippingCost = 15;
  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  const total = subtotal + shippingCost + tax;

  const initializeCardPayment = async () => {
    setInitializingPayment(true);
    setError('');
    try {
      const payment = await api.post<PaymentIntentResponse>('/payments/intent', { currency: 'usd' });
      setPaymentIntentId(payment.payment_intent_id);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to initialize secure payment.'));
    }
    setInitializingPayment(false);
  };

  const handleSubmitOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const order = await api.post<CreatedOrder>('/orders', {
        ...form,
        payment_method: selectedBackendPaymentMethod,
        payment_intent_id: selectedBackendPaymentMethod === 'card' ? paymentIntentId : undefined,
      });
      await clearCart();
      router.push(`/orders/${order.id}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to place order. Please try again.'));
    }
    setLoading(false);
  };

  if (cartLoading) return <div className="max-w-5xl mx-auto px-4 py-20 text-center">Loading...</div>;
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-3">Sign in to continue checkout</h1>
        <p className="text-muted mb-8">Please sign in or create an account first.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/login?redirect=/checkout" className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="px-6 py-3 border border-border font-bold rounded-xl hover:bg-surface transition-colors">
            Sign Up
          </Link>
        </div>
      </div>
    );
  }
  if (!items.length) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center"><h1 className="text-2xl font-bold mb-4">Cart is empty</h1><Link href="/products" className="text-primary hover:underline">Return to Shop</Link></div>;
  }

  const steps = [
    { id: 1, name: 'Shipping', icon: MapPin },
    { id: 2, name: 'Payment', icon: CreditCard },
    { id: 3, name: 'Review', icon: CheckCircle },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {error && <div className="mb-6 p-4 bg-danger/10 text-danger rounded-xl">{error}</div>}

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border -z-10 rounded-full" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }} />
            {steps.map((s) => {
              const isActive = step === s.id;
              const isPast = step > s.id;
              return (
                <div key={s.id} className="flex flex-col items-center gap-2 bg-background px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${isActive ? 'border-primary bg-primary text-white shadow-lg shadow-primary/30' : isPast ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface text-muted'}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-primary' : isPast ? 'text-foreground' : 'text-muted'}`}>{s.name}</span>
                </div>
              );
            })}
          </div>

          <div className="bg-background border border-border rounded-3xl p-6 md:p-8 shadow-sm">
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-1.5 ml-1">Full Name</label>
                    <input value={form.shipping_name} onChange={e => setForm({...form, shipping_name: e.target.value})} className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary/50 text-sm" placeholder="John Doe" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-1.5 ml-1">Phone Number</label>
                    <input value={form.shipping_phone} onChange={e => setForm({...form, shipping_phone: e.target.value})} className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary/50 text-sm" placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-1.5 ml-1">Address</label>
                    <input value={form.shipping_address} onChange={e => setForm({...form, shipping_address: e.target.value})} className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary/50 text-sm" placeholder="123 Main St" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 ml-1">City</label>
                    <input value={form.shipping_city} onChange={e => setForm({...form, shipping_city: e.target.value})} className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary/50 text-sm" placeholder="New York" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 ml-1">State</label>
                    <input value={form.shipping_state} onChange={e => setForm({...form, shipping_state: e.target.value})} className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary/50 text-sm" placeholder="NY" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 ml-1">ZIP Code</label>
                    <input value={form.shipping_zip} onChange={e => setForm({...form, shipping_zip: e.target.value})} className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary/50 text-sm" placeholder="10001" />
                  </div>
                </div>
                <button onClick={() => setStep(2)} className="w-full mt-6 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all btn-press shadow-lg shadow-primary/25">Continue to Payment</button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /> Payment Method</h2>
                
                <div className="space-y-3">
                  {['credit_card', 'cod'].map(method => (
                    <label key={method} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${form.payment_method === method ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:bg-surface-hover'}`}>
                      <input type="radio" name="payment" checked={form.payment_method === method} onChange={() => setForm({...form, payment_method: method})} className="w-4 h-4 text-primary focus:ring-primary" />
                      <span className="ml-3 font-semibold capitalize">{method === 'cod' ? 'Cash on Delivery' : method.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>

                {form.payment_method === 'credit_card' && (
                  <div className="p-4 border border-border rounded-xl bg-surface space-y-4">
                    <p className="text-sm text-muted">Card checkout is handled by the payment gateway using a server-created payment intent.</p>
                    <button
                      onClick={initializeCardPayment}
                      disabled={initializingPayment}
                      className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                      {initializingPayment ? 'Initializing secure payment...' : paymentIntentId ? 'Payment Authorized' : 'Authorize Secure Card Payment'}
                    </button>
                    {paymentIntentId && (
                      <p className="text-xs text-success">Payment intent created: {paymentIntentId}</p>
                    )}
                  </div>
                )}

                {form.payment_method === 'cod' && (
                  <div className="p-4 border border-border rounded-xl bg-surface">
                    <p className="text-sm text-muted flex items-start gap-2">
                      <Truck className="w-4 h-4 mt-0.5" />
                      Pay when your order is delivered. No online payment is required now.
                    </p>
                  </div>
                )}
                
                <div className="flex gap-4 mt-6">
                  <button onClick={() => setStep(1)} className="px-6 py-4 bg-surface border border-border font-bold rounded-xl hover:bg-surface-hover transition-colors">Back</button>
                  <button onClick={() => setStep(3)} className="flex-1 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all btn-press shadow-lg shadow-primary/25">Review Order</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary" /> Review Order</h2>
                
                <div className="grid md:grid-cols-2 gap-6 bg-surface p-6 border border-border rounded-2xl">
                  <div>
                    <h3 className="font-bold text-sm mb-2 text-muted uppercase tracking-wider">Shipping To</h3>
                    <p className="font-semibold">{form.shipping_name}</p>
                    <p className="text-sm mt-1">{form.shipping_address}<br/>{form.shipping_city}, {form.shipping_state} {form.shipping_zip}</p>
                    <button onClick={() => setStep(1)} className="text-primary text-sm font-semibold mt-2 hover:underline">Edit</button>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-2 text-muted uppercase tracking-wider">Payment</h3>
                    <p className="font-semibold capitalize flex items-center gap-2">
                      {form.payment_method === 'cod' ? <Truck className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                      {form.payment_method === 'cod' ? 'Cash on Delivery' : form.payment_method.replace('_', ' ')}
                    </p>
                    <button onClick={() => setStep(2)} className="text-primary text-sm font-semibold mt-2 hover:underline">Edit</button>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button onClick={() => setStep(2)} className="px-6 py-4 bg-surface border border-border font-bold rounded-xl hover:bg-surface-hover transition-colors">Back</button>
                  <button
                    onClick={handleSubmitOrder}
                    disabled={loading || (form.payment_method === 'credit_card' && !paymentIntentId)}
                    className="flex-1 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all btn-press shadow-lg shadow-primary/25 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1 border border-border rounded-3xl p-6 bg-surface h-fit sticky top-24 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
            {items.map(item => (
              <div key={item.id} className="flex gap-3">
                <div className="w-16 h-16 rounded-lg bg-background border border-border overflow-hidden shrink-0 relative">
                  <img src={getImageUrl(item.product?.primary_image?.image_path)} alt="" className="w-full h-full object-cover" />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-muted text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">{item.quantity}</span>
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <p className="text-sm font-semibold truncate hover:text-primary transition-colors cursor-pointer" onClick={() => router.push(`/products/${item.product?.slug}`)}>{item.product?.name}</p>
                  <p className="font-bold text-sm mt-1">{formatCurrency(Number(item.product?.price))}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-3 text-sm font-medium border-t border-border pt-6 mb-4">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Shipping</span><span>{formatCurrency(shippingCost)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Tax</span><span>{formatCurrency(tax)}</span></div>
          </div>
          <div className="flex justify-between items-end border-t border-border pt-4">
            <span className="font-bold text-lg">Total</span>
            <span className="text-3xl font-black text-primary">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
