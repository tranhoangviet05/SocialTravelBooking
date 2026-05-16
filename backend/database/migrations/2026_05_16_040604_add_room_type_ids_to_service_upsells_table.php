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
        Schema::table('service_upsells', function (Blueprint $table) {
            $table->uuid('trigger_room_type_id')->nullable()->after('trigger_service_id');
            $table->uuid('target_room_type_id')->nullable()->after('target_service_id');
            
            $table->foreign('trigger_room_type_id')->references('id')->on('hotel_room_types')->onDelete('set null');
            $table->foreign('target_room_type_id')->references('id')->on('hotel_room_types')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_upsells', function (Blueprint $table) {
            $table->dropForeign(['trigger_room_type_id']);
            $table->dropForeign(['target_room_type_id']);
            $table->dropColumn(['trigger_room_type_id', 'target_room_type_id']);
        });
    }
};
