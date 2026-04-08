<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AffiliateClick extends Model
{
    /**
     * Tên bảng đặc thù
     */
    protected $table = 'affiliate_clicks';

    use HasFactory, HasUuids;

    protected $guarded = [];

    public $timestamps = false; // Dùng clicked_at thay thế

    protected function casts(): array
    {
        return [
            'converted' => 'boolean',
            'commission_paid' => 'boolean',
            'clicked_at' => 'datetime',
            'converted_at' => 'datetime',
        ];
    }

    // --- QUAN HỆ ---

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function affiliate()
    {
        return $this->belongsTo(User::class, 'affiliate_user_id');
    }

    public function clicker()
    {
        return $this->belongsTo(User::class, 'clicker_user_id');
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
