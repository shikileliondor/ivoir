<?php

namespace App\Http\Middleware;

use App\Models\Visit;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class TrackShopVisit
{
    /**
     * Record a page view for the visitor stats. Never blocks or
     * breaks the response: any failure is silently ignored.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($this->shouldTrack($request, $response)) {
            try {
                Visit::create([
                    'visited_on' => now()->toDateString(),
                    'session_hash' => sha1($request->session()->getId()),
                    'path' => '/'.ltrim($request->path(), '/'),
                ]);
            } catch (Throwable) {
                // Stats must never take the shop down.
            }
        }

        return $response;
    }

    /**
     * Only track successful GET page views on the public shop.
     */
    protected function shouldTrack(Request $request, Response $response): bool
    {
        if (! $request->isMethod('GET') || $response->getStatusCode() !== 200) {
            return false;
        }

        if ($request->header('X-Inertia-Partial-Component') !== null) {
            return false;
        }

        if ($request->is('admin*', 'settings*', 'dashboard*', 'login', 'register', 'up', 'storage/*')) {
            return false;
        }

        $userAgent = strtolower((string) $request->userAgent());

        foreach (['bot', 'crawl', 'spider', 'preview', 'curl'] as $needle) {
            if (str_contains($userAgent, $needle)) {
                return false;
            }
        }

        return $request->hasSession();
    }
}
