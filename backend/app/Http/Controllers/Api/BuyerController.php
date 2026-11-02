<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BuyerController extends Controller
{
    // GET /api/buyers/search?name=juan - Search buyers by name
    public function search(Request $request)
    {
        $searchTerm = $request->get('name', '');

        if (empty($searchTerm)) {
            return response()->json([]);
        }

        // Get unique buyer names that match search
        $buyers = Transaction::select('buyer_name')
            ->where('buyer_name', 'LIKE', "%{$searchTerm}%")
            ->groupBy('buyer_name')
            ->orderBy('buyer_name', 'asc')
            ->limit(10)
            ->get()
            ->map(function($buyer) {
                // Get transaction count and total spent
                $transactionCount = Transaction::where('buyer_name', $buyer->buyer_name)->count();
                $totalSpent = Transaction::where('buyer_name', $buyer->buyer_name)->sum('total');

                return [
                    'buyer_name' => $buyer->buyer_name,
                    'transaction_count' => (int) $transactionCount,
                    'total_spent' => (float) $totalSpent,
                ];
            });

        return response()->json($buyers);
    }

    // GET /api/buyers/top - Get top buyers
    public function topBuyers(Request $request)
    {
        $limit = $request->get('limit', 10);

        $topBuyers = Transaction::select(
            'buyer_name',
            DB::raw('COUNT(*) as transaction_count'),
            DB::raw('SUM(total) as total_spent'),
            DB::raw('MAX(created_at) as last_purchase')
        )
        ->groupBy('buyer_name')
        ->orderBy('total_spent', 'desc')
        ->limit($limit)
        ->get();

        // No manual conversion; middleware handles camelCase
        return response()->json($topBuyers);
    }

    // GET /api/buyers/{buyerName} - Get buyer details
    public function buyerDetails($buyerName)
    {
        $transactions = Transaction::with('items')
            ->where('buyer_name', $buyerName)
            ->orderBy('created_at', 'desc')
            ->get();

        if ($transactions->isEmpty()) {
            return response()->json(['message' => 'Buyer not found'], 404);
        }

        $totalSpent = $transactions->sum('total');
        $transactionCount = $transactions->count();

        // Most purchased products
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

        // Send all snake_case keys; middleware will convert
        return response()->json([
            'buyer_name' => $buyerName,
            'total_spent' => (float) $totalSpent,
            'transaction_count' => (int) $transactionCount,
            'first_purchase' => $transactions->last()->created_at,
            'last_purchase' => $transactions->first()->created_at,
            'favorite_products' => $productsPurchased,
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
}
