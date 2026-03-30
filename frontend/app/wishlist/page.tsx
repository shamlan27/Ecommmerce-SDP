'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import type { Wishlist } from '@/lib/types';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import { Heart, ShoppingCart, Trash2, Plus } from 'lucide-react';

export default function WishlistPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlists = () => {
    api.get<Wishlist[]>('/wishlists')
      .then(setWishlists)
      .catch(() => setWishlists([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) fetchWishlists();
    else setLoading(false);
  }, [user]);

  const handleRemoveItem = async (wishlistId: number, productId: number) => {
    await api.delete(`/wishlists/${wishlistId}/items/${productId}`);
    fetchWishlists();
  };

  const handleMoveToCart = async (wishlistId: number, productId: number) => {
    await addToCart(productId);
    await api.delete(`/wishlists/${wishlistId}/items/${productId}`);
    fetchWishlists();
  };

  const handleCreateWishlist = async () => {
    await api.post('/wishlists', { name: 'My Wishlist' });
    fetchWishlists();
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fade-in">
        <Heart className="w-16 h-16 text-muted mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Sign in to view your wishlist</h1>
        <Link href="/login" className="inline-flex px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors mt-4">Sign In</Link>
      </div>
    );
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="h-40 skeleton rounded-2xl" /></div>;

  const allItems = wishlists.flatMap(w => (w.items || []).map(item => ({ ...item, wishlistId: w.id })));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">My Wishlist</h1>
        {wishlists.length === 0 && (
          <button onClick={handleCreateWishlist} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors">
            <Plus className="w-4 h-4" /> Create Wishlist
          </button>
        )}
      </div>

      {allItems.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
          <p className="text-muted mb-6">Save items you love for later.</p>
          <Link href="/products" className="inline-flex px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allItems.map(item => item.product && (
            <div key={item.id} className="border border-border rounded-2xl overflow-hidden card-hover">
              <Link href={`/products/${item.product.slug}`} className="block aspect-square bg-surface overflow-hidden">
                <img src={getImageUrl(item.product.primary_image?.image_path || item.product.images?.[0]?.image_path)} alt={item.product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </Link>
              <div className="p-4">
                <Link href={`/products/${item.product.slug}`} className="font-semibold text-sm hover:text-primary transition-colors line-clamp-2">{item.product.name}</Link>
                <p className="text-primary font-bold mt-2">{formatCurrency(Number(item.product.price))}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleMoveToCart(item.wishlistId, item.product_id)} className="flex-1 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-1.5">
                    <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                  </button>
                  <button onClick={() => handleRemoveItem(item.wishlistId, item.product_id)} className="p-2 border border-border rounded-lg hover:bg-surface hover:text-danger transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
