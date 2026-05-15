<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasFactory;

    protected $guarded = [];

    /**
     * Tắt timestamp mặc định của Laravel nếu DB chỉ có created_at
     */
    public $timestamps = true; 

    // --- ACCESSORS ---
    
    /**
     * Tự động gắn domain vào image_url nếu là ảnh local
     */
    protected function getImageUrlAttribute($value)
    {
        if (!$value) return null;
        
        // Nếu là link Cloudinary hoặc link tuyệt đối thì giữ nguyên
        if (str_starts_with($value, 'http')) {
            return $value;
        }
        
        // Nếu là ảnh local (bắt đầu bằng /images/) thì gắn APP_URL vào
        return url($value);
    }

    // --- QUAN HỆ ---

    public function parent()
    {
        return $this->belongsTo(Location::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Location::class, 'parent_id');
    }

    public function services()
    {
        return $this->hasMany(Service::class);
    }
}
