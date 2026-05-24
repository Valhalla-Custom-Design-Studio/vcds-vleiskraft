export type Language = 'af' | 'en';

export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export type OrderStatus =
  | 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY'
  | 'COLLECTED' | 'DELIVERED' | 'CANCELLED';

export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface User {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  language: Language;
  deliveryAddress?: string;
  lat?: number;
  lng?: number;
  birthday?: string;
  referralCode?: string;
  createdAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor: string;
  accentColor: string;
  tagline: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
  lat?: number;
  lng?: number;
  operatingHours?: Record<string, string>;
  featureFlags?: Record<string, boolean>;
}

export interface Product {
  id: string;
  tenantId: string;
  categoryId: string;
  nameAf: string;
  nameEn: string;
  descriptionAf?: string;
  descriptionEn?: string;
  price: number;
  unit: string;
  weight?: number;
  imageUrl?: string;
  inStock: boolean;
  featured?: boolean;
  weeklySpecial?: boolean;
  specialPrice?: number;
  specialEndsAt?: string;
}

export interface Category {
  id: string;
  tenantId: string;
  nameAf: string;
  nameEn: string;
  slug: string;
  sortOrder: number;
  image?: string;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Order {
  id: string;
  tenantId: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  deliveryFee: number;
  deliveryType: 'DELIVERY' | 'COLLECTION';
  deliveryAddress?: string;
  notes?: string;
  paymentRef?: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  items: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  productNameSnapshot: string;
}

export interface LoyaltyAccount {
  id: string;
  userId: string;
  points: number;
  lifetimePoints: number;
  tier: LoyaltyTier;
}

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  points: number;
  type: 'EARNED' | 'REDEEMED' | 'BONUS' | 'REFERRAL' | 'BIRTHDAY';
  orderId?: string;
  description: string;
  createdAt: string;
}

export interface SocialPost {
  id: string;
  userId: string;
  tenantId: string;
  imageUrl?: string;
  caption: string;
  meatType?: string;
  rating?: number;
  likesCount: number;
  liked?: boolean;
  user?: { firstName: string; lastName: string };
  createdAt: string;
}

export interface DiaryEntry {
  id: string;
  userId: string;
  date: string;
  meats: string[];
  woodUsed?: string;
  weather?: string;
  rating: number;
  notes?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Recipe {
  id: string;
  tenantId: string;
  nameAf: string;
  nameEn: string;
  descriptionAf?: string;
  descriptionEn?: string;
  category: string;
  ingredients: { item: string; amount: string }[];
  methodAf: string[];
  methodEn: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  imageUrl?: string;
  favorited?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  sentAt: string;
  readAt?: string;
}

export interface StampCard {
  stamps: number;
  target: number;
  redeemed: number;
}
