import React, { useState, useEffect } from 'react';
import { Users, ShoppingCart, Package, TrendingUp, BarChart3 } from 'lucide-react';
import ProductForm from './components/ProductForm';
import ProductTable from './components/ProductTable';
import ProductHistoryTable from './components/ProductHistory';
import SummaryCards from './components/SummaryCards';
import InventoryTable from './components/InventoryTable';
import TransactionHistory from './components/TransactionHistory';
import TransactionForm from './components/TransactionForm';
import ShoppingCartComponent from './components/ShoppingCart';
import TopBuyers from './components/TopBuyer';
import { productService } from './services/productService';
import { transactionService } from './services/transactionService';
import { statsService } from './services/statsService';
import type { Product, Transaction, TransactionItem } from './types';
import api from './services/api';
import DailySalesReport from './components/DailySalesReport';



type View = 'products' | 'sales' | 'transactions' | 'topbuyers' | 'dailysales';

const App = () => {
  const [view, setView] = useState<View>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [cartItems, setCartItems] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [transactionCounts, setTransactionCounts] = useState({ paid: 0, unpaid: 0, total: 0 });
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>('unpaid');
  const [paymentMethod, setPaymentMethod] = useState('');
 
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProducts: 0,
    totalItemsSold: 0,
    inventoryValue: 0
  });
  const [data, setData] = useState({
  transactions: [],
  counts: { paid: 0, unpaid: 0, total: 0 }
});


