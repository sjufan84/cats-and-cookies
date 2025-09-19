"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Refund {
  id: string;
  amount: number;
  currency: string;
  payment_intent: string;
  reason: string;
  status: string;
  created: string;
  metadata?: Record<string, unknown>;
}

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  customer: string;
  status: string;
  created: string;
}

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [paymentIntents, setPaymentIntents] = useState<PaymentIntent[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPaymentIntent, setSelectedPaymentIntent] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('requested_by_customer');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [refundsResponse, paymentsResponse] = await Promise.all([
        fetch('/api/admin/stripe-dashboard?action=refunds'),
        fetch('/api/admin/stripe-dashboard?action=payment-intents')
      ]);

      const refundsData = await refundsResponse.json();
      const paymentsData = await paymentsResponse.json();

      setRefunds(refundsData.refunds || []);
      setPaymentIntents(paymentsData.paymentIntents || []);
    } catch (error) {
      console.error('Error fetching refund data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRefund = async () => {
    if (!selectedPaymentIntent || !refundAmount) {
      alert('Please select a payment and enter refund amount');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/admin/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: selectedPaymentIntent,
          amount: Math.round(parseFloat(refundAmount) * 100), // Convert to cents
          reason: refundReason
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Refund created successfully for ${formatCurrency(result.refund.amount)}`);
        fetchData();
        setSelectedPaymentIntent('');
        setRefundAmount('');
        setRefundReason('requested_by_customer');
      } else {
        alert(`Failed to create refund: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating refund:', error);
      alert('Failed to create refund');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPaymentIntent = (id: string) => {
    return paymentIntents.find(pi => pi.id === id);
  };

  const getReasonDisplay = (reason: string) => {
    const reasons: { [key: string]: string } = {
      'duplicate': 'Duplicate',
      'fraudulent': 'Fraudulent',
      'requested_by_customer': 'Customer Request'
    };
    return reasons[reason] || reason;
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading refund management...</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Refund Management</h1>
        <Link href="/admin" className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
          Back to Admin
        </Link>
      </div>

      {/* Create New Refund */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Create New Refund</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Payment Intent</label>
            <select
              value={selectedPaymentIntent}
              onChange={(e) => setSelectedPaymentIntent(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select a payment</option>
              {paymentIntents
                .filter(pi => pi.status === 'succeeded')
                .map((pi) => (
                  <option key={pi.id} value={pi.id}>
                    {formatCurrency(pi.amount)} - {pi.customer || 'Guest'} - {formatDate(pi.created)}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Refund Amount (USD)</label>
            <input
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border rounded-md"
              step="0.01"
              min="0"
              max={selectedPaymentIntent ?
                (getPaymentIntent(selectedPaymentIntent)?.amount || 0) / 100 :
                undefined
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Refund Reason</label>
            <select
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="duplicate">Duplicate</option>
              <option value="fraudulent">Fraudulent</option>
              <option value="requested_by_customer">Customer Request</option>
            </select>
          </div>
        </div>
        <button
          onClick={createRefund}
          disabled={processing || !selectedPaymentIntent || !refundAmount}
          className="mt-4 bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 disabled:bg-gray-400"
        >
          {processing ? 'Processing...' : 'Create Refund'}
        </button>
      </div>

      {/* Refunds Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Refunded</h3>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(refunds.reduce((sum, refund) => sum + refund.amount, 0))}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Refund Count</h3>
          <p className="text-2xl font-bold text-blue-600">
            {refunds.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Success Rate</h3>
          <p className="text-2xl font-bold text-green-600">
            {refunds.length > 0 ?
              Math.round((refunds.filter(r => r.status === 'succeeded').length / refunds.length) * 100) :
              0}%
          </p>
        </div>
      </div>

      {/* Refunds List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold">Recent Refunds ({refunds.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {refunds.map((refund) => {
                const paymentIntent = getPaymentIntent(refund.payment_intent);
                return (
                  <tr key={refund.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(refund.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>{formatCurrency(paymentIntent?.amount || 0)}</div>
                        <div className="text-xs text-gray-400">{paymentIntent?.customer || 'Guest'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getReasonDisplay(refund.reason)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        refund.status === 'succeeded'
                          ? 'bg-green-100 text-green-800'
                          : refund.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {refund.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(refund.created)}
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