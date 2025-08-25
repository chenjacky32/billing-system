<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AccountDeleted
{
    use Dispatchable, SerializesModels;

    public ?string $identityImage;
    public ?string $userImage;

    public function __construct(?string $identityImage, ?string $userImage)
    {
        $this->identityImage = $identityImage;
        $this->userImage = $userImage;
    }
}
