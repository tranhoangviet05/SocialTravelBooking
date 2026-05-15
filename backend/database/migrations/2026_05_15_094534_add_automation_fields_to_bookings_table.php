<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->timestamp('last_reminded_at')->nullable(); // Ngày cuối nhắc nhở bỏ dở
            $table->timestamp('review_requested_at')->nullable(); // Ngày xin đánh giá
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['last_reminded_at', 'review_requested_at']);
        });
    }
};
