<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderTracking;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Review;
use App\Models\User;
use App\Models\Wishlist;
use App\Models\WishlistItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@shopnest.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'phone' => '+1-555-0100',
        ]);

        // Create support user
        $support = User::create([
            'name' => 'Support Agent',
            'email' => 'support@shopnest.com',
            'password' => bcrypt('password'),
            'role' => 'support',
            'phone' => '+1-555-0101',
        ]);

        // Create customer users
        $customers = [];
        $customerData = [
            ['name' => 'John Smith', 'email' => 'john@example.com'],
            ['name' => 'Sarah Johnson', 'email' => 'sarah@example.com'],
            ['name' => 'Michael Brown', 'email' => 'michael@example.com'],
            ['name' => 'Emily Davis', 'email' => 'emily@example.com'],
            ['name' => 'David Wilson', 'email' => 'david@example.com'],
        ];

        foreach ($customerData as $data) {
            $customers[] = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => bcrypt('password'),
                'role' => 'customer',
                'phone' => '+1-555-' . str_pad(rand(1000, 9999), 4, '0'),
            ]);
        }

        // Add addresses for customers
        foreach ($customers as $customer) {
            Address::create([
                'user_id' => $customer->id,
                'type' => 'shipping',
                'name' => $customer->name,
                'line1' => rand(100, 9999) . ' Main Street',
                'city' => ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][rand(0, 4)],
                'state' => ['NY', 'CA', 'IL', 'TX', 'AZ'][rand(0, 4)],
                'zip' => str_pad(rand(10000, 99999), 5, '0'),
                'country' => 'US',
                'is_default' => true,
            ]);
        }

        // Create categories
        $categories = [];
        $categoryData = [
            ['name' => 'Electronics', 'description' => 'Smartphones, laptops, tablets, and electronic accessories', 'image' => 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'],
            ['name' => 'Fashion', 'description' => 'Clothing, shoes, and fashion accessories for men and women', 'image' => 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400'],
            ['name' => 'Home & Garden', 'description' => 'Furniture, decor, kitchen appliances, and garden supplies', 'image' => 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400'],
            ['name' => 'Sports & Outdoors', 'description' => 'Sports equipment, fitness gear, and outdoor recreation', 'image' => 'https://images.unsplash.com/photo-1461896836934-bd45ba8c0e78?w=400'],
            ['name' => 'Books', 'description' => 'Fiction, non-fiction, educational, and children\'s books', 'image' => 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400'],
            ['name' => 'Health & Beauty', 'description' => 'Skincare, wellness products, vitamins, and personal care', 'image' => 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'],
            ['name' => 'Toys & Games', 'description' => 'Children\'s toys, board games, puzzles, and gaming', 'image' => 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400'],
            ['name' => 'Automotive', 'description' => 'Car accessories, tools, and maintenance products', 'image' => 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400'],
        ];

        foreach ($categoryData as $i => $data) {
            $categories[] = Category::create([
                'name' => $data['name'],
                'slug' => Str::slug($data['name']),
                'description' => $data['description'],
                'image' => $data['image'],
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }

        // Create products
        $products = [];
        $productData = [
            // Electronics
            ['category' => 0, 'name' => 'iPhone 16 Pro Max', 'price' => 1199.99, 'compare_price' => 1299.99, 'brand' => 'Apple', 'stock' => 45, 'featured' => true, 'desc' => 'The most powerful iPhone ever with A18 Pro chip, 48MP camera system, and titanium design.', 'image' => 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600'],
            ['category' => 0, 'name' => 'MacBook Air M3', 'price' => 1099.00, 'compare_price' => 1199.00, 'brand' => 'Apple', 'stock' => 30, 'featured' => true, 'desc' => 'Supercharged by M3 chip. Up to 18 hours of battery life. Stunningly thin design.', 'image' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'],
            ['category' => 0, 'name' => 'Sony WH-1000XM5', 'price' => 349.99, 'compare_price' => 399.99, 'brand' => 'Sony', 'stock' => 80, 'featured' => true, 'desc' => 'Industry-leading noise canceling headphones with exceptional sound quality.', 'image' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
            ['category' => 0, 'name' => 'Samsung Galaxy S24 Ultra', 'price' => 1299.99, 'compare_price' => null, 'brand' => 'Samsung', 'stock' => 25, 'featured' => false, 'desc' => 'Galaxy AI-powered smartphone with built-in S Pen, 200MP camera, and titanium frame.', 'image' => 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600'],
            ['category' => 0, 'name' => 'iPad Pro M4', 'price' => 999.00, 'compare_price' => 1099.00, 'brand' => 'Apple', 'stock' => 35, 'featured' => true, 'desc' => 'Ultra Retina XDR display, M4 chip, and Apple Pencil Pro support.', 'image' => 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600'],
            ['category' => 0, 'name' => 'Dell XPS 15', 'price' => 1499.99, 'compare_price' => null, 'brand' => 'Dell', 'stock' => 20, 'featured' => false, 'desc' => '15.6-inch OLED display, Intel Core i9, 32GB RAM, perfect for creators.', 'image' => 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600'],

            // Fashion
            ['category' => 1, 'name' => 'Classic Leather Jacket', 'price' => 249.99, 'compare_price' => 299.99, 'brand' => 'Urban Edge', 'stock' => 60, 'featured' => true, 'desc' => 'Premium genuine leather jacket with quilted lining. Timeless style for any occasion.', 'image' => 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600'],
            ['category' => 1, 'name' => 'Running Sneakers Pro', 'price' => 129.99, 'compare_price' => 159.99, 'brand' => 'Nike', 'stock' => 100, 'featured' => true, 'desc' => 'Lightweight performance running shoes with React foam cushioning.', 'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],
            ['category' => 1, 'name' => 'Designer Sunglasses', 'price' => 189.99, 'compare_price' => null, 'brand' => 'Ray-Ban', 'stock' => 75, 'featured' => false, 'desc' => 'Classic aviator sunglasses with polarized lenses and gold frame.', 'image' => 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600'],
            ['category' => 1, 'name' => 'Cashmere Sweater', 'price' => 179.99, 'compare_price' => 219.99, 'brand' => 'Luxe Knits', 'stock' => 40, 'featured' => false, 'desc' => '100% pure cashmere crew neck sweater. Incredibly soft and warm.', 'image' => 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600'],

            // Home & Garden
            ['category' => 2, 'name' => 'Scandinavian Coffee Table', 'price' => 299.99, 'compare_price' => 399.99, 'brand' => 'Nordic Living', 'stock' => 15, 'featured' => true, 'desc' => 'Minimalist oak coffee table with clean lines and natural finish.', 'image' => 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=600'],
            ['category' => 2, 'name' => 'Smart Home Speaker', 'price' => 99.99, 'compare_price' => null, 'brand' => 'Amazon', 'stock' => 150, 'featured' => false, 'desc' => 'Voice-controlled smart speaker with premium sound and built-in hub.', 'image' => 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600'],
            ['category' => 2, 'name' => 'Ceramic Plant Pot Set', 'price' => 49.99, 'compare_price' => 69.99, 'brand' => 'Green Thumb', 'stock' => 200, 'featured' => false, 'desc' => 'Set of 3 handcrafted ceramic pots in matte white, perfect for indoor plants.', 'image' => 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600'],
            ['category' => 2, 'name' => 'Velvet Throw Pillow Set', 'price' => 39.99, 'compare_price' => null, 'brand' => 'Cozy Home', 'stock' => 120, 'featured' => false, 'desc' => 'Set of 2 luxurious velvet throw pillows, 18x18 inches.', 'image' => 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600'],

            // Sports
            ['category' => 3, 'name' => 'Yoga Mat Premium', 'price' => 69.99, 'compare_price' => 89.99, 'brand' => 'Manduka', 'stock' => 90, 'featured' => true, 'desc' => 'Extra-thick non-slip yoga mat made from eco-friendly natural rubber.', 'image' => 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600'],
            ['category' => 3, 'name' => 'Adjustable Dumbbell Set', 'price' => 299.99, 'compare_price' => 349.99, 'brand' => 'Bowflex', 'stock' => 25, 'featured' => true, 'desc' => 'Space-saving adjustable dumbbells from 5 to 52.5 lbs each.', 'image' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600'],
            ['category' => 3, 'name' => 'Mountain Bike Helmet', 'price' => 89.99, 'compare_price' => null, 'brand' => 'Giro', 'stock' => 55, 'featured' => false, 'desc' => 'MIPS-equipped mountain bike helmet with adjustable visor.', 'image' => 'https://images.unsplash.com/photo-1557803175-2f0778241670?w=600'],

            // Books
            ['category' => 4, 'name' => 'The Art of Innovation', 'price' => 24.99, 'compare_price' => 29.99, 'brand' => 'Penguin', 'stock' => 200, 'featured' => false, 'desc' => 'Bestselling guide to fostering creativity and innovation in business.', 'image' => 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600'],
            ['category' => 4, 'name' => 'Mindfulness Collection', 'price' => 44.99, 'compare_price' => 59.99, 'brand' => 'HarperCollins', 'stock' => 150, 'featured' => true, 'desc' => 'A curated collection of 3 bestselling mindfulness and meditation books.', 'image' => 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600'],
            ['category' => 4, 'name' => 'Cooking Masterclass', 'price' => 34.99, 'compare_price' => null, 'brand' => 'DK Publishing', 'stock' => 80, 'featured' => false, 'desc' => 'Complete guide to culinary techniques with 500+ recipes from world-class chefs.', 'image' => 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=600'],

            // Health & Beauty
            ['category' => 5, 'name' => 'Luxury Skincare Set', 'price' => 149.99, 'compare_price' => 199.99, 'brand' => 'La Mer', 'stock' => 40, 'featured' => true, 'desc' => 'Premium skincare set including cleanser, serum, moisturizer, and eye cream.', 'image' => 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600'],
            ['category' => 5, 'name' => 'Essential Oil Diffuser', 'price' => 39.99, 'compare_price' => 49.99, 'brand' => 'Vitruvi', 'stock' => 100, 'featured' => false, 'desc' => 'Stone essential oil diffuser with whisper-quiet operation and ambient lighting.', 'image' => 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600'],

            // Toys & Games
            ['category' => 6, 'name' => 'LEGO Architecture Set', 'price' => 79.99, 'compare_price' => null, 'brand' => 'LEGO', 'stock' => 60, 'featured' => true, 'desc' => 'Build iconic world landmarks with this detailed LEGO Architecture collection.', 'image' => 'https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=600'],
            ['category' => 6, 'name' => 'Strategy Board Game', 'price' => 49.99, 'compare_price' => 59.99, 'brand' => 'Catan Studio', 'stock' => 45, 'featured' => false, 'desc' => 'Award-winning strategy board game for 3-4 players. Hours of fun!', 'image' => 'https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=600'],

            // Automotive
            ['category' => 7, 'name' => 'Dash Camera 4K', 'price' => 129.99, 'compare_price' => 159.99, 'brand' => 'Vantrue', 'stock' => 70, 'featured' => true, 'desc' => '4K front and rear dash camera with night vision and parking mode.', 'image' => 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600'],
            ['category' => 7, 'name' => 'Car Cleaning Kit', 'price' => 59.99, 'compare_price' => null, 'brand' => 'Chemical Guys', 'stock' => 90, 'featured' => false, 'desc' => 'Professional car detailing kit with wash, wax, and interior cleaning products.', 'image' => 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600'],
        ];

        foreach ($productData as $i => $data) {
            $product = Product::create([
                'category_id' => $categories[$data['category']]->id,
                'name' => $data['name'],
                'slug' => Str::slug($data['name']) . '-' . Str::random(5),
                'short_description' => Str::limit($data['desc'], 100),
                'description' => $data['desc'] . "\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
                'price' => $data['price'],
                'compare_price' => $data['compare_price'],
                'brand' => $data['brand'],
                'sku' => 'SKU-' . strtoupper(Str::random(8)),
                'stock_quantity' => $data['stock'],
                'is_active' => true,
                'is_featured' => $data['featured'],
            ]);

            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $data['image'],
                'is_primary' => true,
                'sort_order' => 0,
            ]);

            $products[] = $product;
        }

        // Create reviews
        $reviewTexts = [
            ['title' => 'Amazing product!', 'body' => 'Exceeded my expectations. Great quality and fast shipping.'],
            ['title' => 'Good value', 'body' => 'Decent product for the price. Would recommend to others.'],
            ['title' => 'Love it!', 'body' => 'This is exactly what I was looking for. Perfect in every way.'],
            ['title' => 'Solid purchase', 'body' => 'Well-made and durable. Happy with my purchase.'],
            ['title' => 'Great quality', 'body' => 'The quality is outstanding. Will definitely buy again.'],
        ];

        foreach ($products as $product) {
            $numReviews = rand(1, 3);
            $shuffledCustomers = collect($customers)->shuffle()->take($numReviews);

            foreach ($shuffledCustomers as $j => $customer) {
                Review::create([
                    'user_id' => $customer->id,
                    'product_id' => $product->id,
                    'rating' => rand(3, 5),
                    'title' => $reviewTexts[$j % count($reviewTexts)]['title'],
                    'body' => $reviewTexts[$j % count($reviewTexts)]['body'],
                    'is_approved' => true,
                ]);
            }
        }

        // Create some orders for customers
        foreach ($customers as $customer) {
            $address = $customer->addresses()->first();
            $numOrders = rand(1, 3);

            for ($o = 0; $o < $numOrders; $o++) {
                $orderProducts = collect($products)->shuffle()->take(rand(1, 4));
                $subtotal = 0;
                $orderItems = [];

                foreach ($orderProducts as $product) {
                    $qty = rand(1, 3);
                    $itemTotal = $product->price * $qty;
                    $subtotal += $itemTotal;
                    $orderItems[] = [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'quantity' => $qty,
                        'unit_price' => $product->price,
                        'total' => $itemTotal,
                    ];
                }

                $tax = round($subtotal * 0.08, 2);
                $shippingCost = $subtotal >= 100 ? 0 : 9.99;
                $total = $subtotal + $tax + $shippingCost;

                $statuses = ['pending', 'processing', 'shipped', 'delivered'];
                $status = $statuses[rand(0, 3)];

                $order = Order::create([
                    'user_id' => $customer->id,
                    'order_number' => Order::generateOrderNumber(),
                    'status' => $status,
                    'shipping_name' => $address ? $address->name : $customer->name,
                    'shipping_address' => $address ? $address->line1 : '123 Main St',
                    'shipping_city' => $address ? $address->city : 'New York',
                    'shipping_state' => $address ? $address->state : 'NY',
                    'shipping_zip' => $address ? $address->zip : '10001',
                    'shipping_country' => 'US',
                    'subtotal' => $subtotal,
                    'tax' => $tax,
                    'shipping_cost' => $shippingCost,
                    'total' => $total,
                    'payment_method' => 'card',
                    'payment_status' => 'paid',
                ]);

                foreach ($orderItems as $item) {
                    OrderItem::create(array_merge($item, ['order_id' => $order->id]));
                }

                // Add tracking entries based on status
                $trackingStatuses = ['pending'];
                if (in_array($status, ['processing', 'shipped', 'delivered'])) $trackingStatuses[] = 'processing';
                if (in_array($status, ['shipped', 'delivered'])) $trackingStatuses[] = 'shipped';
                if ($status === 'delivered') $trackingStatuses[] = 'delivered';

                foreach ($trackingStatuses as $k => $ts) {
                    OrderTracking::create([
                        'order_id' => $order->id,
                        'status' => $ts,
                        'description' => match($ts) {
                            'pending' => 'Order placed successfully.',
                            'processing' => 'Order is being processed.',
                            'shipped' => 'Order has been shipped.',
                            'delivered' => 'Order has been delivered.',
                        },
                        'tracked_at' => now()->subDays(count($trackingStatuses) - $k),
                    ]);
                }
            }
        }

        // Create wishlists
        foreach ($customers as $customer) {
            $wishlist = Wishlist::create([
                'user_id' => $customer->id,
                'name' => 'My Wishlist',
            ]);

            $wishlistProducts = collect($products)->shuffle()->take(rand(2, 5));
            foreach ($wishlistProducts as $product) {
                WishlistItem::create([
                    'wishlist_id' => $wishlist->id,
                    'product_id' => $product->id,
                ]);
            }
        }

        $this->command->info('Database seeded successfully!');
        $this->command->info('Admin login: admin@shopnest.com / password');
        $this->command->info('Customer login: john@example.com / password');
    }
}
