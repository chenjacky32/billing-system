<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="p-6 text-gray-900">
    <h2 class="mb-4 text-xl font-semibold">Payment Confirmation</h2>
    <p class="mb-2">Dear <span class="font-medium">{{ $billing->owner->owner_name  }}</span>,</p>
    <p class="mb-4">We have received your payment for invoice <strong>{{ $billing->id }}</strong>.</p>
    
    <p class="p-4 text-green-700 bg-green-100 border-l-4 border-green-500 rounded">
        Thank you for your business!
    </p>
</body>
</html>
