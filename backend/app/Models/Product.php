<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'price',
        'stock',
        'total_sold'
    ];

    protected $casts = [
        'price' => 'float',
        'stock' => 'integer',
        'total_sold' => 'integer',
        'created_at' => 'datetime:Y-m-d\TH:i:sP',
        'updated_at' => 'datetime:Y-m-d\TH:i:sP',
    ];

    public function transactionItems()
    {
        return $this->hasMany(TransactionItem::class);
    }

    // NEW: Add stock logs relationship
    public function stockLogs()
    {
        return $this->hasMany(ProductStock::class)->orderBy('created_at', 'desc');
    }
}