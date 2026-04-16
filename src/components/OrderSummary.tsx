import React from 'react';
import { CreditCard, Banknote, QrCode, User } from 'lucide-react';
import { CartItem } from '../types';

interface OrderSummaryProps {
  items: CartItem[];
  tableId: string;
  customerName: string;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ items, tableId, customerName }) => {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  return (
    <div className="w-80 h-screen bg-white border-l border-gray-100 flex flex-col p-6 shrink-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Table {tableId}</h2>
          <p className="text-xs text-gray-400">{customerName}</p>
        </div>
        <button className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-600">
          <User size={20} />
        </button>
      </div>

      <div className="flex gap-2 mb-8">
        {['Dine in', 'Take Away', 'Delivery'].map((type, i) => (
          <button 
            key={type}
            className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${
              i === 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-400 border border-transparent'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[11px] font-bold text-gray-800 leading-tight mb-1 line-clamp-2">{item.name}</h4>
              <div className="flex items-center justify-between">
                <span className="text-emerald-500 text-[11px] font-bold">${item.price.toFixed(2)} <span className="text-gray-400 ml-1">{item.quantity}X</span></span>
                <span className="text-gray-900 text-[11px] font-bold">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Sub Total</span>
          <span className="font-bold text-gray-800">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Tax 5%</span>
          <span className="font-bold text-gray-800">${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-bold text-gray-900 pt-2">
          <span>Total Amount</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Banknote, label: 'Cash' },
            { icon: CreditCard, label: 'Credit/Debit Card' },
            { icon: QrCode, label: 'QR Code' },
          ].map((method, i) => (
            <button key={method.label} className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
              i === 2 ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-gray-100 text-gray-400 hover:border-emerald-100'
            }`}>
              <method.icon size={20} />
              <span className="text-[8px] font-bold text-center leading-tight">{method.label}</span>
            </button>
          ))}
        </div>
        
        <button className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all">
          Place Order
        </button>
      </div>
    </div>
  );
};
