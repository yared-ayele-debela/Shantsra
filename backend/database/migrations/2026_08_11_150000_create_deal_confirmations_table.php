<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('deal_confirmations');

        Schema::create('deal_confirmations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained('shipments')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('partner_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->foreignId('travel_id')->nullable()->constrained('travel')->onDelete('set null');
            $table->decimal('agreed_price', 10, 2)->nullable();
            $table->enum('status', ['deal_made', 'no_deal', 'pending'])->default('deal_made');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deal_confirmations');
    }
};
