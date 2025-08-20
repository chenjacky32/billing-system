<!DOCTYPE html>
<html>
    <head>
      <meta charset="utf-8" />
      <title>Invoice</title>
      <style>
        @page {
          margin: 8mm;
          size: A4 landscape;
        }
        
        body {
          font-family: system-ui, sans-serif;
          color: #333;
          margin: 0;
          padding: 10px;
          font-size: 11px;
          line-height: 1.3;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        .header-table {
          margin-bottom: 8px;
          background: #f8f9fa;
        }

        .header-table td {
          padding: 6px;
          vertical-align: middle;
        }

        .logo-cell {
          width: 160px;
          background: #f8f9fa;
        }

        .logo-cell img {
          max-width: 150px;
          max-height: 150px;
          object-fit: contain;
        }

        .invoice-id {
          text-align: right;
          font-size: 14px;
          font-weight: bold;
        }

        .address-table {
          margin-bottom: 8px;
          width: 100%;
        }

        .address-table td {
          width: 50%;
          vertical-align: top;
          padding: 6px;
        }

        .address-label {
          font-weight: bold;
          font-size: 11px;
          display: block;
          margin-bottom: 3px;
        }

        .product-table {
          width: 100%;
          margin-top: 8px;
          border: 1px solid #ddd;
        }

        .product-table th {
          background-color: #60a5fa;
          color: white;
          padding: 5px;
          font-weight: 600;
          text-align: left;
          border: 1px solid #ddd;
          font-size: 11px;
          line-height: 1.2;
        }

        .product-table td {
          background-color: white;
          border: 1px solid #ddd;
          padding: 5px;
          font-size: 11px;
          line-height: 1.2;
        }

        .text-right {
          text-align: right;
        }

        .text-center {
          text-align: center;
        }

        .text-bold {
          font-weight: 600;
        }

        .footer {
          margin-top: 10px;
          padding: 6px;
          background-color: #f8f9fa;
          text-align: center;
          font-size: 11px;
          color: #666;
        }

        .totals-row td {
          padding: 5px;
          font-weight: 600;
          text-align: right;
          background-color: #f1f5f9;
          font-size: 11px;
        }

        .invoice-meta {
          font-size: 11px;
          font-weight: normal;
          margin-top: 2px;
          color: #555;
          line-height: 1.2;
        }

        .recipient-info div {
          margin-bottom: 2px;
          font-size: 11px;
          line-height: 1.3;
        }

        /* Style untuk catatan - optimized for landscape */
        .notes-container {
          margin-top: 10px;
          margin-bottom: 10px;
          padding: 10px;
          background-color: #e0f2fe;
          border-left: 4px solid #60a5fa;
          border-radius: 3px;
        }

        .notes-title {
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 4px;
          font-size: 11px;
        }

        .notes-content {
          font-size: 10px;
          line-height: 1.4;
          color: #374151;
        }

        /* Landscape specific adjustments */
        .landscape-container {
          max-width: 100%;
          margin: 0 auto;
        }

        .compact-spacing {
          margin-bottom: 6px;
        }

        /* Tfoot styling untuk total */
        .product-table tfoot td {
          padding: 4px 5px;
          font-size: 11px;
          line-height: 1.2;
        }

        /* Mengurangi tinggi baris */
        .product-table tbody tr {
          height: auto;
        }
      </style>
    </head>
    <body>
      <div class="landscape-container">
        <!-- Header Section -->
        <table class="header-table compact-spacing">
          <tr>
            <td class="logo-cell">
            @php
              $logoPath = storage_path('app/public/' . $billing->apartment->logo_company);
              $logoBase64 = file_exists($logoPath)
                    ? 'data:image/' . pathinfo($logoPath, PATHINFO_EXTENSION) . ';base64,' . base64_encode(file_get_contents($logoPath))
                    : '';
            @endphp
              <img src="{{ $logoBase64 }}" alt="Apartment Logo" />
            </td>
            <td class="invoice-id">
              <div>Nomor Invoice: {{ $billing->id }}</div>
              <div class="invoice-meta">Periode Tagihan: {{ \Carbon\Carbon::parse($billing->period)->format('F Y') }}</div>
              <div class="invoice-meta">Tanggal Tagihan: {{ \Carbon\Carbon::parse($billing->billing_date)->format('d F Y') }}</div>
              <div class="invoice-meta">Jatuh Tempo: {{ \Carbon\Carbon::parse($billing->due_date)->format('d F Y') }}</div>
            </td>
          </tr>
        </table>

        <!-- Address Section -->
        <table class="address-table compact-spacing">
          <tr>
            <td class="recipient-info">
              <span class="address-label">Kepada Yth,</span>
              <div>Bapak/Ibu {{ $billing->residence->user->fullname ?? '-' }}</div>
              <div><strong>No. Unit:</strong> {{ $billing->residence->roomNo ?? '-'}}</div>
              <div><strong>No. Hp:</strong> {{ $billing->residence->user->phone ?? '-'}}</div>
              <div><strong>Email:</strong> {{ $billing->residence->user->email ?? '-'}}</div>
              <div><strong>Tower:</strong> {{ $billing->tower->tower_name ?? '-'}}</div>
              <div><strong>Tipe Unit:</strong> {{ $billing->residence->apartmentTypeData->name ?? '-'}}</div>
              <div><strong>Daya Unit:</strong> {{ $billing->residence->unitPowerCapacity->capacity ?? '-'}}</div>
            </td>
            <td class="recipient-info">
              <span class="address-label">Dari:</span>
              <div><strong>{{ $billing->apartment->name ?? '-' }}</strong></div>
              <div>{{ $billing->apartment->address ?? '-' }}</div>
            </td>
          </tr>
        </table>

        <table class="product-table">
          <thead>
            @if($billing->billing_type === "Air" || $billing->billing_type === "Listrik")
              <tr>
                <th style="width: 8%;">No.</th>
                <th style="width: 15%;">Jenis Tagihan</th>
                <th style="width: 15%;">Tipe Unit</th>
                <th style="width: 12%;">Meteran Awal</th>
                <th style="width: 12%;">Meteran Akhir</th>
                <th style="width: 12%;">Pemakaian</th>
                <th style="width: 13%; text-align: right;">Tarif</th>
                <th style="width: 13%; text-align: right;">Jumlah</th>
              </tr>
            @else
              <tr>
                <th style="width: 10%; text-align: center;">No.</th>
                <th style="width: 30%; text-align: left;">Jenis Tagihan</th>
                <th style="width: 25%; text-align: left;">Tipe Unit</th>
                <th style="width: 35%; text-align: right;">Jumlah</th>
              </tr>
            @endif
          </thead>
          <tbody>
            @if($billing->billing_type === "Air" || $billing->billing_type === "Listrik")
              <tr>
                <td style="text-align: center;">1</td>
                <td>{{ $billing->billing_type }}</td>
                @if ($billing->residence->apartmentTypeData->name )
                <td>{{ $billing->residence->apartmentTypeData->name }}</td>
                @else
                <td>-</td>
                @endif
                <td style="text-align: center;">{{ $billing->start_meter ? number_format($billing->start_meter, 3) : '-' }}</td>
                <td style="text-align: center;">{{ $billing->end_meter ? number_format($billing->end_meter, 3) : '-' }}</td>
                <td style="text-align: center;">{{ $billing->meter_reading ? number_format($billing->meter_reading, 3) : '-' }}</td>
                <td style="text-align: right;">Rp. {{ number_format($billing->unit_price ?? 0, 2) }}</td>
                <td style="text-align: right;">Rp. {{ number_format($billing->billing_fee, 2) }}</td>
              </tr>
            @else
              <tr>
                <td style="text-align: center;">1</td>
                <td>{{ $billing->billing_type }}</td>
                @if ($billing->residence->apartmentTypeData->name )
                <td>{{ $billing->residence->apartmentTypeData->name }}</td>
                @else
                <td>-</td>
                @endif
                <td style="text-align: right;">Rp. {{ number_format($billing->billing_fee, 2) }}</td>
              </tr>
            @endif
          </tbody>
          <tfoot>
            @if($billing->billing_type === "Air" || $billing->billing_type === "Listrik")
              <tr>
                <td colspan="7" style="text-align: right; font-weight: 600;">Sub Total:</td>
                <td style="text-align: right; font-weight: 600;">Rp. {{ number_format($billing->billing_fee, 2) }}</td>
              </tr>
              <tr>
                <td colspan="7" style="text-align: right; font-weight: 600;">Denda Periode Sebelumnya:</td>
                <td style="text-align: right; font-weight: 600;">Rp. {{ number_format($billing->fine, 2) }}</td>
              </tr>
              <tr>
                <td colspan="7" style="text-align: right; font-weight: 600; background-color: #f1f5f9;">Total Tagihan:</td>
                <td style="text-align: right; font-weight: 600; background-color: #f1f5f9;">Rp. {{ number_format($billing->total_amount, 2) }}</td>
              </tr>
            @else
              <tr>
                <td colspan="3" style="text-align: right; font-weight: 600;">Sub Total:</td>
                <td style="text-align: right; font-weight: 600;">Rp. {{ number_format($billing->billing_fee, 2) }}</td>
              </tr>
              <tr>
                <td colspan="3" style="text-align: right; font-weight: 600;">Denda Periode Sebelumnya:</td>
                <td style="text-align: right; font-weight: 600;">Rp. {{ number_format($billing->fine, 2) }}</td>
              </tr>
              <tr>
                <td colspan="3" style="text-align: right; font-weight: 600; background-color: #f1f5f9;">Total Tagihan:</td>
                <td style="text-align: right; font-weight: 600; background-color: #f1f5f9;">Rp. {{ number_format($billing->total_amount, 2) }}</td>
              </tr>
            @endif
          </tfoot>
        </table>

        <!-- Notes Section -->
        <div class="notes-container">
          <div class="notes-content">
            Apabila terjadi keterlambatan pembayaran tagihan dari batas waktu yang telah ditentukan, maka akan dikenakan denda beserta sanksi-sanksinya berdasarkan ketentuan dalam Peraturan Penghuni Satuan Rumah Susun Mansyur Residences
          </div>
        </div>

        <!-- Footer Section -->
        <div class="footer">
          <p>Terima Kasih, <br />{{ $billing->apartment->name }}</p>
        </div>
      </div>
    </body>
</html>