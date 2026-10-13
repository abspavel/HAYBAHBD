import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageSquare,
  Printer,
  Calendar,
  MapPin,
  CreditCard,
  Package,
  CheckCircle2,
  AlertCircle,
  Truck,
  ExternalLink,
} from 'lucide-react';
import { OrderDetails, OrderStatus } from '../../types';
import { StatusBadge } from './StatusBadge';
import { adminUpdateOrderStatus } from '../../services/supabaseService';

interface OrderDetailsDrawerProps {
  order: OrderDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

export const OrderDetailsDrawer: React.FC<OrderDetailsDrawerProps> = ({
  order,
  isOpen,
  onClose,
  onStatusUpdated,
}) => {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(
    (order?.status as OrderStatus) || 'pending'
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [adminNote, setAdminNote] = useState(order?.notes || '');

  if (!isOpen || !order) return null;

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    setCurrentStatus(newStatus);
    const success = await adminUpdateOrderStatus(order.orderId, newStatus);
    setIsUpdating(false);
    if (success && onStatusUpdated) {
      onStatusUpdated();
    }
  };

  const cleanPhone = order.phone.replace(/[^0-9]/g, '');
  const bdBareNumber = cleanPhone.slice(-10); // 10 digits without leading 0
  const whatsappUrl = `https://wa.me/880${bdBareNumber}?text=${encodeURIComponent(
    `Hello ${order.customerName}, this is HAYBAH regarding your order #${order.orderId}.`
  )}`;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${order.orderId}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #06201A; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #D4AF37; padding-bottom: 12px; margin-bottom: 20px; }
            .brand { font-size: 24px; font-weight: 900; letter-spacing: 2px; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; font-size: 13px; }
            .total-row { font-weight: bold; font-size: 15px; }
            .badge { display: inline-block; padding: 4px 8px; background: #FAF7EC; border: 1px solid #D4AF37; border-radius: 4px; font-size: 12px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">HAYBAH</div>
              <p style="font-size: 12px; color: #555; margin: 4px 0;">Premium Men's Clothing & Contemporary Apparel</p>
              <p style="font-size: 12px; color: #555; margin: 0;">Helpline: +880 1642-247530</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; font-size: 20px;">INVOICE / PACKING SLIP</h2>
              <p style="margin: 4px 0; font-weight: bold; font-family: monospace;">#${order.orderId}</p>
              <p style="margin: 0; font-size: 12px; color: #666;">Date: ${order.createdAt}</p>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px;">
            <div>
              <strong>DELIVER TO:</strong><br/>
              <strong>${order.customerName}</strong><br/>
              Phone: ${order.phone}<br/>
              Address: ${order.address}<br/>
              ${order.thana ? order.thana + ', ' : ''}${order.district || ''} (${order.city})
            </div>
            <div style="text-align: right;">
              <strong>PAYMENT:</strong><br/>
              <span class="badge">Cash on Delivery</span><br/>
              Status: <strong>${order.status.toUpperCase()}</strong>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr style="background: #f8f8f8;">
                <th>Item</th>
                <th>Size</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (it) => `
                <tr>
                  <td><strong>${it.product.name}</strong></td>
                  <td>${it.selectedSize}</td>
                  <td>${it.quantity}</td>
                  <td>৳${it.product.price}</td>
                  <td style="text-align: right;">৳${it.product.price * it.quantity}</td>
                </tr>
              `
                )
                .join('')}
              <tr>
                <td colspan="4" style="text-align: right;">Subtotal:</td>
                <td style="text-align: right;">৳${order.subtotal}</td>
              </tr>
              <tr>
                <td colspan="4" style="text-align: right;">Delivery Fee:</td>
                <td style="text-align: right;">৳${order.deliveryFee}</td>
              </tr>
              ${
                order.discount
                  ? `<tr><td colspan="4" style="text-align: right; color: green;">Discount:</td><td style="text-align: right; color: green;">-৳${order.discount}</td></tr>`
                  : ''
              }
              <tr class="total-row">
                <td colspan="4" style="text-align: right;">TOTAL PAYABLE:</td>
                <td style="text-align: right;">৳${order.total}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 12px;">
            Thank you for shopping with HAYBAH. For exchanges or returns within 7 days, keep this receipt intact.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const statuses: OrderStatus[] = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'returned',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="p-5 border-b border-gray-200 bg-[#06201A] text-white flex items-center justify-between sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-[#D4AF37] text-[#06201A] font-black">
                {order.orderId}
              </span>
              <StatusBadge status={currentStatus} type="order" />
            </div>
            <p className="text-xs text-gray-300 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#E8CE7A]" />
              <span>Placed on {order.createdAt}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FFF3B0] transition-colors cursor-pointer"
              title="Print Invoice / Packing Slip"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-6 flex-1">
          {/* Quick Action Buttons: Call & WhatsApp */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <a
              href={`tel:${order.phone}`}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition-all shadow-xs"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Call ({order.phone})</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] border border-[#25D366]/30 font-bold text-xs transition-all shadow-xs"
            >
              <MessageSquare className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp Chat</span>
            </a>

            <button
              type="button"
              onClick={handlePrint}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-all"
            >
              <Printer className="w-4 h-4 text-gray-600" />
              <span>Print Slip</span>
            </button>
          </div>

          {/* Change Status Selector */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Change Order Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statuses.map((st) => (
                <button
                  key={st}
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize transition-all cursor-pointer ${
                    currentStatus === st
                      ? 'bg-[#06201A] text-[#D4AF37] ring-2 ring-[#D4AF37] shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-[#D4AF37]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
            {isUpdating && (
              <p className="text-[11px] text-amber-700 font-medium">Updating status in Supabase...</p>
            )}
          </div>

          {/* Customer & Delivery Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white rounded-2xl p-4 border border-gray-200">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Customer Information
              </h4>
              <p className="font-extrabold text-[#06201A] text-sm">{order.customerName}</p>
              <p className="text-xs text-gray-600 font-mono mt-0.5">{order.phone}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Delivery Location
              </h4>
              <p className="text-xs text-[#06201A] font-medium leading-relaxed">
                {order.address}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {order.thana ? `${order.thana}, ` : ''}{order.district || ''} ({order.city})
              </p>
            </div>
          </div>

          {/* Ordered Items Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700">
                Order Items ({order.items.length})
              </h4>
              <span className="text-xs font-bold text-[#AA820A] bg-[#FAF7EC] px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30">
                Cash on Delivery
              </span>
            </div>

            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-14 object-cover rounded-xl bg-neutral-900 border border-gray-200 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-[#06201A] line-clamp-1">{item.product.name}</p>
                      <div className="flex items-center gap-2 mt-1 text-gray-500 text-[11px]">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded font-bold text-gray-700">
                          Size: {item.selectedSize}
                        </span>
                        <span>Qty: {item.quantity}</span>
                        <span>৳{item.product.price} each</span>
                      </div>
                    </div>
                  </div>

                  <span className="font-black text-sm text-[#06201A] shrink-0">
                    ৳{(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Total Box */}
            <div className="p-4 bg-gray-50/80 border-t border-gray-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-900">৳{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge:</span>
                <span className="font-semibold text-gray-900">৳{order.deliveryFee}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount:</span>
                  <span>-৳{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-[#06201A] pt-2 border-t border-gray-200">
                <span>Total Payable:</span>
                <span className="text-lg text-[#06201A]">৳{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-mono">
            HAYBAH • Cash on Delivery
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#06201A] text-[#D4AF37] font-bold text-xs uppercase tracking-wider hover:bg-[#0B2B22] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
