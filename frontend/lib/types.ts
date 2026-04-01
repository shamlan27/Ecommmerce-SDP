export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'support';
  phone?: string;
  avatar?: string;
  profile_completed?: boolean;
  payment_preferences?: {
    default_method: 'card' | 'paypal' | 'bank_transfer' | 'cod';
    [key: string]: unknown;
  };
  created_at: string;
  addresses?: Address[];
  orders_count?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  image?: string;
  sort_order: number;
  is_active: boolean;
  products_count?: number;
  children?: Category[];
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  price: number;
  compare_price?: number;
  brand?: string;
  sku: string;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  weight?: number;
  attributes?: Record<string, string>;
  category?: Category;
  images?: ProductImage[];
  primary_image?: ProductImage;
  average_rating?: number;
  review_count?: number;
  reviews?: Review[];
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_path: string;
  is_primary: boolean;
  sort_order: number;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

export interface CartResponse {
  items: CartItem[];
  subtotal: number;
  item_count: number;
}

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
  shipping_phone?: string;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  tracking?: OrderTracking[];
  user?: User;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  product?: Product;
}

export interface OrderTracking {
  id: number;
  order_id: number;
  status: string;
  description?: string;
  tracked_at: string;
}

export interface Review {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  title?: string;
  body?: string;
  is_approved: boolean;
  created_at: string;
  user?: User;
}

export interface Address {
  id: number;
  user_id: number;
  type: 'shipping' | 'billing';
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  is_default: boolean;
}

export interface Wishlist {
  id: number;
  user_id: number;
  name: string;
  items?: WishlistItem[];
}

export interface WishlistItem {
  id: number;
  wishlist_id: number;
  product_id: number;
  product?: Product;
}

export interface Ticket {
  id: number;
  user_id: number;
  order_id?: number;
  subject: string;
  type: 'inquiry' | 'complaint' | 'return' | 'feedback';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  order?: Order;
  messages?: TicketMessage[];
  user?: User;
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  user_id: number;
  message: string;
  is_staff_reply: boolean;
  created_at: string;
  user?: User;
}

export interface DashboardData {
  recent_orders: Order[];
  recommended: Product[];
  active_promotions: Product[];
  wishlist_items: WishlistItem[];
  wishlist_count: number;
  stats: {
    total_orders: number;
    total_spent: number;
    pending_orders: number;
    open_tickets: number;
  };
}

export interface PaymentIntentResponse {
  payment_intent_id: string;
  client_secret: string;
  amount: number;
  currency: string;
}

export interface AdminOverview {
  stats: {
    total_revenue: number;
    total_orders: number;
    total_customers: number;
    total_products: number;
    pending_orders: number;
    low_stock_products: number;
  };
  monthly_revenue: { month: string; revenue: number; orders: number }[];
  top_products: Product[];
  recent_orders: Order[];
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
