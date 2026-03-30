'use client';

import { useCart } from '@/contexts/CartContext';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  if (!items || items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-muted" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Your cart is empty</h1>
        <p className="text-muted mb-8 max-w-sm mx-auto">Looks like you haven't added anything to your cart yet. Discover your next favorite item in our shop.</p>
        <Link href="/products" className="inline-flex px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors btn-press shadow-md shadow-primary/20">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">Shopping Cart <span className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full">{items.length} items</span></h1>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-background border border-border rounded-2xl p-4 shadow-sm hidden md:grid grid-cols-12 gap-4 text-xs font-bold uppercase tracking-wider text-muted">
            <div className="col-span-6">Product</div>
            <div className="col-span-3 text-center">Quantity</div>
            <div className="col-span-3 text-right">Total</div>
          </div>

          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-background border border-border rounded-2xl p-4 shadow-sm hover:border-primary/25 transition-colors relative group">
                <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                  <div className="col-span-6 flex items-center gap-4 w-full">
                    <Link href={`/products/${item.product.slug}`} className="w-20 h-20 rounded-xl bg-surface overflow-hidden shrink-0 border border-border/50">
                      <img src={getImageUrl(item.product.primary_image?.image_path || item.product.images?.[0]?.image_path)} alt={item.product.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product.slug}`} className="font-bold text-foreground hover:text-primary transition-colors line-clamp-2">{item.product.name}</Link>
                      <p className="text-sm font-semibold text-primary mt-1">{formatCurrency(Number(item.product.price))}</p>
                    </div>
                  </div>

                  <div className="col-span-3 flex items-center justify-between w-full md:justify-center">
                    <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1">
                      <button disabled={item.quantity <= 1} onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-background text-muted hover:text-foreground transition-colors disabled:opacity-50">−</button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button disabled={item.quantity >= item.product.stock_quantity} onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-background text-muted hover:text-foreground transition-colors disabled:opacity-50">+</button>
                    </div>
                  </div>

                  <div className="col-span-3 flex items-center justify-between md:justify-end w-full">
                    <span className="font-bold text-lg md:text-base">{formatCurrency(Number(item.product.price) * item.quantity)}</span>
                    <button onClick={() => removeItem(item.id)} className="p-2 text-muted hover:text-danger bg-surface hover:bg-danger/10 rounded-lg transition-colors ml-4 md:absolute md:-right-2 md:-top-2 opacity-100 md:opacity-0 group-hover:opacity-100 md:shadow-md">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          <div className="bg-background border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 text-sm text-foreground/80 mb-6 pb-6 border-b border-border">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Shipping Estimate</span>
                <span className="text-success font-semibold">Calculated at checkout</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tax Estimate</span>
                <span className="font-semibold">Calculated at checkout</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-base font-bold">Estimated Total</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(subtotal)}</span>
            </div>

            <Link href="/checkout" className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors btn-press shadow-md shadow-primary/20">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="mt-4 text-center">
              <Link href="/products" className="text-sm font-semibold text-muted hover:text-primary transition-colors">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
