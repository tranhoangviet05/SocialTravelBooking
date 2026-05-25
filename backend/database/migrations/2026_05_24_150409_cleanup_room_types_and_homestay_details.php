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
        Schema::table('homestay_details', function (Blueprint $table) {
            $table->dropColumn(['max_guests', 'total_bedrooms', 'total_bathrooms']);
        });

        Schema::table('hotel_room_types', function (Blueprint $table) {
            $table->dropColumn(['total_rooms', 'capacity_children']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hotel_room_types', function (Blueprint $table) {
            $table->integer('total_rooms')->default(1)->after('base_price');
            $table->integer('capacity_children')->default(0)->after('capacity_adults');
        });

        Schema::table('homestay_details', function (Blueprint $table) {
            $table->integer('max_guests')->nullable();
            $table->integer('total_bedrooms')->nullable();
            $table->integer('total_bathrooms')->nullable();
        });
    }
};
