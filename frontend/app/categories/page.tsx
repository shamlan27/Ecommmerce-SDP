'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import type { Category } from '@/lib/types';
import { ArrowRight, ShoppingBag } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Category[]>('/categories')
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">All Categories</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/3] skeleton rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Shop by Category</h1>
        <p className="text-muted max-w-2xl mx-auto">Explore our wide selection of products organized by category to help you find exactly what you're looking for.</p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-3xl border border-border border-dashed">
          <ShoppingBag className="w-16 h-16 text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No categories found</h2>
          <p className="text-muted">Check back later for updates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <Link key={category.id} href={`/products?category_slug=${category.slug}`} className="group relative bg-background border border-border rounded-3xl overflow-hidden card-hover block aspect-[4/3]">
              <div className="absolute inset-0 bg-surface">
                {category.image ? (
                  <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                    <ShoppingBag className="w-16 h-16 text-primary/20" />
                  </div>
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 via-background/60 to-transparent p-6 pt-20 flex items-end justify-between backdrop-blur-[2px]">
                <div>
                  <h3 className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors">{category.name}</h3>
                  <p className="text-sm font-medium text-muted">{category.products_count || 0} Products</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-primary-dark">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
