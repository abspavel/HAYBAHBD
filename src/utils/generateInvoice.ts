import { OrderDetails } from '../types';

export const downloadInvoicePdf = (order: OrderDetails) => {
  const invoiceHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice #${order.orderId} - Haybah</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @page {
      size: A4;
      margin: 12mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1a1a1a;
      background: #f8fafc;
      padding: 20px 12px;
      line-height: 1.45;
      font-size: 13px;
    }
    .invoice-wrapper {
      max-width: 780px;
      margin: 0 auto;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 32px 28px;
      background: #ffffff;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0B2B22;
      padding-bottom: 20px;
      margin-bottom: 22px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 900;
      color: #0B2B22;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .brand-arabic {
      font-size: 18px;
      color: #D4AF37;
      margin-top: 1px;
      font-weight: bold;
    }
    .brand-subtitle {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
      letter-spacing: 0.3px;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-badge {
      display: inline-block;
      background: #0B2B22;
      color: #D4AF37;
      padding: 5px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .meta-line {
      font-size: 12px;
      color: #475569;
      margin: 2px 0;
    }
    .meta-line strong {
      color: #0f172a;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 20px;
    }
    .info-box h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #997300;
      margin-bottom: 8px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .info-box p {
      font-size: 12px;
      color: #334155;
      margin: 3px 0;
    }
    .info-box strong {
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      background: #0B2B22;
      color: #ffffff;
      text-align: left;
      padding: 10px 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    th.text-right, td.text-right {
      text-align: right;
    }
    th.text-center, td.text-center {
      text-align: center;
    }
    td {
      padding: 12px 12px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 12.5px;
      color: #1e293b;
    }
    tr:nth-child(even) td {
      background: #fbfcfd;
    }
    .item-name {
      font-weight: 700;
      color: #0B2B22;
    }
    .item-variant {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .summary-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 24px;
    }
    .summary-table {
      width: 290px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 12.5px;
      color: #475569;
      border-bottom: 1px dashed #e2e8f0;
    }
    .summary-row.total-row {
      border-top: 2px solid #0B2B22;
      border-bottom: none;
      padding-top: 10px;
      margin-top: 4px;
      font-size: 15px;
      font-weight: 900;
      color: #0B2B22;
    }
    .summary-row.total-row span:last-child {
      color: #B8962E;
    }
    .payment-status-badge {
      display: inline-block;
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
    }
    .footer-note {
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
      line-height: 1.6;
    }
    .footer-note strong {
      color: #0B2B22;
    }
    .action-bar {
      margin-bottom: 20px;
      text-align: center;
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    .action-btn {
      background: #0B2B22;
      color: #D4AF37;
      border: 1px solid #D4AF37;
      padding: 10px 22px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 9999px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      box-shadow: 0 4px 12px rgba(11, 43, 34, 0.15);
    }
    .action-btn:hover {
      background: #143e32;
    }
    @media print {
      body {
        padding: 0;
        background: #fff;
      }
      .action-bar {
        display: none !important;
      }
      .invoice-wrapper {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
    }
    @media (max-width: 600px) {
      .info-grid {
        grid-template-columns: 1fr;
        gap: 14px;
      }
      .header {
        flex-direction: column;
        gap: 14px;
      }
      .invoice-meta {
        text-align: left;
      }
      .summary-table {
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="action-bar">
    <button class="action-btn" onclick="window.print()">
      🖨️ Save as PDF / Print
    </button>
  </div>

  <div class="invoice-wrapper" id="printable-area">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="brand-title">HAYBAH</div>
        <div class="brand-arabic">هَيْبَة</div>
        <div class="brand-subtitle">Premium Islamic & Modest Lifestyle Store</div>
        <div class="brand-subtitle" style="margin-top: 2px;">Dhaka, Bangladesh • Hotline: 01889-138400 • www.haybahbd.com</div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-badge">OFFICIAL INVOICE</div>
        <div class="meta-line">Invoice No: <strong>#${order.orderId}</strong></div>
        <div class="meta-line">Date: <strong>${order.createdAt}</strong></div>
        <div class="meta-line">Status: <strong style="color: #047857;">${order.status}</strong></div>
      </div>
    </div>

    <!-- Info Grid -->
    <div class="info-grid">
      <div class="info-box">
        <h3>📍 Delivery Details</h3>
        <p><strong>Customer Name:</strong> ${order.customerName}</p>
        <p><strong>Mobile Number:</strong> ${order.phone}</p>
        <p><strong>Address:</strong> ${order.address}</p>
        <p><strong>Thana / District:</strong> ${order.thana}, ${order.district}</p>
      </div>
      <div class="info-box">
        <h3>💳 Payment & Dispatch</h3>
        <p><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
        <p><strong>Zone:</strong> ${order.city}</p>
        <p><strong>Estimated Delivery:</strong> ${order.city === 'Inside Dhaka' ? '24-48 Hours' : '48-72 Hours'}</p>
        <div style="margin-top: 8px;">
          <span class="payment-status-badge">💰 Payable to Delivery Rider</span>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table>
      <thead>
        <tr>
          <th style="width: 44%;">Item Description</th>
          <th class="text-center" style="width: 14%;">Size</th>
          <th class="text-center" style="width: 12%;">Qty</th>
          <th class="text-right" style="width: 15%;">Unit Price</th>
          <th class="text-right" style="width: 15%;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${order.items
          .map(
            (item) => `
          <tr>
            <td>
              <div class="item-name">${item.product.name}</div>
              <div class="item-variant">SKU: ${item.product.sku || 'HYB-' + item.productId.slice(0, 6)}</div>
            </td>
            <td class="text-center"><strong>${item.selectedSize}</strong></td>
            <td class="text-center">${item.quantity}</td>
            <td class="text-right">৳${item.product.price.toLocaleString()}</td>
            <td class="text-right"><strong>৳${(item.product.price * item.quantity).toLocaleString()}</strong></td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <!-- Summary -->
    <div class="summary-section">
      <div class="summary-table">
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>৳${order.subtotal.toLocaleString()}</span>
        </div>
        <div class="summary-row">
          <span>Delivery Charge (${order.city}):</span>
          <span>৳${order.deliveryFee.toLocaleString()}</span>
        </div>
        ${
          order.discount > 0
            ? `
        <div class="summary-row" style="color: #047857;">
          <span>Discount:</span>
          <span>-৳${order.discount.toLocaleString()}</span>
        </div>
        `
            : ''
        }
        <div class="summary-row total-row">
          <span>Total Amount:</span>
          <span>৳${order.total.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <!-- Footer Note -->
    <div class="footer-note">
      <p><strong>Thank you for shopping with Haybah (হায়বাহ্)!</strong></p>
      <p>For order queries, tracking updates, or exchange requests, call/WhatsApp us at <strong>01889-138400</strong>.</p>
      <p style="margin-top: 6px; font-size: 10.5px; color: #94a3b8;">This is a computer-generated customer receipt for Haybah Bangladesh.</p>
    </div>
  </div>
</body>
</html>
  `;

  // 1. Create a downloadable HTML file (works offline & direct save on Android/iOS/PC)
  const blob = new Blob([invoiceHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Haybah_Invoice_${order.orderId}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // 2. Open print window to let mobile browser trigger native PDF export
  try {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(invoiceHtml);
      printWindow.document.close();
      // Auto prompt print on open
      setTimeout(() => {
        try {
          printWindow.print();
        } catch {
          // Ignore
        }
      }, 500);
    }
  } catch {
    // Popup blockers fallback
  }

  setTimeout(() => URL.revokeObjectURL(url), 10000);
};
