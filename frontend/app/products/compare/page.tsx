import Link from 'next/link';
import type { Product } from '@/lib/types';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import api from '@/lib/api';

interface CompareResponse {
  products: Product[];
}

async function fetchCompareProducts(ids: number[]): Promise<CompareResponse | null> {
  if (ids.length < 2) {
    return null;
  }

  try {
    return await api.get<CompareResponse>(`/products/compare?ids=${ids.join(',')}`, {
      cache: 'no-store',
    });
  } catch {
    return null;
  }
}

export default async function CompareProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const params = await searchParams;
  const ids = (params.ids || '')
    .split(',')
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isFinite(id) && id > 0)
    .slice(0, 4);

  const compare = await fetchCompareProducts(ids);
  const products = compare?.products || [];

  if (ids.length < 2 || products.length < 2) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-3">Compare Products</h1>
        <p className="text-muted mb-6">Select at least two products to compare features, price, and availability.</p>
        <Link href="/products" className="inline-flex px-5 py-2.5 rounded-xl bg-primary text-white font-semibold">Browse Products</Link>
      </div>
    );
  }

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
                        <img src={getImageUrl(product.primary_image?.image_path || product.images?.[0]?.image_path)} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <p className="font-bold leading-tight hover:text-primary transition-colors">{product.name}</p>
                    </Link>
                    <Link
                      href={nextIds.length >= 2 ? `/products/compare?ids=${nextIds.join(',')}` : '/products'}
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
                <td key={`price-${product.id}`} className="p-4 font-semibold">{formatCurrency(Number(product.price))}</td>
              ))}
            </tr>

            <tr className="border-b border-border">
              <th className="text-left p-4">Sale Price</th>
              {products.map((product) => (
                <td key={`sale-${product.id}`} className="p-4">{product.compare_price ? formatCurrency(Number(product.compare_price)) : '-'}</td>
              ))}
            </tr>

            <tr className="border-b border-border">
              <th className="text-left p-4">Brand</th>
              {products.map((product) => (
                <td key={`brand-${product.id}`} className="p-4">{product.brand || '-'}</td>
              ))}
            </tr>

            <tr className="border-b border-border">
              <th className="text-left p-4">Stock</th>
              {products.map((product) => (
                <td key={`stock-${product.id}`} className="p-4">{product.stock_quantity > 0 ? `${product.stock_quantity} available` : 'Out of stock'}</td>
              ))}
            </tr>

            <tr>
              <th className="text-left p-4">Rating</th>
              {products.map((product) => (
                <td key={`rating-${product.id}`} className="p-4">{product.average_rating ? Number(product.average_rating).toFixed(1) : '-'} ({product.review_count || 0} reviews)</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
