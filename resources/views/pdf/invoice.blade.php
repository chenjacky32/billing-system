<!DOCTYPE html>
<html>
    <head>
      <meta charset="utf-8" />
      <title>Invoice</title>
      <style>
        body {
          font-family: system-ui, sans-serif;
          color: #333;
          margin: 0;
          padding: 20px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        .header-table {
          margin-bottom: 20px;
          background: #f8f9fa;
        }

        .header-table td {
          padding: 10px;
          vertical-align: middle;
        }

        .logo-cell {
          width: 200px;
          background: #f8f9fa;
        }

        .invoice-id {
          text-align: right;
          font-size: 18px;
          font-weight: bold;
        }

        .address-table {
          margin-bottom: 20px;
          width: 100%;
        }

        .address-table td {
          width: 50%;
          vertical-align: top;
          padding: 10px;
        }

        .address-label {
          font-weight: bold;
          font-size: 13px;
          display: block;
          margin-bottom: 5px;
        }

        .product-table {
          width: 100%;
          margin-top: 20px;
          border: 1px solid #ddd;
        }

        .product-table th {
          background-color: #60a5fa;
          color: white;
          padding: 10px;
          font-weight: 600;
          text-align: left;
        }

        .product-table td {
          background-color: #f9f9f9;
          border-bottom: 1px solid #ddd;
          padding: 10px;
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
          margin-top: 40px;
          padding: 10px;
          background-color: #f8f9fa;
          text-align: center;
          font-size: 12px;
          color: #666;
        }

        .totals-row td {
          padding: 10px;
          font-weight: 600;
          text-align: right;
          background-color: #f1f5f9;
        }

        .invoice-meta {
          font-size: 12px;
          font-weight: normal;
          margin-top: 4px;
          color: #555;
        }

        .recipient-info div {
          margin-bottom: 6px;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <!-- Header Section -->
      <table class="header-table">
        <tr>
          <td class="logo-cell">
            <img src="{{ storage_path('app/public/' . $billing->apartment->logo_company) }}" alt="Apartment Logo" width="200" />
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
      <table class="address-table">
        <tr>
          <td class="recipient-info">
            <span class="address-label">Untuk:</span>
            <div>{{ $billing->residence->user->fullname ?? '-' }}</div>
            <div><strong>No. Hp:</strong> {{ $billing->residence->user->phone ?? '-'}}</div>
            <div><strong>Email:</strong> {{ $billing->residence->user->email ?? '-'}}</div>
            <div><strong>Tower:</strong> {{ $billing->tower->tower_name ?? '-'}}</div>
            <div><strong>Tipe Unit:</strong> {{ $billing->residence->apartmentTypeData->name ?? '-'}}</div>
          </td>
          <td class="recipient-info">
            <span class="address-label">Dari:</span>
            <div><strong>{{ $billing->apartment->name ?? '-' }}</strong></div>
            <div>{{ $billing->apartment->address ?? '-' }}</div>
          </td>
        </tr>
      </table>

      <!-- Product Table -->
      <table class="product-table">
        <thead>
          <tr>
            <th style="width: 33.33%; background-color: #60a5fa; color: white; padding: 10px; font-weight: 600; border: 1px solid #ddd">Jenis Tagihan</th>
            <th style="width: 33.33%; background-color: #60a5fa; color: white; padding: 10px; font-weight: 600; border: 1px solid #ddd">Keterangan</th>
            <th style="width: 33.33%; background-color: #60a5fa; color: white; padding: 10px; font-weight: 600; border: 1px solid #ddd; text-align: right">Harga/Tarif</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="width: 33.33%; background-color: white; padding: 10px; border: 1px solid #ddd; text-align: left">{{ $billing->billing_type }}</td>
            @if ($billing->billing_category_id)
            <td style="width: 33.33%; background-color: white; padding: 10px; border: 1px solid #ddd; text-align: left">{{ $billing->billingCategory->category_name }}</td>
            @else
            <td style="width: 33.33%; background-color: white; padding: 10px; border: 1px solid #ddd; text-align: left">-</td>
            @endif
            <td style="width: 33.33%; background-color: white; padding: 10px; border: 1px solid #ddd; text-align: right">Rp. {{ number_format($billing->billing_fee, 2) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: 600">Sub Total:</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: 600">Rp. {{ number_format($billing->billing_fee, 2) }}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: 600">Denda Periode Sebelumnya:</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: 600">Rp. {{ number_format($billing->fine, 2) }}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: 600">Tax:</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: 600">Rp. 0.00</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: 600; background-color: #f1f5f9">Total Tagihan:</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: 600; background-color: #f1f5f9">Rp. {{ number_format($billing->total_amount, 2) }}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Footer Section -->
      <div class="footer">
        <p>Terima Kasih, <br />{{ $billing->apartment->name }}</p>
      </div>
    </body>
</html>
