<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class AuditResult extends Model {
    protected $fillable = [
        'audit_id','tool','success','duration_ms','raw_path','normalized_json','error_message'
    ];
    protected $casts = [ 'normalized_json' => 'array' ];
}
