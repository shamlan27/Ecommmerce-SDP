<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use App\Models\WishlistItem;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $wishlists = $request->user()->wishlists()
            ->with('items.product.primaryImage')
            ->get();

        return response()->json($wishlists);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
        ]);

        $wishlist = Wishlist::create([
            'user_id' => $request->user()->id,
            'name' => $request->input('name', 'My Wishlist'),
        ]);

        return response()->json($wishlist, 201);
    }

    public function addItem(Request $request, Wishlist $wishlist)
    {
        if ($wishlist->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $exists = WishlistItem::where('wishlist_id', $wishlist->id)
            ->where('product_id', $request->product_id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Product already in wishlist.'], 422);
        }

        WishlistItem::create([
            'wishlist_id' => $wishlist->id,
            'product_id' => $request->product_id,
        ]);

        return response()->json($wishlist->load('items.product.primaryImage'), 201);
    }

    public function removeItem(Request $request, Wishlist $wishlist, int $productId)
    {
        if ($wishlist->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        WishlistItem::where('wishlist_id', $wishlist->id)
            ->where('product_id', $productId)
            ->delete();

        return response()->json(['message' => 'Product removed from wishlist.']);
    }

    public function destroy(Request $request, Wishlist $wishlist)
    {
        if ($wishlist->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $wishlist->delete();

        return response()->json(['message' => 'Wishlist deleted.']);
    }
}
