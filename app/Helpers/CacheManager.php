<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;

class CacheManager
{
    /**
     * Cache with tracking and optional tag
     */
    public static function remember($key, $ttl, $callback, $tags = [])
    {
        self::trackCacheKey($key, $tags);
        return Cache::remember($key, $ttl, $callback);
    }

    /**
     * Track key by tag
     */
    protected static function trackCacheKey($key, array $tags = [])
    {
        if (empty($tags)) return;

        $trackingKey = 'cache_tracking';
        $tracking = Cache::get($trackingKey, []);

        foreach ($tags as $tag) {
            $tracking[$tag] = $tracking[$tag] ?? [];
            if (!in_array($key, $tracking[$tag])) {
                $tracking[$tag][] = $key;
            }
        }

        Cache::forever($trackingKey, $tracking);
    }

    /**
     * Flush cache keys by tag
     */
    public static function forgetByTag($tag)
    {
        $trackingKey = 'cache_tracking';
        $tracking = Cache::get($trackingKey, []);

        if (!isset($tracking[$tag])) return;

        foreach ($tracking[$tag] as $key) {
            Cache::forget($key);
        }

        unset($tracking[$tag]);
        Cache::forever($trackingKey, $tracking);
    }

    /**
     * Optional: flush all tracked keys (if needed)
     */
    public static function flushAllTracked()
    {
        $trackingKey = 'cache_tracking';
        $tracking = Cache::get($trackingKey, []);

        foreach ($tracking as $keys) {
            foreach ($keys as $key) {
                Cache::forget($key);
            }
        }

        Cache::forget($trackingKey);
    }
}
