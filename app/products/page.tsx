"use client";

import { useState, useEffect, useMemo } from "react";
import ProductSearch, { SearchFilters } from "@/components/custom/ProductSearch";
import ProductCard from "@/components/custom/ProductCard";
import { Loader2 } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string | null;
  category: string;
  isAvailable: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'All',
    priceRange: [0, 50],
    isAvailable: null,
    isFeatured: null
  });
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.category !== 'All') {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Price range filter
    filtered = filtered.filter(product => {
      const price = parseFloat(product.price);
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Availability filter
    if (filters.isAvailable !== null) {
      filtered = filtered.filter(product => product.isAvailable === filters.isAvailable);
    }

    // Featured filter
    if (filters.isFeatured !== null) {
      filtered = filtered.filter(product => product.isFeatured === filters.isFeatured);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-desc':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'featured':
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchQuery, filters, sortBy]);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading delicious cookies...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Our Cookie Collection
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our handcrafted cookies, each baked with love and supervised by Teddy & Millie. 
              From classic favorites to seasonal specials, we have something for every cookie lover.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <ProductSearch
        onSearch={setSearchQuery}
        onFilter={setFilters}
        onSort={setSortBy}
        totalResults={filteredProducts.length}
      />

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🍪</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchQuery || Object.values(filters).some(f => f !== null && f !== 'All') 
                ? 'No cookies found' 
                : 'No cookies available'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || Object.values(filters).some(f => f !== null && f !== 'All')
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Check back soon for fresh batches of delicious cookies!'
              }
            </p>
            {(searchQuery || Object.values(filters).some(f => f !== null && f !== 'All')) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilters({
                    category: 'All',
                    priceRange: [0, 50],
                    isAvailable: null,
                    isFeatured: null
                  });
                }}
                className="bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
              >
                Clear Search & Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={`$${parseFloat(product.price).toFixed(2)}`}
                imageUrl={product.imageUrl || ''}
                isFeatured={product.isFeatured}
              />
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      {filteredProducts.length > 0 && (
        <div className="bg-pink-50 border-t border-pink-100">
          <div className="container mx-auto px-4 py-12 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Can&apos;t find what you&apos;re looking for?
            </h2>
            <p className="text-gray-600 mb-6">
              We&apos;re always baking new flavors! Contact us for custom orders or special requests.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/about"
                className="bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
              >
                Learn Our Story
              </a>
              <a
                href="mailto:hello@catsandcookies.com"
                className="bg-white text-pink-500 border border-pink-500 px-6 py-3 rounded-lg font-semibold hover:bg-pink-50 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
