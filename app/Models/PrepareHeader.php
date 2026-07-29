<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrepareHeader extends Model
{
    protected $fillable = [
        'date',
        'shift',
        'spv_name',
        'status',
        'total_recipe_plan',
        'total_recipe_real',
        'notes',
    ];

    public function canBeEdited(): bool
    {
        if (!$this->created_at) {
            return false;
        }

        return now()->diffInHours($this->created_at) <= 24;
    }

    public function productDetails()
    {
        return $this->hasMany(PrepareProductDetail::class);
    }

    public function skinMaterials()
    {
        return $this->hasMany(PrepareSkinMaterial::class);
    }

    public function wasteLogs()
    {
        return $this->hasMany(PrepareWasteLog::class);
    }

    public function returDetails()
    {
        return $this->hasMany(PrepareReturDetail::class);
    }

    public function toppings()
    {
        return $this->hasMany(PrepareTopping::class);
    }
}
