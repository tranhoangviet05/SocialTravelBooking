<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Google\Auth\Credentials\ServiceAccountCredentials;

class RealtimeService
{
    protected $projectId;
    protected $serviceAccountPath;

    public function __construct()
    {
        $this->serviceAccountPath = base_path('firebase-service-account.json');
        
        if (file_exists($this->serviceAccountPath)) {
            $json = json_decode(file_get_contents($this->serviceAccountPath), true);
            $this->projectId = $json['project_id'] ?? 'socialtravelbooking';
        } else {
            $this->projectId = 'socialtravelbooking';
        }
    }

    protected function getAccessToken()
    {
        try {
            if (!file_exists($this->serviceAccountPath)) {
                return null;
            }

            $credentials = new ServiceAccountCredentials(
                'https://www.googleapis.com/auth/datastore',
                $this->serviceAccountPath
            );
            
            $token = $credentials->fetchAuthToken();
            return $token['access_token'] ?? null;
        } catch (\Exception $e) {
            Log::error('RealtimeService get token failed: ' . $e->getMessage());
            return null;
        }
    }

    protected function formatFirestoreValue($value)
    {
        if (is_null($value)) {
            return ['nullValue' => null];
        } elseif (is_bool($value)) {
            return ['booleanValue' => $value];
        } elseif (is_int($value)) {
            return ['integerValue' => (string)$value];
        } elseif (is_float($value)) {
            return ['doubleValue' => $value];
        } elseif (is_string($value)) {
            return ['stringValue' => $value];
        } elseif (is_array($value)) {
            if (empty($value)) {
                return ['arrayValue' => ['values' => []]];
            }
            $isAssoc = array_keys($value) !== range(0, count($value) - 1);
            if ($isAssoc) {
                $fields = [];
                foreach ($value as $k => $v) {
                    $fields[(string)$k] = $this->formatFirestoreValue($v);
                }
                return ['mapValue' => ['fields' => $fields]];
            } else {
                $values = [];
                foreach ($value as $v) {
                    $values[] = $this->formatFirestoreValue($v);
                }
                return ['arrayValue' => ['values' => $values]];
            }
        }
        return ['stringValue' => json_encode($value)];
    }

    public function broadcast(string $channel, string $event, array $data = [])
    {
        try {
            $token = $this->getAccessToken();
            if (!$token) {
                Log::error('RealtimeService: Cannot get access token');
                return;
            }

            $url = "https://firestore.googleapis.com/v1/projects/{$this->projectId}/databases/(default)/documents/realtime_sync/{$channel}";

            $payload = [
                'name' => "projects/{$this->projectId}/databases/(default)/documents/realtime_sync/{$channel}",
                'fields' => [
                    'event' => ['stringValue' => $event],
                    'data' => $this->formatFirestoreValue($data),
                    'timestamp' => ['integerValue' => (string)round(microtime(true) * 1000)]
                ]
            ];

            $response = Http::withToken($token)->patch($url, $payload);

            if (!$response->successful()) {
                Log::error("Realtime broadcast failed: " . $response->body());
            }
        } catch (\Exception $e) {
            Log::error("Realtime broadcast failed: " . $e->getMessage());
        }
    }

    public function broadcastAdmin(string $event, array $data = [])
    {
        $this->broadcast('admin-data', $event, $data);
    }

    public function broadcastProvider(int|string $providerId, string $event, array $data = [])
    {
        $this->broadcast('provider-' . $providerId, $event, $data);
    }
}
