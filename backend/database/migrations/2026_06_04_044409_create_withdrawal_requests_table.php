<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'withdrawal_status') THEN
                CREATE TYPE withdrawal_status AS ENUM ('pending', 'approved', 'rejected');
            END IF;
        END $$;");

        // Add new values to transaction_type enum if they don't exist
        DB::statement("ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'withdrawal'");
        DB::statement("ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'revenue_allocation'");
        DB::statement("ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'platform_fee'");
        DB::statement("ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'final_payment'");

        Schema::create('withdrawal_requests', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('user_id');
            $table->decimal('amount', 15, 2);
            $table->string('bank_name');
            $table->string('bank_account_number');
            $table->string('bank_account_name');
            $table->text('admin_note')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        DB::statement('ALTER TABLE withdrawal_requests ADD COLUMN status withdrawal_status NOT NULL DEFAULT \'pending\'');
    }

    public function down(): void
    {
        Schema::dropIfExists('withdrawal_requests');
    }
};
