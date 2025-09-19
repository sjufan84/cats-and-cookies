"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Subscription {
  id: string;
  customerId: string;
  priceId: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

interface Customer {
  id: string;
  name: string;
  email: string;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState('weekly');
  const [newSubscription, setNewSubscription] = useState({
    customerEmail: '',
    customerName: '',
    items: [{ id: 1, name: 'Chocolate Chip Cookies', quantity: 1 }]
  });

  useEffect(() => {
    fetchSubscriptions();
    fetchCustomers();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/admin/stripe-dashboard?action=subscriptions');
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/admin/stripe-dashboard?action=customers');
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const createSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: newSubscription.customerEmail,
          customerName: newSubscription.customerName,
          plan: selectedPlan,
          items: newSubscription.items
        })
      });

      if (response.ok) {
        alert('Subscription created successfully!');
        fetchSubscriptions();
        setNewSubscription({
          customerEmail: '',
          customerName: '',
          items: [{ id: 1, name: 'Chocolate Chip Cookies', quantity: 1 }]
        });
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('Failed to create subscription');
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;

    try {
      const response = await fetch(`/api/subscriptions?subscriptionId=${subscriptionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Subscription canceled successfully!');
        fetchSubscriptions();
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Failed to cancel subscription');
    }
  };

  const subscriptionPlans = {
    weekly: { name: 'Weekly Cookie Box', price: '$35/week', color: 'bg-green-100 text-green-800' },
    biweekly: { name: 'Bi-Weekly Cookie Box', price: '$65/2 weeks', color: 'bg-blue-100 text-blue-800' },
    monthly: { name: 'Monthly Cookie Box', price: '$120/month', color: 'bg-purple-100 text-purple-800' }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <Link href="/admin" className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
          Back to Admin
        </Link>
      </div>

      {/* Create New Subscription */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Create New Subscription</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Customer Name</label>
            <input
              type="text"
              value={newSubscription.customerName}
              onChange={(e) => setNewSubscription({ ...newSubscription, customerName: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Customer name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Customer Email</label>
            <input
              type="email"
              value={newSubscription.customerEmail}
              onChange={(e) => setNewSubscription({ ...newSubscription, customerEmail: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="customer@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Subscription Plan</label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="weekly">Weekly - $35/week</option>
              <option value="biweekly">Bi-Weekly - $65/2 weeks</option>
              <option value="monthly">Monthly - $120/month</option>
            </select>
          </div>
        </div>
        <button
          onClick={createSubscription}
          disabled={!newSubscription.customerName || !newSubscription.customerEmail}
          className="mt-4 bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 disabled:bg-gray-400"
        >
          Create Subscription
        </button>
      </div>

      {/* Subscription Plans Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.entries(subscriptionPlans).map(([key, plan]) => (
          <div key={key} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <p className="text-2xl font-bold text-pink-500 mb-4">{plan.price}</p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Fresh cookies delivered {key === 'weekly' ? 'every week' : key === 'biweekly' ? 'every two weeks' : 'every month'}</li>
              <li>• Assorted cookie varieties</li>
              <li>• Free shipping</li>
              <li>• Cancel anytime</li>
            </ul>
          </div>
        ))}
      </div>

      {/* Active Subscriptions */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold">Active Subscriptions ({subscriptions.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptions.map((subscription) => {
                const plan = subscriptionPlans[subscription.status === 'active' ? 'weekly' : 'weekly'];
                const customer = customers.find(c => c.id === subscription.customerId);

                return (
                  <tr key={subscription.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {customer?.name || 'Unknown Customer'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer?.email || subscription.customerId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${plan.color}`}>
                        {plan.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        subscription.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : subscription.status === 'canceled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {subscription.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                        <button
                          onClick={() => cancelSubscription(subscription.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}