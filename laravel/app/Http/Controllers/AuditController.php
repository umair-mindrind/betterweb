<?php

namespace App\Http\Controllers;

use App\Models\Audit;
use App\Models\AuditResult;
use App\Jobs\RunAuditJob;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditController extends Controller
{
    public function index(): Response
    {
        $audits = Audit::with('results')->latest()->paginate(10);
        
        return Inertia::render('Audits/Index', [
            'audits' => $audits
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Audits/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'url' => 'required|url'
        ]);

        $audit = Audit::create([
            'url' => $request->url,
            'status' => 'queued'
        ]);

        RunAuditJob::dispatch($audit->id);

        return redirect()->route('audits.index')
            ->with('success', 'Audit queued successfully for ' . $request->url);
    }

    public function show(Audit $audit): Response
    {
        $audit->load('results');
        
        return Inertia::render('Audits/Show', [
            'audit' => $audit
        ]);
    }
} 