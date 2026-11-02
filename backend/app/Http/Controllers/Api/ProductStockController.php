<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductStock;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ProductStockController extends Controller
{
    // GET /api/product-stocks - Get all stock logs
    public function index(Request $request)
    {
        $query = ProductStock::with('product');

        // Filter by product_id if provided
        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Filter by type if provided
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $stocks = $query->orderBy('created_at', 'desc')->get();
        
        return response()->json($stocks);
    }

    // POST /api/product-stocks - Add stock log (and update product stock)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'type' => 'required|in:add,deduct',
            'note' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $product = Product::findOrFail($request->product_id);

            // Validate stock for deduction
            if ($request->type === 'deduct' && $product->stock < $request->quantity) {
                DB::rollBack();
                return response()->json([
                    'message' => "Insufficient stock. Available: {$product->stock}, Requested: {$request->quantity}"
                ], 400);
            }

            // Create stock log
            $stockLog = ProductStock::create([
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
                'type' => $request->type,
                'note' => $request->note
            ]);

            // Update product stock
            if ($request->type === 'add') {
                $product->stock += $request->quantity;
            } else {
                $product->stock -= $request->quantity;
            }
            $product->save();

            DB::commit();

            return response()->json([
                'message' => 'Stock updated successfully',
                'stock_log' => $stockLog->load('product'),
                'new_stock' => $product->stock
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // GET /api/product-stocks/{id} - Get single stock log
    public function show($id)
    {
        $stockLog = ProductStock::with('product')->find($id);
        
        if (!$stockLog) {
            return response()->json(['message' => 'Stock log not found'], 404);
        }

        return response()->json($stockLog);
    }

    // GET /api/products/{id}/stock-history - Get stock history for a product
    public function productHistory($productId)
    {
        $product = Product::find($productId);
        
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $history = ProductStock::where('product_id', $productId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'product' => $product,
            'history' => $history
        ]);
    }
}