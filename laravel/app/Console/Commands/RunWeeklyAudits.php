<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\RunAuditJob;
use App\Models\Audit;

class RunWeeklyAudits extends Command {
    protected $signature = 'audit:weekly-run';
    protected $description = 'Queue weekly audits for configured sites (reads BETTERWEB_WEEKLY_SITES env as JSON array of urls)';

    public function handle(): int {
        $sitesJson = env('BETTERWEB_WEEKLY_SITES', '[]');
        $sites = json_decode($sitesJson, true) ?: [];

        if (empty($sites)) {
            $this->info('No weekly sites configured in BETTERWEB_WEEKLY_SITES');
            return self::SUCCESS;
        }

        foreach ($sites as $url) {
            $audit = Audit::create(['url' => $url, 'status' => 'queued']);
            RunAuditJob::dispatch($audit->id);
            $this->info("Queued audit {$audit->id} for {$url}");
        }

        return self::SUCCESS;
    }
}
