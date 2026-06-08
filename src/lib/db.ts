import fs from 'fs';
import path from 'path';
import { User, Product, Cart, Order, Address, Review, RecentlyViewed, Session, Wishlist } from '@/types';

const DB_PATH = process.env.DATABASE_PATH || './data';

const ensureDbDir = () => {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(DB_PATH, { recursive: true });
  }
};

const getFilePath = (filename: string) => path.join(DB_PATH, filename);

const readDB = <T>(filename: string, defaultValue: T): T => {
  ensureDbDir();
  const filePath = getFilePath(filename);
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
  }
  return defaultValue;
};

const writeDB = <T>(filename: string, data: T): void => {
  ensureDbDir();
  const filePath = getFilePath(filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
  }
};

export const db = {
  users: {
    getAll: (): User[] => readDB('users.json', []),
    getById: (id: string): User | undefined => {
      const users = readDB('users.json', [] as User[]);
      return users.find(u => u.id === id);
    },
    getByEmail: (email: string): User | undefined => {
      const users = readDB('users.json', [] as User[]);
      return users.find(u => u.email.toLowerCase() === email.toLowerCase());
    },
    create: (user: User): User => {
      const users = readDB('users.json', [] as User[]);
      users.push(user);
      writeDB('users.json', users);
      return user;
    },
    update: (id: string, updates: Partial<User>): User | undefined => {
      const users = readDB('users.json', [] as User[]);
      const index = users.findIndex(u => u.id === id);
      if (index === -1) return undefined;
      users[index] = { ...users[index], ...updates, updatedAt: new Date() };
      writeDB('users.json', users);
      return users[index];
    },
  },
  products: {
    getAll: (): Product[] => readDB('products.json', []),
    getById: (id: string): Product | undefined => {
      const products = readDB('products.json', [] as Product[]);
      return products.find(p => p.id === id);
    },
    getByCategory: (category: string): Product[] => {
      const products = readDB('products.json', [] as Product[]);
      return products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    },
    getByBrand: (brand: string): Product[] => {
      const products = readDB('products.json', [] as Product[]);
      return products.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
    },
    search: (query: string): Product[] => {
      const products = readDB('products.json', [] as Product[]);
      const lower = query.toLowerCase();
      return products.filter(p =>
        p.name.toLowerCase().includes(lower) ||
        p.description.toLowerCase().includes(lower) ||
        p.brand.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower)
      );
    },
  },
  carts: {
    getByUserId: (userId: string): Cart | undefined => {
      const carts = readDB('carts.json', [] as Cart[]);
      return carts.find(c => c.userId === userId);
    },
    upsert: (cart: Cart): Cart => {
      const carts = readDB('carts.json', [] as Cart[]);
      const index = carts.findIndex(c => c.userId === cart.userId);
      if (index === -1) {
        carts.push(cart);
      } else {
        carts[index] = cart;
      }
      writeDB('carts.json', carts);
      return cart;
    },
  },
  orders: {
    getAll: (): Order[] => readDB('orders.json', []),
    getById: (id: string): Order | undefined => {
      const orders = readDB('orders.json', [] as Order[]);
      return orders.find(o => o.id === id);
    },
    getByUserId: (userId: string): Order[] => {
      const orders = readDB('orders.json', [] as Order[]);
      return orders.filter(o => o.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    create: (order: Order): Order => {
      const orders = readDB('orders.json', [] as Order[]);
      orders.push(order);
      writeDB('orders.json', orders);
      return order;
    },
    update: (id: string, updates: Partial<Order>): Order | undefined => {
      const orders = readDB('orders.json', [] as Order[]);
      const index = orders.findIndex(o => o.id === id);
      if (index === -1) return undefined;
      orders[index] = { ...orders[index], ...updates, updatedAt: new Date() };
      writeDB('orders.json', orders);
      return orders[index];
    },
  },
  addresses: {
    getByUserId: (userId: string): Address[] => {
      const addresses = readDB('addresses.json', [] as Address[]);
      return addresses.filter(a => a.userId === userId);
    },
    getById: (id: string): Address | undefined => {
      const addresses = readDB('addresses.json', [] as Address[]);
      return addresses.find(a => a.id === id);
    },
    create: (address: Address): Address => {
      const addresses = readDB('addresses.json', [] as Address[]);
      addresses.push(address);
      writeDB('addresses.json', addresses);
      return address;
    },
    update: (id: string, updates: Partial<Address>): Address | undefined => {
      const addresses = readDB('addresses.json', [] as Address[]);
      const index = addresses.findIndex(a => a.id === id);
      if (index === -1) return undefined;
      addresses[index] = { ...addresses[index], ...updates, updatedAt: new Date() };
      writeDB('addresses.json', addresses);
      return addresses[index];
    },
    delete: (id: string): boolean => {
      const addresses = readDB('addresses.json', [] as Address[]);
      const filtered = addresses.filter(a => a.id !== id);
      if (filtered.length === addresses.length) return false;
      writeDB('addresses.json', filtered);
      return true;
    },
  },
  reviews: {
    getByProductId: (productId: string): Review[] => {
      const reviews = readDB('reviews.json', [] as Review[]);
      return reviews.filter(r => r.productId === productId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    create: (review: Review): Review => {
      const reviews = readDB('reviews.json', [] as Review[]);
      reviews.push(review);
      writeDB('reviews.json', reviews);
      return review;
    },
  },
  recentlyViewed: {
    getByUserId: (userId: string): RecentlyViewed[] => {
      const viewed = readDB('recentlyViewed.json', [] as RecentlyViewed[]);
      return viewed
        .filter(v => v.userId === userId)
        .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())
        .slice(0, 20);
    },
    add: (userId: string, productId: string): void => {
      const viewed = readDB('recentlyViewed.json', [] as RecentlyViewed[]);
      const existing = viewed.find(v => v.userId === userId && v.productId === productId);
      if (existing) {
        existing.viewedAt = new Date();
      } else {
        viewed.push({ userId, productId, viewedAt: new Date() });
      }
      writeDB('recentlyViewed.json', viewed);
    },
  },
  wishlists: {
    getByUserId: (userId: string): Wishlist | undefined => {
      const wishlists = readDB('wishlists.json', [] as Wishlist[]);
      return wishlists.find(w => w.userId === userId);
    },
    upsert: (wishlist: Wishlist): Wishlist => {
      const wishlists = readDB('wishlists.json', [] as Wishlist[]);
      const index = wishlists.findIndex(w => w.userId === wishlist.userId);
      if (index === -1) {
        wishlists.push(wishlist);
      } else {
        wishlists[index] = wishlist;
      }
      writeDB('wishlists.json', wishlists);
      return wishlist;
    },
  },
  sessions: {
    getById: (id: string): Session | undefined => {
      const sessions = readDB('sessions.json', [] as Session[]);
      return sessions.find(s => s.id === id);
    },
    getBySessionId: (sessionId: string): Session | undefined => {
      const sessions = readDB('sessions.json', [] as Session[]);
      return sessions.find(s => s.sessionId === sessionId);
    },
    create: (session: Session): Session => {
      const sessions = readDB('sessions.json', [] as Session[]);
      sessions.push(session);
      writeDB('sessions.json', sessions);
      return session;
    },
    delete: (id: string): void => {
      const sessions = readDB('sessions.json', [] as Session[]);
      const filtered = sessions.filter(s => s.id !== id);
      writeDB('sessions.json', filtered);
    },
  },
};
