<?php

namespace App\Services;

use Kreait\Laravel\Firebase\Facades\Firebase;
use Illuminate\Support\Facades\Log;

class RealtimeService
{
    protected $firestore;

    public function __construct()
    {
        // Sử dụng Firestore để lưu tín hiệu đồng bộ
        try {
            $this->firestore = Firebase::firestore()->database();
        } catch (\Exception $e) {
            Log::error('RealtimeService initialization failed: ' . $e->getMessage());
        }
    }

    /**
     * Gửi tín hiệu thông báo dữ liệu đã thay đổi
     * 
     * @param string $channel Tên kênh (ví dụ: 'admin-data', 'provider-1')
     * @param string $event Tên sự kiện (ví dụ: 'LocationCreated', 'BookingUpdated')
     * @param array $data Dữ liệu đính kèm (không nên quá lớn)
     */
    public function broadcast(string $channel, string $event, array $data = [])
    {
        if (!$this->firestore) return;

        try {
            // Cập nhật document trong collection 'realtime_sync'
            // Channel sẽ là ID của document (ví dụ: 'admin-data')
            $this->firestore->collection('realtime_sync')->document($channel)->set([
                'event' => $event,
                'data' => $data,
                'timestamp' => round(microtime(true) * 1000) // miliseconds
            ]);
        } catch (\Exception $e) {
            Log::error("Realtime broadcast failed: " . $e->getMessage());
        }
    }

    /**
     * Broadcast cho Admin
     */
    public function broadcastAdmin(string $event, array $data = [])
    {
        $this->broadcast('admin-data', $event, $data);
    }

    /**
     * Broadcast cho một Provider cụ thể
     */
    public function broadcastProvider(int $providerId, string $event, array $data = [])
    {
        $this->broadcast('provider-' . $providerId, $event, $data);
    }
}
