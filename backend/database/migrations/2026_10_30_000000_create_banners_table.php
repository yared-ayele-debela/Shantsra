<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('banners', function (Blueprint $table): void {
            $table->id();
            $table->string('title', 160);
            $table->string('badge', 80)->nullable();
            $table->text('description')->nullable();
            $table->string('image_path')->nullable();
            $table->string('bg_gradient', 500)->default('linear-gradient(135deg, #14532D, #0F3F22)');
            $table->string('cta_text', 80)->nullable();
            $table->string('cta_link', 500)->nullable();
            $table->string('placement', 40)->default('all');
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->timestamps();

            $table->index(['placement', 'is_active', 'sort_order']);
            $table->index(['start_date', 'end_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};
