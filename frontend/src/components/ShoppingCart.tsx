import React, { useState, useEffect} from 'react';
import { PAYMENT_METHODS } from '../utils/paymentMethod';

import type { ShoppingCartProps } from './../types';
  


const ShoppingCart: React.FC<ShoppingCartProps> = ({ 
  cartItems, 
  products,
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout,
  buyerName 
  
}) => {


  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>('unpaid');
  const [paymentMethod, setPaymentMethod] = useState('');

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (product && newQuantity > 0 && newQuantity <= product.stock) {
      onUpdateQuantity(productId, newQuantity);
    } else if (product && newQuantity > product.stock) {
      alert(`Only ${product.stock} units available!`);
    }
  };
  useEffect(() => {
  console.log('Payment Status:', paymentStatus, 'Payment Method:', paymentMethod);
}, [paymentStatus, paymentMethod]);
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Shopping Cart</h2>
          
      {cartItems.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Cart is empty</p>
      ) : (
        <>
          <div className="mb-4">
         <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
           <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as 'paid' | 'unpaid')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
        </select>
      </div>
              {paymentStatus === 'paid' && (
         <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select payment method</option>
              {PAYMENT_METHODS.map(method => (
                <option key={method.value} value={method.value}>
                  {method.icon} {method.label}
                </option>
              ))}
            </select>
          </div>
)}
          <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
            {cartItems.map((item) => (
              <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.productName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <span className="text-sm text-gray-600">
                      × ₱{item.price.toFixed(2)} = ₱{(item.quantity * item.price).toFixed(2)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveItem(item.productId)}
                  className="text-red-600 hover:text-red-800 font-medium ml-4"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold text-gray-800">Total:</span>
              <span className="text-2xl font-bold text-indigo-600">₱{cartTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={() => onCheckout(paymentStatus, paymentMethod)}
              disabled={!buyerName || cartItems.length === 0}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Complete Transaction
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShoppingCart;