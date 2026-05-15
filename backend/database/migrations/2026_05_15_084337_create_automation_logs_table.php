<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('automation_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->nullable();
            $table->string('email');
            $table->string('display_name');
            $table->string('campaign_type'); // welcome_voucher, hotel_recommendation, tour_recommendation
            $table->string('service_name')->nullable(); // Tên khách sạn/tour đã gợi ý
            $table->string('status')->default('success');
            $table->json('metadata')->nullable(); // Lưu thêm thông tin phụ nếu cần
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('automation_logs');
    }
};
