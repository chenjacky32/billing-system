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
    </style>
  </head>

  <body>
    <!-- Header Section -->
    <table class="header-table">
      <tr>
        <td class="logo-cell">
          <img src="{{ storage_path('app/images/okgo.png') }}" alt="OKGO" width="200" style="background: #f8f9fa; border: 3px solid #f1f5f9; padding: 6px;" />
        </td>
        <td class="invoice-id">
          Invoice ID: {{ $billing->id }}
        </td>
      </tr>
    </table>

    <!-- Address Section -->
    <table class="address-table">
      <tr>
        <td>
          <span class="address-label">To:</span>
          <div>{{ $billing->owner->owner_name }}</div>
          <div><strong>Phone:</strong> {{ $billing->owner->phone }}</div>
          <div><strong>Email:</strong> {{ $billing->owner->email }}</div>
        </td>
        <td>
          <span class="address-label">From:</span>
          <div>{{ $billing->apartment->name }}</div>
          <div>{{ $billing->apartment->address }}</div>
        </td>
      </tr>
    </table>

    <!-- Product Table -->
	<table class="product-table">
		<thead>
		  <tr>
			<th style="width: 33.33%; background-color: #60a5fa; color: white; padding: 10px; font-weight: 600; border: 1px solid #ddd;">Product</th>
			<th style="width: 33.33%; background-color: #60a5fa; color: white; padding: 10px; font-weight: 600; border: 1px solid #ddd;">Description</th>
			<th style="width: 33.33%; background-color: #60a5fa; color: white; padding: 10px; font-weight: 600; border: 1px solid #ddd; text-align: right;">Price</th>
		  </tr>
		</thead>
		<tbody>
		  <tr>
			<td style="width: 33.33%; background-color: white; padding: 10px; border: 1px solid #ddd; text-align: left;">{{ $billing->billing_type }}</td>
			@if ($billing->billing_category_id)
			<td style="width: 33.33%; background-color: white; padding: 10px; border: 1px solid #ddd; text-align: left;">{{ $billing->billingCategory->category_name }}</td>
			@else
			<td style="width: 33.33%; background-color: white; padding: 10px; border: 1px solid #ddd; text-align: left;">-</td>
			@endif
			<td style="width: 33.33%; background-color: white; padding: 10px; border: 1px solid #ddd; text-align: right;">Rp. {{ number_format($billing->billing_fee, 2) }}</td>
		  </tr>
		</tbody>
		<tfoot>
		  <tr>
			<td colspan="2" style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: 600;">Sub Total:</td>
			<td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: 600;">Rp. {{ number_format($billing->billing_fee, 2) }}</td>
		  </tr>
		  <tr>
			<td colspan="2" style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: 600;">Tax:</td>
			<td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: 600;">Rp. 0.00</td>
		  </tr>
		  <tr>
			<td colspan="2" style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: 600; background-color: #f1f5f9;">Total Amount:</td>
			<td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: 600; background-color: #f1f5f9;">Rp. {{ number_format($billing->billing_fee, 2) }}</td>
		  </tr>
		</tfoot>
	  </table>

    <!-- Footer Section -->
    <div class="footer">
      <p>Thank you, <br />{{ $billing->apartment->name }}</p>
    </div>
  </body>
</html>