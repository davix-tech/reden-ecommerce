'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data.slice(0, 12));
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Welcome to Reden Ecommerce</h1>
          <p>Discover millions of products at unbeatable prices</p>
          <Link href="/products" className={styles.ctaButton}>
            Shop Now
          </Link>
        </div>
      </section>

      <section className={styles.categoriesSection}>
        <h2>Shop by Category</h2>
        <div className={styles.categoriesGrid}>
          <Link href="/products?category=electronics" className={styles.categoryCard}>
            <span>Electronics</span>
          </Link>
          <Link href="/products?category=fashion" className={styles.categoryCard}>
            <span>Fashion</span>
          </Link>
          <Link href="/products?category=home" className={styles.categoryCard}>
            <span>Home & Garden</span>
          </Link>
          <Link href="/products?category=beauty" className={styles.categoryCard}>
            <span>Beauty</span>
          </Link>
        </div>
      </section>

      <section className={styles.productsSection}>
        <h2>Featured Products</h2>
        {loading ? (
          <div className={styles.loading}>Loading products...</div>
        ) : (
          <div className={styles.productsGrid}>
            {products.map((product: any) => (
              <Link key={product.id} href={`/products/${product.id}`} className={styles.productCard}>
                <img src={product.images[0]} alt={product.name} />
                <h3>{product.name}</h3>
                <p className={styles.price}>${product.price.toFixed(2)}</p>
                <span className={styles.rating}>★ {product.rating.toFixed(1)}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className={styles.banner}>
        <div className={styles.bannerContent}>
          <h2>Flash Sale!</h2>
          <p>Get up to 50% off on selected items</p>
          <Link href="/products" className={styles.bannerButton}>
            View Deals
          </Link>
        </div>
      </section>
    </div>
  );
}
