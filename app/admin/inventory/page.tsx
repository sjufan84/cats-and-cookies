"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  description: string;
  basePrice: string;
  isAvailable: boolean;
  category: string;
  imageUrl?: string;
  stockCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface SalesData {
  productId: number;
  totalSold: number;
}

interface RevenueData {
  productId: number;
  productName: string;
  totalRevenue: number;
  totalOrders: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchProducts(),
        fetchSalesData(),
        fetchRevenueData()
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchSalesData = async () => {
    try {
      const response = await fetch('/api/admin/inventory?action=low-stock');
      const data = await response.json();
      setSalesData(data.productSales || []);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  const fetchRevenueData = async () => {
    try {
      const response = await fetch('/api/admin/inventory?action=revenue-report');
      const data = await response.json();
      setRevenueData(data.revenueByProduct || []);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };

  const toggleProductAvailability = async (productId: number, isAvailable: boolean) => {
    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-inventory',
          data: { productId, isAvailable }
        })
      });

      if (response.ok) {
        fetchProducts();
      } else {
        alert('Failed to update product availability');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product availability');
    }
  };

  const syncAllProducts = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/admin/stripe-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync-products' })
      });

      const result = await response.json();
      alert(`Synced ${result.syncResult?.length || 0} products with Stripe`);
      fetchProducts();
    } catch (error) {
      console.error('Error syncing products:', error);
      alert('Failed to sync products with Stripe');
    } finally {
      setSyncing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  
  const getSalesForProduct = (productId: number) => {
    const sales = salesData.find(s => s.productId === productId);
    return sales?.totalSold || 0;
  };

  const getRevenueForProduct = (productId: number) => {
    const revenue = revenueData.find(r => r.productId === productId);
    return revenue?.totalRevenue || 0;
  };

  const getOrdersForProduct = (productId: number) => {
    const revenue = revenueData.find(r => r.productId === productId);
    return revenue?.totalOrders || 0;
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading inventory management...</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <div className="flex gap-4">
          <button
            onClick={syncAllProducts}
            disabled={syncing}
            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 disabled:bg-gray-400"
          >
            {syncing ? 'Syncing...' : 'Sync All Products'}
          </button>
          <Link href="/admin" className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
            Back to Admin
          </Link>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Products</h3>
          <p className="text-2xl font-bold text-blue-600">
            {products.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Available Products</h3>
          <p className="text-2xl font-bold text-green-600">
            {products.filter(p => p.isAvailable).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
          <p className="text-2xl font-bold text-purple-600">
            {formatCurrency(revenueData.reduce((sum, r) => sum + r.totalRevenue, 0))}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
          <p className="text-2xl font-bold text-orange-600">
            {revenueData.reduce((sum, r) => sum + r.totalOrders, 0)}
          </p>
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Low Stock Alert</h3>
        <p className="text-yellow-700">
          Consider restocking products that have sold well in the last 30 days
        </p>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Products ({products.length})</h2>
          <Link href="/admin/products" className="text-blue-600 hover:text-blue-900">
            Manage Products
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">30-Day Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const sales = getSalesForProduct(product.id);
                const revenue = getRevenueForProduct(product.id);
                const orders = getOrdersForProduct(product.id);

                return (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.imageUrl && (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="rounded-md mr-3 object-cover"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.description.length > 50
                              ? product.description.substring(0, 50) + '...'
                              : product.description
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(parseFloat(product.basePrice))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sales}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toggleProductAvailability(product.id, !product.isAvailable)}
                        className={`${
                          product.isAvailable
                            ? 'text-red-600 hover:text-red-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {product.isAvailable ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Best Sellers */}
      <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold">Top Performing Products</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {revenueData
              .sort((a, b) => b.totalRevenue - a.totalRevenue)
              .slice(0, 3)
              .map((product, rank) => (
                <div key={product.productId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{product.productName}</h3>
                    <span className="text-2xl">{rank === 0 ? '🥇' : rank === 1 ? '🥈' : '🥉'}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Revenue:</span>
                      <span className="font-medium">{formatCurrency(product.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Orders:</span>
                      <span className="font-medium">{product.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Order:</span>
                      <span className="font-medium">
                        {formatCurrency(product.totalRevenue / product.totalOrders)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}