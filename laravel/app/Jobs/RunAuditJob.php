<?php
namespace App\Jobs;

use App\Models\Audit;
use App\Models\AuditResult;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Throwable;
use Symfony\Component\Process\Process as SymfonyProcess;
use App\Services\GenerateGptSummaryService;

class RunAuditJob implements ShouldQueue {
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public ?int $timeout;
    public function __construct(public int $auditId) {
        $this->timeout = is_numeric(env('AUDIT_TIMEOUT_MS', 120000)) ? (int) env('AUDIT_TIMEOUT_MS', 120000) / 1000 : null;
    }

    public function handle(): void {
        $audit = Audit::findOrFail($this->auditId);
        $audit->update(['status' => 'running', 'started_at' => now()]);

        $url = $audit->url;
        $runner = base_path('../auditor/src/index.js');

        $sym = new SymfonyProcess(['node', $runner, '--url='.$url, '--chromePath='.env('CHROME_PATH','')]);

        if ($this->timeout !== null && $this->timeout > 0) {
            $sym->setTimeout($this->timeout);
        } else {
            $sym->setTimeout(null);
        }

        $sym->run();

        if (!$sym->isSuccessful()) {
            $audit->update(['status'=>'failed','finished_at'=>now()]);
            AuditResult::create([
                'audit_id'=>$audit->id,
                'tool'=>'runner',
                'success'=>false,
                'error_message'=>$sym->getErrorOutput() ?: $sym->getOutput(),
            ]);
            return;
        }

        $payload = json_decode($sym->getOutput(), true);

        foreach (['lighthouse','axe','security'] as $tool) {
            $entry = $payload[$tool] ?? null;
            if (!$entry) continue;
            $rawPath = null;
            if (!empty($entry['raw'])) {
                $rawPath = 'audits/'.uniqid($tool.'_', true).'.json';
                Storage::disk(config('filesystems.default'))
                    ->put($rawPath, json_encode($entry['raw'], JSON_PRETTY_PRINT));
            }
            AuditResult::create([
                'audit_id' => $audit->id,
                'tool' => $tool,
                'success' => (bool)($entry['success'] ?? true),
                'duration_ms' => $entry['durationMs'] ?? null,
                'raw_path' => $rawPath,
                'normalized_json' => $entry['normalized'] ?? null,
                'error_message' => $entry['error'] ?? null,
            ]);
        }

        $speed = (int) round(($payload['lighthouse']['normalized']['performanceScore'] ?? 0) * 100);
        $seo   = (int) round(($payload['lighthouse']['normalized']['seoScore'] ?? 0) * 100);
        $a11y  = max(0, 100 - min(100, ($payload['axe']['normalized']['violationScorePenalty'] ?? 0)));
        $sec   = (int) ($payload['security']['normalized']['securityScore'] ?? 0);

        $weights = ['speed'=>25,'accessibility'=>25,'security'=>25,'seo'=>25];
        $weighted = (
            $speed * $weights['speed'] +
            $a11y * $weights['accessibility'] +
            $sec * $weights['security'] +
            $seo * $weights['seo']
        ) / array_sum($weights);

        $summary = GenerateGptSummaryService::generate([
            'lighthouse' => $payload['lighthouse']['normalized'] ?? [],
            'axe' => $payload['axe']['normalized'] ?? [],
            'security' => $payload['security']['normalized'] ?? [],
        ]);

        $audit->update([
            'category_scores' => [
                'speed' => $speed,
                'accessibility' => $a11y,
                'security' => $sec,
                'seo' => $seo,
            ],
            'total_score' => (int) round($weighted),
            'gpt_summary' => $summary,
            'status' => 'completed',
            'finished_at' => now(),
        ]);
    }

    public function failed(Throwable $e): void {
        if ($audit = Audit::find($this->auditId)) {
            $audit->update(['status'=>'failed','finished_at'=>now()]);
        }
    }
}
