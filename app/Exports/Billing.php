<?php

namespace App\Exports;

use App\Models\Billing as ModelsBilling;
use Maatwebsite\Excel\Concerns\FromView;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class Billing implements FromView, WithColumnFormatting
{
    protected $data;

    public function __construct($data)
    { 
        // Pastikan data numerik dikonversi ke float agar tidak terbaca sebagai string oleh Excel
        $this->data = collect($data)->map(function ($item) {
            $item->fine = (float) $item->fine;
            $item->billing_fee = (float) $item->billing_fee;
            $item->total_billing = (float) $item->total_amount;
            return $item;
        });
    }
    
    public function view(): View
    { 
        Log::info($this->data->first());
        return view('excel.export', ['data' => $this->data]);
    }
    
    public function columnFormats(): array
    {
        return [
            'G' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1, // Format angka dengan dua desimal
            'H' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1,
            'K' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1,
        ];
    }
}
