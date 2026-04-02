'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { getApiBaseUrl } from '@/lib/api';
import type { Category, Product } from '@/lib/types';
import { getImageUrl } from '@/lib/utils';
import { ArrowLeft, Save, UploadCloud } from 'lucide-react';

export default function EditProductAdmin() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: '',
    category_id: '',
    short_description: '',
    description: '',
    price: '',
    compare_price: '',
    brand: '',
    sku: '',
    stock_quantity: '0',
    is_active: true,
    is_featured: false,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [categoryRes, productRes] = await Promise.all([
          api.get<Category[]>('/categories'),
          api.get<Product>(`/admin/products/${id}`),
        ]);

        setCategories(categoryRes);
        setForm({
          name: productRes.name || '',
          category_id: String(productRes.category_id || ''),
          short_description: productRes.short_description || '',
          description: productRes.description || '',
          price: String(productRes.price ?? ''),
          compare_price: productRes.compare_price ? String(productRes.compare_price) : '',
          brand: productRes.brand || '',
          sku: productRes.sku || '',
          stock_quantity: String(productRes.stock_quantity ?? 0),
          is_active: productRes.is_active,
          is_featured: productRes.is_featured,
        });
        setImages(productRes.images?.map((img) => img.image_path) || []);
      } catch {
        setError('Failed to load product data.');
      } finally {
        setPageLoading(false);
      }
    };

    if (Number.isFinite(id) && id > 0) {
      load();
    } else {
      setError('Invalid product id.');
      setPageLoading(false);
    }
  }, [id]);

  const isLikelyImageUrl = (value: string): boolean => {
    const url = value.toLowerCase();
    return /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(url) || url.includes('images.unsplash.com');
  };

  const addImageUrl = () => {
    const value = imageUrl.trim();
    if (!value) return;

    if (!/^https?:\/\//i.test(value) || !isLikelyImageUrl(value)) {
      setError('Please add a direct image URL (jpg, png, webp, etc.), not a product page link.');
      return;
    }

    setError('');
    setImages((prev) => [...prev, value]);
    setImageUrl('');
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImageFile = async (file: File) => {
    const apiBase = getApiBaseUrl();
    const token = localStorage.getItem('auth_token');

    if (!token) {
      throw new Error('Please sign in again to upload images.');
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${apiBase}/admin/products/upload-image`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = typeof data?.message === 'string' ? data.message : 'Failed to upload image.';
      throw new Error(message);
    }

    if (!data?.path) {
      throw new Error('Upload succeeded but no image path was returned.');
    }

    return data.path as string;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploadingImage(true);
    setError('');

    try {
      const uploadedPaths: string[] = [];
      for (const file of Array.from(files)) {
        const path = await uploadImageFile(file);
        uploadedPaths.push(path);
      }
      setImages((prev) => [...prev, ...uploadedPaths]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to upload image.';
      setError(message);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.put(`/admin/products/${id}`, {
        ...form,
        price: Number(form.price),
        compare_price: form.compare_price ? Number(form.compare_price) : null,
        stock_quantity: Number(form.stock_quantity),
        category_id: Number(form.category_id),
        images,
      });
      router.push('/admin/products');
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'data' in err) {
        const data = (err as { data?: { message?: string } }).data;
        setError(data?.message || 'Failed to update product.');
      } else {
        setError('Failed to update product.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="max-w-4xl mx-auto py-16 text-center">Loading product...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all btn-press shadow-md disabled:opacity-50">
          <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Update Product'}
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
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 ml-1">SKU</label>
                  <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 ml-1">Category</label>
                  <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50">
                    <option value="">Select category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 ml-1">Short Description</label>
                <textarea value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 resize-none h-20" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 ml-1">Full Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 resize-y min-h-[150px]" />
              </div>
            </div>
          </div>

          <div className="bg-background border border-border rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">Pricing & Stock</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 ml-1">Price ($)</label>
                <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 font-mono" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 ml-1">Compare Price</label>
                <input type="number" step="0.01" value={form.compare_price} onChange={(e) => setForm({ ...form, compare_price: e.target.value })} className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 font-mono" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 ml-1">Stock Qty</label>
                <input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} required className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 font-mono" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-background border border-border rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">Product Images</h2>
            <div className="space-y-3">
              <div className="border-2 border-dashed border-border rounded-xl p-4 bg-surface">
                <UploadCloud className="w-6 h-6 text-muted mb-2" />
                <p className="text-sm font-semibold mb-2">Upload image file</p>
                <label className="w-full block cursor-pointer">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="w-full text-center px-3 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors">
                    {uploadingImage ? 'Uploading...' : 'Choose Image Files'}
                  </div>
                </label>
                <p className="text-xs text-muted mt-2">Files are stored in backend public storage.</p>
              </div>

              <div className="border-2 border-dashed border-border rounded-xl p-4 bg-surface">
                <p className="text-sm font-semibold mb-2">Or add image URL</p>
                <div className="flex gap-2">
                  <input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors"
                  >
                    Add
                  </button>
                </div>
                <p className="text-xs text-muted mt-2">First image becomes primary.</p>
              </div>

              {images.length > 0 && (
                <div className="space-y-2">
                  {images.map((img, idx) => (
                    <div key={`${img}-${idx}`} className="flex items-center gap-2 p-2 border border-border rounded-lg bg-surface">
                      <img src={getImageUrl(img)} alt="" className="w-10 h-10 rounded object-cover border border-border" />
                      <span className="text-xs font-mono truncate flex-1">{img}</span>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="text-xs px-2 py-1 rounded bg-danger/10 text-danger hover:bg-danger/20"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-background border border-border rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">Status & Visibility</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:bg-surface transition-colors">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 text-primary focus:ring-primary rounded" />
                <div>
                  <p className="text-sm font-bold">Active</p>
                  <p className="text-xs text-muted">Visible in catalog</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:bg-surface transition-colors">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4 text-primary focus:ring-primary rounded" />
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
