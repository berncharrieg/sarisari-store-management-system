import React, { useState, useEffect } from 'react';
import { Calendar, Package, TrendingUp, TrendingDown } from 'lucide-react';
import type { ProductHistoryItem } from '../types'


const ProductHistoryTable: React.FC = () => {
  const [history, setHistory] = useState<ProductHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'add' | 'deduct'>('all');

  useEffect(() => {
    fetchHistory();
  }, [filter]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
     const filterParam = filter === "all" ? "" : `?type=${filter}`;
     const response = await fetch(`http://localhost:8000/api/stats/product-history${filterParam}`);

      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="text-indigo-600" />
          Product Stock History
        </h2>
        
        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('add')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'add'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Stock In
          </button>
          <button
            onClick={() => setFilter('deduct')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'deduct'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Stock Out
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date & Time</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Current Stock</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(item.date).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {item.productName}
                  </td>
                  <td className="px-4 py-3">
                    {item.type === 'add' ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <TrendingUp size={16} />
                        <span className="font-medium">Stock In</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600">
                        <TrendingDown size={16} />
                        <span className="font-medium">Stock Out</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      item.type === 'add'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.type === 'add' ? '+' : '-'}{item.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    {item.product.currentStock}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item.note || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && (
            <p className="text-center text-gray-500 py-8">No stock history found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductHistoryTable;