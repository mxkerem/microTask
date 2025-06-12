'use client';

import { useState } from 'react';
import { PaymentFormData } from '@/types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayment: (formData: PaymentFormData) => void;
  loading?: boolean;
}

export default function PaymentModal({ isOpen, onClose, onPayment, loading = false }: PaymentModalProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    taskId: '',
    freelancerAddress: '',
    paymentAmount: ''
  });

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.taskId && formData.freelancerAddress && formData.paymentAmount) {
      onPayment(formData);
      // Reset form after successful submission
      setFormData({
        taskId: '',
        freelancerAddress: '',
        paymentAmount: ''
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Pay for Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task ID
            </label>
            <input
              type="text"
              value={formData.taskId}
              onChange={(e) => handleInputChange('taskId', e.target.value)}
              placeholder="e.g., TASK001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Freelancer Address
            </label>
            <input
              type="text"
              value={formData.freelancerAddress}
              onChange={(e) => handleInputChange('freelancerAddress', e.target.value)}
              placeholder="GXXXXXX..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (XLM)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.paymentAmount}
              onChange={(e) => handleInputChange('paymentAmount', e.target.value)}
              placeholder="10.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.taskId || !formData.freelancerAddress || !formData.paymentAmount}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <span>Pay Now</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}