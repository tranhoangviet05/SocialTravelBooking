<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Support\Collection;

class CategoryService
{
    /**
     * Lấy danh sách toàn bộ danh mục
     */
    public function getAllCategories(): Collection
    {
        return Category::orderBy('name', 'asc')->get();
    }

    /**
     * Lấy thông tin chi tiết danh mục kèm các dịch vụ liên quan (có bộ lọc)
     * 
     * @param string $slug
     * @param array $filters [is_popular, min_rating]
     */
    public function getCategoryBySlug(string $slug, array $filters = []): ?Category
    {
        $category = Category::where('slug', $slug)->first();

        if (!$category) {
            return null;
        }

        // Tải danh sách dịch vụ thuộc danh mục này kèm các quan hệ liên quan
        $category->load(['services' => function ($query) use ($filters) {
            // Lọc theo phổ biến
            if (isset($filters['is_popular'])) {
                $query->where('is_popular', filter_var($filters['is_popular'], FILTER_VALIDATE_BOOLEAN));
            }

            // Lọc theo đánh giá tối thiểu
            if (isset($filters['min_rating'])) {
                $query->where('rating_avg', '>=', (float)$filters['min_rating']);
            }

            // Sắp xếp (mặc định đánh giá cao lên đầu)
            $query->orderBy('rating_avg', 'desc');

            // Eager loading các thông tin cần thiết để hiển thị Card Service
            $query->with(['provider', 'location', 'media']);
        }]);

        return $category;
    }
}
