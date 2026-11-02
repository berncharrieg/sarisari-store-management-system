<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    // GET /api/products - Get all unique products
    public function index()
    {
        $products = Product::orderBy('created_at', 'desc')->get();
        return response()->json($products);
    }

    // GET /api/products/search?name=coca - Search product by name
    public function search(Request $request)
    {
        $name = $request->get('name', '');
        
        if (empty($name)) {
            return response()->json([]);
        }

        $products = Product::where('name', 'LIKE', "%{$name}%")
            ->limit(10)
            ->get();

        return response()->json($products);
    }

    // POST /api/products - Add product (new or existing) with stock
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'note' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            // Check if product exists (case-insensitive)
            $product = Product::whereRaw('LOWER(name) = ?', [strtolower($request->name)])->first();

            if ($product) {
                // Product exists - update price and add to stock
                $product->price = $request->price;
                $oldStock = $product->stock;
                $product->stock += $request->stock;
                $product->save();

                // Create stock history entry
                ProductStock::create([
                    'product_id' => $product->id,
                    'quantity' => $request->stock,
                    'type' => 'add',
                    'note' => $request->note ?? "Stock added (Previous: {$oldStock}, New: {$product->stock})"
                ]);

                DB::commit();

                return response()->json([
                    'message' => 'Stock added to existing product',
                    'product' => $product,
                    'stock_added' => $request->stock,
                    'is_new' => false
                ], 200);
            } else {
                // Product doesn't exist - create new
                $product = Product::create([
                    'name' => $request->name,
                    'price' => $request->price,
                    'stock' => $request->stock,
                    'total_sold' => 0
                ]);

                // Create initial stock history entry
                ProductStock::create([
                    'product_id' => $product->id,
                    'quantity' => $request->stock,
                    'type' => 'add',
                    'note' => $request->note ?? 'Initial stock'
                ]);

                DB::commit();

                return response()->json([
                    'message' => 'New product created',
                    'product' => $product,
                    'stock_added' => $request->stock,
                    'is_new' => true
                ], 201);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to add product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // GET /api/products/{id} - Get single product
    public function show($id)
    {
        $product = Product::find($id);
        
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($product);
    }

    // PUT /api/products/{id} - Update product info only (not stock)
    public function update(Request $request, $id)
    {
        $product = Product::find($id);
        
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'price' => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Only allow updating name and price, NOT stock directly
        $product->update($request->only(['name', 'price']));

        return response()->json([
            'message' => 'Product updated',
            'product' => $product
        ]);
    }

    // DELETE /api/products/{id} - Delete product
    public function destroy($id)
    {
        $product = Product::find($id);
        
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }

    // GET /api/products/{id}/history - Get stock history for a product
    public function history($id)
    {
        $product = Product::find($id);
        
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $history = ProductStock::where('product_id', $id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($item) {
                return [
                    'id' => $item->id,
                    'quantity' => (int) $item->quantity,
                    'type' => $item->type,
                    'note' => $item->note,
                    'date' => $item->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return response()->json([
            'product' => $product,
            'history' => $history
        ]);
    }
}