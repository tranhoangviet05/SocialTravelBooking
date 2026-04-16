<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use App\Http\Requests\General\CategoryRequest;
use App\Http\Resources\General\CategoryResource;
use App\Services\CategoryService;
use App\Services\RealtimeService;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    protected $categoryService;
    protected $realtimeService;

    public function __construct(CategoryService $categoryService, RealtimeService $realtimeService)
    {
        $this->categoryService = $categoryService;
        $this->realtimeService = $realtimeService;
    }

    /**
     * Lấy danh sách danh mục
     * Endpoint: GET /api/general/get/categories
     */
    public function index()
    {
        $categories = $this->categoryService->getAllCategories();

        return CategoryResource::collection($categories)->additional([
            'success' => true,
            'message' => 'Lấy danh sách danh mục thành công'
        ]);
    }

    /**
     * Lấy chi tiết danh mục kèm danh sách dịch vụ (có bộ lọc)
     * Endpoint: GET /api/general/get/categories/{slug}
     */
    public function show(Request $request, $slug)
    {
        $filters = $request->only(['is_popular', 'min_rating']);
        $category = $this->categoryService->getCategoryBySlug($slug, $filters);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy danh mục'
            ], 404);
        }

        return (new CategoryResource($category))->additional([
            'success' => true,
            'message' => 'Lấy thông tin danh mục thành công'
        ]);
    }

    /**
     * Thêm danh mục mới (Admin)
     */
    public function store(CategoryRequest $request)
    {
        $category = $this->categoryService->createCategory($request->validated());

        // Realtime signal
        $this->realtimeService->broadcastAdmin('CategoryCreated', $category->toArray());

        return (new CategoryResource($category))->additional([
            'success' => true,
            'message' => 'Thêm danh mục mới thành công'
        ])->response()->setStatusCode(201);
    }

    /**
     * Cập nhật danh mục (Admin)
     */
    public function update(CategoryRequest $request, $id)
    {
        $category = $this->categoryService->updateCategory((int)$id, $request->validated());

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy danh mục'
            ], 404);
        }

        if ($category) {
            // Realtime signal
            $this->realtimeService->broadcastAdmin('CategoryUpdated', $category->toArray());
        }

        return (new CategoryResource($category))->additional([
            'success' => true,
            'message' => 'Cập nhật danh mục thành công'
        ]);
    }

    /**
     * Xóa danh mục (Admin)
     */
    public function destroy($id)
    {
        try {
            $deleted = $this->categoryService->deleteCategory((int)$id);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy danh mục'
                ], 404);
            }

            if ($deleted) {
                // Realtime signal
                $this->realtimeService->broadcastAdmin('CategoryDeleted', ['id' => $id]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Xóa danh mục thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
