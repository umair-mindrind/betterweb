<?php
namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected $commands = [
    \App\Console\Commands\RunAuditForUrl::class,
    \App\Console\Commands\RunWeeklyAudits::class,
    ];

    protected function schedule(Schedule $schedule)
    {
    // Weekly: queue audits for all known sites (placeholder — adapt when Site model exists)
    // Runs at 03:00 every Monday
    $schedule->command('audit:weekly-run')->weeklyOn(1, '03:00')->withoutOverlapping();
    }

    protected function commands()
    {
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
}
