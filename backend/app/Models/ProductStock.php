<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductStock extends Model
{
    use HasFactory;

    // Disable updated_at timestamp
    const UPDATED_AT = null;

    protected $fillable = [
        'product_id',
        'quantity',
        'type',
        'note'
    ];

    protected $casts = [
        'quantity' => 'integer',

        'created_at' => 'datetime:Y-m-d\TH:i:sP',
        'updated_at' => 'datetime:Y-m-d\TH:i:sP',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}