<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $guarded = [];

    public $timestamps = true;

    // --- ACCESSORS ---

    public function getIconUrlAttribute($value)
    {
        if (!$value) return null;
        if (str_starts_with($value, 'http')) return $value;
        return url($value);
    }

    // --- QUAN HỆ ---

    public function services()
    {
        return $this->hasMany(Service::class);
    }
}
