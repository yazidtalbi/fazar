// Guest cart utilities using localStorage

export interface GuestCartItem {
  productId: string;
  quantity: number;
  addedAt: string;
}

const GUEST_CART_KEY = "afus_guest_cart";

export function getGuestCart(): GuestCartItem[] {
  if (typeof window === "undefined") return [];
  
  try {
    const cart = localStorage.getItem(GUEST_CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error("Error reading guest cart:", error);
    return [];
  }
}

export function addToGuestCart(productId: string, quantity: number = 1): void {
  if (typeof window === "undefined") return;
  
  try {
    const cart = getGuestCart();
    const existingIndex = cart.findIndex(item => item.productId === productId);
    
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        productId,
        quantity,
        addedAt: new Date().toISOString(),
      });
    }
    
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("guestCartUpdated"));
  } catch (error) {
    console.error("Error adding to guest cart:", error);
  }
}

export function removeFromGuestCart(productId: string): void {
  if (typeof window === "undefined") return;
  
  try {
    const cart = getGuestCart();
    const filtered = cart.filter(item => item.productId !== productId);
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent("guestCartUpdated"));
  } catch (error) {
    console.error("Error removing from guest cart:", error);
  }
}

export function updateGuestCartQuantity(productId: string, quantity: number): void {
  if (typeof window === "undefined") return;
  
  try {
    const cart = getGuestCart();
    const existingIndex = cart.findIndex(item => item.productId === productId);
    
    if (existingIndex >= 0) {
      if (quantity <= 0) {
        removeFromGuestCart(productId);
      } else {
        cart[existingIndex].quantity = quantity;
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
        window.dispatchEvent(new CustomEvent("guestCartUpdated"));
      }
    }
  } catch (error) {
    console.error("Error updating guest cart:", error);
  }
}

export function clearGuestCart(): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(GUEST_CART_KEY);
    window.dispatchEvent(new CustomEvent("guestCartUpdated"));
  } catch (error) {
    console.error("Error clearing guest cart:", error);
  }
}

export function getGuestCartCount(): number {
  const cart = getGuestCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

