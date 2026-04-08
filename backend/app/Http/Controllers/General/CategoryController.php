<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use App\Services\CategoryService;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    protected $categoryService;

    public function __construct(CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }

    /**
     * Lấy danh sách danh mục (vaitro/hanhdong/chucnang)
     * Endpoint: GET /api/general/get/categories
     */
    public function index()
    {
        $categories = $this->categoryService->getAllCategories();

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách danh mục thành công',
            'data' => $categories
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

        return response()->json([
            'success' => true,
            'message' => 'Lấy thông tin danh mục thành công',
            'data' => $category
        ]);
    }
}
