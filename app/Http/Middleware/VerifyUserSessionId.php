<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VerifyUserSessionId
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()){
            /** @var \App\Models\User $user */
            $user = Auth::user();
            $currentSession = session()->getId();

            if ($user->session_id && $user->session_id !== $currentSession) {
                $oldSessionPath = storage_path('framework/sessions/' . $user->session_id);
                
                if (!file_exists($oldSessionPath)) {
                    $user->session_id = $currentSession;
                    $user->save();
                } else {
                    Auth::guard('web')->logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();

                    return redirect()->route('login')->withErrors([
                        'email' => trans('auth.session-middleware-failed'),
                    ]);
                }
            }
        }

        return $next($request);
    }
}
