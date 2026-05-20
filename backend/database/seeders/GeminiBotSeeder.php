<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GeminiBotSeeder extends Seeder
{
    /**
     * Tạo tài khoản Bot Gemini AI với ID cố định.
     * Dùng DB::table để bypass HasUuids trait (tự sinh UUID).
     */
    public function run(): void
    {
        $botId = '00000000-0000-0000-0000-000000000000';

        $exists = DB::table('users')->where('id', $botId)->exists();

        if (!$exists) {
            DB::table('users')->insert([
                'id'           => $botId,
                'firebase_uid' => 'gemini-bot-system',
                'email'        => 'gemini-bot@socialtravel.com',
                'display_name' => 'Trợ lý ảo Gemini',
                'avatar_url'   => null,
                'role'         => 'admin',
                'status'       => 'active',
                'social_active'=> false,
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);
            $this->command->info('✅ Gemini Bot user created successfully.');
        } else {
            $this->command->info('ℹ️  Gemini Bot user already exists, skipping.');
        }
    }
}
