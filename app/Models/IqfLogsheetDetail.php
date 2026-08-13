<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IqfLogsheetDetail extends Model
{
    protected $fillable = [
        'iqf_logsheet_id',
        'batch_number',
        'pic',
        'time',
        'suhu_panel',
        'suhu_produk',
        'rak',
        'tray_count',
    ];

    public function iqfLogsheet()
    {
        return $this->belongsTo(IqfLogsheet::class);
    }
}
