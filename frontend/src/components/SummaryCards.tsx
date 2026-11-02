import React from 'react';
import { DollarSign, Package, ShoppingCart } from 'lucide-react';
import type { SummaryCardsProps } from './../types';


const SummaryCards: React.FC<SummaryCardsProps> = ({ totalSales, inventoryValue, itemsSold }) => {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Total Sales</p>
            <p className="text-3xl font-bold mt-1">₱{parseFloat(totalSales.toFixed(2))}</p>
          </div>
          <DollarSign size={40} className="text-blue-200" />
        </div>
      </div>
      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">Inventory Value</p>
            <p className="text-3xl font-bold mt-1">₱{parseFloat(inventoryValue.toFixed(2))}</p>
          </div>
          <Package size={40} className="text-green-200" />
        </div>
      </div>
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm">Items Sold</p>
            <p className="text-3xl font-bold mt-1">{itemsSold}</p>
          </div>
          <ShoppingCart size={40} className="text-purple-200" />
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;