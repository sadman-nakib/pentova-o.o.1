
export type Role = 'admin' | 'customer';

export interface Profile {
  id: string;
  email: string;
  role: Role;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: string;
  image_url?: string;
  created_at: string;
  category?: Category;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'payment_pending' | 'paid' | 'cod_pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: 'cod' | 'uddoktapay';
  subtotal: number;
  total_price: number;
  delivery_charge: number;
  grand_total: number;
  created_at: string;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
  customer_email?: string;
  delivery_zone?: string;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  charge: number;
}
