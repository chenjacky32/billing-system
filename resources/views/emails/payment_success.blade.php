<!DOCTYPE html>
<html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #111827;
                padding: 24px;
                max-width: 600px;
                margin: 0 auto;
            }
            .header {
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 16px;
            }
            .greeting {
                margin-bottom: 8px;
            }
            .intro {
                margin-bottom: 16px;
            }
            .font-medium {
                font-weight: 500;
            }
            .invoice-container {
                background-color: #6b7280;
                color: #ffffff;
                padding: 16px;
                border-radius: 4px;
                margin-bottom: 16px;
                font-size: 14px;
                border: 1px solid #4b5563;
            }
            .invoice-container p {
                margin: 0 0 8px;
            }
            .invoice-container strong {
                font-weight: 700;
            }
            .success-message {
                background-color: #d1fae5;
                color: #065f46;
                padding: 16px;
                border-left: 4px solid #10b981;
                border-radius: 4px;
                margin-bottom: 16px;
            }
            .note {
                font-size: 14px;
                color: #4b5563;
                margin-top: 16px;
            }
            .footer {
                margin-top: 24px;
                font-size: 14px;
                color: #6b7280;
            }
        </style>
    </head>
    <body>
        <div class="header">Konfirmasi Pembayaran</div>

        <p class="greeting">
            Kepada Yth. <span class="font-medium">{{ $billing->residence->user->fullname }}</span>,
        </p>
        
        <p class="intro">
            Kami telah menerima pembayaran Anda untuk Nomor Invoice: <strong>{{ $billing->id }}</strong>.
        </p>

        <div class="invoice-container">
            <p><strong>Nomor Invoice:</strong> {{ $billing->id }}</p>
            <p><strong>Periode Tagihan:</strong> {{ \Carbon\Carbon::parse($billing->period)->format('d F Y') ?? '-' }}</p>
            <p><strong>Tanggal Pembayaran:</strong> {{ \Carbon\Carbon::parse($billing->paid_date)->format('d F Y') }}</p>
            <p><strong>Tanggal Tagihan:</strong> {{ \Carbon\Carbon::parse($billing->billing_date)->format('d F Y') ?? '-' }}</p>
            <p><strong>No. Unit:</strong> {{ $billing->residence->roomNo ?? '-' }}</p>
            <p><strong>Nama Penghuni:</strong> {{ $billing->residence->user->fullname ?? '-' }}</p>
            <p><strong>No. Hp:</strong> {{ $billing->residence->user->phone ?? '-' }}</p>
            <p><strong>Email:</strong> {{ $billing->residence->user->email ?? '-' }}</p>
            <p><strong>Tower:</strong> {{ $billing->tower->tower_name ?? '-'}}</p>
            <p><strong>Daya Unit:</strong> {{ $billing->residence->unitPowerCapacity->capacity ?? '-'}}</p>
            <p><strong>Tipe Unit:</strong> {{ $billing->residence->apartmentTypeData->name ?? '-'}}</p>
            <p><strong>Jenis Tagihan:</strong> {{ $billing->billing_type ?? '-' }}</p>
            <p><strong>Harga/Tarif Tagihan:</strong> {{ number_format($billing->billing_fee, 2) ?? '-'}}</p>
            <p><strong>Denda Periode Sebelumnya:</strong> {{ number_format($billing->fine, 2) ?? '-'}}</p>
            <p><strong>Total Tagihan:</strong> {{ number_format($billing->total_amount, 2) ?? '-'}}</p>
            <p><strong>Jumlah Dibayar:</strong> Rp {{ number_format($billing->total_amount, 0, ',', '.') }}</p>
        </div>

        <div class="success-message">
            Terima kasih telah menyelesaikan pembayaran Anda. Kami berkomitmen untuk memberikan pengalaman tinggal yang nyaman dan layanan terbaik bagi Anda.
        </div>

        <p class="note">
            Jika Anda memiliki pertanyaan lebih lanjut mengenai pembayaran ini, jangan ragu untuk menghubungi kami.
        </p>

        <div class="footer">
            <p>Hormat kami,</p>
            <p>Tim Manajemen {{ $billing->apartment->name }}</p>
        </div>
    </body>
</html>



{{-- OLD TEMPLATE  --}}
{{-- <!DOCTYPE html>
<html>
    <head>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="p-6 text-gray-900">
        <h2 class="mb-4 text-xl font-semibold">Konfirmasi Pembayaran</h2>

        <p class="mb-2">
            Kepada Yth. <span class="font-medium">{{ $billing->residence->user->fullname }}</span>,
        </p>
        
        <p class="mb-4">
            Kami telah menerima pembayaran Anda untuk Nomor Invoice: <strong>{{ $billing->id }}</strong>.
        </p>

        <div class="p-4 mb-4 text-sm bg-gray-500 border rounded">
            <p><strong>Nomor Invoice:</strong> {{ $billing->id }}</p>
            <p><strong>Peiode Tagihan:</strong> {{ \Carbon\Carbon::parse($billing->period)->format('d F Y') ?? '-' }}</p>
            <p><strong>Tanggal Pembayaran:</strong> {{ \Carbon\Carbon::parse($billing->paid_date)->format('d F Y') }}</p>
            <p><strong>Tanggal Tagihan:</strong> {{ \Carbon\Carbon::parse($billing->billing_date)->format('d F Y') ?? '-' }}</p>
            <p><strong>No. Unit:</strong> {{ $billing->residence->roomNo ?? '-' }}</p>
            <p><strong>Nama Penghuni:</strong> {{ $billing->residence->user->fullname ?? '-' }}</p>
            <p><strong>No. Hp:</strong> {{ $billing->residence->user->phone ?? '-' }}</p>
            <p><strong>Email:</strong> {{ $billing->residence->user->email ?? '-' }}</p>
            <p><strong>Tower:</strong> {{ $billing->tower->tower_name ?? '-'}}</p>
            <p><strong>Daya Unit:</strong> {{ $billing->residence->unitPowerCapacity->capacity ?? '-'}}</p>
            <p><strong>Tipe Unit:</strong> {{ $billing->residence->apartmentTypeData->name ?? '-'}}</p>
            <p><strong>Jenis Tagihan:</strong> {{ $billing->billing_type ?? '-' }}</p>
            <p><strong>Harga/Tarif Tagihan:</strong> {{ number_format($billing->billing_fee, 2) ?? '-'}}</p>
            <p><strong>Denda Periode Sebelumnya:</strong> {{ number_format($billing->fine, 2) ?? '-'}}</p>
            <p><strong>Total Tagihan:</strong> {{ number_format($billing->total_amount, 2) ?? '-'}}</p>
            <p><strong>Jumlah Dibayar:</strong> Rp {{ number_format($billing->total_amount, 0, ',', '.') }}</p>
        </div>

        <div class="p-4 text-green-700 bg-green-100 border-l-4 border-green-500 rounded">
            Terima kasih telah menyelesaikan pembayaran Anda. Kami berkomitmen untuk memberikan pengalaman tinggal yang nyaman dan layanan terbaik bagi Anda.
        </div>

        <p class="text-sm text-gray-600">
            Jika Anda memiliki pertanyaan lebih lanjut mengenai pembayaran ini, jangan ragu untuk menghubungi kami.
        </p>

        <div class="mt-6 text-sm text-gray-500">
            Hormat kami,<br>
            Tim Manajemen {{ $billing->apartment->name }}
        </div>
    </body>
</html> --}}
