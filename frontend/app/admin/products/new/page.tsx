'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import type { Category } from '@/lib/types';
import { ArrowLeft, Save, UploadCloud } from 'lucide-react';

export default function NewProductAdmin() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    useEffect(() => {
        api.get<Category[]>('/categories').then(setCategories);
    }, []);

    const [form, setForm] = useState({
        name: '', category_id: '', slug: '', short_description: '', description: '', 
        price: '', compare_price: '', brand: '', sku: '', stock_quantity: '10', 
        is_active: true, is_featured: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/admin/products', {...form, price: Number(form.price), stock_quantity: Number(form.stock_quantity), category_id: Number(form.category_id)});
            router.push('/admin/products');
        } catch (err: any) {
            setError(err.data?.message || 'Failed to create product');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary mb-6"><ArrowLeft className="w-4 h-4" /> Back to Products</Link>
            
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Add New Product</h1>
                <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all btn-press shadow-md disabled:opacity-50">
                    <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Product'}
                </button>
            </div>

            {error && <div className="mb-6 p-4 bg-danger/10 text-danger rounded-xl border border-danger/20 font-medium">{error}</div>}

            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 space-y-6">
                    <div className="bg-background border border-border rounded-2xl p-6">
                        <h2 className="text-lg font-bold mb-4">Basic Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1.5 ml-1">Product Name</label>
                                <input value={form.name} onChange={e => {
                                    setForm({...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')});
                                }} required className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 ml-1">SKU</label>
                                    <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} required className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 ml-1">Slug (URL)</label>
                                    <input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} required className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5 ml-1">Short Description</label>
                                <textarea value={form.short_description} onChange={e => setForm({...form, short_description: e.target.value})} required className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 resize-none h-20" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5 ml-1">Full Description</label>
                                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 resize-y min-h-[150px]" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-background border border-border rounded-2xl p-6">
                        <h2 className="text-lg font-bold mb-4">Pricing & Stock</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1.5 ml-1">Price ($)</label>
                                <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 font-mono" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5 ml-1">Compare Price</label>
                                <input type="number" step="0.01" value={form.compare_price} onChange={e => setForm({...form, compare_price: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 font-mono" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5 ml-1">Stock Qty</label>
                                <input type="number" value={form.stock_quantity} onChange={e => setForm({...form, stock_quantity: e.target.value})} required className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 font-mono" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-background border border-border rounded-2xl p-6">
                        <h2 className="text-lg font-bold mb-4">Organization</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1.5 ml-1">Category</label>
                                <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} required className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50">
                                    <option value="">Select category...</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5 ml-1">Brand (optional)</label>
                                <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-background border border-border rounded-2xl p-6">
                        <h2 className="text-lg font-bold mb-4">Product Images</h2>
                        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-surface hover:bg-surface-hover transition-colors cursor-pointer group">
                            <UploadCloud className="w-8 h-8 text-muted mx-auto mb-3 group-hover:text-primary transition-colors" />
                            <p className="text-sm font-semibold">Click to upload images</p>
                            <p className="text-xs text-muted mt-1">PNG, JPG, WebP up to 5MB</p>
                        </div>
                    </div>

                    <div className="bg-background border border-border rounded-2xl p-6">
                        <h2 className="text-lg font-bold mb-4">Status & Visibility</h2>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:bg-surface transition-colors">
                                <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="w-4 h-4 text-primary focus:ring-primary rounded" />
                                <div>
                                    <p className="text-sm font-bold">Active</p>
                                    <p className="text-xs text-muted">Visible in catalog</p>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:bg-surface transition-colors">
                                <input type="checkbox" checked={form.is_featured} onChange={e => setForm({...form, is_featured: e.target.checked})} className="w-4 h-4 text-primary focus:ring-primary rounded" />
                                <div>
                                    <p className="text-sm font-bold">Featured</p>
                                    <p className="text-xs text-muted">Show on homepage</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
