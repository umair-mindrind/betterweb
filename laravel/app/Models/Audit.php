<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Audit extends Model {
    protected $fillable = [
        'site_id','url','status','category_scores','total_score','started_at','finished_at'
    ];
    protected $casts = [
        'category_scores' => 'array',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];
    public function results(): HasMany { return $this->hasMany(AuditResult::class); }
}
