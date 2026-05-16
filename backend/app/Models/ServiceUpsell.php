<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceUpsell extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_id',
        'trigger_service_id',
        'trigger_room_type_id',
        'trigger_quantity',
        'target_service_id',
        'target_room_type_id',
        'perk_service_id',
        'perk_discount_percent',
        'is_active',
        'description'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'trigger_quantity' => 'integer',
        'perk_discount_percent' => 'integer',
    ];

    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    public function triggerService()
    {
        return $this->belongsTo(Service::class, 'trigger_service_id');
    }

    public function targetService()
    {
        return $this->belongsTo(Service::class, 'target_service_id');
    }

    public function perkService()
    {
        return $this->belongsTo(Service::class, 'perk_service_id');
    }

    public function triggerRoomType()
    {
        return $this->belongsTo(HotelRoomType::class, 'trigger_room_type_id');
    }

    public function targetRoomType()
    {
        return $this->belongsTo(HotelRoomType::class, 'target_room_type_id');
    }
}
