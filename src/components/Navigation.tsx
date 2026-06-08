'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Heart, User, Search, Menu, X } from 'lucide-react';
import styles from './Navigation.module.css';

export default function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch('/api/auth/check');
      setIsLoggedIn(response.ok);
    };
    checkAuth();

    const cart = localStorage.getItem('cart');
    if (cart) {
      const items = JSON.parse(cart);
      setCartCount(items.reduce((sum: number, item: any) => sum + item.quantity, 0));
    }

    const handleStorageChange = () => {
      const updatedCart = localStorage.getItem('cart');
      if (updatedCart) {
        const items = JSON.parse(updatedCart);
        setCartCount(items.reduce((sum: number, item: any) => sum + item.quantity, 0));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Reden Ecommerce
        </Link>

        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            <Search size={20} />
          </button>
        </form>

        <div className={styles.navLinks}>
          <Link href="/products" className={styles.link}>
            Products
          </Link>
          <Link href="/products?category=electronics" className={styles.link}>
            Electronics
          </Link>
          <Link href="/products?category=fashion" className={styles.link}>
            Fashion
          </Link>
          <Link href="/products?category=home" className={styles.link}>
            Home
          </Link>
        </div>

        <div className={styles.rightSection}>
          <Link href="/wishlist" className={styles.iconButton}>
            <Heart size={24} />
          </Link>
          <Link href="/cart" className={styles.cartButton}>
            <ShoppingCart size={24} />
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </Link>
          {isLoggedIn ? (
            <div className={styles.userMenu}>
              <Link href="/account" className={styles.iconButton}>
                <User size={24} />
              </Link>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className={styles.loginButton}>
              Login
            </Link>
          )}
          <button
            className={styles.mobileMenuButton}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/products" className={styles.mobileLink}>
            Products
          </Link>
          <Link href="/products?category=electronics" className={styles.mobileLink}>
            Electronics
          </Link>
          <Link href="/products?category=fashion" className={styles.mobileLink}>
            Fashion
          </Link>
          <Link href="/products?category=home" className={styles.mobileLink}>
            Home
          </Link>
          <Link href="/wishlist" className={styles.mobileLink}>
            Wishlist
          </Link>
          <Link href="/cart" className={styles.mobileLink}>
            Cart
          </Link>
          {!isLoggedIn && (
            <Link href="/auth/login" className={styles.mobileLink}>
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
