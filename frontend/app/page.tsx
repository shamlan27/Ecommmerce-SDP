'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import type { Product, Category } from '@/lib/types';
import ProductCard from '@/components/products/ProductCard';
import { ArrowRight, Zap, ShieldCheck, Truck, Clock } from 'lucide-react';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any>('/products?featured=1&per_page=8'),
      api.get<Category[]>('/categories')
    ]).then(([productsRes, cats]) => {
      setFeaturedProducts(productsRes.data || []);
      setCategories(cats ? cats.slice(0, 4) : []);
    })
    .catch(() => {
      setFeaturedProducts([]);
      setCategories([]);
    })
    .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
          alt="Hero background"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full animate-slide-up">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm tracking-widest uppercase mb-6 backdrop-blur-md border border-primary/20">
              New Collection 2026
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Elevate Your <br /> 
              <span className="gradient-text">Lifestyle.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted mb-8 leading-relaxed max-w-lg">
              Discover curated tech, fashion, and home goods designed for the modern aesthetic. Uncompromising quality meets exceptional design.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-colors btn-press shadow-xl shadow-primary/30 flex items-center gap-2">
                Shop Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/categories" className="px-8 py-4 bg-surface text-foreground font-bold rounded-2xl hover:bg-surface-hover transition-colors border border-border btn-press">
                Explore Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-b border-border bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: "Fast Delivery", desc: "Same day dispatch" },
              { icon: ShieldCheck, title: "Secure Payment", desc: "100% protected" },
              { icon: Truck, title: "Free Shipping", desc: "On orders over $50" },
              { icon: Clock, title: "24/7 Support", desc: "Always here for you" }
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold mb-1">{f.title}</h3>
                <p className="text-sm text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Shop by Category</h2>
              <p className="text-muted">Find exactly what you're looking for</p>
            </div>
            <Link href="/categories" className="hidden sm:flex text-primary font-bold items-center gap-1 hover:gap-2 transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="aspect-square skeleton rounded-3xl" />)
            ) : categories.map(cat => (
              <Link key={cat.id} href={`/products?category_slug=${cat.slug}`} className="group relative aspect-square rounded-3xl overflow-hidden card-hover">
                <img src={cat.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8'} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                  <h3 className="text-white text-xl font-bold mb-1">{cat.name}</h3>
                  <p className="text-white/80 text-sm font-medium">{cat.products_count} Products</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trending Now</h2>
            <p className="text-muted max-w-2xl mx-auto">Discover our most popular products this week, handpicked for you.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [...Array(8)].map((_, i) => <div key={i} className="h-[400px] skeleton rounded-3xl" />)
            ) : featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-background border-2 border-primary text-primary font-bold rounded-2xl hover:bg-primary hover:text-white transition-all btn-press">
              View All Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
