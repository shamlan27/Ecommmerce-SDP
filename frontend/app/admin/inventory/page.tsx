'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Product, PaginatedResponse } from '@/lib/types';
import { Search, AlertTriangle, ArrowRightLeft } from 'lucide-react';

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchInventory = () => {
    setLoading(true);
    api.get<PaginatedResponse<Product>>(`/admin/products?search=${search}&per_page=50`)
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInventory();
  }, [search]);

  const updateStock = async (id: number, quantity: number) => {
    try {
      await api.put(`/admin/inventory/${id}`, { stock_quantity: quantity });
      fetchInventory();
    } catch(e) { console.error(e); }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Inventory Management</h1>

      <div className="bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-surface flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by SKU or Product Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2 text-sm font-semibold">
            <span className="px-3 py-1.5 bg-danger/10 text-danger rounded-lg flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Low Stock Items Only</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase text-muted bg-surface border-b border-border">
              <tr>
                <th className="px-6 py-4">Product / SKU</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Current Stock</th>
                <th className="px-6 py-4 text-right">Quick Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div></td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted">No inventory records found.</td></tr>
              ) : products.map(product => (
                <tr key={product.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-foreground">{product.name}</p>
                    <p className="text-xs text-muted font-mono mt-1">SKU: {product.sku}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${product.stock_quantity > 20 ? 'bg-success/10 text-success' : product.stock_quantity > 0 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
                      {product.stock_quantity > 20 ? 'In Stock' : product.stock_quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-lg">{product.stock_quantity}</span> unit(s)
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => updateStock(product.id, Math.max(0, product.stock_quantity - 1))} className="px-3 py-1.5 border border-border bg-surface hover:bg-surface-hover rounded-lg font-bold">−</button>
                       <button onClick={() => updateStock(product.id, product.stock_quantity + 10)} className="px-3 py-1.5 border border-border bg-surface hover:text-success rounded-lg font-bold" title="Add 10">+10</button>
                       <button className="px-3 py-1.5 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-colors"><ArrowRightLeft className="w-4 h-4" /></button>
                    </div>
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
