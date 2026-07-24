<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class SubscriptionPlanController extends Controller
{
    public function index(): View
    {
        $plans = SubscriptionPlan::query()->latest()->paginate(15);

        return view('admin.subscription-plans.index', compact('plans'));
    }

    public function store(Request $request): RedirectResponse
    {
        SubscriptionPlan::create($this->validatedData($request));

        return redirect()->route('admin.subscription-plans.index')
            ->with('success', 'Subscription package created successfully.');
    }

    public function update(Request $request, SubscriptionPlan $subscriptionPlan): RedirectResponse
    {
        $subscriptionPlan->update($this->validatedData($request, $subscriptionPlan));

        return redirect()->route('admin.subscription-plans.index')
            ->with('success', 'Subscription package updated successfully.');
    }

    public function destroy(SubscriptionPlan $subscriptionPlan): RedirectResponse
    {
        $subscriptionPlan->delete();

        return redirect()->route('admin.subscription-plans.index')
            ->with('success', 'Subscription package deleted successfully.');
    }

    private function validatedData(Request $request, ?SubscriptionPlan $subscriptionPlan = null): array
    {
        $data = $request->validate([
            'plan_modal' => ['nullable', 'string'],
            'name' => [
                'required',
                'string',
                'max:120',
                Rule::unique('subscription_plans', 'name')->ignore($subscriptionPlan),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'monthly_post_limit' => ['required', 'integer', 'min:1', 'max:100000'],
            'yearly_post_limit' => ['required', 'integer', 'min:1', 'max:1000000'],
            'monthly_price' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'yearly_price' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'is_active' => ['required', 'boolean'],
        ]);

        unset($data['plan_modal']);

        $data['name'] = trim($data['name']);
        $data['description'] = isset($data['description']) ? trim($data['description']) : null;

        return $data;
    }
}
