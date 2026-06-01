<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemHoliday;
use Illuminate\Http\Request;

class HolidayController extends Controller
{
    /**
     * Danh sách ngày lễ hệ thống (Admin)
     * GET /api/admin/holidays?year=2026
     */
    public function index(Request $request)
    {
        $year = $request->get('year', now()->year);

        $holidays = SystemHoliday::whereYear('date', $year)
            ->orderBy('date')
            ->get()
            ->map(function ($h) {
                return [
                    'id'               => $h->id,
                    'date'             => $h->date->format('Y-m-d'),
                    'name'             => $h->name,
                    'type'             => $h->type,
                    'type_label'       => SystemHoliday::$typeLabels[$h->type] ?? $h->type,
                    'description'      => $h->description,
                    'is_block_booking' => $h->is_block_booking,
                    'created_at'       => $h->created_at?->toISOString(),
                ];
            });

        return response()->json([
            'success' => true,
            'data'    => $holidays,
        ]);
    }

    /**
     * Tạo ngày lễ mới
     * POST /api/admin/holidays
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date'             => 'required|date_format:Y-m-d|unique:system_holidays,date',
            'name'             => 'required|string|max:255',
            'type'             => 'required|in:national_holiday,national_mourning,emergency,other',
            'description'      => 'nullable|string|max:1000',
            'is_block_booking' => 'boolean',
        ]);

        $holiday = SystemHoliday::create([
            ...$validated,
            'is_block_booking' => $validated['is_block_booking'] ?? false,
            'created_by'       => $request->user()?->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm ngày đặc biệt thành công.',
            'data'    => $holiday,
        ], 201);
    }

    /**
     * Cập nhật ngày lễ
     * PUT /api/admin/holidays/{id}
     */
    public function update(Request $request, $id)
    {
        $holiday = SystemHoliday::findOrFail($id);

        $validated = $request->validate([
            'date'             => 'sometimes|date_format:Y-m-d|unique:system_holidays,date,' . $id,
            'name'             => 'sometimes|string|max:255',
            'type'             => 'sometimes|in:national_holiday,national_mourning,emergency,other',
            'description'      => 'nullable|string|max:1000',
            'is_block_booking' => 'boolean',
        ]);

        $holiday->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật ngày đặc biệt thành công.',
            'data'    => $holiday,
        ]);
    }

    /**
     * Xóa ngày lễ
     * DELETE /api/admin/holidays/{id}
     */
    public function destroy($id)
    {
        $holiday = SystemHoliday::findOrFail($id);
        $holiday->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa ngày đặc biệt.',
        ]);
    }

    /**
     * API công khai - Frontend/Provider đọc để hiển thị calendar overlay
     * GET /api/holidays?start_date=2026-01-01&end_date=2026-12-31
     */
    public function publicIndex(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth()->toDateString());
        $endDate   = $request->get('end_date', now()->endOfMonth()->toDateString());

        $holidays = SystemHoliday::whereBetween('date', [$startDate, $endDate])
            ->orderBy('date')
            ->get(['id', 'date', 'name', 'type', 'description', 'is_block_booking']);

        return response()->json([
            'success' => true,
            'data'    => $holidays,
        ]);
    }
}
