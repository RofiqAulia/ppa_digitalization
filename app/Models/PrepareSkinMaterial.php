<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrepareSkinMaterial extends Model
{
    protected $fillable = [
        'prepare_header_id',
        'material_type',
        'masuk',
        'sisa_pack',
        'sisa_unit',
        'waste_manual_gr',
        'waste_tandon_gr',
        'retur_pro_wh',
        'retur_wh_pro',
    ];

    public function prepareHeader()
    {
        return $this->belongsTo(PrepareHeader::class);
    }
}
