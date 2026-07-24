<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_one_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('user_two_id')->constrained('users')->cascadeOnDelete();
            $table->string('listable_type');
            $table->unsignedBigInteger('listable_id');
            $table->timestamps();

            $table->unique(
                ['user_one_id', 'user_two_id', 'listable_type', 'listable_id'],
                'contact_conversations_listing_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_conversations');
    }
};
