'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { trackRedenEvent } from '@/lib/reden';
import ProductCard from '@/components/ProductCard';
import styles from './page.module.css';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  description: string;
  images: string[];
  stock: number;
  price: number;
  salePrice?: number;
  rating: number;
  reviewCount: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [sessionId, setSessionId] = useState('');
  const [userId, setUserId] = useState<string>();
  const router = useRouter();

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

    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    const category = params.get('category');

    if (search) {
      setSearchQuery(search);
    }
    if (category) {
      setSelectedCategory(category);
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = '/api/products';

        if (searchQuery) {
          url = `/api/products/search?q=${encodeURIComponent(searchQuery)}`;

          trackRedenEvent({
            eventType: 'search',
            userId,
            sessionId,
            timestamp: Date.now(),
            searchQuery,
          });
        } else if (selectedCategory) {
          url = `/api/products/category?category=${encodeURIComponent(selectedCategory)}`;

          trackRedenEvent({
            eventType: 'category_view',
            userId,
            sessionId,
            timestamp: Date.now(),
            category: selectedCategory,
          });
        }

        const response = await fetch(url);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategory, sessionId, userId]);

  useEffect(() => {
    let filtered = [...products];

    if (selectedBrand) {
      filtered = filtered.filter(p => p.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    filtered = filtered.filter(
      p => (p.salePrice || p.price) >= priceRange[0] && (p.salePrice || p.price) <= priceRange[1]
    );

    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      filtered.reverse();
    }

    setFilteredProducts(filtered);
  }, [products, selectedBrand, priceRange, sortBy]);

  const categories = Array.from(new Set(products.map(p => p.category)));
  const brands = Array.from(new Set(products.map(p => p.brand)));

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <h3>Filters</h3>

          <div className={styles.filterGroup}>
            <label htmlFor="sort">Sort By</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.select}
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Rating</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <h4>Categories</h4>
            {categories.map(cat => (
              <label key={cat} className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={selectedCategory === cat}
                  onChange={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                />
                {cat}
              </label>
            ))}
          </div>

          <div className={styles.filterGroup}>
            <h4>Brands</h4>
            {brands.slice(0, 10).map(brand => (
              <label key={brand} className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={selectedBrand === brand}
                  onChange={() => setSelectedBrand(selectedBrand === brand ? '' : brand)}
                />
                {brand}
              </label>
            ))}
          </div>

          <div className={styles.filterGroup}>
            <h4>Price Range</h4>
            <div className={styles.priceInputs}>
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                placeholder="Min"
                className={styles.input}
              />
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                placeholder="Max"
                className={styles.input}
              />
            </div>
          </div>
        </aside>

        <div className={styles.content}>
          <div className={styles.header}>
            <h1>Products</h1>
            <p className={styles.count}>
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>

          {loading ? (
            <div className={styles.loading}>Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className={styles.empty}>
              <p>No products found</p>
              <Link href="/products">Clear filters</Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  sessionId={sessionId}
                  userId={userId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
