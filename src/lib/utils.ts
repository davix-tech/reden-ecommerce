export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

export const generateId = (prefix: string = ''): string => {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const calculateTax = (subtotal: number, taxRate: number = 0.1): number => {
  return subtotal * taxRate;
};

export const calculateShippingCost = (
  deliveryOption: 'standard' | 'express' | 'overnight',
  cartTotal: number
): number => {
  if (cartTotal > 100) return 0;
  switch (deliveryOption) {
    case 'standard':
      return 5.99;
    case 'express':
      return 12.99;
    case 'overnight':
      return 24.99;
  }
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};
