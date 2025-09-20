"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import AdminStats from "@/components/custom/AdminStats";

interface Product {
  id: number;
  name: string;
  description: string;
  basePrice: string;
  imageUrl: string | null;
  isFeatured: boolean;
  isAvailable: boolean;
}

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  totalPrice: string;
  status: string;
  createdAt: string;
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders')
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const toggleProductFeatured = async (id: number, isFeatured: boolean) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      });

      if (response.ok) {
        setProducts(products.map(p =>
          p.id === id ? { ...p, isFeatured: !isFeatured } : p
        ));
        setRefreshTrigger(prev => prev + 1); // Refresh stats
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const refreshData = () => {
    fetchData();
    setRefreshTrigger(prev => prev + 1);
  };

  const syncProductsWithStripe = async () => {
    try {
      setIsSyncing(true);
      const response = await fetch('/api/admin/sync-stripe-products', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Sync completed! ${result.summary.success} products synced successfully.`);
        refreshData(); // Refresh the data to show updated sync status
      } else {
        const error = await response.json();
        alert(`Sync failed: ${error.details || error.error}`);
      }
    } catch (error) {
      console.error('Error syncing products:', error);
      alert('Failed to sync products. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link
          href="/"
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          Back to Store
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'products'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Orders ({orders.length})
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Business Overview</h2>
            <button
              onClick={refreshData}
              className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Refresh Data
            </button>
          </div>
          <AdminStats refreshTrigger={refreshTrigger} />
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Manage Products</h2>
            <div className="flex space-x-3">
              <button
                onClick={syncProductsWithStripe}
                disabled={isSyncing}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSyncing ? 'Syncing...' : 'Sync with Stripe'}
              </button>
              <Link
                href="/admin/products/new"
                className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
              >
                Add New Product
              </Link>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="rounded object-cover"
                            />
                          ) : (
                            <div className="bg-gray-200 h-10 w-10 rounded flex items-center justify-center">
                              <span className="text-xs text-gray-500">No img</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${parseFloat(product.basePrice).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.isAvailable
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                        {product.isFeatured && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleProductFeatured(product.id, product.isFeatured)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {product.isFeatured ? 'Unfeature' : 'Feature'}
                        </button>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customerName}</div>
                      <div className="text-sm text-gray-500">{order.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${parseFloat(order.totalPrice).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
