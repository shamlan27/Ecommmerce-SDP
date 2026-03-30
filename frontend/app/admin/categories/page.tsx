'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Category } from '@/lib/types';
import { Search, Plus, Trash2, Edit } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = () => {
    setLoading(true);
    api.get<Category[]>('/admin/categories')
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const deleteCategory = async (id: number) => {
    if (confirm('Are you sure you want to delete this category? It may break associated products.')) {
      await api.delete(`/admin/categories/${id}`);
      fetchCategories();
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Categories</h1>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all btn-press shadow-md">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase text-muted bg-surface border-b border-border">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Name & Slug</th>
                <th className="px-6 py-4">Products</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div></td></tr>
              ) : categories.map(cat => (
                <tr key={cat.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 bg-surface rounded-lg overflow-hidden border border-border">
                      {cat.image ? <img src={cat.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted">No IMG</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold">{cat.name}</p>
                    <p className="text-xs text-muted">{cat.slug}</p>
                  </td>
                  <td className="px-6 py-4 font-semibold">{cat.products_count || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cat.is_active ? 'bg-success/10 text-success' : 'bg-muted text-foreground'}`}>
                      {cat.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-muted hover:text-primary bg-surface hover:bg-primary/10 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deleteCategory(cat.id)} className="p-2 text-muted hover:text-danger bg-surface hover:bg-danger/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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
