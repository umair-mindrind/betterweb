<?php
namespace App\Console\Commands;
use Illuminate\Console\Command;
use App\Models\Audit;
use App\Jobs\RunAuditJob;

class RunAuditForUrl extends Command {
    protected $signature = 'audit:run {url}';
    protected $description = 'Queue an audit for a URL';

    public function handle(): int {
        $url = $this->argument('url');
        $audit = Audit::create(['url'=>$url,'status'=>'queued']);
        RunAuditJob::dispatch($audit->id);
        $this->info("Queued audit #{$audit->id} for {$url}");
        return self::SUCCESS;
    }
}
