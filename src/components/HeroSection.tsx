'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1>Welcome to Reden Ecommerce</h1>
          <p>Discover millions of products at unbeatable prices</p>
          <Link href="/products" className={styles.cta}>
            Start Shopping <ChevronRight size={20} />
          </Link>
        </div>
        <div className={styles.imageSection}>
          <img
            src="https://via.placeholder.com/500x400?text=Featured+Products"
            alt="Hero"
            className={styles.heroImage}
          />
        </div>
      </div>
    </section>
  );
}
