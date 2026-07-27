<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrepareReturDetail extends Model
{
    protected $fillable = [
        'prepare_header_id',
        'product_type',
        'serah_terima_retur_gr',
        'retur_prepare_to_produksi_gr',
    ];

    public function prepareHeader()
    {
        return $this->belongsTo(PrepareHeader::class);
    }
}
