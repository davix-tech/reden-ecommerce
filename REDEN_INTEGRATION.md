# Reden Ecommerce Platform - Complete Integration Guide

## Project Overview
Production-grade multi-page ecommerce platform built with Next.js 15, TypeScript, and App Router. Fully integrated with REDEN SDK for comprehensive user journey tracking.

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: File-based JSON storage (for development/testing)
- **Authentication**: Email OTP with JWT tokens
- **Styling**: CSS Modules
- **UI Components**: Lucide React icons

### Folder Structure
```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── check/route.ts
│   │   │   ├── signup/
│   │   │   │   ├── request-otp/route.ts
│   │   │   │   └── verify/route.ts
│   │   │   ├── login/
│   │   │   │   ├── request-otp/route.ts
│   │   │   │   └── verify/route.ts
│   │   │   └── logout/route.ts
│   │   ├── products/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   ├── [id]/reviews/route.ts
│   │   │   ├── search/route.ts
│   │   │   ├── category/route.ts
│   │   │   └── view/route.ts
│   │   ├── user/
│   │   │   ├── profile/route.ts
│   │   │   ├── addresses/route.ts
│   │   │   ├── addresses/[id]/route.ts
│   │   │   └── recently-viewed/route.ts
│   │   ├── orders/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   └── checkout/route.ts
│   ├── auth/
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── page.module.css
│   │   └── signup/
│   │       ├── page.tsx
│   │       └── page.module.css
│   ├── products/
│   │   ├── page.tsx
│   │   ├── page.module.css
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── page.module.css
│   ├── cart/
│   │   ├── page.tsx
│   │   └── page.module.css
│   ├── wishlist/
│   │   ├── page.tsx
│   │   └── page.module.css
│   ├── checkout/
│   │   ├── page.tsx
│   │   └── page.module.css
│   ├── account/
│   │   ├── page.tsx
│   │   └── page.module.css
│   ├── orders/
│   │   ├── page.tsx
│   │   ├── page.module.css
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── page.module.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── page.module.css
│   └── globals.css
├── components/
│   ├── RedenProvider.tsx
│   ├── Navigation.tsx
│   ├── Navigation.module.css
│   ├── Footer.tsx
│   ├── Footer.module.css
│   ├── ProductCard.tsx
│   ├── ProductCard.module.css
│   └── HeroSection.tsx
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   ├── email.ts
│   ├── session.ts
│   ├── reden.ts
│   └── utils.ts
├── types/
│   └── index.ts
└── middleware.ts
```

## REDEN SDK Integration

### Global Setup
The REDEN SDK is injected globally through the `RedenProvider` component in the root layout:

```typescript
// src/components/RedenProvider.tsx
window.redenSessionId = sessionId;
window.reden.init({
  apiKey: process.env.NEXT_PUBLIC_REDEN_API_KEY,
  sessionId,
  environment: process.env.NODE_ENV
});
```

### Event Tracking Implementation

All REDEN events are tracked using the `trackRedenEvent` helper function defined in `src/lib/reden.ts`.

#### Event Types Implemented:

1. **page_view** - Tracked on all page navigation
2. **product_view** - Tracked when user views product details
3. **search** - Tracked when user performs product search
4. **category_view** - Tracked when user filters by category
5. **add_to_cart** - Tracked when user adds product to cart
6. **remove_from_cart** - Tracked when user removes product from cart
7. **wishlist_add** - Tracked when user adds product to wishlist
8. **wishlist_remove** - Tracked when user removes product from wishlist
9. **checkout_start** - Tracked when user initiates checkout
10. **checkout_complete** - Tracked when order is successfully placed
11. **login** - Tracked on successful user login
12. **signup** - Tracked on successful user registration
13. **logout** - Tracked on user logout

### Event Payload Structure

Each event includes:
- `eventType`: The type of event
- `userId`: User ID (when authenticated)
- `sessionId`: Unique session identifier
- `timestamp`: Event timestamp in milliseconds
- `productId`: Product ID (when applicable)
- `category`: Product category (when applicable)
- `searchQuery`: Search query (for search events)
- `metadata`: Additional event-specific data

## Authentication Flow

### Signup Process
1. User enters email → OTP sent to email
2. User verifies OTP → Enters personal details
3. System creates user account and sets auth cookie
4. User is redirected to homepage

### Login Process
1. User enters email → OTP sent to email
2. User verifies OTP with 6-digit code
3. System validates OTP and generates JWT token
4. Auth cookie is set with 7-day expiration
5. `login` event is tracked

### Session Management
- JWT tokens stored in httpOnly cookies
- Session ID persisted in localStorage
- Middleware protects /account, /checkout, /orders routes

## Database Schema

