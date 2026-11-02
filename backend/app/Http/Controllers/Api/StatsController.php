<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Product;
use App\Models\ProductStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function index()
    {
        $totalSales = Transaction::sum('total');
        $totalProducts = Product::count();
        $totalItemsSold = Product::sum('total_sold');
        $inventoryValue = Product::selectRaw('SUM(price * stock) as value')->value('value');

        return response()->json([
            'total_sales' => (float) ($totalSales ?? 0),
            'total_products' => (int) ($totalProducts ?? 0),
            'total_items_sold' => (int) ($totalItemsSold ?? 0),
            'inventory_value' => (float) ($inventoryValue ?? 0),
        ]);
    }

    // NEW: Get product stock history (every addition/deduction)
    public function productHistory(Request $request)
    {
        $query = ProductStock::with('product')
            ->orderBy('created_at', 'desc');

        // Filter by product if specified
        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Filter by type if specified
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $history = $query->get()->map(function($item) {
            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product->name,
                'quantity' => (int) $item->quantity,
                'type' => $item->type,
                'note' => $item->note,
                'date' => $item->created_at->format('Y-m-d H:i:s'),
                'product' => [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'current_stock' => (int) $item->product->stock,
                ]
            ];
        });

        return response()->json($history);
    }

    // NEW: Get unique products with summed stock from history
    public function uniqueProducts()
    {
        $products = Product::with(['stockLogs' => function($query) {
            $query->orderBy('created_at', 'desc');
        }])->get()->map(function($product) {
            // Calculate total added and total deducted
            $totalAdded = ProductStock::where('product_id', $product->id)
                ->where('type', 'add')
                ->sum('quantity');
            
            $totalDeducted = ProductStock::where('product_id', $product->id)
                ->where('type', 'deduct')
                ->sum('quantity');

            // Get first stock entry date
            $firstStockDate = ProductStock::where('product_id', $product->id)
                ->orderBy('created_at', 'asc')
                ->first();

            return [
                'id' => $product->id,
                'name' => $product->name,
                'price' => (float) $product->price,
                'current_stock' => (int) $product->stock,
                'total_sold' => (int) $product->total_sold,
                'total_added' => (int) $totalAdded,
                'total_deducted' => (int) $totalDeducted,
                'first_added_date' => $firstStockDate ? $firstStockDate->created_at->format('Y-m-d') : null,
                'created_at' => $product->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json($products);
    }

    // NEW: Get top buyers
    public function topBuyers(Request $request)
    {
        $limit = $request->get('limit', 10);

        // Group transactions by buyer_name and sum their totals
        $topBuyers = Transaction::select(
            'buyer_name',
            DB::raw('COUNT(*) as transaction_count'),
            DB::raw('SUM(total) as total_spent'),
            DB::raw('MAX(created_at) as last_purchase')
        )
        ->groupBy('buyer_name')
        ->orderBy('total_spent', 'desc')
        ->limit($limit)
        ->get()
        ->map(function($buyer) {
            return [
                'buyer_name' => $buyer->buyer_name,
                'transaction_count' => (int) $buyer->transaction_count,
                'total_spent' => (float) $buyer->total_spent,
                'last_purchase' => $buyer->last_purchase,
            ];
        });

        return response()->json($topBuyers);
    }

    // NEW: Get buyer details
    public function buyerDetails($buyerName)
    {
        // Get all transactions for this buyer
        $transactions = Transaction::with('items')
            ->where('buyer_name', $buyerName)
            ->orderBy('created_at', 'desc')
            ->get();

        if ($transactions->isEmpty()) {
            return response()->json(['message' => 'Buyer not found'], 404);
        }

        $totalSpent = $transactions->sum('total');
        $transactionCount = $transactions->count();
        
        // Get most purchased products
        $productsPurchased = DB::table('transaction_items')
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.buyer_name', $buyerName)
            ->select(
                'transaction_items.product_name',
                DB::raw('SUM(transaction_items.quantity) as total_quantity'),
                DB::raw('SUM(transaction_items.price * transaction_items.quantity) as total_amount')
            )
            ->groupBy('transaction_items.product_name')
            ->orderBy('total_quantity', 'desc')
            ->get();

        return response()->json([
            'buyer_name' => $buyerName,
            'total_spent' => (float) $totalSpent,
            'transaction_count' => (int) $transactionCount,
            'first_purchase' => $transactions->last()->created_at,
            'last_purchase' => $transactions->first()->created_at,
            'favorite_products' => $productsPurchased->map(function($item) {
                return [
                    'product_name' => $item->product_name,
                    'total_quantity' => (int) $item->total_quantity,
                    'total_amount' => (float) $item->total_amount,
                ];
            }),
            'recent_transactions' => $transactions->take(5)->map(function($transaction) {
                return [
                    'id' => $transaction->id,
                    'date' => $transaction->created_at->format('Y-m-d H:i:s'),
                    'total' => (float) $transaction->total,
                    'items_count' => $transaction->items->count(),
                ];
            }),
        ]);
    }

    public function summary()
    {
        $lowStockProducts = Product::where('stock', '<', 10)->count();
        $todaySales = Transaction::whereDate('created_at', today())->sum('total');
        $monthlySales = Transaction::whereMonth('created_at', now()->month)
                                   ->whereYear('created_at', now()->year)
                                   ->sum('total');

        return response()->json([
            'low_stock_count' => (int) $lowStockProducts,
            'today_sales' => (float) ($todaySales ?? 0),
            'monthly_sales' => (float) ($monthlySales ?? 0),
        ]);
    }

    public function topProducts(Request $request)
    {
        $limit = $request->get('limit', 5);
        
        $topProducts = Product::orderBy('total_sold', 'desc')
                              ->limit($limit)
                              ->get()
                              ->map(function($product) {
                                  return [
                                      'id' => $product->id,
                                      'name' => $product->name,
                                      'total_sold' => (int) $product->total_sold,
                                      'revenue' => (float) ($product->price * $product->total_sold),
                                  ];
                              });

        return response()->json($topProducts);
    }
}