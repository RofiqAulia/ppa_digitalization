<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrepareTopping extends Model
{
    protected $fillable = [
        'prepare_header_id',
        'topping_weight_gr',
    ];

    public function prepareHeader()
    {
        return $this->belongsTo(PrepareHeader::class);
    }
}
