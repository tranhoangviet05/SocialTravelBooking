<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->boolean('is_public')->default(true);
            $table->decimal('max_discount', 15, 2)->nullable();
        });

        Schema::create('coupon_user', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(\Illuminate\Support\Facades\DB::raw('uuid_generate_v4()'));
            $table->uuid('coupon_id');
            $table->uuid('user_id');
            $table->boolean('is_used')->default(false);
            $table->timestampTz('used_at')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            $table->foreign('coupon_id')->references('id')->on('coupons')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // Một user chỉ được gán 1 lần cho 1 mã giảm giá
            $table->unique(['coupon_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupon_user');
        
        Schema::table('coupons', function (Blueprint $table) {
            $table->dropColumn(['is_public', 'max_discount']);
        });
    }
};
