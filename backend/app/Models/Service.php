<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $guarded = [];

    protected $with = ['tourDetail', 'hotelDetail', 'homestayDetail', 'vehicleDetail'];

    protected $appends = [
        'duration_days', 'duration_nights', 'max_guests',
        'star_rating', 'checkin_time', 'checkout_time',
        'total_bedrooms', 'total_bathrooms',
        'vehicle_type', 'seats', 'transmission', 'fuel_type', 'inventory'
    ];

    /**
     * Tự động chuyển đổi dữ liệu JSON từ Postgres sang mảng PHP
     */
    protected function casts(): array
    {
        return [
            'amenities' => 'array',
            'includes' => 'array',
            'excludes' => 'array',
            // 'tags' được xử lý qua Accessor và Mutator bên dưới
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * Accessor: Chuyển đổi chuỗi text[] của Postgres thành mảng PHP khi đọc
     */
    public function getTagsAttribute($value)
    {
        if (is_array($value)) return array_values($value);
        if (!$value || $value === '{}') return [];
        
        $tags = array_filter(explode(',', trim($value, '{}')));
        return array_values(array_map(function($t) {
            return trim($t, '"\' ');
        }, $tags));
    }

    /**
     * Mutator: Chuyển đổi mảng PHP thành chuỗi text[] của Postgres khi lưu
     */
    public function setTagsAttribute($value)
    {
        if (is_array($value)) {
            // Thêm dấu ngoặc kép để tránh lỗi nếu tag có chứa dấu phẩy hoặc khoảng trắng
            $formatted = array_map(fn($t) => '"' . addslashes(trim($t, '"\'')) . '"', $value);
            $this->attributes['tags'] = '{' . implode(',', $formatted) . '}';
        } else {
            $this->attributes['tags'] = '{' . trim($value, '{}') . '}';
        }
    }

    // --- QUAN HỆ ---

    public function provider()
    {
        return $this->belongsTo(ProviderProfile::class, 'provider_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function media()
    {
        return $this->hasMany(ServiceMedia::class);
    }

    public function schedules()
    {
        return $this->hasMany(ServiceSchedule::class);
    }

    public function availabilities()
    {
        return $this->hasMany(ServiceAvailability::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function roomTypes()
    {
        return $this->hasMany(HotelRoomType::class);
    }

    public function upsells()
    {
        return $this->hasMany(ServiceUpsell::class, 'trigger_service_id');
    }

    // --- CTI DELEGATION RELATIONSHIPS ---

    public function tourDetail()
    {
        return $this->hasOne(TourDetail::class, 'service_id');
    }

    public function hotelDetail()
    {
        return $this->hasOne(HotelDetail::class, 'service_id');
    }

    public function homestayDetail()
    {
        return $this->hasOne(HomestayDetail::class, 'service_id');
    }

    public function vehicleDetail()
    {
        return $this->hasOne(VehicleDetail::class, 'service_id');
    }

    // --- CTI DELEGATION ACCESSORS & MUTATORS ---

    public function getDurationDaysAttribute()
    {
        return $this->tourDetail?->duration_days;
    }

    public function getDurationNightsAttribute()
    {
        return $this->tourDetail?->duration_nights;
    }

    public function getMaxGuestsAttribute()
    {
        if ($this->type === 'tour') {
            return $this->tourDetail?->max_guests;
        }
        if ($this->type === 'homestay') {
            return $this->roomTypes->first()?->capacity_adults;
        }
        return null;
    }

    public function getStarRatingAttribute()
    {
        return $this->hotelDetail?->star_rating;
    }

    public function getCheckinTimeAttribute()
    {
        if ($this->type === 'hotel') {
            return $this->hotelDetail?->checkin_time;
        }
        if ($this->type === 'homestay') {
            return $this->homestayDetail?->checkin_time;
        }
        return null;
    }

    public function getCheckoutTimeAttribute()
    {
        if ($this->type === 'hotel') {
            return $this->hotelDetail?->checkout_time;
        }
        if ($this->type === 'homestay') {
            return $this->homestayDetail?->checkout_time;
        }
        return null;
    }

    public function getTotalBedroomsAttribute()
    {
        if ($this->type === 'homestay') {
            return $this->roomTypes->first()?->total_bedrooms;
        }
        return null;
    }

    public function getTotalBathroomsAttribute()
    {
        if ($this->type === 'homestay') {
            return $this->roomTypes->first()?->total_bathrooms;
        }
        return null;
    }

    public function getVehicleTypeAttribute()
    {
        return $this->vehicleDetail?->vehicle_type;
    }

    public function getSeatsAttribute()
    {
        return $this->vehicleDetail?->seats;
    }

    public function getTransmissionAttribute()
    {
        return $this->vehicleDetail?->transmission;
    }

    public function getFuelTypeAttribute()
    {
        return $this->vehicleDetail?->fuel_type;
    }

    public function getInventoryAttribute()
    {
        return $this->vehicleDetail?->inventory;
    }
}
