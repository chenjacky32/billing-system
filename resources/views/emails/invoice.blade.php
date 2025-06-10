<!DOCTYPE html>
<html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                padding: 20px;
                max-width: 600px;
                margin: 0 auto;
            }
            .invoice-container {
                background-color: #f9f9f9;
                padding: 20px;
                border-radius: 8px;
                margin-top: 20px;
            }
            .invoice-container p {
                margin: 0 0 10px;
            }
            .invoice-container strong {
                color: #000;
            }
            .header {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
            }
            .footer {
                margin-top: 20px;
                font-size: 14px;
                color: #777;
            }
        </style>
    </head>
    <body>
        <div class="header">Tagihan Apartment Anda</div>

        <p>Kepada Yth. <strong>{{ $billing->residence->user->fullname ?? '-' }}</strong>,</p>
        <p>Terima kasih atas kepercayaan Anda sebagai penghuni kami. Berikut kami sampaikan rincian tagihan apartemen Anda:</p>

        <div class="invoice-container">
            <p><strong>Nomor Invoice:</strong> {{ $billing->id ?? '-' }}</p>
            <p><strong>Peiode Tagihan:</strong> {{ \Carbon\Carbon::parse($billing->period)->format('d F Y') ?? '-' }}</p>
            <p><strong>Tanggal Tagihan:</strong> {{ \Carbon\Carbon::parse($billing->billing_date)->format('d F Y') ?? '-' }}</p>
            <p><strong>Nama Penghuni:</strong> {{ $billing->residence->user->fullname ?? '-' }}</p>
            <p><strong>No. Hp:</strong> {{ $billing->residence->user->phone ?? '-' }}</p>
            <p><strong>Email:</strong> {{ $billing->residence->user->email ?? '-' }}</p>
            <p><strong>Jenis Tagihan:</strong> {{ $billing->billing_type ?? '-' }}</p>
            <p><strong>Harga/Tarif Tagihan:</strong> {{ number_format($billing->billing_fee, 2) ?? '-'}}</p>
            <p><strong>Denda Periode Sebelumnya:</strong> {{ number_format($billing->fine, 2) ?? '-'}}</p>
            <p><strong>Total Tagihan:</strong> {{ number_format($billing->total_amount, 2) ?? '-'}}</p>
            <p><strong>Dari:</strong> {{ $billing->apartment->name ?? '-' }}</p>
        </div>

        <p>Jika Anda memiliki pertanyaan terkait tagihan ini, silakan hubungi pihak manajemen kami.</p>

        <div class="footer">
            <p>Hormat Kami,</p>
            <p>Manajemen {{ $billing->apartment->name }}</p>
        </div>
    </body>
</html>