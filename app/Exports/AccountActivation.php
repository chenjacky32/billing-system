<?php

namespace App\Exports;

use App\Models\Billing as ModelsBilling;
use Maatwebsite\Excel\Concerns\FromView;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class AccountActivation implements FromView
{
    protected $data;

    public function __construct($data)
    { 
        $this->data = collect($data)->map(function ($item) {
            return $item;
        });
    }
    
    public function view(): View
    { 
        return view('excel.export-account', ['data' => $this->data]);
    }
    
    // public function columnFormats(): array
    // {
    //     return [
    //         'C'=> NumberFormat::FORMAT_TEXT,
    //     ];
    // }
}
