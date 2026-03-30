'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Package, Users, 
  Settings, BarChart, Tags, MessageSquare 
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return <div className="p-20 text-center skeleton h-screen">Loading admin portal...</div>;
  }

  const nav = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Categories', href: '/admin/categories', icon: Tags },
    { name: 'Orders', href: '/admin/orders', icon: Package },
    { name: 'Customers', href: '/admin/users', icon: Users },
    { name: 'Support Tickets', href: '/admin/tickets', icon: MessageSquare },
    { name: 'Reports', href: '/admin/reports', icon: BarChart },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-surface border-r border-border shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto hidden md:block">
        <div className="p-6">
          <h2 className="text-xs font-bold text-muted uppercase tracking-wider mb-4">Admin Portal</h2>
          <nav className="space-y-1">
            {nav.map(item => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                    active 
                      ? 'bg-primary text-white shadow-md shadow-primary/20' 
                      : 'text-muted hover:bg-background hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden min-w-0">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
