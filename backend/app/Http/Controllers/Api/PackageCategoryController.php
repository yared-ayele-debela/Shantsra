<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PackageCategory;
use Illuminate\Http\JsonResponse;

class PackageCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = PackageCategory::query()
            ->where('is_active', true)
            ->get(['id', 'name', 'description']);

        return response()->json([
            'categories' => $categories,
        ]);
    }
}
