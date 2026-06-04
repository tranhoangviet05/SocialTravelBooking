<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add new enums if needed
        DB::statement("DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_type') THEN
                CREATE TYPE payment_type AS ENUM ('full_100', 'deposit_30');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'remaining_payment_method') THEN
                CREATE TYPE remaining_payment_method AS ENUM ('sepay', 'cash');
            END IF;
        END $$;");

        Schema::table('bookings', function (Blueprint $table) {
            $table->decimal('deposit_amount', 15, 2)->nullable();
            $table->decimal('remaining_amount', 15, 2)->nullable();
            $table->timestampTz('deposit_paid_at')->nullable();
            $table->timestampTz('remaining_paid_at')->nullable();
        });

        DB::statement('ALTER TABLE bookings ADD COLUMN payment_type payment_type NULL');
        DB::statement('ALTER TABLE bookings ADD COLUMN remaining_payment_method remaining_payment_method NULL');
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn([
                'deposit_amount',
                'remaining_amount',
                'deposit_paid_at',
                'remaining_paid_at',
                'payment_type',
                'remaining_payment_method'
            ]);
        });
    }
};
