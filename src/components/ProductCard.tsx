'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { trackRedenEvent } from '@/lib/reden';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  sessionId: string;
  userId?: string;
}

export default function ProductCard({ product, sessionId, userId }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);

    trackRedenEvent({
      eventType: isWishlisted ? 'wishlist_remove' : 'wishlist_add',
      userId,
      sessionId,
      timestamp: Date.now(),
      productId: product.id,
      category: product.category,
    });

    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const exists = wishlist.find((item: any) => item.productId === product.id);

    if (exists) {
      const filtered = wishlist.filter((item: any) => item.productId !== product.id);
      localStorage.setItem('wishlist', JSON.stringify(filtered));
    } else {
      wishlist.push({ productId: product.id, addedAt: new Date() });
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();

    trackRedenEvent({
      eventType: 'add_to_cart',
      userId,
      sessionId,
      timestamp: Date.now(),
      productId: product.id,
      metadata: {
        productName: product.name,
        price: product.price,
        category: product.category,
      },
    });

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((item: any) => item.productId === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        productId: product.id,
        quantity: 1,
        price: product.salePrice || product.price,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const displayPrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  return (
    <Link href={`/products/${product.id}`}>
      <div className={styles.card}>
        <div className={styles.imageContainer}>
          {hasDiscount && <div className={styles.badge}>Sale</div>}
          <img
            src={imageError ? 'https://via.placeholder.com/300x300?text=No+Image' : product.images[0]}
            alt={product.name}
            className={styles.image}
            onError={() => setImageError(true)}
          />
          <div className={styles.overlay}>
            <button
              className={styles.addToCartBtn}
              onClick={handleAddToCart}
              title="Add to cart"
            >
              <ShoppingCart size={20} />
            </button>
            <button
              className={`${styles.wishlistBtn} ${isWishlisted ? styles.active : ''}`}
              onClick={handleWishlistToggle}
              title="Add to wishlist"
            >
              <Heart size={20} />
            </button>
          </div>
        </div>
        <div className={styles.content}>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.brand}>{product.brand}</p>
          <div className={styles.ratingContainer}>
            <span className={styles.rating}>★ {product.rating.toFixed(1)}</span>
            <span className={styles.reviews}>({product.reviewCount})</span>
          </div>
          <div className={styles.priceContainer}>
            <span className={styles.price}>${displayPrice.toFixed(2)}</span>
            {hasDiscount && (
              <span className={styles.originalPrice}>${product.price.toFixed(2)}</span>
            )}
          </div>
          {product.stock > 0 ? (
            <p className={styles.stock}>In Stock</p>
          ) : (
            <p className={styles.outOfStock}>Out of Stock</p>
          )}
        </div>
      </div>
    </Link>
  );
}
