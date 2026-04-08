<?php

namespace App\Services;

use App\Models\Location;
use Illuminate\Support\Collection;

class LocationService
{
    /**
     * Lấy danh sách địa điểm (Có thể lọc theo popular hoặc thành phố)
     */
    public function getAllLocations(array $filters = []): Collection
    {
        $query = Location::query();

        // Lọc địa điểm phổ biến
        if (isset($filters['is_popular'])) {
            $query->where('is_popular', filter_var($filters['is_popular'], FILTER_VALIDATE_BOOLEAN));
        }

        // Chỉ lấy cấp thành phố/tỉnh (không có parent_id)
        if (isset($filters['root_only']) && filter_var($filters['root_only'], FILTER_VALIDATE_BOOLEAN)) {
            $query->whereNull('parent_id');
        }

        return $query->orderBy('name', 'asc')->get();
    }

    /**
     * Lấy thông tin chi tiết một địa điểm
     */
    public function getLocationById(int $id): ?Location
    {
        return Location::with(['children', 'parent'])->find($id);
    }
}
