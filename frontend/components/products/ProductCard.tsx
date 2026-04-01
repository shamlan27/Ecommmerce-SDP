'use client';

import Link from 'next/link';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { ShoppingCart, Star, Scale } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const primaryImage = product.primary_image?.image_path || product.images?.[0]?.image_path;
  const imageSrc = getImageUrl(primaryImage);

  const handleQuickAdd = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!user) {
      router.push('/login?redirect=/products');
      return;
    }

    await addToCart(product.id, 1);
  };

  const addToCompare = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const key = 'compare_product_ids';
    const current = JSON.parse(localStorage.getItem(key) || '[]') as number[];
    const merged = Array.from(new Set([...current, product.id])).slice(-4);
    localStorage.setItem(key, JSON.stringify(merged));
    router.push(`/products/compare?ids=${merged.join(',')}`);
  };

  return (
    <div className="group relative bg-background border border-border rounded-2xl overflow-hidden card-hover flex flex-col h-full">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.compare_price && product.compare_price > product.price && (
          <span className="px-2.5 py-1 text-[10px] font-bold bg-danger text-white rounded-full uppercase tracking-wider shadow-md">Sale</span>
        )}
        {product.is_featured && (
          <span className="px-2.5 py-1 text-[10px] font-bold bg-primary text-white rounded-full uppercase tracking-wider shadow-md">Featured</span>
        )}
      </div>

      {/* Image container */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/5] bg-surface overflow-hidden group-hover:opacity-90 transition-opacity">
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        {/* Quick Add overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={handleQuickAdd}
            disabled={product.stock_quantity === 0}
            className="w-full py-3 bg-white/90 backdrop-blur text-foreground font-semibold text-sm rounded-xl hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            <ShoppingCart className="w-4 h-4" />
            {product.stock_quantity === 0 ? 'Out of Stock' : 'Quick Add'}
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-1 text-xs text-muted flex items-center justify-between">
          <span className="uppercase tracking-wide font-medium">{product.category?.name || 'Category'}</span>
          {product.average_rating ? (
            <span className="flex items-center gap-1 text-accent font-medium"><Star className="w-3 h-3 fill-current" /> {Number(product.average_rating).toFixed(1)}</span>
          ) : null}
        </div>
        
        <Link href={`/products/${product.slug}`} className="block mb-2 flex-1">
          <h3 className="font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-end justify-between mt-auto pt-3 border-t border-border/50">
          <div className="flex flex-col">
            {product.compare_price && product.compare_price > product.price ? (
              <>
                <span className="text-xs text-muted line-through mb-0.5">{formatCurrency(Number(product.compare_price))}</span>
                <span className="font-bold text-danger text-lg leading-none">{formatCurrency(Number(product.price))}</span>
              </>
            ) : (
              <span className="font-bold text-lg leading-none">{formatCurrency(Number(product.price))}</span>
            )}
          </div>
          <button
            onClick={addToCompare}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-surface transition-colors"
            title="Compare product"
          >
            <Scale className="w-3.5 h-3.5" /> Compare
          </button>
        </div>
      </div>
    </div>
  );
}
