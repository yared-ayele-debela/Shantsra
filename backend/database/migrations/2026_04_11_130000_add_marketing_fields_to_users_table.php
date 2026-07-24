<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('marketing_opt_in')->default(false)->after('country');
            $table->string('unsubscribe_token', 64)->nullable()->unique()->after('marketing_opt_in');
        });

        DB::table('users')
            ->select('id')
            ->orderBy('id')
            ->chunkById(100, function ($users): void {
                foreach ($users as $user) {
                    DB::table('users')
                        ->where('id', $user->id)
                        ->update([
                            'unsubscribe_token' => Str::random(40),
                        ]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['unsubscribe_token']);
            $table->dropColumn(['marketing_opt_in', 'unsubscribe_token']);
        });
    }
};
