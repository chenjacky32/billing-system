<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tightenco\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
            ],
            'ziggy' => function () use ($request) {
                return array_merge((new Ziggy)->toArray(), [
                    'location' => $request->url(),
                ]);
            },
            'flash' => [
                // in your case, you named your flash message "success"
                'message' => fn () => $request->session()->get('success'),
                'billing_fee' => fn () => $request->session()->get('billing_fee'),
                'meter_reading'=> fn()=>$request->session()->get('meter_reading'),
                'fine'=> fn()=>$request->session()->get('fine'),
                'due_days'=> fn()=>$request->session()->get('due_days'),
                'total_amount'=> fn()=>$request->session()->get('total_amount'),
            ],
        ]);
    }
}
