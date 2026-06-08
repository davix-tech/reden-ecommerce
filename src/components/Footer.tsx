'use client';

import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.column}>
            <h3>About Us</h3>
            <p>Reden Ecommerce is a premium online marketplace offering a wide range of products.</p>
          </div>
          <div className={styles.column}>
            <h3>Quick Links</h3>
            <ul>
              <li>
                <Link href="/products">Products</Link>
              </li>
              <li>
                <Link href="/account">Account</Link>
              </li>
              <li>
                <Link href="/orders">Orders</Link>
              </li>
            </ul>
          </div>
          <div className={styles.column}>
            <h3>Customer Support</h3>
            <ul>
              <li>
                <a href="mailto:support@reden.com">Contact Us</a>
              </li>
              <li>
                <Link href="#">FAQ</Link>
              </li>
              <li>
                <Link href="#">Shipping Info</Link>
              </li>
            </ul>
          </div>
          <div className={styles.column}>
            <h3>Legal</h3>
            <ul>
              <li>
                <Link href="#">Terms of Service</Link>
              </li>
              <li>
                <Link href="#">Privacy Policy</Link>
              </li>
              <li>
                <Link href="#">Return Policy</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className={styles.bottom}>
          <p>&copy; 2024 Reden Ecommerce. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
