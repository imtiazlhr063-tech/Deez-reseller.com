import React from 'react';
import { Order } from '../types/store';
import { X, Printer } from 'lucide-react';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white border border-stone-300 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden relative max-h-[95vh] flex flex-col print:border-none print:shadow-none print:max-h-none print:rounded-none">
        {/* Controls - Hidden on print */}
        <div className="px-6 py-3 bg-stone-100 border-b border-stone-200 flex items-center justify-between print:hidden">
          <span className="text-xs font-semibold text-stone-700">Thermal / A4 Packing Slip & COD Invoice</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#1C1917] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-8 overflow-y-auto flex-1 font-sans text-stone-900 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-stone-300 pb-5">
            <div>
              <h1 className="text-2xl font-serif-luxury font-bold tracking-tight text-stone-950">
                DEEZ COSMETICS
              </h1>
              <p className="text-xs text-stone-500 uppercase tracking-widest mt-0.5">
                Pakistan Premier Luxury Beauty & Reseller Network
              </p>
              <p className="text-xs text-stone-600 mt-2">
                Head Office: Main Boulevard, Gulberg III, Lahore, Punjab<br />
                WhatsApp: +92 300 1234567 | Email: support@deezcosmetics.pk
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-stone-900 text-white text-xs font-bold uppercase tracking-wider rounded">
                Cash on Delivery (COD)
              </span>
              <p className="font-mono text-sm font-bold text-stone-900 mt-2">{order.id}</p>
              <p className="text-xs text-stone-500">
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Delivery & Courier Information */}
          <div className="grid grid-cols-2 gap-6 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div>
              <h4 className="font-bold text-stone-900 uppercase tracking-wider mb-1">Customer Delivery Details:</h4>
              <p className="font-semibold text-stone-950 text-sm">{order.customerName}</p>
              <p className="text-stone-700">Phone: <strong>{order.customerPhone}</strong></p>
              <p className="text-stone-700 mt-1">{order.address}</p>
              <p className="text-stone-700 font-medium">{order.city}, {order.province}</p>
              {order.deliveryNotes && (
                <p className="text-stone-600 italic mt-1 bg-white p-1.5 rounded border border-stone-200">
                  Note: {order.deliveryNotes}
                </p>
              )}
            </div>

            <div className="border-l border-stone-200 pl-6">
              <h4 className="font-bold text-stone-900 uppercase tracking-wider mb-1">Fulfillment & Courier:</h4>
              <p className="text-stone-700">Status: <strong className="text-stone-900">{order.orderStatus}</strong></p>
              <p className="text-stone-700">
                Courier: <strong>{order.courier.company || 'Assigned Courier'}</strong>
              </p>
              <p className="text-stone-700">
                Tracking #: <span className="font-mono font-bold">{order.courier.trackingNumber || 'Pending Dispatch'}</span>
              </p>
              {order.referralCode && (
                <p className="text-amber-800 text-[11px] mt-2">
                  Reseller Attribution: {order.referralCode} ({order.resellerName || 'Reseller'})
                </p>
              )}
            </div>
          </div>

          {/* Order Items Table */}
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-stone-900 text-stone-900">
                <th className="py-2 font-bold uppercase">SKU / Item</th>
                <th className="py-2 text-center font-bold uppercase">Qty</th>
                <th className="py-2 text-right font-bold uppercase">Unit Price</th>
                <th className="py-2 text-right font-bold uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2.5">
                    <p className="font-semibold text-stone-950">{item.title}</p>
                    <span className="text-[11px] font-mono text-stone-500">{item.sku || 'SKU'}</span>
                  </td>
                  <td className="py-2.5 text-center font-mono font-medium">{item.quantity}</td>
                  <td className="py-2.5 text-right font-mono">PKR {item.price.toLocaleString()}</td>
                  <td className="py-2.5 text-right font-mono font-bold">PKR {item.subtotal.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial Calculation */}
          <div className="flex justify-end pt-2 border-t border-stone-300">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Product Subtotal:</span>
                <span className="font-mono font-medium text-stone-900">PKR {order.productSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Courier Delivery:</span>
                <span className="font-mono font-medium text-stone-900">
                  {order.shippingFee === 0 ? 'FREE' : `PKR ${order.shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-stone-900 text-sm font-bold text-stone-950">
                <span>Cash on Delivery Payable:</span>
                <span className="font-mono text-base text-stone-950">
                  PKR {order.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Signatures & Barcode */}
          <div className="pt-6 border-t border-stone-200 grid grid-cols-2 gap-8 text-[11px] text-stone-600">
            <div>
              <p className="font-bold text-stone-900 mb-6">Courier Rider Signature / Confirmation:</p>
              <div className="border-b border-stone-400 w-48"></div>
              <p className="text-[10px] text-stone-400 mt-1">Amount Collected in Cash (PKR {order.totalAmount.toLocaleString()})</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-stone-900 mb-6">Recipient Customer Signature:</p>
              <div className="border-b border-stone-400 w-48 ml-auto"></div>
              <p className="text-[10px] text-stone-400 mt-1">Parcel Received Sealed & Intact</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
