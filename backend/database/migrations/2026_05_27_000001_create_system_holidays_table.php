<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_holidays', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->date('date')->unique();                  // Ngày đặc biệt (unique - mỗi ngày 1 bản ghi)
            $table->string('name');                          // Tên: "Quốc tang Tổng Bí thư...", "Lễ Quốc khánh 2/9"
            $table->enum('type', [
                'national_holiday',   // Ngày lễ quốc gia (Tết, 2/9, 30/4...) - thường vẫn được đặt
                'national_mourning',  // Quốc tang - thường bị chặn
                'emergency',          // Khẩn cấp (thiên tai, dịch bệnh...)
                'other',              // Khác (tự mô tả)
            ])->default('national_holiday');

            $table->text('description')->nullable();         // Mô tả thêm chi tiết

            // Tuỳ lễ: is_block_booking = true thì CHẶN đặt mới, false thì chỉ hiển thị nhãn trên calendar
            $table->boolean('is_block_booking')->default(false);

            $table->uuid('created_by')->nullable();          // Admin tạo
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_holidays');
    }
};
