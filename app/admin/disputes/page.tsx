"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Dispute {
  id: string;
  amount: number;
  currency: string;
  payment_intent: string;
  reason: string;
  status: string;
  created: string;
  evidence?: Record<string, unknown>;
}

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  customer: string;
  status: string;
  created: string;
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [paymentIntents, setPaymentIntents] = useState<PaymentIntent[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [evidence, setEvidence] = useState({
    customerEmail: '',
    customerName: '',
    productDescription: '',
    cancellationPolicy: '',
    duplicateChargeExplanation: '',
    uncategorizedText: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [disputesResponse, paymentsResponse] = await Promise.all([
        fetch('/api/admin/stripe-dashboard?action=disputes'),
        fetch('/api/admin/stripe-dashboard?action=payment-intents')
      ]);

      const disputesData = await disputesResponse.json();
      const paymentsData = await paymentsResponse.json();

      setDisputes(disputesData.disputes || []);
      setPaymentIntents(paymentsData.paymentIntents || []);
    } catch (error) {
      console.error('Error fetching dispute data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitEvidence = async (submitToBank: boolean = false) => {
    if (!selectedDispute) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/admin/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeId: selectedDispute.id,
          evidence,
          submit: submitToBank
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Dispute evidence ${submitToBank ? 'submitted to bank' : 'saved'} successfully!`);
        fetchData();
        setSelectedDispute(null);
        setEvidence({
          customerEmail: '',
          customerName: '',
          productDescription: '',
          cancellationPolicy: '',
          duplicateChargeExplanation: '',
          uncategorizedText: ''
        });
      } else {
        alert(`Failed to submit evidence: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting evidence:', error);
      alert('Failed to submit evidence');
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
      'subscription_canceled': 'Subscription Canceled',
      'product_not_received': 'Product Not Received',
      'unrecognized': 'Unrecognized',
      'credit_not_processed': 'Credit Not Processed',
      'general': 'General'
    };
    return reasons[reason] || reason;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'needs_response':
        return 'bg-red-100 text-red-800';
      case 'won':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      case 'warning_closed':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const selectDispute = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    // Pre-fill evidence if available
    if (dispute.evidence) {
      setEvidence({
        customerEmail: String(dispute.evidence.customer_email || ''),
        customerName: String(dispute.evidence.customer_name || ''),
        productDescription: String(dispute.evidence.product_description || ''),
        cancellationPolicy: String(dispute.evidence.cancellation_policy_disclosure || ''),
        duplicateChargeExplanation: String(dispute.evidence.duplicate_charge_explanation || ''),
        uncategorizedText: String(dispute.evidence.uncategorized_text || '')
      });
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading dispute management...</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dispute Management</h1>
        <Link href="/admin" className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
          Back to Admin
        </Link>
      </div>

      {/* Dispute Evidence Form */}
      {selectedDispute && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              Respond to Dispute: {formatCurrency(selectedDispute.amount)}
            </h2>
            <button
              onClick={() => setSelectedDispute(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Customer Name</label>
              <input
                type="text"
                value={evidence.customerName}
                onChange={(e) => setEvidence({...evidence, customerName: e.target.value})}
                placeholder="Customer name"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Customer Email</label>
              <input
                type="email"
                value={evidence.customerEmail}
                onChange={(e) => setEvidence({...evidence, customerEmail: e.target.value})}
                placeholder="customer@email.com"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Product Description</label>
              <textarea
                value={evidence.productDescription}
                onChange={(e) => setEvidence({...evidence, productDescription: e.target.value})}
                placeholder="Describe the product or service purchased"
                className="w-full px-3 py-2 border rounded-md h-24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cancellation Policy</label>
              <textarea
                value={evidence.cancellationPolicy}
                onChange={(e) => setEvidence({...evidence, cancellationPolicy: e.target.value})}
                placeholder="Describe your cancellation policy"
                className="w-full px-3 py-2 border rounded-md h-20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Duplicate Charge Explanation</label>
              <textarea
                value={evidence.duplicateChargeExplanation}
                onChange={(e) => setEvidence({...evidence, duplicateChargeExplanation: e.target.value})}
                placeholder="Explain if this is a duplicate charge"
                className="w-full px-3 py-2 border rounded-md h-20"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Additional Evidence</label>
              <textarea
                value={evidence.uncategorizedText}
                onChange={(e) => setEvidence({...evidence, uncategorizedText: e.target.value})}
                placeholder="Any additional evidence or statements"
                className="w-full px-3 py-2 border rounded-md h-24"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-4">
            <button
              onClick={() => submitEvidence(false)}
              disabled={processing}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            >
              {processing ? 'Saving...' : 'Save Evidence'}
            </button>
            <button
              onClick={() => submitEvidence(true)}
              disabled={processing}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
            >
              {processing ? 'Submitting...' : 'Submit to Bank'}
            </button>
          </div>
        </div>
      )}

      {/* Disputes Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Disputed</h3>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(disputes.reduce((sum, dispute) => sum + dispute.amount, 0))}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Active Disputes</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {disputes.filter(d => d.status === 'needs_response').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Won Disputes</h3>
          <p className="text-2xl font-bold text-green-600">
            {disputes.filter(d => d.status === 'won').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Win Rate</h3>
          <p className="text-2xl font-bold text-blue-600">
            {disputes.filter(d => d.status === 'won' || d.status === 'lost').length > 0 ?
              Math.round((disputes.filter(d => d.status === 'won').length /
                disputes.filter(d => d.status === 'won' || d.status === 'lost').length) * 100) :
              0}%
          </p>
        </div>
      </div>

      {/* Disputes List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold">All Disputes ({disputes.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {disputes.map((dispute) => {
                const paymentIntent = getPaymentIntent(dispute.payment_intent);
                return (
                  <tr key={dispute.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(dispute.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {paymentIntent?.customer || 'Guest'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getReasonDisplay(dispute.reason)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(dispute.status)}`}>
                        {dispute.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(dispute.created)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {dispute.status === 'needs_response' && (
                        <button
                          onClick={() => selectDispute(dispute)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Respond
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