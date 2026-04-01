'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import type { Product, PaginatedResponse } from '@/lib/types';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = useCallback(() => {
    setLoading(true);
    api.get<PaginatedResponse<Product>>(`/admin/products?search=${search}&per_page=50`)
      .then(res => setProducts(res.data))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const handle = setTimeout(() => {
      fetchProducts();
    }, 0);

    return () => clearTimeout(handle);
  }, [fetchProducts]);

    const toggleStatus = async (id: number, currentStatus: boolean) => {
      try {
        await api.put(`/admin/products/${id}`, { is_active: !currentStatus });
        fetchProducts();
      } catch (e) { console.error(e); }
    };

    const deleteProduct = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await api.delete(`/admin/products/${id}`);
      fetchProducts();
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href="/admin/products/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all btn-press shadow-md">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-surface">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase text-muted bg-surface border-b border-border">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div></td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted">No products found.</td></tr>
              ) : products.map(product => (
                <tr key={product.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-surface border border-border overflow-hidden shrink-0">
                        <img src={getImageUrl(product.primary_image?.image_path || product.images?.[0]?.image_path)} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground line-clamp-1">{product.name}</p>
                        <p className="text-xs text-muted">{product.category?.name} • SKU: {product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{formatCurrency(Number(product.price))}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.stock_quantity > 10 ? 'bg-success/10 text-success' : product.stock_quantity > 0 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleStatus(product.id, product.is_active)} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${product.is_active ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-muted/10 text-muted hover:bg-muted/20'}`}>
                      {product.is_active ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {product.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/products/${product.id}`} className="p-2 text-muted hover:text-primary bg-surface hover:bg-primary/10 rounded-lg transition-colors"><Edit className="w-4 h-4" /></Link>
                      <button onClick={() => deleteProduct(product.id)} className="p-2 text-muted hover:text-danger bg-surface hover:bg-danger/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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
