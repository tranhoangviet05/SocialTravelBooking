<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdCampaign extends Model
{
    /**
     * Tên bảng đặc thù
     */
    protected $table = 'ad_campaigns';

    use HasFactory, HasUuids;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'start_date' => 'datetime',
            'end_date' => 'datetime',
        ];
    }

    // --- QUAN HỆ ---

    public function provider()
    {
        return $this->belongsTo(ProviderProfile::class, 'provider_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
