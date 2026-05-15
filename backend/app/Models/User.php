<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasUuids, HasApiTokens;

    /**
     * Cho phép gán mọi trường dữ liệu (Mass Assignment)
     */
    protected $guarded = [];

    /**
     * Các trường cần ẩn khi chuyển sang JSON
     */
    protected $hidden = [];

    /**
     * Các thuộc tính cần ép kiểu
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'social_active' => 'boolean',
        ];
    }

    /**
     * Appends photoURL for frontend compatibility (matching Firebase naming)
     */
    protected $appends = ['photoURL'];

    public function getAvatarUrlAttribute($value)
    {
        if (!$value) return null;
        if (str_starts_with($value, 'http')) return $value;
        return url($value);
    }

    public function getPhotoURLAttribute()
    {
        return $this->avatar_url;
    }

    // --- QUAN HỆ (RELATIONSHIPS) ---

    public function touristProfile()
    {
        return $this->hasOne(TouristProfile::class);
    }

    public function providerProfile()
    {
        return $this->hasOne(ProviderProfile::class);
    }

    public function socialProfile()
    {
        return $this->hasOne(SocialProfile::class);
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