### Users
```typescript
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Products
```typescript
{
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
```

### Orders
```typescript
{
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
```

### Addresses
```typescript
{
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
```

## API Routes

### Authentication
- `POST /api/auth/signup/request-otp` - Request signup OTP
- `POST /api/auth/signup/verify` - Verify OTP and create account
- `POST /api/auth/login/request-otp` - Request login OTP
- `POST /api/auth/login/verify` - Verify login OTP
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/check` - Check authentication status

### Products
- `GET /api/products` - Get all products
- `GET /api/products/[id]` - Get product details
- `GET /api/products/search?q=query` - Search products
- `GET /api/products/category?category=name` - Get products by category
- `GET /api/products/[id]/reviews` - Get product reviews
- `POST /api/products/[id]/reviews` - Create review
- `POST /api/products/view` - Track product view

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/addresses` - Get user addresses
- `POST /api/user/addresses` - Create address
- `GET /api/user/addresses/[id]` - Get address details
- `PUT /api/user/addresses/[id]` - Update address
- `DELETE /api/user/addresses/[id]` - Delete address
- `GET /api/user/recently-viewed` - Get recently viewed products

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/[id]` - Get order details
- `POST /api/checkout` - Place order

## Pages Implemented

### Public Pages
- `/` - Homepage with featured products
- `/products` - Product listing with filters
- `/products/[id]` - Product detail page
- `/cart` - Shopping cart
- `/wishlist` - Wishlist
- `/auth/signup` - User registration
- `/auth/login` - User login

### Protected Pages
- `/account` - User profile and settings
- `/account/addresses` - Manage addresses
- `/checkout` - Multi-step checkout
- `/orders` - Order history
- `/orders/[id]` - Order details

## Features

### Shopping
- Product browsing with category/brand/price filtering
- Full-text search
- Product details with image gallery
- Customer reviews and ratings
- Add to cart / Remove from cart
- Wishlist functionality
- Save for later

### Checkout
- Multi-step checkout process
- Address management
- Multiple delivery options
- Coupon code support (SAVE10, SAVE20)
- Order confirmation
- Email notifications

### Account
- Profile management
- Address management
- Order history
- Recently viewed products

### Performance
- Lazy loading of images
- Optimized API calls
- Client-side caching with localStorage
- Responsive design (mobile-first)

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
git clone https://github.com/davix-tech/reden-ecommerce.git
cd reden-ecommerce
npm install
```

### Environment Setup
```bash
cp .env.example .env
# Edit .env with your values:
# - NEXT_PUBLIC_REDEN_API_KEY
# - NEXT_PUBLIC_REDEN_SCRIPT_URL
# - JWT_SECRET
# - NODEMAILER_USER and NODEMAILER_PASSWORD
# - DATABASE_PATH
```

### Running Development Server
```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Building for Production
```bash
npm run build
npm start
```

## Testing the Platform

### User Journey 1: Browse & Purchase
1. Visit homepage (tracks page_view)
2. Search for products (tracks search)
3. Filter by category (tracks category_view)
4. View product details (tracks product_view)
5. Add to cart (tracks add_to_cart)
6. Proceed to checkout (tracks checkout_start)
7. Complete purchase (tracks checkout_complete)

### User Journey 2: Wishlist
1. Browse products
2. Add to wishlist (tracks wishlist_add)
3. View wishlist page
4. Remove from wishlist (tracks wishlist_remove)

### User Journey 3: Authentication
1. Create account (tracks signup)
2. Login (tracks login)
3. Make purchase
4. Logout (tracks logout)

## REDEN Event Firing Locations

| Event | Location | Trigger |
|-------|----------|---------|
| page_view | Global layout | Every page load |
| product_view | `/products/[id]` | Product detail page load |
| search | `/products` | User searches products |
| category_view | `/products` | User filters by category |
| add_to_cart | ProductCard component | Add to cart button click |
| remove_from_cart | `/cart` | Remove item from cart |
| wishlist_add | ProductCard component | Add to wishlist button |
| wishlist_remove | ProductCard component | Remove from wishlist |
| checkout_start | `/checkout` | Checkout page load |
| checkout_complete | `/checkout` | Order placement success |
| login | `/auth/login` | Successful login |
| signup | `/auth/signup` | Account creation success |
| logout | Navigation component | Logout button click |

## Customization

### Adding Product Data
Edit `data/products.json` to add products to the database.

### Modifying REDEN Configuration
Update `src/components/RedenProvider.tsx` to change REDEN initialization parameters.

### Styling
All pages use CSS Modules for component-scoped styling. Modify `*.module.css` files to customize appearance.

## Support

For REDEN SDK integration questions, refer to official REDEN documentation.
For general ecommerce functionality questions, check the API routes documentation above.
