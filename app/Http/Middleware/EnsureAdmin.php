<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    /**
     * Handle an incoming request.
     * Ensure user is logged in and has 'admin' role (not 'koordinator' or 'operator').
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || $user->role !== 'admin') {
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Akses ditolak. Role Koordinator hanya memiliki hak akses Read-Only.'
                ], 403);
            }

            return back()->with('error', 'Akses ditolak. Role Koordinator hanya memiliki hak akses Read-Only (hanya dapat melihat data).');
        }

        return $next($request);
    }
}
