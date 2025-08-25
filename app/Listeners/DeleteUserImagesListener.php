<?php

namespace App\Listeners;

use App\Events\AccountDeleted;
use App\Jobs\DeleteUserImagesJob;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class DeleteUserImagesListener
{
    public function __construct()
    {
        //
    }

    public function handle(AccountDeleted $event)
    {
        DeleteUserImagesJob::dispatch(
            $event->identityImage,
            $event->userImage
        )->onQueue('delete_user_images'); 
    }
}
