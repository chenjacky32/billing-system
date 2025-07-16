<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class BRIService {

    public function getAccessToken(String $timestamp)
    {
        $payload = [
            'grantType' => 'client_credentials',
        ];

        $stringToSign = $this->generateStringToSign($timestamp);
        $signature = $this->createRsaSignature($stringToSign);

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-SIGNATURE' => $signature,
            'X-TIMESTAMP' => $timestamp,
            'X-CLIENT-KEY' => config('services.bri.client_key'),
        ])->post('https://partner.api.bri.co.id/snap/v1.0/access-token/b2b', $payload);

        if ($response->successful()) {
            return $response->json();
        }

        Log::error('BRI Token Error', ['response' => $response->body()]);
        throw new \Exception('Failed to get access token');
    }
    
    public function formatTimestamp(): string
    {
        $now = Carbon::now();
        $offset = $now->getOffset() / 60; // offset in minutes
        $sign = $offset >= 0 ? '+' : '-';
        $absOffset = abs($offset);
        $offsetHours = str_pad(floor($absOffset / 60), 2, '0', STR_PAD_LEFT);
        $offsetMinutes = str_pad($absOffset % 60, 2, '0', STR_PAD_LEFT);

        return $now->format("Y-m-d\TH:i:s") . $sign . $offsetHours . ":" . $offsetMinutes;
    }
    private function generateStringToSign(String $timestamp)
    {
        return config('services.bri.client_key') . '|' . $timestamp;
    }

    private function createRsaSignature(string $stringToSign): string
    {
        $privateKeyPath = storage_path('app/keys/private_key.pem');
        $privateKey = file_get_contents($privateKeyPath);

        $key = openssl_pkey_get_private($privateKey);
        openssl_sign($stringToSign, $signature, $key, OPENSSL_ALGO_SHA256);

        return bin2hex($signature);
    }

    public function createSignatureTxn(string $method, string $endpoint, string $token, array $body, string $timestamp): string
    {
        $minifiedBody = json_encode($body);
        $hashedBody = strtolower(hash('sha256', $minifiedBody));

        $stringToSign = "$method:$endpoint:$token:$hashedBody:$timestamp";

        return hash_hmac('sha512', $stringToSign, config('services.bri.client_secret'));
    }

    public function generateExternalId(){
        $now = Carbon::now();

        $yy = $now->format('y');
        $mm = $now->format('m');
        $dd = $now->format('d');
        $sec = $now->format('s'); 
        $ms  = str_pad($now->format('v'), 3, '0', STR_PAD_LEFT); 
        
        return substr("{$yy}{$mm}{$dd}{$sec}{$ms}", 0, 9);
    }
}