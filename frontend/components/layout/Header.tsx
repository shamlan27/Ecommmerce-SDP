'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import {
  ShoppingCart, User, Search, Menu, X, Heart,
  Package, LogOut, LayoutDashboard, ChevronDown, Store
} from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" id="header-logo">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-background border border-border shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
              <Image
                src="/logo.jpg"
                alt="ShopNest logo"
                width={36}
                height={36}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">ShopNest</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                id="header-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/products" className="px-3 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors rounded-lg hover:bg-surface" id="nav-products">
              Products
            </Link>
            <Link href="/categories" className="px-3 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors rounded-lg hover:bg-surface" id="nav-categories">
              Categories
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {user && (
              <Link href="/wishlist" className="relative p-2 text-muted hover:text-foreground transition-colors rounded-lg hover:bg-surface" id="header-wishlist">
                <Heart className="w-5 h-5" />
              </Link>
            )}

            <Link href="/cart" className="relative p-2 text-muted hover:text-foreground transition-colors rounded-lg hover:bg-surface" id="header-cart">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-fade-in">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 text-sm font-medium text-muted hover:text-foreground transition-colors rounded-lg hover:bg-surface"
                  id="header-user-menu"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:block">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-4 h-4 hidden lg:block" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-xl shadow-xl z-50 py-2 animate-fade-in">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-muted">{user.email}</p>
                      </div>
                      <Link href="/account/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <Package className="w-4 h-4" /> My Orders
                      </Link>
                      <Link href="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <User className="w-4 h-4" /> Account Settings
                      </Link>
                      {user.role === 'admin' && (
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface transition-colors text-primary font-medium" onClick={() => setUserMenuOpen(false)}>
                          <LayoutDashboard className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-border mt-1 pt-1">
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger hover:bg-surface transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors" id="header-login">
                  Sign In
                </Link>
                <Link href="/register" className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors btn-press shadow-lg shadow-primary/25" id="header-register">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-muted hover:text-foreground transition-colors"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 animate-fade-in">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
                >
                  Go
                </button>
              </div>
            </form>
            <div className="flex flex-col gap-1">
              <Link href="/products" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-surface" onClick={() => setMobileMenuOpen(false)}>Products</Link>
              <Link href="/categories" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-surface" onClick={() => setMobileMenuOpen(false)}>Categories</Link>
              {user && (
                <>
                  <Link href="/orders" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-surface" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
                  <Link href="/account/dashboard" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-surface" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                  <Link href="/help" className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-surface" onClick={() => setMobileMenuOpen(false)}>Help Center</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
