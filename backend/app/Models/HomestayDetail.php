<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomestayDetail extends Model
{
    protected $table = 'homestay_details';
    protected $primaryKey = 'service_id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];

    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id');
    }
}
