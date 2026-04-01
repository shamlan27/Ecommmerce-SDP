<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    private function hasDeliveredPurchase(int $userId, int $productId): bool
    {
        return OrderItem::query()
            ->where('product_id', $productId)
            ->whereHas('order', function ($query) use ($userId) {
                $query->where('user_id', $userId)
                    ->where('status', 'delivered');
            })
            ->exists();
    }

    public function index(int $productId)
    {
        $reviews = Review::with('user')
            ->where('product_id', $productId)
            ->where('is_approved', true)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($reviews);
    }

    public function canReview(Request $request, int $productId)
    {
        $userId = $request->user()->id;

        $alreadyReviewed = Review::where('user_id', $userId)
            ->where('product_id', $productId)
            ->exists();

        if ($alreadyReviewed) {
            return response()->json([
                'can_review' => false,
                'message' => 'You have already reviewed this product.',
            ]);
        }

        if (!$this->hasDeliveredPurchase($userId, $productId)) {
            return response()->json([
                'can_review' => false,
                'message' => 'You can review this product after your order is delivered.',
            ]);
        }

        return response()->json([
            'can_review' => true,
            'message' => 'You can write a review for this product.',
        ]);
    }

    public function store(Request $request, int $productId)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'body' => 'nullable|string|max:2000',
        ]);

        $existing = Review::where('user_id', $request->user()->id)
            ->where('product_id', $productId)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You have already reviewed this product.'], 422);
        }

        if (!$this->hasDeliveredPurchase($request->user()->id, $productId)) {
            return response()->json([
                'message' => 'You can review this product only after delivery.',
            ], 422);
        }

        $review = Review::create([
            'user_id' => $request->user()->id,
            'product_id' => $productId,
            'rating' => $request->rating,
            'title' => $request->title,
            'body' => $request->body,
        ]);

        return response()->json($review->load('user'), 201);
    }

    public function update(Request $request, Review $review)
    {
        if ($review->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'body' => 'nullable|string|max:2000',
        ]);

        $review->update($request->only(['rating', 'title', 'body']));

        return response()->json($review->load('user'));
    }

    public function destroy(Request $request, Review $review)
    {
        if ($review->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $review->delete();

        return response()->json(['message' => 'Review deleted.']);
    }
}
