<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrepareProductDetail extends Model
{
    protected $fillable = [
        'prepare_header_id',
        'product_type',
        'recipe_plan',
        'recipe_real',
        'dikichi',
        'adonan_akhir_gr',
        'adonan_masuk_gr',
        'waste_gr',
        'retur_gr',
    ];

    public function prepareHeader()
    {
        return $this->belongsTo(PrepareHeader::class);
    }
}
