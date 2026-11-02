<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class NoIndexPrivatePaths
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        if ($request->is(
            'admin',
            'admin/*',
            'api',
            'api/*',
            'dashboard',
            'login',
            'register',
            'reset-password',
            'chat'
        )) {
            $response->headers->set('X-Robots-Tag', 'noindex, nofollow');
        }

        return $response;
    }
}
