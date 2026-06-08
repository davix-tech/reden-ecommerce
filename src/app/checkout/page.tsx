'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Loader } from 'lucide-react';
import { calculateTax, calculateShippingCost, formatCurrency } from '@/lib/utils';
import { trackRedenEvent } from '@/lib/reden';
import styles from './page.module.css';

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Address {
  id: string;
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Product {
  id: string;
  name: string;
  images: string[];
}

export default function CheckoutPage() {
  const [step, setStep] = useState<'shipping' | 'billing' | 'review' | 'confirmation'>('shipping');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null);
  const [billingAddress, setBillingAddress] = useState<Address | null>(null);
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [deliveryOption, setDeliveryOption] = useState<'standard' | 'express' | 'overnight'>('standard');
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orderNumber, setOrderNumber] = useState('');
  const [sessionId, setSessionId] = useState('');
  const router = useRouter();

  useEffect(() => {
    setSessionId(window.redenSessionId || '');
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      const cartItems = JSON.parse(storedCart);
      setCart(cartItems);

      const fetchProducts = async () => {
        try {
          const productsMap: Record<string, Product> = {};
          for (const item of cartItems) {
            const response = await fetch(`/api/products/${item.productId}`);
            if (response.ok) {
              const product = await response.json();
              productsMap[item.productId] = product;
            }
          }
          setProducts(productsMap);
        } catch (error) {
          console.error('Failed to fetch products:', error);
        }
      };

      fetchProducts();
    }

    const fetchAddresses = async () => {
      try {
        const response = await fetch('/api/user/addresses');
        if (response.ok) {
          const data = await response.json();
          setAddresses(data);
          if (data.length > 0) {
            setShippingAddress(data[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = calculateTax(subtotal);
  const shippingCost = calculateShippingCost(deliveryOption, subtotal);
  let discount = 0;

  if (couponCode === 'SAVE10') {
    discount = subtotal * 0.1;
  } else if (couponCode === 'SAVE20') {
    discount = subtotal * 0.2;
  }

  const total = subtotal + tax + shippingCost - discount;

  const handlePlaceOrder = async () => {
    if (!shippingAddress) {
      setError('Please select a shipping address');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          shippingAddressId: shippingAddress.id,
          billingAddressId: useSameAddress ? shippingAddress.id : billingAddress?.id,
          deliveryOption,
          couponCode,
        }),
      });

      if (response.ok) {
        const order = await response.json();
        setOrderNumber(order.id);

        trackRedenEvent({
          eventType: 'checkout_complete',
          sessionId,
          timestamp: Date.now(),
          metadata: {
            orderId: order.id,
            total: order.total,
            itemCount: cart.length,
          },
        });

        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));
        setStep('confirmation');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to place order');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Checkout error:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className={styles.container}>Loading checkout...</div>;
  }

  if (cart.length === 0 && step !== 'confirmation') {
    return (
      <div className={styles.container}>
        <div className={styles.emptyCart}>
          <h2>Your cart is empty</h2>
          <Link href="/products" className={styles.continueButton}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (step === 'confirmation') {
    return (
      <div className={styles.container}>
        <div className={styles.confirmation}>
          <div className={styles.successIcon}>✓</div>
          <h1>Order Confirmed!</h1>
          <p>Your order has been placed successfully.</p>
          <p className={styles.orderNumber}>Order Number: <strong>{orderNumber}</strong></p>
          <p>You will receive an email confirmation shortly.</p>
          <Link href={`/orders/${orderNumber}`} className={styles.viewOrderButton}>
            View Order Details
          </Link>
          <Link href="/" className={styles.continueButton}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        <div className={styles.main}>
          <div className={styles.steps}>
            <div className={`${styles.step} ${step === 'shipping' ? styles.active : ''}`}>
              <span className={styles.stepNumber}>1</span>
              <span>Shipping</span>
            </div>
            <div className={`${styles.step} ${step === 'billing' ? styles.active : ''}`}>
              <span className={styles.stepNumber}>2</span>
              <span>Billing</span>
            </div>
            <div className={`${styles.step} ${step === 'review' ? styles.active : ''}`}>
              <span className={styles.stepNumber}>3</span>
              <span>Review</span>
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {step === 'shipping' && (
            <div className={styles.stepContent}>
              <h2>Shipping Address</h2>
              <div className={styles.addressList}>
                {addresses.map(addr => (
                  <label key={addr.id} className={styles.addressOption}>
                    <input
                      type="radio"
                      checked={shippingAddress?.id === addr.id}
                      onChange={() => setShippingAddress(addr)}
                    />
                    <span>
                      {addr.firstName} {addr.lastName}, {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                    </span>
                  </label>
                ))}
              </div>
              <div className={styles.delivery}>
                <h3>Delivery Option</h3>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    value="standard"
                    checked={deliveryOption === 'standard'}
                    onChange={(e) => setDeliveryOption(e.target.value as any)}
                  />
                  Standard (5-7 days) - $5.99
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    value="express"
                    checked={deliveryOption === 'express'}
                    onChange={(e) => setDeliveryOption(e.target.value as any)}
                  />
                  Express (2-3 days) - $12.99
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    value="overnight"
                    checked={deliveryOption === 'overnight'}
                    onChange={(e) => setDeliveryOption(e.target.value as any)}
                  />
                  Overnight - $24.99
                </label>
              </div>
              <div className={styles.actions}>
                <button onClick={() => setStep('billing')} className={styles.nextButton}>
                  Continue to Billing <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 'billing' && (
            <div className={styles.stepContent}>
              <h2>Billing Address</h2>
              <label className={styles.checkboxOption}>
                <input
                  type="checkbox"
                  checked={useSameAddress}
                  onChange={(e) => setUseSameAddress(e.target.checked)}
                />
                Same as shipping address
              </label>
              {!useSameAddress && (
                <div className={styles.addressList}>
                  {addresses.map(addr => (
                    <label key={addr.id} className={styles.addressOption}>
                      <input
                        type="radio"
                        checked={billingAddress?.id === addr.id}
                        onChange={() => setBillingAddress(addr)}
                      />
                      <span>
                        {addr.firstName} {addr.lastName}, {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              <div className={styles.actions}>
                <button onClick={() => setStep('shipping')} className={styles.backButton}>
                  Back
                </button>
                <button onClick={() => setStep('review')} className={styles.nextButton}>
                  Continue to Review <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className={styles.stepContent}>
              <h2>Order Review</h2>
              <div className={styles.coupon}>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code (SAVE10 or SAVE20)"
                  className={styles.couponInput}
                />
              </div>
              <div className={styles.actions}>
                <button onClick={() => setStep('billing')} className={styles.backButton}>
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className={styles.placeOrderButton}
                  disabled={processing}
                >
                  {processing ? <Loader className={styles.spinner} /> : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.summary}>
          <h2>Order Summary</h2>
          <div className={styles.items}>
            {cart.map(item => (
              <div key={item.productId} className={styles.item}>
                <img src={products[item.productId]?.images[0]} alt={products[item.productId]?.name} />
                <div>
                  <p className={styles.itemName}>{products[item.productId]?.name}</p>
                  <p className={styles.itemQty}>Qty: {item.quantity}</p>
                </div>
                <p className={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className={styles.totals}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>Tax</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>Shipping</span>
              <span>{shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}</span>
            </div>
            {discount > 0 && (
              <div className={styles.totalRow}>
                <span>Discount</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className={styles.totalFinal}>
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
