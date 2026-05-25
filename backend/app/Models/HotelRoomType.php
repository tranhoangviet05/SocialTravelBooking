<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HotelRoomType extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'service_id',
        'name',
        'rank', // standard, premium, vip
        'description',
        'base_price',
        'inventory',
        'total_bedrooms',
        'total_bathrooms',
        'capacity_adults',
        'amenities',
        'images',
        'status',
    ];

    protected $casts = [
        'amenities' => 'array',
        'images' => 'array',
        'base_price' => 'decimal:2',
        'inventory' => 'integer',
        'total_bedrooms' => 'integer',
        'total_bathrooms' => 'integer',
        'capacity_adults' => 'integer',
    ];

    /**
     * Relationship with Service (Hotel)
     */
    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Relationship with Bookings
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class, 'room_type_id');
    }
}
