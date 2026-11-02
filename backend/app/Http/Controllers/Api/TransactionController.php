<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Product;
use App\Models\ProductStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
    // GET /api/transactions - Get all transactions with filters
    public function index(Request $request)
    {
        $query = Transaction::with('items')->orderBy('created_at', 'desc');

        // Filter by payment status
        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        // Filter by buyer name
        if ($request->has('buyer_name')) {
            $query->where('buyer_name', 'LIKE', '%' . $request->buyer_name . '%');
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $transactions = $query->get();

        // Add counts for filters
        $paidCount = Transaction::where('payment_status', 'paid')->count();
        $unpaidCount = Transaction::where('payment_status', 'unpaid')->count();

        return response()->json([
            'transactions' => $transactions,
            'counts' => [
                'paid' => (int) $paidCount,
                'unpaid' => (int) $unpaidCount,
                'total' => (int) ($paidCount + $unpaidCount)
            ]
        ]);
    }

    // POST /api/transactions - Create new transaction
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'buyer_name' => 'required|string|max:255',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_status' => 'nullable|in:paid,unpaid',
            'payment_method' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $total = 0;
            $items = [];

            foreach ($request->items as $item) {
                $product = Product::find($item['product_id']);
                
                if ($product->stock < $item['quantity']) {
                    DB::rollBack();
                    return response()->json([
                        'message' => "Insufficient stock for {$product->name}. Available: {$product->stock}"
                    ], 400);
                }

                $itemTotal = $product->price * $item['quantity'];
                $total += $itemTotal;

                $items[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $item['quantity'],
                    'price' => $product->price
                ];

                $product->stock -= $item['quantity'];
                $product->total_sold += $item['quantity'];
                $product->save();

                ProductStock::create([
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'type' => 'deduct',
                    'note' => "Sale to {$request->buyer_name}"
                ]);
            }

            $transaction = Transaction::create([
                'buyer_name' => $request->buyer_name,
                'total' => $total,
                'payment_status' => $request->payment_status ?? 'unpaid',
                'payment_method' => $request->payment_method
            ]);

            foreach ($items as $item) {
                $transaction->items()->create($item);
            }

            DB::commit();

            return response()->json($transaction->load('items'), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Transaction failed', 'error' => $e->getMessage()], 500);
        }
    }

    // GET /api/transactions/{id} - Get single transaction
    public function show($id)
    {
        $transaction = Transaction::with('items')->find($id);
        
        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        return response()->json($transaction);
    }

    // PUT /api/transactions/{id}/payment - Update payment status
    public function updatePayment(Request $request, $id)
    {
        $transaction = Transaction::find($id);
        
        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'payment_status' => 'required|in:paid,unpaid',
            'payment_method' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $transaction->payment_status = $request->payment_status;
        $transaction->payment_method = $request->payment_method;
        $transaction->save();

        return response()->json([
            'message' => 'Payment status updated',
            'transaction' => $transaction->load('items')
        ]);
    }
}