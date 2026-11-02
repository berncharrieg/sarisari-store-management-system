import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, TrendingUp, CreditCard, Package, Clock, Users, ChevronDown, ChevronUp } from 'lucide-react';

import { salesReportService } from '../services/salesReportService';
import type { DailySalesReport as DailySalesReportType } from '../types';
import { PAYMENT_METHODS, getPaymentMethodLabel, getPaymentMethodIcon } from '../utils/paymentMethod';

const DailySalesReport: React.FC = () => {
  const [report, setReport] = useState<DailySalesReportType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [quickPeriod, setQuickPeriod] = useState<'today' | 'yesterday' | 'this_week' | 'this_month'>('today');

  useEffect(() => {
    fetchReport();
  }, [selectedDate]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await salesReportService.getDailyReport(selectedDate);
      setReport(data);
    } catch (error) {
      console.error('Error fetching sales report:', error);
      alert('Failed to load sales report');
    } finally {
      setLoading(false);
    }
  };
  const [showHourlyChart, setShowHourlyChart] = useState(false);

  const handleQuickPeriod = (period: 'today' | 'yesterday') => {
    setQuickPeriod(period);
    const date = new Date();
    if (period === 'yesterday') {
      date.setDate(date.getDate() - 1);
    }
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-500 mt-4">Loading sales report...</p>
      </div>
    );
  }

  if (!report) {
    return <div className="text-center py-12 text-gray-500">No data available</div>;
  }

  function LiveDate() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatted = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

  const weekday = now.toLocaleDateString("en-US", {
    weekday: "long",
  });
    const formattedTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
 
  return <p>{formatted}  ·  {formattedTime} | {weekday} </p>;
}

  return (
    <div className="space-y-6">
      {/* Header with Date Selector */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Calendar size={32} />
              Daily Sales Report
            </h1>
            <p className="mt-2 text-sm text-green-100"><LiveDate /></p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleQuickPeriod('today')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDate === new Date().toISOString().split('T')[0]
                  ? 'bg-white text-green-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handleQuickPeriod('yesterday')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]
                  ? 'bg-white text-green-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Yesterday
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="px-4 py-2 rounded-lg text-gray-800 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                ₱{report.summary.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign size={40} className="text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{report.summary.transactionCount}</p>
            </div>
            <TrendingUp size={40} className="text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                ₱{report.summary.paidTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500">{report.summary.paidCount} transactions</p>
            </div>
            <div className="text-emerald-500">✓</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unpaid</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                ₱{report.summary.unpaidTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500">{report.summary.unpaidCount} transactions</p>
            </div>
            <div className="text-red-500">⚠</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Payment Method Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="text-indigo-600" />
            Cash Flow Breakdown
          </h2>
          
          {report.paymentBreakdown.length > 0 ? (
            <div className="space-y-3">
              {report.paymentBreakdown.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {payment.paymentMethod !== 'not_specified' 
                        ? getPaymentMethodIcon(payment.paymentMethod)
                        : '💰'
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {payment.paymentMethod !== 'not_specified' 
                          ? getPaymentMethodLabel(payment.paymentMethod)
                          : 'Not Specified'
                        }
                      </p>
                      <p className="text-sm text-gray-600">{payment.count} {payment.count === 1 ? 'transaction' : 'transactions'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      ₱{payment.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {((payment.total / report.summary.paidTotal) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CreditCard size={48} className="mx-auto mb-3 text-gray-300" />
              <p>No paid transactions for this date</p>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Package className="text-indigo-600" />
            Top Selling Products
          </h2>
          
          {report.topProducts.length > 0 ? (
            <div className="space-y-3">
              {report.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold rounded-full">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{product.productName}</p>
                      <p className="text-sm text-gray-600">{product.totalQuantity} units sold</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-800">
                    ₱{product.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package size={48} className="mx-auto mb-3 text-gray-300" />
              <p>No products sold on this date</p>
            </div>
          )}
        </div>
      </div>

      {/* Hourly Sales Chart */}
{report.hourlySales.length > 0 && (
  <div className="bg-white rounded-lg shadow-md p-6">
    <button
      onClick={() => setShowHourlyChart(!showHourlyChart)}
      className="w-full flex items-center justify-between text-xl font-bold text-gray-800 mb-4 hover:text-indigo-600 transition-colors"
    >
      <div className="flex items-center gap-2">
        <Clock className="text-indigo-600" />
        Sales by Hour
      </div>
      {showHourlyChart ? (
        <ChevronUp className="text-gray-600" />
      ) : (
        <ChevronDown className="text-gray-600" />
      )}
    </button>
    
    {showHourlyChart && (
      <div className="grid grid-cols-12 gap-2">
        {Array.from({ length: 24 }, (_, i) => {
          const hourData = report.hourlySales.find(h => h.hour === i);
          const maxSales = Math.max(...report.hourlySales.map(h => h.totalSales), 1);
          const height = hourData ? (hourData.totalSales / maxSales) * 100 : 0;
          
          return (
            <div key={i} className="flex flex-col items-center">
              <div className="w-full bg-gray-100 rounded-t h-32 flex items-end overflow-hidden">
                {hourData && (
                  <div
                    className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t transition-all hover:from-indigo-600 hover:to-indigo-500 cursor-pointer relative group"
                    style={{ height: `${height}%` }}
                    title={`${i}:00 - ₱${hourData.totalSales.toFixed(2)} (${hourData.transactionCount} trans)`}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                      ₱{hourData.totalSales.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">{i}</p>
            </div>
          );
        })}
      </div>
    )}
  </div>
)}
      {/* Transaction List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="text-indigo-600" />
          Transactions ({report.transactions.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Buyer</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Items</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {report.transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(transaction.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{transaction.buyerName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{transaction.itemsCount} items</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    ₱{transaction.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.paymentStatus === 'paid' ? '✓ Paid' : '⚠ Unpaid'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {transaction.paymentMethod ? (
                      <>
                        {getPaymentMethodIcon(transaction.paymentMethod)}{' '}
                        {getPaymentMethodLabel(transaction.paymentMethod)}
                      </>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {report.transactions.length === 0 && (
            <p className="text-center text-gray-500 py-8">No transactions for this date</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailySalesReport;