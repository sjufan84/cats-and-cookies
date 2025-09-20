/**
 * Utility functions for handling price formatting and calculations
 */

/**
 * Safely parses a price string to a number, handling various formats
 * @param price - The price string (may contain currency symbols, commas, etc.)
 * @returns The parsed numeric value, or 0 if invalid
 */
export function parsePrice(price: string | number): number {
  if (typeof price === 'number') {
    return isNaN(price) ? 0 : price;
  }
  
  if (typeof price !== 'string') {
    console.warn('Invalid price type:', typeof price, price);
    return 0;
  }
  
  // Clean the price string by removing any non-numeric characters except decimal point
  const cleanPrice = price.replace(/[^0-9.-]/g, '');
  const numericPrice = parseFloat(cleanPrice);
  
  if (isNaN(numericPrice)) {
    console.warn(`Invalid price format: "${price}"`);
    return 0;
  }
  
  return numericPrice;
}

/**
 * Formats a price as a currency string
 * @param price - The price string or number
 * @returns Formatted price string (e.g., "$12.99")
 */
export function formatPrice(price: string | number): string {
  const numericPrice = parsePrice(price);
  return `$${numericPrice.toFixed(2)}`;
}

/**
 * Calculates the total for an item (price × quantity)
 * @param price - The price string or number
 * @param quantity - The quantity
 * @returns The total as a formatted string
 */
export function calculateItemTotal(price: string | number, quantity: number): string {
  const numericPrice = parsePrice(price);
  return (numericPrice * quantity).toFixed(2);
}

/**
 * Calculates the total for multiple items
 * @param items - Array of items with price and quantity
 * @returns The total as a number
 */
export function calculateCartTotal(items: Array<{ price: string | number; quantity: number }>): number {
  return items.reduce((total, item) => {
    const numericPrice = parsePrice(item.price);
    return total + (numericPrice * item.quantity);
  }, 0);
}
