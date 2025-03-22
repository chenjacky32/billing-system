<?php

namespace App\Exports;

use App\Models\Billing as ModelsBilling;
// use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\FromView;
use Illuminate\Contracts\View\View;

class Billing implements FromView
{
    /**
    * @return \Illuminate\Support\Collection
    */
    
    protected $data;

    public function __construct($data)
    { 
        $this->data = $data;
    }
    
    public function view(): View
    { 
        return view('excel.export',['data' => $this->data]);
    }
} 
