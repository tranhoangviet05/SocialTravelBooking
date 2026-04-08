<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use App\Services\LocationService;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    protected $locationService;

    public function __construct(LocationService $locationService)
    {
        $this->locationService = $locationService;
    }

    /**
     * Lấy danh sách địa điểm (vaitro/hanhdong/chucnang)
     * Endpoint: GET /api/general/get/locations
     */
    public function index(Request $request)
    {
        $filters = $request->only(['is_popular', 'root_only']);
        $locations = $this->locationService->getAllLocations($filters);

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách địa điểm thành công',
            'data' => $locations
        ]);
    }

    /**
     * Lấy chi tiết một địa điểm
     */
    public function show($id)
    {
        $location = $this->locationService->getLocationById($id);

        if (!$location) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy địa điểm'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $location
        ]);
    }
}
