import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, ShoppingBag, Calendar, DollarSign, Award } from 'lucide-react';
import { buyerService } from '../services/buyerSrevice';
import type { TopBuyer, BuyerDetails } from '../types';

const TopBuyers: React.FC = () => {
  const [topBuyers, setTopBuyers] = useState<TopBuyer[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState<BuyerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchTopBuyers();
  }, [limit]);

  const fetchTopBuyers = async () => {
    try {
      setLoading(true);
      const data = await buyerService.getTopBuyers(limit);
      setTopBuyers(data);
    } catch (error) {
      console.error('Error fetching top buyers:', error);
      alert('Failed to load top buyers');
    } finally {
      setLoading(false);
    }
  };

  const fetchBuyerDetails = async (buyerName: string) => {
    try {
      setDetailsLoading(true);
      const data = await buyerService.getBuyerDetails(buyerName);
      setSelectedBuyer(data);
    } catch (error) {
      console.error('Error fetching buyer details:', error);
      alert('Failed to load buyer details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Award size={32} />
              Top Buyers Leaderboard
            </h1>
            <p className="mt-2 text-purple-100">Track your most valuable customers</p>
          </div>
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="bg-white/20 text-white px-4 py-2 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
          >
            <option value="5" className="text-gray-800">Top 5</option>
            <option value="10" className="text-gray-800">Top 10</option>
            <option value="20" className="text-gray-800">Top 20</option>
            <option value="50" className="text-gray-800">Top 50</option>
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Buyers List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="text-indigo-600" />
            Top Customers by Spending
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading...</p>
            </div>
          ) : topBuyers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users size={64} className="mx-auto mb-4 text-gray-300" />
              <p>No buyers found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topBuyers.map((buyer, index) => (
                <div
                  key={buyer.buyerName}
                  onClick={() => fetchBuyerDetails(buyer.buyerName)}
                  className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${
                    selectedBuyer?.buyerName === buyer.buyerName
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 shadow-md'
                      : 'bg-gradient-to-r from-gray-50 to-white border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-xl font-bold w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-full shadow-md">
                      {getRankIcon(index)}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 text-lg">{buyer.buyerName}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <ShoppingBag size={14} />
                          {buyer.transactionCount} {buyer.transactionCount === 1 ? 'transaction' : 'transactions'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(buyer.lastPurchase).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      ₱{buyer.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500">Total Spent</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buyer Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-indigo-600" />
            Customer Details
          </h2>

          {detailsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading details...</p>
            </div>
          ) : !selectedBuyer ? (
            <div className="text-center py-12 text-gray-500">
              <Users size={64} className="mx-auto mb-4 text-gray-300" />
              <p>Select a customer to view details</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
                <h3 className="text-xl font-bold text-gray-800 mb-3">{selectedBuyer.buyerName}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₱{selectedBuyer.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transactions</p>
                    <p className="text-2xl font-bold text-indigo-600">{selectedBuyer.transactionCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">First Purchase</p>
                    <p className="font-medium text-gray-800">
                      {new Date(selectedBuyer.firstPurchase).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Purchase</p>
                    <p className="font-medium text-gray-800">
                      {new Date(selectedBuyer.lastPurchase).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Favorite Products */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <ShoppingBag size={18} className="text-indigo-600" />
                  Favorite Products
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedBuyer.favoriteProducts.length > 0 ? (
                    selectedBuyer.favoriteProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{product.productName}</p>
                          <p className="text-sm text-gray-600">{product.totalQuantity} units purchased</p>
                        </div>
                        <p className="font-bold text-gray-800">
                          ₱{product.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">No products found</p>
                  )}
                </div>
              </div>

              {/* Recent Transactions */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <DollarSign size={18} className="text-indigo-600" />
                  Recent Transactions
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedBuyer.recentTransactions.length > 0 ? (
                    selectedBuyer.recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">Transaction #{transaction.id}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(transaction.date).toLocaleString()} • {transaction.itemsCount} {transaction.itemsCount === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                        <p className="font-bold text-gray-800">
                          ₱{transaction.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">No recent transactions</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBuyers;