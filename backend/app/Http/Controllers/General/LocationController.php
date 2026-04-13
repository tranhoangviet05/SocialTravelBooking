<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use App\Http\Requests\General\LocationRequest;
use App\Http\Resources\General\LocationResource;
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
     * Lấy danh sách địa điểm
     * Endpoint: GET /api/general/get/locations
     */
    public function index(Request $request)
    {
        $filters = $request->only(['is_popular', 'root_only']);
        $locations = $this->locationService->getAllLocations($filters);

        return LocationResource::collection($locations)->additional([
            'success' => true,
            'message' => 'Lấy danh sách địa điểm thành công'
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

        return (new LocationResource($location))->additional([
            'success' => true
        ]);
    }

    /**
     * Thêm địa điểm mới
     */
    public function store(LocationRequest $request)
    {
        $location = $this->locationService->createLocation($request->validated());
        $location->load('parent');

        return (new LocationResource($location))->additional([
            'success' => true,
            'message' => 'Thêm địa điểm thành công'
        ])->response()->setStatusCode(201);
    }

    /**
     * Cập nhật địa điểm
     */
    public function update(LocationRequest $request, $id)
    {
        $location = $this->locationService->updateLocation($id, $request->validated());
        if ($location) {
            $location->load('parent');
        }

        if (!$location) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy địa điểm để cập nhật'
            ], 404);
        }

        return (new LocationResource($location))->additional([
            'success' => true,
            'message' => 'Cập nhật địa điểm thành công'
        ]);
    }

    /**
     * Xóa địa điểm
     */
    public function destroy($id)
    {
        try {
            $deleted = $this->locationService->deleteLocation((int) $id);
            
            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy địa điểm hoặc xóa thất bại'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Xóa địa điểm thành công'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
