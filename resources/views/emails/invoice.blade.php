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
    <div class="header">Invoice for Your Apartment Billing</div>

    <p>Dear <strong>{{ $billing->residence->user->fullname ?? '-' }}</strong>,</p>
    <p>Thank you for being a valued resident. Below is the details of your invoice for your reference:</p>

    <div class="invoice-container">
        <p><strong>Invoice Number:</strong> {{ $billing->id ?? '-' }}</p>
        <p><strong>Invoice Date:</strong> {{ $billing->billing_date ?? '-' }}</p>
        <p><strong>Customer Name:</strong> {{ $billing->residence->user->fullname ?? '-' }}</p>
        <p><strong>Phone Number:</strong> {{ $billing->residence->user->phone ?? '-' }}</p>
        <p><strong>Email Address:</strong> {{ $billing->residence->user->email ?? '-' }}</p>
        <p><strong>Billing Type:</strong> {{ $billing->billing_type ?? '-' }}</p>
        <p><strong>Billing Fee:</strong> {{ number_format($billing->billing_fee, 2) ?? '-'}}</p>
        <p><strong>From:</strong> {{ $billing->apartment->name ?? '-' }}</p>
    </div>

    <p>If you have any questions regarding this invoice, please feel free to contact us.</p>

    <div class="footer">
        <p>Best Regards,</p>
        <p>{{ $billing->apartment->name }} Management</p>
    </div>
</body>
</html>