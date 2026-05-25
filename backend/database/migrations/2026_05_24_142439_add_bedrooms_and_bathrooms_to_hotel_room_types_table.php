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
        Schema::table('hotel_room_types', function (Blueprint $table) {
            $table->integer('total_bedrooms')->default(1)->after('capacity_adults');
            $table->integer('total_bathrooms')->default(1)->after('total_bedrooms');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hotel_room_types', function (Blueprint $table) {
            $table->dropColumn(['total_bedrooms', 'total_bathrooms']);
        });
    }
};
