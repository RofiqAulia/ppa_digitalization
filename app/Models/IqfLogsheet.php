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

    public function canBeEdited(): bool
    {
        if (!$this->created_at) {
            return false;
        }

        return now()->diffInHours($this->created_at) <= 24;
    }

    public function details()
    {
        return $this->hasMany(IqfLogsheetDetail::class);
    }
}
