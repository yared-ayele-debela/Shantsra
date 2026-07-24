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
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->string('receiver_name');
            $table->string('receiver_phone')->nullable();
            $table->string('from_city');
            $table->string('to_city');
            $table->decimal('weight', 8, 2);
            $table->text('description')->nullable();
            $table->date('travel_date')->nullable();
            $table->enum('status', ['pending', 'accepted', 'in_transit', 'delivered'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
