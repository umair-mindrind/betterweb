<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GenerateGptSummaryService
{
    public static function generate(array $auditData): ?string
    {
        $apiKey = env('OPENAI_API_KEY');
        if (!$apiKey) {
            Log::warning('OpenAI API key missing; skipping GPT summary generation');
            return null;
        }

        $model = config('services.openai.model', env('OPENAI_MODEL', 'gpt-4'));
        $endpoint = config('services.openai.endpoint', env('OPENAI_ENDPOINT', 'https://api.openai.com/v1/chat/completions'));

        try {
            $response = Http::withToken($apiKey)
                ->acceptJson()
                ->asJson()
                ->timeout(30)
                ->post($endpoint, [
                    'model' => $model,
                    'messages' => [
                        ['role' => 'system', 'content' => 'You are a web audit expert that summarizes performance, accessibility, and security results clearly.'],
                        ['role' => 'user', 'content' => "Summarize this audit data and suggest improvements:\n\n" . json_encode($auditData, JSON_PRETTY_PRINT)],
                    ],
                    'temperature' => 0.3,
                ]);

            if ($response->failed()) {
                Log::warning('OpenAI chat completion request failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return null;
            }

            return $response->json('choices.0.message.content') ?? null;
        } catch (\Throwable $e) {
            Log::error('Failed to generate GPT summary', [
                'exception' => $e->getMessage(),
            ]);
            return null;
        }
    }
}
