<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\ProductStockController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\BuyerController;
use App\Http\Controllers\Api\SalesReportController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Product routes
Route::get('products/search', [ProductController::class, 'search']); // Must be before apiResource
Route::get('products/{id}/history', [ProductController::class, 'history']);
Route::apiResource('products', ProductController::class);

// Transaction routes
Route::apiResource('transactions', TransactionController::class)->only(['index', 'store', 'show']);
Route::put('transactions/{id}/payment', [TransactionController::class, 'updatePayment']);

// Product Stock routes
Route::apiResource('product-stocks', ProductStockController::class)->only(['index', 'store', 'show']);
Route::get('products/{id}/stock-history', [ProductStockController::class, 'productHistory']);

// Buyer routes
Route::get('buyers/search', [BuyerController::class, 'search']);
Route::get('buyers/top', [BuyerController::class, 'topBuyers']);
Route::get('buyers/{buyerName}', [BuyerController::class, 'buyerDetails']);

// Stats routes
Route::get('stats', [StatsController::class, 'index']);
Route::get('stats/summary', [StatsController::class, 'summary']);
Route::get('stats/top-products', [StatsController::class, 'topProducts']);
Route::get('stats/product-history', [StatsController::class, 'productHistory']);
Route::get('stats/unique-products', [StatsController::class, 'uniqueProducts']);
Route::get('stats/top-buyers', [StatsController::class, 'topBuyers']);
Route::get('stats/buyers/{buyerName}', [StatsController::class, 'buyerDetails']);

// Test route
Route::get('test', function () {
    return response()->json(['message' => 'API is working!', 'version' => app()->version()]);
});


// Sales Report routes
Route::get('sales-report', [SalesReportController::class, 'dailyReport']);
Route::get('sales-report/quick', [SalesReportController::class, 'quickReport']);