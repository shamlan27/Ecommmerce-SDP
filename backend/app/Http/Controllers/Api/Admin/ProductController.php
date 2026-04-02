<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png,webp,gif|max:5120',
        ]);

        $cloudName = env('CLOUDINARY_CLOUD_NAME');
        $apiKey = env('CLOUDINARY_API_KEY');
        $apiSecret = env('CLOUDINARY_API_SECRET');

        if ($cloudName && $apiKey && $apiSecret) {
            $timestamp = time();
            $folder = 'products';
            $signature = sha1("folder={$folder}&timestamp={$timestamp}{$apiSecret}");

            $response = Http::asMultipart()
                ->attach('file', fopen($request->file('image')->getRealPath(), 'r'), $request->file('image')->getClientOriginalName())
                ->post("https://api.cloudinary.com/v1_1/{$cloudName}/image/upload", [
                    'api_key' => $apiKey,
                    'timestamp' => $timestamp,
                    'folder' => $folder,
                    'signature' => $signature,
                ]);

            if ($response->successful() && $response->json('secure_url')) {
                $secureUrl = $response->json('secure_url');

                return response()->json([
                    'path' => $secureUrl,
                    'url' => $secureUrl,
                ], 201);
            }
        }

        $path = $request->file('image')->store('products', 'public');

        return response()->json([
            'path' => $path,
            'url' => asset('storage/' . $path),
        ], 201);
    }

    public function index(Request $request)
    {
        $query = Product::with(['category', 'primaryImage']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $products = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'brand' => 'nullable|string|max:255',
            'sku' => 'required|string|unique:products',
            'stock_quantity' => 'required|integer|min:0',
            'is_active' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
            'weight' => 'nullable|numeric|min:0',
            'images' => 'nullable|array',
            'images.*' => 'string',
        ]);

        $product = Product::create(array_merge(
            $request->only([
                'name', 'category_id', 'short_description', 'description',
                'price', 'compare_price', 'brand', 'sku', 'stock_quantity',
                'is_active', 'is_featured', 'weight',
            ]),
            ['slug' => Str::slug($request->name) . '-' . Str::random(5)]
        ));

        // Create product images
        if ($request->filled('images')) {
            foreach ($request->images as $index => $imagePath) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $imagePath,
                    'is_primary' => $index === 0,
                    'sort_order' => $index,
                ]);
            }
        }

        return response()->json($product->load(['category', 'images']), 201);
    }

    public function show(Product $product)
    {
        return response()->json($product->load(['category', 'images', 'reviews']));
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'category_id' => 'sometimes|exists:categories,id',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'brand' => 'nullable|string|max:255',
            'sku' => "sometimes|string|unique:products,sku,{$product->id}",
            'stock_quantity' => 'sometimes|integer|min:0',
            'is_active' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
            'weight' => 'nullable|numeric|min:0',
            'images' => 'sometimes|array',
            'images.*' => 'string',
        ]);

        $data = $request->only([
            'name', 'category_id', 'short_description', 'description',
            'price', 'compare_price', 'brand', 'sku', 'stock_quantity',
            'is_active', 'is_featured', 'weight',
        ]);

        if ($request->has('name')) {
            $data['slug'] = Str::slug($request->name) . '-' . Str::random(5);
        }

        $product->update($data);

        if ($request->has('images')) {
            ProductImage::where('product_id', $product->id)->delete();

            foreach ($request->input('images', []) as $index => $imagePath) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $imagePath,
                    'is_primary' => $index === 0,
                    'sort_order' => $index,
                ]);
            }
        }

        return response()->json($product->load(['category', 'images']));
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json(['message' => 'Product deleted.']);
    }
}
