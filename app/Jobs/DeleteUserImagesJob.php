<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DeleteUserImagesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public ?string $identityImage;
    public ?string $userImage;

    public $tries = 3;

    public function __construct(?string $identityImage, ?string $userImage)
    {
        $this->identityImage = $identityImage;
        $this->userImage     = $userImage;
    }

    public function backoff()
    {
        return [60, 300, 600]; // Retry after 1m, 5m, then 10m
    }

    public function handle()
    {
        if (!empty($this->identityImage)) {
            $this->deleteFileWithAccessSign(
                $this->identityImage,
                'apartment/access-sign/upload-id',
                'apartment-id'
            );
        }

        if (!empty($this->userImage)) {
            $this->deleteFileWithAccessSign(
                $this->userImage,
                'apartment/access-sign/upload-user',
                'apartment-user'
            );
        }
    }

    private function deleteFileWithAccessSign(string $filename, string $signPath, string $deletePath): void
    {
        try {
            $baseUrl = config('services.okgo-api.base_url');
            $secret  = config('services.okgo-api.secret');

            $payload = [
                'grantType' => 'client_credentials',
                'timestamp' => now()->toIso8601String(),
            ];

            $raw   = $secret . json_encode($payload);
            $apiKey = hash('sha256', $raw);

            $signRes = Http::timeout(10)->withHeaders([
                'Content-Type' => 'application/json',
                'X-API-KEY'    => $apiKey,
            ])->post(rtrim($baseUrl, '/').'/'.ltrim($signPath, '/'), $payload);

            if (!$signRes->ok()) {
                Log::warning("Sign failed for {$filename} via {$signPath}", [
                    'status' => $signRes->status(),
                    'body'   => $signRes->body(),
                ]);
                return;
            }

            $signature = $signRes->json('Signature');
            $date      = $signRes->json('date');

            if (!$signature || !$date) {
                Log::warning("Sign missing Signature/date for {$filename} via {$signPath}");
                return;
            }

            $delRes = Http::timeout(10)->withHeaders([
                'X-Signature' => $signature,
                'X-Timestamp' => $date,
            ])->delete(rtrim($baseUrl, '/').'/'.trim($deletePath, '/').'/'.$filename);

            if ($delRes->ok()) {
                Log::info("Deleted {$filename} at {$deletePath} successfully.");
            } else {
                Log::warning("Delete failed for {$filename} at {$deletePath}", [
                    'status' => $delRes->status(),
                    'body'   => $delRes->body(),
                ]);
            }
        } catch (\Throwable $e) {
            Log::error("Exception deleting {$filename} at {$deletePath}: ".$e->getMessage());
        }
    }
}
