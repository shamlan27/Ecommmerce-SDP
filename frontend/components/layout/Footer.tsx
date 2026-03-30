'use client';

import Link from 'next/link';
import { Store, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">ShopNest</span>
            </Link>
            <p className="text-sm text-muted leading-relaxed mb-4">
              Your premier destination for quality products at unbeatable prices. Shop with confidence and enjoy a seamless experience.
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@shopnest.com</div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> +1 (555) 123-4567</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> New York, NY 10001</div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm text-muted">
              <li><Link href="/products" className="hover:text-primary transition-colors">All Products</Link></li>
              <li><Link href="/categories" className="hover:text-primary transition-colors">Categories</Link></li>
              <li><Link href="/products?featured=true" className="hover:text-primary transition-colors">Featured Items</Link></li>
              <li><Link href="/products?sort_by=created_at" className="hover:text-primary transition-colors">New Arrivals</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2.5 text-sm text-muted">
              <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="/orders" className="hover:text-primary transition-colors">Track Order</Link></li>
              <li><Link href="/help/new" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/account" className="hover:text-primary transition-colors">My Account</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-4">Stay Updated</h3>
            <p className="text-sm text-muted mb-4">Subscribe to our newsletter for exclusive deals and updates.</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button type="submit" className="px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors btn-press">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted">&copy; {new Date().getFullYear()} ShopNest. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-muted">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
