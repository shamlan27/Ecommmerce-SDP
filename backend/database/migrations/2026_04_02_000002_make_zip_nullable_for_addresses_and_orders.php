<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('addresses', function (Blueprint $table) {
            $table->string('zip')->nullable()->change();
            $table->string('country')->default('LK')->change();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('shipping_zip')->nullable()->change();
            $table->string('shipping_country')->default('LK')->change();
        });
    }

    public function down(): void
    {
        Schema::table('addresses', function (Blueprint $table) {
            $table->string('zip')->nullable(false)->change();
            $table->string('country')->default('US')->change();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('shipping_zip')->nullable(false)->change();
            $table->string('shipping_country')->default('US')->change();
        });
    }
};
