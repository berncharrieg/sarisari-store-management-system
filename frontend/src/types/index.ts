export interface Product {
  id: number;  
  name: string;
  price: number;
  stock: number;
  totalSold: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormProps {
  products: Product[];
  onAddProduct: (name: string, price: number, stock: number) => Promise<void>;
  
}

export interface ProductTableProps {
  products: Product[];
  onUpdateStock: (id: number, newStock: number) => void;
  onDeleteProduct: (id: number) => void;
}



export interface InventoryTableProps {
  products: Product[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
}
export interface TransactionItem {
  id?: number;  
  transactionId?: number; 
  productId: number; 
  productName: string;
  quantity: number;
  price: number;
}

export interface Transaction {
  id: number;
  buyerName: string;
  total: number;
  paymentStatus: 'paid' | 'unpaid';
  paymentMethod: string | null;
  items: TransactionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TransactionCounts {
  paid: number;
  unpaid: number;
  total: number;
}

export interface TransactionFormProps {
  products: Product[];
  onAddToCart: (item: TransactionItem) => void;
  buyerName: string;
  onBuyerNameChange: (name: string) => void;
  
}



export interface TransactionHistoryProps {
  transactions: Transaction[];
  counts: TransactionCounts;
  onUpdatePayment: (id: number, status: 'paid' | 'unpaid', method?: string) => Promise<void>;
  onFilterChange: (filter: 'all' | 'paid' | 'unpaid') => void;
  currentFilter: 'all' | 'paid' | 'unpaid';
}


export interface ProductStock {
  id: number; 
  productId: number; 
  quantity: number;
  type: 'add' | 'deduct';
  note: string | null;
  createdAt: string;
  product?: Product;
}

export interface ShoppingCartProps {
  cartItems: TransactionItem[];
  products: Product[];
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onCheckout: (paymentStatus: 'paid' | 'unpaid', paymentMethod: string) => void;

  buyerName: string;
}

export interface Stats {
  totalSales: number;
  totalProducts: number;
  totalItemsSold: number;
  inventoryValue: number;
}
export interface SummaryCardsProps {
  totalSales: number;
  inventoryValue: number;
  itemsSold: number;
}
export interface ProductHistoryItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  type: 'add' | 'deduct';
  note: string | null;
  date: string;
  product: {
    id: number;
    name: string;
    currentStock: number;
  };
}
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface TopBuyer {
  buyerName: string;
  transactionCount: number;
  totalSpent: number;
  lastPurchase: string;
}

export interface BuyerDetails {
  buyerName: string;
  totalSpent: number;
  transactionCount: number;
  firstPurchase: string;
  lastPurchase: string;
  favoriteProducts: Array<{
    productName: string;
    totalQuantity: number;
    totalAmount: number;
  }>;
  recentTransactions: Array<{
    id: number;
    date: string;
    total: number;
    itemsCount: number;
  }>;
}

export interface DailySalesReport {
  date: string;
  summary: {
    totalSales: number;
    transactionCount: number;
    paidTotal: number;
    unpaidTotal: number;
    paidCount: number;
    unpaidCount: number;
  };
  paymentBreakdown: Array<{
    paymentMethod: string;
    count: number;
    total: number;
  }>;
  topProducts: Array<{
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  hourlySales: Array<{
    hour: number;
    transactionCount: number;
    totalSales: number;
  }>;
  transactions: Array<{
    id: number;
    buyerName: string;
    total: number;
    paymentStatus: 'paid' | 'unpaid';
    paymentMethod: string | null;
    createdAt: string;
    itemsCount: number;
  }>;
}

export interface QuickSalesReport {
  period: string;
  startDate: string;
  endDate: string;
  totalSales: number;
  transactionCount: number;
  paymentBreakdown: Array<{
    paymentMethod: string;
    count: number;
    total: number;
  }>;
}