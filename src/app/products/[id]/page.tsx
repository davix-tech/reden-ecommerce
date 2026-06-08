'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { trackRedenEvent } from '@/lib/reden';
import styles from './page.module.css';

interface Review {
  id: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  verified: boolean;
  createdAt: string;
}

interface Product {
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
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [sessionId, setSessionId] = useState('');
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    setSessionId(window.redenSessionId || '');

    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const user = await response.json();
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();

    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`);
        const data = await response.json();
        setProduct(data);

        trackRedenEvent({
          eventType: 'product_view',
          userId,
          sessionId,
          timestamp: Date.now(),
          productId: params.id,
          category: data.category,
        });

        const reviewsResponse = await fetch(`/api/products/${params.id}/reviews`);
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData);

        const allProducts = await fetch('/api/products');
        const allData = await allProducts.json();
        const related = allData
          .filter((p: Product) => p.category === data.category && p.id !== params.id)
          .slice(0, 5);
        setRelatedProducts(related);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();

    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsWishlisted(wishlist.some((item: any) => item.productId === params.id));
  }, [params.id, userId, sessionId]);

  if (loading) {
    return <div className={styles.container}>Loading product...</div>;
  }

  if (!product) {
    return <div className={styles.container}>Product not found</div>;
  }

  const displayPrice = product.salePrice || product.price;
  const discount = product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((item: any) => item.productId === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        quantity,
        price: displayPrice,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));

    trackRedenEvent({
      eventType: 'add_to_cart',
      userId,
      sessionId,
      timestamp: Date.now(),
      productId: product.id,
      metadata: {
        productName: product.name,
        price: displayPrice,
        quantity,
      },
    });
  };

  const handleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const exists = wishlist.find((item: any) => item.productId === product.id);

    if (exists) {
      const filtered = wishlist.filter((item: any) => item.productId !== product.id);
      localStorage.setItem('wishlist', JSON.stringify(filtered));
    } else {
      wishlist.push({ productId: product.id, addedAt: new Date() });
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }

    setIsWishlisted(!isWishlisted);

    trackRedenEvent({
      eventType: isWishlisted ? 'wishlist_remove' : 'wishlist_add',
      userId,
      sessionId,
      timestamp: Date.now(),
      productId: product.id,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/products">{product.category}</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className={styles.layout}>
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            <img src={product.images[activeImageIndex]} alt={product.name} />
            {discount > 0 && <div className={styles.badge}>{discount}% OFF</div>}
          </div>
          <div className={styles.thumbnails}>
            {product.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} ${index + 1}`}
                className={activeImageIndex === index ? styles.active : ''}
                onClick={() => setActiveImageIndex(index)}
              />
            ))}
          </div>
        </div>

        <div className={styles.details}>
          <div className={styles.header}>
            <span className={styles.brand}>{product.brand}</span>
            <h1>{product.name}</h1>
            <p className={styles.sku}>SKU: {product.sku}</p>
          </div>

          <div className={styles.rating}>
            <span className={styles.stars}>★★★★★ {product.rating.toFixed(1)}</span>
            <span className={styles.reviewCount}>({product.reviewCount} reviews)</span>
          </div>

          <div className={styles.pricing}>
            <span className={styles.price}>${displayPrice.toFixed(2)}</span>
            {product.salePrice && (
              <span className={styles.originalPrice}>${product.price.toFixed(2)}</span>
            )}
          </div>

          <p className={styles.description}>{product.description}</p>

          {Object.entries(product.specifications).length > 0 && (
            <div className={styles.specs}>
              <h3>Specifications</h3>
              <ul>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong> {value}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.actions}>
            <div className={styles.quantity}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
              <input type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} />
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            <button className={styles.addToCart} onClick={handleAddToCart} disabled={product.stock === 0}>
              <ShoppingCart size={20} />
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <button
              className={`${styles.wishlist} ${isWishlisted ? styles.active : ''}`}
              onClick={handleWishlist}
            >
              <Heart size={20} />
            </button>
          </div>

          <div className={styles.stock}>
            {product.stock > 0 ? (
              <p className={styles.inStock}>✓ In Stock ({product.stock} available)</p>
            ) : (
              <p className={styles.outOfStock}>Out of Stock</p>
            )}
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className={styles.related}>
          <h2>Related Products</h2>
          <div className={styles.relatedGrid}>
            {relatedProducts.map(p => (
              <Link key={p.id} href={`/products/${p.id}`} className={styles.relatedCard}>
                <img src={p.images[0]} alt={p.name} />
                <h4>{p.name}</h4>
                <p>${(p.salePrice || p.price).toFixed(2)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {reviews.length > 0 && (
        <div className={styles.reviews}>
          <h2>Customer Reviews</h2>
          <div className={styles.reviewsList}>
            {reviews.slice(0, 5).map(review => (
              <div key={review.id} className={styles.review}>
                <div className={styles.reviewHeader}>
                  <strong>{review.userName}</strong>
                  <span className={styles.reviewRating}>★ {review.rating}</span>
                </div>
                <h4>{review.title}</h4>
                <p>{review.content}</p>
                {review.verified && <span className={styles.verified}>✓ Verified Purchase</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
