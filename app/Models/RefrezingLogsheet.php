<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RefrezingLogsheet extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function details()
    {
        return $this->hasMany(RefrezingLogsheetDetail::class);
    }

    public function canBeEdited()
    {
        // Data can only be edited within 24 hours of its date
        return now()->diffInHours($this->created_at) <= 24;
    }
}
