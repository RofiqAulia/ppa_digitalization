<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IqfLogsheet extends Model
{
    protected $fillable = [
        'date',
        'shift',
        'product_type',
        'machine',
        'batch_number',
        'planning_qty',
        'unplanned_stop',
        'status',
    ];

    public function details()
    {
        return $this->hasMany(IqfLogsheetDetail::class);
    }
}
