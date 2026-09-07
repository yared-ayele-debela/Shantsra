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
        Schema::table('shipments', function (Blueprint $table) {
            $table->unsignedInteger('inquiry_count')->default(0)->after('deal_status');
            $table->boolean('is_paused_by_inquiries')->default(false)->after('inquiry_count');
        });

        Schema::create('shipment_inquiries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained('shipments')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->string('contact_type', 50)->default('whatsapp'); // whatsapp, call, copy
            $table->timestamps();

            $table->index(['shipment_id', 'user_id']);
            $table->index(['shipment_id', 'ip_address']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipment_inquiries');

        Schema::table('shipments', function (Blueprint $table) {
            $table->dropColumn(['inquiry_count', 'is_paused_by_inquiries']);
        });
    }
};
