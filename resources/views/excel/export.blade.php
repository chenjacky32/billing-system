<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <table>
        <thead>
            <tr>
                <th>No Unit</th>
                <th>Nama Pemilik</th>
                <th>Tower</th>
                <th>Tipe Unit</th>
                <th>Periode</th>
                <th>Jenis Tagihan</th>
                <th>Denda</th>
                <th>Biaya Tagihan</th>
                <th>Tanggal Tagihan Dibuat</th>
                <th>Tanggal Jatuh Tempo</th>
                <th>Total Tagihan</th>
                <th>Status Pembayaran</th>
                <th>Tanggal Dibayar</th>
                <th>Dibuat Oleh</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $billings)
                <tr>
                    <td>{{ $billings->residence->roomNo ?? '-' }}</td>
                    <td>{{ $billings->residence->user->fullname ?? '-' }}</td>
                    <td>{{ $billings->tower->tower_name ?? '-' }}</td>
                    <td>{{ $billings->residence->apartmentTypeData->name ?? '-' }}</td>
                    <td>{{ $billings->period ? \Carbon\Carbon::parse($billings->period)->format('F Y') : '-' }}</td>
                    <td>{{ $billings->billing_type }}</td>
                    <td>{{ number_format($billings->fine, 2) }}</td>
                    <td>{{ number_format($billings->billing_fee, 2) }}</td>
                    <td>{{ $billings->billing_date ? \Carbon\Carbon::parse($billings->billing_date)->format('d/m/Y') : '-' }}</td>
                    <td>{{ $billings->due_date ? \Carbon\Carbon::parse($billings->due_date)->format('d/m/Y') : '-' }}</td>
                    <td>{{ number_format($billings->billing_fee + $billings->fine, 2) }}</td>
                    <td>{{ $billings->status }}</td>
                    <td>{{ $billings->paid_date ? \Carbon\Carbon::parse($billings->paid_date)->format('d/m/Y') : '-' }}</td>
                    <td>{{ $billings->created_by->name ?? '-' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>