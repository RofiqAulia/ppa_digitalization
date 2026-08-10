<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RefrezingLogsheetDetail extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function refrezingLogsheet()
    {
        return $this->belongsTo(RefrezingLogsheet::class);
    }
}
