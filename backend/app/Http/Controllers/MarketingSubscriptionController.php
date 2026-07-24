<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\View\View;

class MarketingSubscriptionController extends Controller
{
    public function unsubscribe(string $token): View
    {
        $user = User::query()->where('unsubscribe_token', $token)->first();

        if (! $user) {
            return view('marketing.unsubscribe', [
                'success' => false,
            ]);
        }

        $user->update([
            'marketing_opt_in' => false,
        ]);

        return view('marketing.unsubscribe', [
            'success' => true,
            'user' => $user,
        ]);
    }
}
