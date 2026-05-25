<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tạo bảng tour_details (Chi tiết Tour)
        Schema::create('tour_details', function (Blueprint $table) {
            $table->uuid('service_id')->primary();
            $table->integer('duration_days')->default(1);
            $table->integer('duration_nights')->default(0);
            $table->integer('max_guests')->default(50);
            $table->timestamps();

            $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');
        });

        // 2. Tạo bảng hotel_details (Chi tiết Khách sạn)
        Schema::create('hotel_details', function (Blueprint $table) {
            $table->uuid('service_id')->primary();
            $table->integer('star_rating')->nullable();
            $table->string('checkin_time', 10)->default('14:00');
            $table->string('checkout_time', 10)->default('12:00');
            $table->timestamps();

            $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');
        });

        // 3. Tạo bảng homestay_details (Chi tiết Homestay)
        Schema::create('homestay_details', function (Blueprint $table) {
            $table->uuid('service_id')->primary();
            $table->string('checkin_time', 10)->default('14:00');
            $table->string('checkout_time', 10)->default('12:00');
            $table->integer('max_guests')->default(2);
            $table->integer('total_bedrooms')->default(1);
            $table->integer('total_bathrooms')->default(1);
            $table->timestamps();

            $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');
        });

        // 4. Tạo bảng vehicle_details (Chi tiết Phương tiện)
        Schema::create('vehicle_details', function (Blueprint $table) {
            $table->uuid('service_id')->primary();
            $table->string('vehicle_type', 50)->nullable();
            $table->integer('seats')->nullable();
            $table->string('transmission', 50)->nullable();
            $table->string('fuel_type', 50)->nullable();
            $table->integer('inventory')->default(1);
            $table->timestamps();

            $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');
        });

        // 5. Backfill/Di chuyển dữ liệu hiện tại từ bảng services sang các bảng phụ mới
        DB::transaction(function () {
            // Chuyển dữ liệu Tour
            DB::statement("
                INSERT INTO tour_details (service_id, duration_days, duration_nights, max_guests, created_at, updated_at)
                SELECT id, COALESCE(duration_days, 1), COALESCE(duration_nights, 0), COALESCE(max_guests, 50), created_at, updated_at
                FROM services
                WHERE type = 'tour'
            ");

            // Chuyển dữ liệu Phương tiện (Vehicle)
            DB::statement("
                INSERT INTO vehicle_details (service_id, vehicle_type, seats, transmission, fuel_type, inventory, created_at, updated_at)
                SELECT id, vehicle_type, seats, transmission, fuel_type, COALESCE(inventory, 1), created_at, updated_at
                FROM services
                WHERE type = 'vehicle'
            ");

            // Khởi tạo thực thể Khách sạn (Hotel)
            DB::statement("
                INSERT INTO hotel_details (service_id, star_rating, checkin_time, checkout_time, created_at, updated_at)
                SELECT id, NULL, '14:00', '12:00', created_at, updated_at
                FROM services
                WHERE type = 'hotel'
            ");

            // Chuyển dữ liệu Homestay
            DB::statement("
                INSERT INTO homestay_details (service_id, checkin_time, checkout_time, max_guests, total_bedrooms, total_bathrooms, created_at, updated_at)
                SELECT id, '14:00', '12:00', COALESCE(max_guests, 2), 1, 1, created_at, updated_at
                FROM services
                WHERE type = 'homestay'
            ");
        });

        // 6. Xóa các trường đặc thù khỏi bảng cơ sở services để giải phóng bảng
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn([
                'duration_days',
                'duration_nights',
                'max_guests',
                'vehicle_type',
                'seats',
                'transmission',
                'fuel_type',
                'inventory'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Phục hồi lại các cột cũ trong bảng services
        Schema::table('services', function (Blueprint $table) {
            $table->integer('duration_days')->nullable();
            $table->integer('duration_nights')->nullable();
            $table->integer('max_guests')->nullable();
            $table->string('vehicle_type')->nullable();
            $table->integer('seats')->nullable();
            $table->string('transmission')->nullable();
            $table->string('fuel_type')->nullable();
            $table->integer('inventory')->default(1);
        });

        // 2. Chuyển dữ liệu ngược trở lại bảng services từ 4 bảng phụ
        DB::transaction(function () {
            // Khôi phục Tour
            DB::statement("
                UPDATE services s
                SET duration_days = t.duration_days,
                    duration_nights = t.duration_nights,
                    max_guests = t.max_guests
                FROM tour_details t
                WHERE s.id = t.service_id
            ");

            // Khôi phục Phương tiện (Vehicle)
            DB::statement("
                UPDATE services s
                SET vehicle_type = v.vehicle_type,
                    seats = v.seats,
                    transmission = v.transmission,
                    fuel_type = v.fuel_type,
                    inventory = v.inventory
                FROM vehicle_details v
                WHERE s.id = v.service_id
            ");

            // Khôi phục Homestay
            DB::statement("
                UPDATE services s
                SET max_guests = h.max_guests
                FROM homestay_details h
                WHERE s.id = h.service_id
            ");
        });

        // 3. Xóa các bảng phụ
        Schema::dropIfExists('tour_details');
        Schema::dropIfExists('hotel_details');
        Schema::dropIfExists('homestay_details');
        Schema::dropIfExists('vehicle_details');
    }
};
