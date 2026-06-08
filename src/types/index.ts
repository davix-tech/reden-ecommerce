export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  userId: string;
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  description: string;
  specifications: Record<string, string>;
  images: string[];
  stock: number;
  price: number;
  salePrice?: number;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: Date;
}

export interface WishlistItem {
  productId: string;
  addedAt: Date;
}

export interface Wishlist {
  userId: string;
  items: WishlistItem[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  couponCode?: string;
  trackingNumber?: string;
  deliveryOption: 'standard' | 'express' | 'overnight';
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  verified: boolean;
  createdAt: Date;
}

export interface RecentlyViewed {
  userId: string;
  productId: string;
  viewedAt: Date;
}

export interface Session {
  id: string;
  userId?: string;
  sessionId: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface AuthToken {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface RedenEvent {
  eventType: string;
  userId?: string;
  sessionId: string;
  timestamp: number;
  productId?: string;
  category?: string;
  searchQuery?: string;
  metadata?: Record<string, any>;
}
