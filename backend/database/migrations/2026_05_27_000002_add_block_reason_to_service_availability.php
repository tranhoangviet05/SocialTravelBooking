<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_availability', function (Blueprint $table) {
            // Lý do Provider chặn ngày (ví dụ: "Bảo trì hệ thống", "Lễ riêng công ty", "Nghỉ Tết")
            $table->string('block_reason')->nullable()->after('is_blocked');

            // Loại lý do chặn - giúp frontend hiển thị icon/màu khác nhau
            $table->enum('block_type', [
                'maintenance',    // Bảo trì
                'staff_leave',    // Nghỉ phép nhân viên
                'private_event',  // Sự kiện riêng
                'fully_booked',   // Đã kín chỗ (tự đặt)
                'other',          // Khác
            ])->nullable()->after('block_reason');
        });
    }

    public function down(): void
    {
        Schema::table('service_availability', function (Blueprint $table) {
            $table->dropColumn(['block_reason', 'block_type']);
        });
    }
};
