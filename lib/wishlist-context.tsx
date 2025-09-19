'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface WishlistItem {
  id: number;
  name: string;
  price: string;
  imageUrl: string | null;
  addedAt: Date;
}

interface WishlistState {
  items: WishlistItem[];
}

type WishlistAction =
  | { type: 'ADD_ITEM'; payload: Omit<WishlistItem, 'addedAt'> }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'LOAD_WISHLIST'; payload: WishlistItem[] };

const initialState: WishlistState = {
  items: [],
};

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Check if item already exists
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return state; // Don't add duplicates
      }

      const newItem = {
        ...action.payload,
        addedAt: new Date()
      };

      return {
        ...state,
        items: [...state.items, newItem],
      };
    }

    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    }

    case 'CLEAR_WISHLIST':
      return {
        ...state,
        items: [],
      };

    case 'LOAD_WISHLIST':
      return {
        ...state,
        items: action.payload,
      };

    default:
      return state;
  }
}

interface WishlistContextType {
  state: WishlistState;
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => void;
  removeItem: (id: number) => void;
  clearWishlist: () => void;
  isInWishlist: (id: number) => boolean;
  toggleItem: (item: Omit<WishlistItem, 'addedAt'>) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('cats-and-cookies-wishlist');
    if (savedWishlist) {
      try {
        const parsedWishlist = JSON.parse(savedWishlist);
        // Convert date strings back to Date objects
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const wishlistWithDates = parsedWishlist.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
        dispatch({ type: 'LOAD_WISHLIST', payload: wishlistWithDates });
      } catch (error) {
        console.error('Error loading wishlist from localStorage:', error);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cats-and-cookies-wishlist', JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (item: Omit<WishlistItem, 'addedAt'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
  };

  const isInWishlist = (id: number) => {
    return state.items.some(item => item.id === id);
  };

  const toggleItem = (item: Omit<WishlistItem, 'addedAt'>) => {
    if (isInWishlist(item.id)) {
      removeItem(item.id);
    } else {
      addItem(item);
    }
  };

  return (
    <WishlistContext.Provider value={{
      state,
      addItem,
      removeItem,
      clearWishlist,
      isInWishlist,
      toggleItem,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
