<!DOCTYPE html>
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

        <div class="p-4 mb-4 text-sm border rounded bg-gray-50">
            <p><strong>Nomor Invoice:</strong> {{ $billing->id }}</p>
            <p><strong>Tanggal Pembayaran:</strong> {{ \Carbon\Carbon::parse($billing->paid_date)->format('d F Y') }}</p>
            <p><strong>Jumlah Dibayar:</strong> Rp {{ number_format($billing->total_amount, 0, ',', '.') }}</p>
        </div>

        <div class="p-4 mb-4 text-green-700 bg-green-100 border-l-4 border-green-500 rounded">
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
</html>
