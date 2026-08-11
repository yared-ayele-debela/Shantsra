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
        Schema::create('package_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('from_city');
            $table->string('to_city');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->boolean('email_notify')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('package_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('package_alert_id')->nullable()->constrained('package_alerts')->onDelete('cascade');
            $table->foreignId('shipment_id')->nullable()->constrained('shipments')->onDelete('cascade');
            $table->string('title');
            $table->text('message');
            $table->boolean('email_sent')->default(true);
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('package_notifications');
        Schema::dropIfExists('package_alerts');
    }
};