useEffect(() => {
  fetch("http://localhost:8000/api/transactions")
    .then(res => res.json())
    .then(json => setData(json));
}, []);

  // Load products on mount
  useEffect(() => {
    fetchProducts();
    fetchTransactions();
    fetchStats();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };
  

const fetchTransactions = async () => {
  try {
    const filters = transactionFilter !== 'all' ? { paymentStatus: transactionFilter } : undefined;

    const data = await transactionService.getAll(filters);
    setTransactions(data.transactions);
    setTransactionCounts(data.counts);
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }
};


  const fetchStats = async () => {
    try {
      const data = await statsService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Product Management Functions
const addProduct = async (name: string, price: number, stock: number, note?: string) => {
  try {
    setLoading(true);
    const response = await api.post('/products', { name, price, stock, note });
    
    if (response.data.is_new) {
      alert(`New product "${name}" created with ${stock} units!`);
    } else {
      alert(`Stock added to "${name}". New total: ${response.data.product.stock} units`);
    }
    
    await fetchProducts();
    await fetchStats();
  } catch (error: any) {
    console.error('Error adding product:', error);
    alert(error.response?.data?.message || 'Failed to add product');
  } finally {
    setLoading(false);
  }
};
const handleUpdatePayment = async (id: number, status: 'paid' | 'unpaid', method?: string) => {
  try {
    await transactionService.updatePayment(id, { paymentStatus: status, paymentMethod: method });
    await fetchTransactions();
    alert('Payment status updated!');
  } catch (error: any) {
    console.error('Error updating payment:', error);
    alert('Failed to update payment status');
  }
};

useEffect(() => {
  fetchTransactions();
}, [transactionFilter]);

  const updateProductStock = async (id: number, newStock: number) => {
    try {
      await productService.update(id, { stock: newStock });
      await fetchProducts();
      await fetchStats();
    } catch (error: any) {
      console.error('Error updating stock:', error);
      alert(error.response?.data?.message || 'Failed to update stock');
    }
  };

  const deleteProduct = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.delete(id);
        await fetchProducts();
        await fetchStats();
      } catch (error: any) {
        console.error('Error deleting product:', error);
        alert(error.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  // Cart Functions
// Cart Functions
const addToCart = (item: TransactionItem) => {
  const existingItem = cartItems.find(cartItem => cartItem.productId === item.productId);
  if (existingItem) {
    const newQuantity = existingItem.quantity + item.quantity;
    const product = products.find(p => p.id === item.productId);
    if (product && newQuantity <= product.stock) {
      setCartItems(cartItems.map(cartItem =>
        cartItem.productId === item.productId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      ));
    } else {
      alert(`Only ${product?.stock} units available!`);
    }
  } else {
    // Make sure the item has productId
    setCartItems([...cartItems, {
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      price: item.price
    }]);
  }
};

const updateCartQuantity = (productId: number, newQuantity: number) => {
  setCartItems(cartItems.map(item =>
    item.productId === productId ? { ...item, quantity: newQuantity } : item
  ));
};

const removeFromCart = (productId: number) => {
  setCartItems(cartItems.filter(item => item.productId !== productId));
};
  // Transaction Functions
const handleCheckout = async (paymentStatus: 'paid' | 'unpaid', paymentMethod: string) => {
  if (!buyerName || cartItems.length === 0) {
    alert('Please enter buyer name and add items to cart');
    return;
  }

  if (paymentStatus === 'paid' && !paymentMethod) {
    alert('Please select a payment method for a paid transaction');
    return;
  }

  // Log cart items for debugging
  console.log('Cart Items:', cartItems);
  console.log('Payment Status:', paymentStatus, 'Payment Method:', paymentMethod);

  try {
    setLoading(true);

    // Build the transaction payload for backend
    const transactionData = {
      buyerName,
      items: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      paymentStatus: paymentStatus,  // frontend state
      paymentMethod: paymentMethod,  // frontend state
    };

    console.log('Sending transaction data:', transactionData);

    // Call your transaction service
    await transactionService.create(transactionData);

    // Refresh products, transactions, and stats
    await fetchProducts();
    await fetchTransactions();
    await fetchStats();

    // Clear form
    setBuyerName('');
    setCartItems([]);
    setPaymentStatus('unpaid');
    setPaymentMethod('');

    alert('Transaction completed successfully!');
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    alert(error.response?.data?.message || 'Failed to complete transaction');
  } finally {
    setLoading(false);
  }
};

  // Calculate summary data
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {loading && (
        <div className="fixed top-0 left-0 right-0 bg-indigo-600 text-white text-center py-2 z-50">
          Loading...
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-indigo-900">🏪 Sari-Sari Store System</h1>
          <p className="text-gray-600 mt-1">Manage your store with ease</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm mt-4 mx-4 rounded-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setView('products')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                view === 'products'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <Package size={20} />
              Product Management
            </button>
            <button
              onClick={() => setView('sales')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                view === 'sales'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <TrendingUp size={20} />
              Sales & Inventory
            </button>
            <button
              onClick={() => setView('transactions')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                view === 'transactions'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <ShoppingCart size={20} />
              Transaction Entry
            </button>

            <button
                onClick={() => setView('topbuyers')}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                     view === 'topbuyers'
                       ? 'text-indigo-600 border-b-2 border-indigo-600'
                       : 'text-gray-600 hover:text-indigo-600'
                      }`}
>
                     <Users size={20} />
               Top Buyers
            </button>
            <button
                  onClick={() => setView('dailysales')}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    view === 'dailysales'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  <BarChart3 size={20} />
                  Daily Sales
            </button>

          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'products' && (
          <div className="grid gap-6">
          <ProductForm onAddProduct={addProduct} />
            <ProductTable 
              products={products}
              onUpdateStock={updateProductStock}
              onDeleteProduct={deleteProduct}
            />

            <ProductHistoryTable />
          </div>

        )}
        
        {view === 'sales' && (
          <div className="grid gap-6">
            <SummaryCards 
              totalSales={stats.totalSales}
              inventoryValue={stats.inventoryValue}
              itemsSold={stats.totalItemsSold}
            />
            <InventoryTable 
              products={filteredProducts}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
           <TransactionHistory 
                  transactions={transactions}
                  counts={transactionCounts}
                  onUpdatePayment={handleUpdatePayment}
                  onFilterChange={(filter) => {
                    setTransactionFilter(filter);
                    fetchTransactions();
                  }}
                  currentFilter={transactionFilter}
             />
          </div>
        )}
        
        {view === 'transactions' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <TransactionForm 
              products={products}
              onAddToCart={addToCart}
              buyerName={buyerName}
              onBuyerNameChange={setBuyerName}
              />
            <ShoppingCartComponent 
              cartItems={cartItems}
              products={products.map(p => ({ ...p, stock: p.stock  }))}
              onUpdateQuantity={updateCartQuantity}
              onRemoveItem={removeFromCart}
              onCheckout={handleCheckout}
              buyerName={buyerName}
            />
          </div>
        )}
        {view === 'topbuyers' && <TopBuyers />}
        {view === 'dailysales' && <DailySalesReport />}
      </main>
    </div>
  );
};

export default App;