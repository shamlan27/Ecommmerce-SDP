"use client";

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { PaginatedResponse, Product } from '@/lib/types';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import api from '@/lib/api';

interface CompareResponse {
  products: Product[];
}

function parseIds(idsValue: string | null): number[] {
  return (idsValue || '')
    .split(',')
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isFinite(id) && id > 0)
    .slice(0, 4);
}

async function fetchCompareProducts(ids: number[]): Promise<Product[]> {
  if (ids.length === 0) {
    return [];
  }

  try {
    const response = await api.get<CompareResponse>(`/products/compare?ids=${ids.join(',')}`, {
      cache: 'no-store',
    });

    return response.products || [];
  } catch {
    return [];
  }
}

async function fetchSuggestedProducts(): Promise<Product[]> {
  try {
    const response = await api.get<PaginatedResponse<Product>>('/products?per_page=12&sort_by=created_at&sort_dir=desc', {
      cache: 'no-store',
    });

    return response.data || [];
  } catch {
    return [];
  }
}

function CompareProductPicker({
  selectedProduct,
  suggestions,
  onAddProduct,
}: {
  selectedProduct: Product;
  suggestions: Product[];
  onAddProduct: (productId: number) => void;
}) {
  return (
    <div className="rounded-3xl border border-border bg-background p-6 md:p-8 space-y-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Choose another product</h2>
          <p className="text-muted mt-1">Pick one more product to compare against your selected item.</p>
        </div>
        <Link href="/products" className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-primary text-white font-semibold">
          Browse all products
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr] items-start">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Selected product</p>
          <div className="w-full h-52 rounded-xl overflow-hidden border border-border bg-background mb-3">
            <img
              src={getImageUrl(selectedProduct.primary_image?.image_path || selectedProduct.images?.[0]?.image_path)}
              alt={selectedProduct.name}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="font-bold leading-tight">{selectedProduct.name}</p>
          <p className="text-sm text-muted mt-1">{formatCurrency(Number(selectedProduct.price))}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Suggested products</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {suggestions.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => onAddProduct(product.id)}
                className="text-left rounded-2xl border border-border bg-background hover:border-primary/40 hover:shadow-lg transition-all overflow-hidden group"
              >
                <div className="aspect-[4/3] bg-surface overflow-hidden">
                  <img
                    src={getImageUrl(product.primary_image?.image_path || product.images?.[0]?.image_path)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold leading-tight line-clamp-2">{product.name}</h3>
                    <span className="text-sm font-bold whitespace-nowrap">{formatCurrency(Number(product.price))}</span>
                  </div>
                  <p className="text-xs text-muted line-clamp-2 mb-4">{product.brand || product.category?.name || 'Product'}</p>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold">
                    Add to compare
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompareProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"><div className="h-12 w-72 skeleton rounded-xl mb-6" /><div className="grid gap-6 lg:grid-cols-2"><div className="h-[520px] skeleton rounded-3xl" /><div className="h-[520px] skeleton rounded-3xl" /></div></div>}>
      <CompareProductsContent />
    </Suspense>
  );
}

function CompareProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ids = parseIds(searchParams.get('ids'));

  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const [compareResponse, suggestionsResponse] = await Promise.all([
        fetchCompareProducts(ids),
        fetchSuggestedProducts(),
      ]);

      if (cancelled) {
        return;
      }

      const orderedProducts = ids
        .map((id) => compareResponse.find((product) => product.id === id))
        .filter((product): product is Product => Boolean(product));

      setCompareProducts(orderedProducts);
      setSuggestedProducts(suggestionsResponse.filter((product) => !ids.includes(product.id)));
      setLoading(false);
    }

    load().catch(() => {
      if (!cancelled) {
        setCompareProducts([]);
        setSuggestedProducts([]);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [ids.join(',')]);

  const updateSelection = (productId: number) => {
    const nextIds = Array.from(new Set([...ids, productId])).slice(-4);
    localStorage.setItem('compare_product_ids', JSON.stringify(nextIds));
    router.push(`/products/compare?ids=${nextIds.join(',')}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-12 w-72 skeleton rounded-xl mb-6" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-[520px] skeleton rounded-3xl" />
          <div className="h-[520px] skeleton rounded-3xl" />
        </div>
      </div>
    );
  }

  if (ids.length === 0 || compareProducts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-3">Compare Products</h1>
        <p className="text-muted mb-6">Select a product, then choose another one to compare features, price, and availability.</p>
        <Link href="/products" className="inline-flex px-5 py-2.5 rounded-xl bg-primary text-white font-semibold">Browse Products</Link>
      </div>
    );
  }

  if (compareProducts.length === 1) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-fade-in">
        <h1 className="text-3xl font-bold mb-3">Compare Products</h1>
        <p className="text-muted mb-8">Select one more product to see the comparison table.</p>
        <CompareProductPicker
          selectedProduct={compareProducts[0]}
          suggestions={suggestedProducts.slice(0, 6)}
          onAddProduct={updateSelection}
        />
      </div>
    );
  }

  const products = compareProducts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Compare Products</h1>

      <div className="overflow-x-auto border border-border rounded-2xl bg-background">
        <table className="min-w-full text-sm">
          <tbody>
            <tr className="border-b border-border">
              <th className="text-left p-4 w-44">Product</th>
              {products.map((product) => {
                const nextIds = ids.filter((id) => id !== product.id);

                return (
                  <td key={product.id} className="p-4 align-top min-w-64">
                    <Link href={`/products/${product.slug}`} className="block">
                      <div className="w-full h-44 rounded-xl overflow-hidden border border-border bg-surface mb-3">
                        <img
                          src={getImageUrl(product.primary_image?.image_path || product.images?.[0]?.image_path)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="font-bold leading-tight hover:text-primary transition-colors">{product.name}</p>
                    </Link>
                    <Link
                      href={nextIds.length >= 1 ? `/products/compare?ids=${nextIds.join(',')}` : '/products'}
                      className="mt-2 inline-block text-xs text-danger hover:underline"
                    >
                      Remove
                    </Link>
                  </td>
                );
              })}
            </tr>

            <tr className="border-b border-border">
              <th className="text-left p-4">Price</th>
              {products.map((product) => (
                <td key={`price-${product.id}`} className="p-4 font-semibold">
                  {formatCurrency(Number(product.price))}
                </td>
              ))}
            </tr>

            <tr className="border-b border-border">
              <th className="text-left p-4">Sale Price</th>
              {products.map((product) => (
                <td key={`sale-${product.id}`} className="p-4">
                  {product.compare_price ? formatCurrency(Number(product.compare_price)) : '-'}
                </td>
              ))}
            </tr>

            <tr className="border-b border-border">
              <th className="text-left p-4">Brand</th>
              {products.map((product) => (
                <td key={`brand-${product.id}`} className="p-4">
                  {product.brand || '-'}
                </td>
              ))}
            </tr>

            <tr className="border-b border-border">
              <th className="text-left p-4">Stock</th>
              {products.map((product) => (
                <td key={`stock-${product.id}`} className="p-4">
                  {product.stock_quantity > 0 ? `${product.stock_quantity} available` : 'Out of stock'}
                </td>
              ))}
            </tr>

            <tr>
              <th className="text-left p-4">Rating</th>
              {products.map((product) => (
                <td key={`rating-${product.id}`} className="p-4">
                  {product.average_rating ? Number(product.average_rating).toFixed(1) : '-'} ({product.review_count || 0} reviews)
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
