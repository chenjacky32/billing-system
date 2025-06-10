<?php

namespace App\Jobs;

use App\Models\Billing;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Helpers\LookupCache;
use App\Events\BillingCreated;
use App\Models\BillingPdfLogs;
use Barryvdh\DomPDF\Facade\Pdf;

class GenerateInvoiceJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $billing;
    public $tries = 3;
    
    public function __construct(Billing $billing)
    {
        $this->billing = $billing;
    }

    public function backoff()
    {
        return [60, 300, 600];
    }

    public function handle()
    {
        $billing = $this->billing;

        // Inject Apartment Types
        $apartmentTypeMap = LookupCache::apartmentTypeMap();

        if ($billing->residence) {
            $id = $billing->residence->apartmentType;
            $billing->residence->apartmentTypeData = isset($apartmentTypeMap[$id])
                ? (object)['id' => $id, 'name' => $apartmentTypeMap[$id]]
                : (object)['id' => '', 'name' => ''];
        }

        $pdf = Pdf::loadView('pdf.invoice', compact('billing'));
        $pdfPath = storage_path("app/temp/invoice_{$billing->id}.pdf");
        $pdf->save($pdfPath);

        BillingPdfLogs::create([
            'billing_id' => $billing->id,
            'pdf_path' => $pdfPath,
            'status' => 'GENERATED',
            'file_type' => 'INVOICE',
            'generated_at' => now()
        ]);

        event(new BillingCreated($billing, $pdfPath));
    }

    public function failed(\Throwable $exception): void
    {
        $billing = $this->billing;
        $pdfPath = storage_path("app/temp/invoice_{$billing->id}.pdf");

        Log::error("GenerateInvoiceJob failed for billing ID {$this->billing->id}", [
            'message' => $exception->getMessage()
        ]);

        BillingPdfLogs::create([
            'billing_id' => $billing->id,
            'pdf_path' => $pdfPath ?? 'NO PATH',
            'status' => 'FAILED',
            'file_type' => 'INVOICE',
            'error_message' => $exception->getMessage(),
            'generated_at' => now()
        ]);
    }
}
