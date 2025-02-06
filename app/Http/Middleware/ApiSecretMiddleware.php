<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ApiSecretMiddleware
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
        $secretKey = env('API_EXTERNAL_SECRET_KEY');
        $requestHeader = $request->header('X-Hash-Signature');
        
        if (!$requestHeader) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Unauthorized - Missing X-Hash-Signature Header'
            ], 401);
        }

        $payload = $request->all();
        $jsonPayload = json_encode($payload,JSON_UNESCAPED_SLASHES);

        //make a new hashing based on payload + secret key
        $serverHash = hash_hmac('sha256', $jsonPayload, $secretKey);

        //compare client hashing with server hashing
        if($serverHash !== $requestHeader) {
            return response()->json([
                'status' => 'fail',
                'clientHash' => $requestHeader,
                'serverHash' => $serverHash,
                'payload'=> $payload,
                'message' => 'Unauthorized - Invalid Hash Signature'
            ],401);
        }

        return $next($request);
    }
}
