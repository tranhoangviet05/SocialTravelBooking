<?php

namespace App\Http\Controllers\General;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BehaviorDatabaseController extends Controller
{

    /**
     * UPSERT hành vi người dùng
     */
    public function upsertBehavior(Request $request)
    {
        // Xử lý tags: Luôn đưa về mảng, kể cả khi n8n gửi dữ liệu trống hoặc sai
        $tags = $request->tags;
        if (empty($tags) || $tags === 'undefined' || !is_array($tags)) {
            $tags = [];
        }

        $score = (float)($request->score ?? 0);
        $userId = $request->user_id;
        $locationId = $request->location_id;
        $actionType = $request->action_type ?? 'unknown';
        
        // --- LOGIC CHUẨN HÓA DANH MỤC MẸ ---
        $rawType = strtolower($request->service_type ?? '');
        $serviceType = 'tour'; // Mặc định là tour

        // Các loại thuộc về "Chỗ ở"
        $hotelTypes = ['hotel', 'khách sạn', 'homestay', 'resort', 'villa', 'studio', 'apartment', 'căn hộ', 'chỗ ở'];
        foreach ($hotelTypes as $hType) {
            if (str_contains($rawType, $hType)) {
                $serviceType = 'hotel';
                break;
            }
        }
        // ------------------------------------

        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'Missing User ID'], 400);
        }

        $existing = DB::table('user_behaviors')
            ->where('user_id', $userId)
            ->where('location_id', $locationId)
            ->where('service_type', $serviceType) // Phân biệt theo loại dịch vụ
            ->first();

        if ($existing) {
            DB::table('user_behaviors')
                ->where('id', $existing->id) // Cập nhật đúng bản ghi đó
                ->update([
                    'score' => $existing->score + $score,
                    'tags' => json_encode($tags),
                    'action_type' => $actionType,
                    'is_pending' => true,
                    'updated_at' => now()
                ]);
            \Log::info("Updated behavior for user $userId, Location $locationId, Type $serviceType, set is_pending = true");
        } else {
            DB::table('user_behaviors')->insert([
                'user_id' => $userId,
                'location_id' => $locationId,
                'action_type' => $actionType,
                'service_type' => $serviceType,
                'score' => $score,
                'tags' => json_encode($tags),
                'is_pending' => true,
                'updated_at' => now(),
                'created_at' => now()
            ]);
            \Log::info("Inserted new behavior for user $userId, Location $locationId, Type $serviceType, set is_pending = true");
        }

        return response()->json(['success' => true]);
    }

    /**
     * Lấy danh sách user đang chờ xử lý gợi ý
     */
    public function getPendingUsers()
    {
        $users = DB::table('user_behaviors')
            ->where('is_pending', true)
            ->select('user_id')
            ->distinct()
            ->get();
            
        return response()->json($users);
    }

    /**
     * Lấy hành vi tốt nhất để tính Cross-sell
     */
    public function getBestInterest(Request $request)
    {
        $userId = $request->query('user_id');
        
        $interest = DB::table('user_behaviors as b')
            ->leftJoin('services as s', 's.location_id', '=', 'b.location_id')
            ->where('b.user_id', $userId)
            ->select('b.*', 's.type as last_type')
            ->orderBy('b.score', 'desc')
            ->first();
            
        return response()->json($interest);
    }

    /**
     * Lưu danh sách gợi ý và Reset trạng thái pending
     */
    public function saveRecommendations(Request $request)
    {
        $userId = $request->user_id;
        $recommendations = $request->recommendations;

        DB::table('user_recommendations')->updateOrInsert(
            ['user_id' => $userId],
            [
                'recommendations' => json_encode($recommendations),
                'updated_at' => now()
            ]
        );

        DB::table('user_behaviors')->where('user_id', $userId)->update(['is_pending' => false]);

        return response()->json(['success' => true]);
    }

    /**
     * Dọn dẹp dữ liệu cũ
     */
    /**
     * Xử lý gợi ý hàng loạt cho tất cả người dùng đang pending
     */
    public function processBulkRecommendations()
    {
        // 1. Tìm tất cả user có hành vi mới
        $pendingUsers = DB::table('user_behaviors')
            ->where('is_pending', true)
            ->distinct()
            ->pluck('user_id');

        if ($pendingUsers->isEmpty()) {
            return response()->json(['success' => true, 'message' => 'No pending behaviors']);
        }

        $processedCount = 0;

        foreach ($pendingUsers as $userId) {
            // 2. Tìm địa điểm quan tâm nhất của user
            $bestInterest = DB::table('user_behaviors')
                ->where('user_id', $userId)
                ->whereNotNull('location_id')
                ->orderBy('score', 'desc')
                ->first();

            // Nếu tổng điểm quá thấp (< 30), coi như chưa đủ quan tâm để đổi gợi ý
            if (!$bestInterest || $bestInterest->score < 30) {
                DB::table('user_behaviors')->where('user_id', $userId)->update(['is_pending' => false]);
                continue;
            }

            $locationId = $bestInterest->location_id;
            $serviceType = $bestInterest->service_type;

            // Kiểm tra xem gợi ý hiện tại có đang ở địa điểm này không để tránh ghi đè trùng lặp
            $currentRec = DB::table('user_recommendations')->where('user_id', $userId)->first();
            if ($currentRec && $currentRec->location_id == $locationId) {
                // Đã gợi ý địa điểm này rồi, không cần đổi nữa trừ khi muốn refresh dữ liệu
                DB::table('user_behaviors')->where('user_id', $userId)->update(['is_pending' => false]);
                continue;
            }

            \Log::info("Processing optimized hybrid recommendations for user: $userId at location: $locationId");

            // 3. Logic Gợi ý Hỗn hợp (Hybrid)
            // Lấy 3 cái bán chéo (Target) và 1 cái cùng loại (Same)
            if ($serviceType === 'tour') {
                $crossTypes = ['hotel', 'homestay', 'resort'];
                $sameTypes = ['tour'];
            } else {
                $crossTypes = ['tour'];
                $sameTypes = ['hotel', 'homestay', 'resort'];
            }

            // Lấy danh sách Cross-sell (Tối đa 3)
            $crossRecs = \App\Models\Service::query()
                ->where('location_id', $locationId)
                ->whereIn('type', $crossTypes)
                ->where('status', 'active')
                ->with(['media' => fn($q) => $q->where('is_cover', true)])
                ->orderBy('rating_avg', 'desc')
                ->limit(3)
                ->get();

            // Lấy danh sách cùng loại (Tối đa 1)
            $sameRecs = \App\Models\Service::query()
                ->where('location_id', $locationId)
                ->whereIn('type', $sameTypes)
                ->where('status', 'active')
                ->with(['media' => fn($q) => $q->where('is_cover', true)])
                ->orderBy('rating_avg', 'desc')
                ->limit(1)
                ->get();

            // Gộp lại thành bộ 4 gợi ý hoàn chỉnh
            $finalRecommendations = $crossRecs->merge($sameRecs);

            if ($finalRecommendations->isNotEmpty()) {
                DB::table('user_recommendations')->updateOrInsert(
                    ['user_id' => $userId],
                    [
                        'location_id' => $locationId,
                        'suggested_services' => json_encode($finalRecommendations),
                        'updated_at' => now()
                    ]
                );
                $processedCount++;
            }

            DB::table('user_behaviors')->where('user_id', $userId)->update(['is_pending' => false]);
        }

        return response()->json([
            'success' => true, 
            'processed_users' => $processedCount
        ]);
    }

    public function cleanup()
    {
        DB::table('user_behaviors')->where('updated_at', '<', now()->subDays(2))->delete();
        return response()->json(['success' => true]);
    }
}
