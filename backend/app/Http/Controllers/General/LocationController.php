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
        ], 200);
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
        ], 200);
    }

    /**
     * Thêm địa điểm mới (/post/add/location)
     */
    public function store(Request $request) {
        $dataLocation = $request->all();
        $location = $this->locationService->createLocation($dataLocation);
        if (!$location) {
            return response()->json([
                'success' => false,
                'message' => 'Thêm địa điểm thất bại'
            ], 404);
        }
        return response()->json([
            'success' => true,
            'message' => 'Thêm địa điểm thành công',
            'data' => $location
        ], 200);
    }

    /**
     * Cập nhật địa điểm (/put/update/location/{id})
     */
    public function update(Request $request, $id) {
        $dataLocation = $request->all();
        $location = $this->locationService->updateLocation($id, $dataLocation);
        if (!$location) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy địa điểm'
            ], 404);
        }
        return response()->json([
            'success' => true,
            'message' => 'Cập nhật địa điểm thành công',
            'data' => $location
        ], 200);
    }

    /**
     * Xóa địa điểm (/delete/delete/location/{id})
     */
    public function destroy($id) {
        $location = $this->locationService->deleteLocation($id);
        if (!$location) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy địa điểm'
            ], 404);
        }
        return response()->json([
            'success' => true,
            'message' => 'Xóa địa điểm thành công',
            'data' => $location
        ], 200);
    }
}
