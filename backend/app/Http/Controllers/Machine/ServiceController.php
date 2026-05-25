<?php

namespace App\Http\Controllers\Machine;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Service;
use App\Events\ProviderServiceStatusUpdated;
use App\Events\AdminServiceUpdated;
use Illuminate\Support\Facades\Log;

class ServiceController extends Controller
{
    /**
     * POST /api/internal/services/{id}/moderate
     * Nhận kết quả từ N8N (Gemini)
     */
    public function moderate(Request $request, $id)
    {
        $request->validate([
            'decision' => 'required|in:approve,reject,manual',
            'reason' => 'nullable|string',
        ]);

        $service = Service::with('provider.user')->find($id);

        if (!$service) {
            return response()->json(['success' => false, 'message' => 'Service not found'], 404);
        }

        if ($request->decision === 'manual') {
            // Không làm gì cả, giữ nguyên trạng thái pending để Admin duyệt
            return response()->json(['success' => true, 'message' => 'Kept as pending for manual review']);
        }

        try {
            $service->status = $request->decision === 'approve' ? 'active' : 'rejected';
            if ($service->status === 'rejected') {
                $service->rejection_reason = $request->reason;
            } else {
                $service->rejection_reason = null;
                $service->approval_note = 'Được phê duyệt tự động bởi AI';
            }
            $service->save();

            // Notify Provider
            if ($service->provider && $service->provider->user_id) {
                broadcast(new ProviderServiceStatusUpdated(
                    $service->provider->user_id,
                    $service->id,
                    $service->name,
                    $service->status,
                    $service->rejection_reason,
                    $service->approval_note
                ));
            }

            // Notify Admin (cập nhật lại dòng hiện tại)
            broadcast(new AdminServiceUpdated($service, 'updated'));

            return response()->json([
                'success' => true,
                'message' => 'Service moderated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Machine moderate error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
