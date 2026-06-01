<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemHoliday extends Model
{
    use HasFactory, HasUuids;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'date'             => 'date',
            'is_block_booking' => 'boolean',
        ];
    }

    /**
     * Nhãn hiển thị cho từng loại ngày lễ
     */
    public static array $typeLabels = [
        'national_holiday' => 'Ngày lễ quốc gia',
        'national_mourning' => 'Quốc tang',
        'emergency'        => 'Khẩn cấp',
        'other'            => 'Khác',
    ];

    public function getTypeLabelAttribute(): string
    {
        return self::$typeLabels[$this->type] ?? $this->type;
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
