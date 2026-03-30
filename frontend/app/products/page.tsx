'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import type { Product, Category, PaginatedResponse } from '@/lib/types';
import ProductCard from '@/components/products/ProductCard';
import { Filter, Search as SearchIcon, X, ChevronDown } from 'lucide-react';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filters state
  const querySearch = searchParams.get('search') || '';
  const queryCategory = searchParams.get('category_slug') || '';
  const querySort = searchParams.get('sort_by') || 'created_at';
  const queryOrder = searchParams.get('sort_order') || 'desc';

  useEffect(() => {
    api.get<Category[]>('/categories')
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (querySearch) params.set('search', querySearch);
    if (queryCategory) params.set('category_slug', queryCategory);
    params.set('sort_by', querySort);
    params.set('sort_order', queryOrder);
    params.set('per_page', '12');

    api.get<PaginatedResponse<Product>>(`/products?${params.toString()}`)
      .then(res => {
        setProducts(res.data);
        setTotal(res.total);
      })
      .finally(() => setLoading(false));
  }, [querySearch, queryCategory, querySort, queryOrder]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {querySearch ? `Search: "${querySearch}"` : queryCategory ? categories.find(c => c.slug === queryCategory)?.name || 'Products' : 'All Products'}
          </h1>
          <p className="text-muted">{total} items found</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl font-medium">
            <Filter className="w-4 h-4" /> Filters
          </button>
          
          <div className="relative group flex-1 md:flex-none">
            <select
              value={`${querySort}|${queryOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('|');
                updateFilters('sort_by', sort);
                updateFilters('sort_order', order);
              }}
              className="w-full md:w-auto appearance-none pl-4 pr-10 py-2.5 bg-surface border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              <option value="created_at|desc">Newest First</option>
              <option value="price|asc">Price: Low to High</option>
              <option value="price|desc">Price: High to Low</option>
              <option value="name|asc">Name: A to Z</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className={`md:w-64 shrink-0 space-y-8 ${showFilters ? 'block' : 'hidden md:block'}`}>
          {/* Categories */}
          <div className="bg-background rounded-2xl border border-border p-5">
            <h3 className="font-bold text-lg mb-4">Categories</h3>
            <div className="space-y-2">
              <button 
                onClick={() => updateFilters('category_slug', '')}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!queryCategory ? 'bg-primary/10 text-primary font-bold' : 'text-muted hover:bg-surface hover:text-foreground'}`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => updateFilters('category_slug', cat.slug)}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between items-center ${queryCategory === cat.slug ? 'bg-primary/10 text-primary font-bold' : 'text-muted hover:bg-surface hover:text-foreground'}`}
                >
                  <span>{cat.name}</span>
                  <span className="text-xs opacity-50">{cat.products_count}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Active Filters */}
          {(querySearch || queryCategory) && (
            <div className="bg-background rounded-2xl border border-border p-5">
              <h3 className="font-bold text-sm mb-3 text-muted uppercase tracking-wider">Active Filters</h3>
              <div className="flex flex-wrap gap-2">
                {querySearch && (
                  <button onClick={() => updateFilters('search', '')} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs font-medium hover:bg-danger/10 hover:text-danger hover:border-danger/30 transition-all group">
                    Search: {querySearch} <X className="w-3 h-3 group-hover:scale-110" />
                  </button>
                )}
                {queryCategory && (
                  <button onClick={() => updateFilters('category_slug', '')} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs font-medium hover:bg-danger/10 hover:text-danger hover:border-danger/30 transition-all group">
                    Category <X className="w-3 h-3 group-hover:scale-110" />
                  </button>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <div key={i} className="h-[400px] skeleton rounded-2xl" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-3xl border border-border border-dashed">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <SearchIcon className="w-6 h-6 text-muted" />
              </div>
              <h2 className="text-xl font-bold mb-2">No products found</h2>
              <p className="text-muted max-w-md mx-auto mb-6">We couldn't find anything matching your current filters. Try removing some filters or searching for something else.</p>
              <button onClick={() => router.push('/products')} className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors btn-press">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-muted">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
