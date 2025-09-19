"use client";

import { useState, useEffect } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface ProductSearchProps {
  onSearch: (query: string) => void;
  onFilter: (filters: SearchFilters) => void;
  onSort: (sortBy: string) => void;
  totalResults: number;
}

export interface SearchFilters {
  category: string;
  priceRange: [number, number];
  isAvailable: boolean | null;
  isFeatured: boolean | null;
}

const CATEGORIES = [
  'All',
  'Chocolate Chip',
  'Sugar Cookies',
  'Oatmeal',
  'Peanut Butter',
  'Snickerdoodle',
  'Double Chocolate',
  'White Chocolate',
  'Seasonal',
  'Gluten Free',
  'Vegan'
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'price', label: 'Price Low to High' },
  { value: 'price-desc', label: 'Price High to Low' },
  { value: 'featured', label: 'Featured First' },
  { value: 'newest', label: 'Newest First' }
];

export default function ProductSearch({ onSearch, onFilter, onSort, totalResults }: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'All',
    priceRange: [0, 50],
    isAvailable: null,
    isFeatured: null
  });
  const [sortBy, setSortBy] = useState('featured');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  // Apply filters when they change
  useEffect(() => {
    onFilter(filters);
  }, [filters, onFilter]);

  // Apply sorting when it changes
  useEffect(() => {
    onSort(sortBy);
  }, [sortBy, onSort]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'All',
      priceRange: [0, 50],
      isAvailable: null,
      isFeatured: null
    });
    setSearchQuery("");
  };

  const hasActiveFilters = filters.category !== 'All' || 
    filters.priceRange[0] > 0 || 
    filters.priceRange[1] < 50 || 
    filters.isAvailable !== null || 
    filters.isFeatured !== null;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-20">
      <div className="container mx-auto px-4 py-4">
        {/* Search Bar */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search cookies by name, ingredients, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-pink-50 border-pink-200 text-pink-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                !
              </span>
            )}
          </button>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">
            {totalResults} {totalResults === 1 ? 'cookie' : 'cookies'} found
          </p>
          
          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Filter Cookies</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={filters.priceRange[0]}
                    onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value), filters.priceRange[1]])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={filters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <select
                  value={filters.isAvailable === null ? 'all' : filters.isAvailable.toString()}
                  onChange={(e) => {
                    const value = e.target.value === 'all' ? null : e.target.value === 'true';
                    handleFilterChange('isAvailable', value);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="true">Available</option>
                  <option value="false">Out of Stock</option>
                </select>
              </div>

              {/* Featured */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special
                </label>
                <select
                  value={filters.isFeatured === null ? 'all' : filters.isFeatured.toString()}
                  onChange={(e) => {
                    const value = e.target.value === 'all' ? null : e.target.value === 'true';
                    handleFilterChange('isFeatured', value);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="true">Featured Only</option>
                  <option value="false">Regular Only</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
