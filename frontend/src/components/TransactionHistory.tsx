import React, { useState } from 'react';
import type {Transaction, TransactionHistoryProps } from '../types';
import { PAYMENT_METHODS, getPaymentMethodIcon, getPaymentMethodLabel } from '../utils/paymentMethod';
import { DollarSign, Smartphone, CreditCard, Building } from 'lucide-react';



const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  transactions, 
  counts,
  onUpdatePayment,
  onFilterChange,
  currentFilter
}) => {
  const [editingTransaction, setEditingTransaction] = useState<number | null>(null);
  const [editData, setEditData] = useState<{ status: 'paid' | 'unpaid'; method: string }>({ 
    status: 'unpaid', 
    method: '' 
  });
const paymentIcons = {
  cash: DollarSign,
  gcash: Smartphone,
  maribank: CreditCard,
  bdo: Building,
};
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction.id);
    setEditData({
      status: transaction.paymentStatus,
      method: transaction.paymentMethod || ''
    });
  };

  const handleSave = async (id: number) => {
    await onUpdatePayment(id, editData.status, editData.method);
    setEditingTransaction(null);
  };

  const handleCancel = () => {
    setEditingTransaction(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>
        
        {/* Filter Buttons with Counts */}
        <div className="flex gap-2">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              currentFilter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {counts.total}
            </span>
          </button>
          <button
            onClick={() => onFilterChange('unpaid')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              currentFilter === 'unpaid'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⚠ Unpaid
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {counts.unpaid}
            </span>
          </button>
          <button
            onClick={() => onFilterChange('paid')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              currentFilter === 'paid'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✓ Paid
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {counts.paid}
            </span>

          </button>
          

        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Buyer</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Items</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Paid Via</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600 text-sm">
                  {new Date(transaction.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">{transaction.buyerName}</td>
                <td className="px-4 py-3 text-gray-600 text-sm">
                  {transaction.items.map(item => `${item.productName} (${item.quantity})`).join(', ')}
                </td>
                <td className="px-4 py-3 font-semibold text-gray-800">₱{transaction.total.toFixed(2)}</td>
                
                {/* Status - Editable if unpaid */}
                <td className="px-4 py-3">
                  {editingTransaction === transaction.id ? (
                    <select
                      value={editData.status}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value as 'paid' | 'unpaid' })}
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
                    </select>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      transaction.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.paymentStatus === 'paid' ? '✓ Paid' : '⚠ Unpaid'}
                    </span>
                  )}
                </td>

                {/* Payment Method - Editable if unpaid */}
              <td className="px-4 py-3">
                {editingTransaction === transaction.id ? (
                  <select
                    value={editData.method}
                    onChange={(e) => setEditData({ ...editData, method: e.target.value })}
                     className={`px-3 py-1 border rounded text-sm ${
                      editData.status !== 'paid' 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                        : 'bg-white text-gray-900 border-gray-300'
                    }`}
                    disabled={editData.status !== 'paid'}
                  >
                    <option value="">Select method</option>
                    {PAYMENT_METHODS.map(method => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <>
                    {transaction.paymentStatus === 'paid' ? (
                      <span className="text-sm text-gray-800 flex items-center gap-2">
                        {transaction.paymentMethod ? (
                          <>
                            {(() => {
                              const IconComponent = paymentIcons[transaction.paymentMethod as keyof typeof paymentIcons];
                              return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
                            })()}
                            {getPaymentMethodLabel(transaction.paymentMethod)}
                          </>
                        ) : (
                          <span className="text-gray-400">No method</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </>
                )}
              </td>

             <td className="px-4 py-3">
              {editingTransaction === transaction.id ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(transaction.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              ) : transaction.paymentStatus === 'unpaid' ? (
                <button
                  onClick={() => handleEdit(transaction)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                >
                  Edit
                </button>
              ) : (
                <span className="text-xs text-gray-400">-</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {transactions.length === 0 && (
      <p className="text-center text-gray-500 py-8">No transactions found</p>
    )}
  </div>
</div>

);
};
export default TransactionHistory;
