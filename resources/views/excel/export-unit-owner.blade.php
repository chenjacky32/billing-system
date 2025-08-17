<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Export Excel</title>
</head>
<body>
    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Nama Owner</th>
                <th>Nomor HP</th>
                <th>Email</th>
                <th>Apartemen</th>
                <th>Tower</th>
                <th>Nomor Unit</th>
                <th>Tipe Unit</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $account)
                <tr>
                    <td>{{ $loop->iteration }}</td>
                    <td>{{ $account->user->fullname ?? '-' }}</td>
                    <td> {{ $account->user->phone ? '="' . $account->user->phone . '"' : '-' }}</td>
                    <td>{{ $account->user->email ?? '-' }}</td>
                    <td>{{ $account->apartment->name ?? '-' }}</td>
                    <td>{{ $account->apartmentTower->tower_name ?? '-' }}</td>
                    <td>{{ $account->roomNo ?? '-' }}</td>
                    <td>{{ $account->apartType->name ?? '-' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
