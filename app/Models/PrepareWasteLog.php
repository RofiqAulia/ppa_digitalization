<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrepareWasteLog extends Model
{
    protected $fillable = [
        'prepare_header_id',
        'waste_type',
        'weight_gr',
    ];

    public function prepareHeader()
    {
        return $this->belongsTo(PrepareHeader::class);
    }
}
