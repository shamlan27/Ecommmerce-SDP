<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'primaryImage']);

        if ($request->filled('low_stock')) {
            $query->where('stock_quantity', '<', 10);
        }

        if ($request->filled('out_of_stock')) {
            $query->where('stock_quantity', 0);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $products = $query->orderBy('stock_quantity', 'asc')->paginate(20);

        return response()->json($products);
    }

    public function updateStock(Request $request, Product $product)
    {
        $request->validate([
            'stock_quantity' => 'required|integer|min:0',
        ]);

        $product->update(['stock_quantity' => $request->stock_quantity]);

        return response()->json($product);
    }

    public function bulkUpdateStock(Request $request)
    {
        $request->validate([
            'products' => 'required|array',
            'products.*.id' => 'required|exists:products,id',
            'products.*.stock_quantity' => 'required|integer|min:0',
        ]);

        foreach ($request->products as $item) {
            Product::where('id', $item['id'])->update(['stock_quantity' => $item['stock_quantity']]);
        }

        return response()->json(['message' => 'Stock levels updated.']);
    }
}
