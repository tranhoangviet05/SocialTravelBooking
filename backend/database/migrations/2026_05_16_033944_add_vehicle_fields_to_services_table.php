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
        Schema::table('services', function (Blueprint $table) {
            $table->string('vehicle_type')->nullable()->after('type'); // self_drive, with_driver
            $table->integer('seats')->nullable()->after('vehicle_type');
            $table->string('transmission')->nullable()->after('seats'); // manual, automatic
            $table->string('fuel_type')->nullable()->after('transmission'); // gasoline, diesel, electric
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(['vehicle_type', 'seats', 'transmission', 'fuel_type']);
        });
    }
};
