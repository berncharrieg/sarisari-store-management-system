<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SalesReportController extends Controller
{
    // GET /api/sales-report?date=YYYY-MM-DD
    public function dailyReport(Request $request)
    {
        $date = $request->get('date', now()->toDateString());
        
        $transactions = Transaction::with('items')
            ->whereDate('created_at', $date)
            ->get();

        $total_sales = (float) $transactions->sum('total');
        $transaction_count = (int) $transactions->count();

        $payment_breakdown = Transaction::whereDate('created_at', $date)
            ->where('payment_status', 'paid')
            ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(total) as total'))
            ->groupBy('payment_method')
            ->get()
            ->map(function($item) {
                return [
                    'payment_method' => $item->payment_method ?? 'not_specified',
                    'count' => (int) $item->count,
                    'total' => (float) ($item->total ?? 0),
                ];
            });

        $paid_total = (float) Transaction::whereDate('created_at', $date)
            ->where('payment_status', 'paid')
            ->sum('total');
        
        $unpaid_total = (float) Transaction::whereDate('created_at', $date)
            ->where('payment_status', 'unpaid')
            ->sum('total');

        $paid_count = (int) Transaction::whereDate('created_at', $date)
            ->where('payment_status', 'paid')
            ->count();
        
        $unpaid_count = (int) Transaction::whereDate('created_at', $date)
            ->where('payment_status', 'unpaid')
            ->count();

        $top_products = DB::table('transaction_items')
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->whereDate('transactions.created_at', $date)
            ->select(
                'transaction_items.product_name',
                DB::raw('SUM(transaction_items.quantity) as total_quantity'),
                DB::raw('SUM(transaction_items.price * transaction_items.quantity) as total_revenue')
            )
            ->groupBy('transaction_items.product_name')
            ->orderBy('total_revenue', 'desc')
            ->limit(5)
            ->get()
            ->map(function($item) {
                return [
                    'product_name' => $item->product_name,
                    'total_quantity' => (int) $item->total_quantity,
                    'total_revenue' => (float) ($item->total_revenue ?? 0),
                ];
            });

        $hourly_sales = Transaction::whereDate('created_at', $date)
            ->select(
                DB::raw('HOUR(created_at) as hour'),
                DB::raw('COUNT(*) as transaction_count'),
                DB::raw('SUM(total) as total_sales')
            )
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->map(function($item) {
                return [
                    'hour' => (int) $item->hour,
                    'transaction_count' => (int) $item->transaction_count,
                    'total_sales' => (float) ($item->total_sales ?? 0),
                ];
            });

        return response()->json([
            'date' => $date,
            'summary' => [
                'total_sales' => $total_sales,
                'transaction_count' => $transaction_count,
                'paid_total' => $paid_total,
                'unpaid_total' => $unpaid_total,
                'paid_count' => $paid_count,
                'unpaid_count' => $unpaid_count,
            ],
            'payment_breakdown' => $payment_breakdown,
            'top_products' => $top_products,
            'hourly_sales' => $hourly_sales,
            'transactions' => $transactions->map(function($transaction) {
                return [
                    'id' => $transaction->id,
                    'buyer_name' => $transaction->buyer_name,
                    'total' => (float) $transaction->total,
                    'payment_status' => $transaction->payment_status,
                    'payment_method' => $transaction->payment_method,
                    'created_at' => $transaction->created_at->format('Y-m-d H:i:s'),
                    'items_count' => $transaction->items->count(),
                ];
            }),
        ]);
    }

    // GET /api/sales-report/quick?period=today|yesterday|this_week|this_month
    public function quickReport(Request $request)
    {
        $period = $request->get('period', 'today');
        
        $start_date = null;
        $end_date = now();

        switch ($period) {
            case 'today':
                $start_date = now()->startOfDay();
                break;
            case 'yesterday':
                $start_date = now()->subDay()->startOfDay();
                $end_date = now()->subDay()->endOfDay();
                break;
            case 'this_week':
                $start_date = now()->startOfWeek();
                break;
            case 'this_month':
                $start_date = now()->startOfMonth();
                break;
            default:
                $start_date = now()->startOfDay();
        }

        $transactions = Transaction::whereBetween('created_at', [$start_date, $end_date])->get();
        $total_sales = (float) $transactions->sum('total');
        $transaction_count = (int) $transactions->count();

        $payment_breakdown = Transaction::whereBetween('created_at', [$start_date, $end_date])
            ->where('payment_status', 'paid')
            ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(total) as total'))
            ->groupBy('payment_method')
            ->get()
            ->map(function($item) {
                return [
                    'payment_method' => $item->payment_method ?? 'not_specified',
                    'count' => (int) $item->count,
                    'total' => (float) ($item->total ?? 0),
                ];
            });

        return response()->json([
            'period' => $period,
            'start_date' => $start_date->format('Y-m-d'),
            'end_date' => $end_date->format('Y-m-d'),
            'total_sales' => $total_sales,
            'transaction_count' => $transaction_count,
            'payment_breakdown' => $payment_breakdown,
        ]);
    }
}
