<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('service_upsells', function (Blueprint $table) {
            $table->id();
            $table->uuid('provider_id');
            $table->uuid('trigger_service_id');
            $table->integer('trigger_quantity')->default(2);
            
            $table->uuid('target_service_id');
            $table->decimal('upsell_price_adjustment', 15, 2)->default(0);
            
            $table->uuid('perk_service_id')->nullable();
            $table->integer('perk_discount_percent')->default(100);
            
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            
            $table->timestamps();

            // Foreign Keys
            $table->foreign('provider_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('trigger_service_id')->references('id')->on('services')->onDelete('cascade');
            $table->foreign('target_service_id')->references('id')->on('services')->onDelete('cascade');
            $table->foreign('perk_service_id')->references('id')->on('services')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('service_upsells');
    }
};
