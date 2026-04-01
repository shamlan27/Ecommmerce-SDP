'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Product, Review } from '@/lib/types';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import { ShoppingCart, Heart, Star, CheckCircle, ChevronRight, ShieldCheck, Truck } from 'lucide-react';

interface ProductDetailResponse {
  product: Product;
}

interface PaginatedReviewsResponse {
  data: Review[];
}

interface WishlistSummary {
  id: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [canReviewMessage, setCanReviewMessage] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    if (slug) {
      setReviewError('');
      setCanReview(false);
      setCanReviewMessage('');

      api.get<Product | ProductDetailResponse>(`/products/${slug}`)
        .then(async (response) => {
          const productData = 'product' in response ? response.product : response;
          setProduct(productData);
          setActiveImage(productData.primary_image?.image_path || productData.images?.[0]?.image_path || '');

          try {
            const reviewRes = await api.get<PaginatedReviewsResponse>(`/products/${productData.id}/reviews`);
            setReviews(reviewRes.data || []);
          } catch {
            setReviews([]);
          }

          if (!user) {
            setCanReview(false);
            setCanReviewMessage('Sign in and purchase this product to leave a review after delivery.');
            return;
          }

          try {
            const eligibility = await api.get<{ can_review: boolean; message: string }>(`/products/${productData.id}/can-review`);
            setCanReview(eligibility.can_review);
            setCanReviewMessage(eligibility.message);
          } catch {
            setCanReview(false);
            setCanReviewMessage('You can review this product after your order is delivered.');
          }
        })
        .catch(() => setProduct(null))
        .finally(() => setLoading(false));
    }
  }, [slug, user]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user || !canReview) return;

    setReviewSubmitting(true);
    setReviewError('');

    try {
      const createdReview = await api.post<Review>(`/products/${product.id}/reviews`, {
        rating: reviewRating,
        title: reviewTitle,
        body: reviewBody,
      });

      setReviews((prev) => [createdReview, ...prev]);
      setCanReview(false);
      setCanReviewMessage('Review submitted successfully.');
      setReviewTitle('');
      setReviewBody('');
      setReviewRating(5);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'data' in err) {
        const data = (err as { data?: { message?: string } }).data;
        setReviewError(data?.message || 'Failed to submit review.');
      } else {
        setReviewError('Failed to submit review.');
      }
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);
    await addToCart(product.id, quantity);
    setIsAdding(false);
  };

  const toggleWishlist = async () => {
    if (!user || !product) return;
    try {
      if (inWishlist) {
        // Find wishlist id logic would go here, mock for now
        setInWishlist(false);
      } else {
        const wishlists = await api.get<WishlistSummary[]>('/wishlists');
        let wid = wishlists[0]?.id;
        if (!wid) {
          const newW = await api.post<WishlistSummary>('/wishlists', { name: 'My Wishlist' });
          wid = newW.id;
        }
        await api.post(`/wishlists/${wid}/items`, { product_id: product.id });
        setInWishlist(true);
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square skeleton rounded-3xl" />
          <div className="space-y-6"><div className="h-10 skeleton w-3/4 rounded-xl" /><div className="h-6 skeleton w-1/4 rounded-lg" /><div className="h-32 skeleton rounded-2xl" /></div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="text-center py-20 text-2xl font-bold">Product not found.</div>;

  const images = product.images?.length ? product.images : [{ image_path: activeImage, id: 0, product_id: product.id, is_primary: true, sort_order: 0 }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted mb-8 overflow-x-auto pb-2">
        <Link href="/" className="hover:text-primary transition-colors whitespace-nowrap">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <Link href="/products" className="hover:text-primary transition-colors whitespace-nowrap">Products</Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        {product.category && (
          <>
            <Link href={`/products?category_slug=${product.category.slug}`} className="hover:text-primary transition-colors whitespace-nowrap">{product.category.name}</Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </>
        )}
        <span className="text-foreground truncate">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16 mb-20">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-surface border border-border rounded-3xl overflow-hidden relative">
            <img src={getImageUrl(activeImage)} alt={product.name} className="w-full h-full object-cover" />
            {product.compare_price && product.compare_price > product.price && (
              <span className="absolute top-4 left-4 px-3 py-1.5 bg-danger text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg">Sale</span>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.image_path)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === img.image_path ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}
                >
                  <img src={getImageUrl(img.image_path)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {/* Brand/Category */}
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-semibold text-primary uppercase tracking-wider">{product.brand || product.category?.name}</span>
            <div className="flex gap-2">
              <button onClick={toggleWishlist} className={`p-2 rounded-full border border-border hover:bg-surface transition-colors ${inWishlist ? 'text-danger bg-danger/5 border-danger/20' : 'text-muted'}`}>
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center text-accent">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(product.average_rating || 0) ? 'fill-current' : 'text-border fill-transparent'}`} />
              ))}
            </div>
            <a href="#reviews" className="text-sm font-medium text-primary hover:underline">{product.review_count || 0} reviews</a>
            <span className="text-border">•</span>
            <span className="text-sm text-muted font-mono">SKU: {product.sku}</span>
          </div>

          <div className="flex items-end gap-3 mb-6">
            <span className="text-4xl font-black">{formatCurrency(Number(product.price))}</span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-xl text-muted line-through mb-1">{formatCurrency(Number(product.compare_price))}</span>
            )}
          </div>

          <p className="text-muted leading-relaxed mb-8">{product.short_description || product.description}</p>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">Quantity</span>
              {product.stock_quantity > 0 ? (
                <span className="text-sm text-success flex items-center gap-1"><CheckCircle className="w-4 h-4" /> In Stock</span>
              ) : (
                <span className="text-sm text-danger">Out of Stock</span>
              )}
            </div>
            <div className="flex gap-4">
              <div className="flex items-center border border-border rounded-xl bg-surface h-14">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-5 text-xl font-medium hover:text-primary transition-colors disabled:opacity-50" disabled={product.stock_quantity === 0}>−</button>
                <div className="w-10 text-center font-semibold">{quantity}</div>
                <button onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))} className="px-5 text-xl font-medium hover:text-primary transition-colors disabled:opacity-50" disabled={product.stock_quantity === 0}>+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0 || isAdding}
                className="flex-1 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50 btn-press h-14 flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
                id="add-to-cart-btn"
              >
                <ShoppingCart className="w-5 h-5" />
                {isAdding ? 'Adding...' : product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mt-auto pt-8 border-t border-border">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0"><Truck className="w-5 h-5" /></div>
              <div><h4 className="font-semibold text-sm">Free Shipping</h4><p className="text-xs text-muted">On orders over $50</p></div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0"><ShieldCheck className="w-5 h-5" /></div>
              <div><h4 className="font-semibold text-sm">2 Year Warranty</h4><p className="text-xs text-muted">Full protection</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Reviews */}
      <div className="grid lg:grid-cols-3 gap-10 lg:gap-16 pt-16 border-t border-border">
        {/* Long Description */}
        <div className="lg:col-span-2 prose prose-zinc dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-6">Product Description</h2>
          <div className="text-muted leading-relaxed whitespace-pre-wrap">{product.description || 'No description available.'}</div>
        </div>

        {/* Reviews */}
        <div id="reviews">
          <h2 className="text-2xl font-bold mb-6 flex items-center justify-between">
            Reviews
            <span className="text-sm font-medium px-3 py-1 bg-surface border border-border rounded-full">{reviews.length}</span>
          </h2>

          <div className="mb-6 p-4 bg-surface border border-border rounded-2xl">
            {!user ? (
              <p className="text-sm text-muted">
                Please <Link href="/login" className="text-primary font-semibold hover:underline">sign in</Link> to review after your order is delivered.
              </p>
            ) : canReview ? (
              <form onSubmit={submitReview} className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Rating</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Title</label>
                  <input
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    maxLength={255}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    placeholder="Review title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Comment</label>
                  <textarea
                    value={reviewBody}
                    onChange={(e) => setReviewBody(e.target.value)}
                    maxLength={2000}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background h-24"
                    placeholder="Share your experience"
                  />
                </div>
                {reviewError && <p className="text-sm text-danger">{reviewError}</p>}
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <p className="text-sm text-muted">{canReviewMessage || 'You can review this product after your order is delivered.'}</p>
            )}
          </div>
          
          {reviews.length === 0 ? (
            <div className="text-center p-8 bg-surface rounded-2xl border border-border border-dashed">
              <Star className="w-8 h-8 text-muted mx-auto mb-3 opacity-50" />
              <p className="font-medium">No reviews yet.</p>
              <p className="text-sm text-muted mt-1">Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="pb-6 border-b border-border last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-sm">{review.title}</h4>
                      <p className="text-xs text-muted mt-0.5">{review.user?.name || 'Anonymous'} · {new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex text-accent">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-border fill-transparent'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">{review.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
