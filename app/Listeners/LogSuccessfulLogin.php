<?php

namespace App\Listeners;

use illuminate\Auth\Events\Login;

class LogSuccessfulLogin
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  object  $event
     * @return void
     */
    public function handle(Login $event)
    {
        /** @var \App\Models\User $user */
        $user = $event->user;

        $user->last_login_at = now();
        $user->last_login_ip_address = request()->ip();
        $user->save();
    }
}
