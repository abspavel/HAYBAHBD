import React from 'react';

interface PaymentLogoProps {
  name: string;
}

export const PaymentMethodLogo: React.FC<PaymentLogoProps> = ({ name }) => {
  switch (name) {
    case 'VISA':
      return (
        <span className="font-black italic text-[#1A1F71] text-[13px] tracking-tight select-none">
          VISA
        </span>
      );

    case 'Mastercard':
      return (
        <div className="flex items-center justify-center -space-x-2 select-none">
          <div className="w-4 h-4 rounded-full bg-[#EB001B] opacity-95" />
          <div className="w-4 h-4 rounded-full bg-[#F79E1B] opacity-90" />
        </div>
      );

    case 'AMEX':
      return (
        <span className="bg-[#002663] text-white font-extrabold text-[8px] px-1 py-0.5 rounded-xs tracking-tighter select-none">
          AMEX
        </span>
      );

    case 'UnionPay':
      return (
        <div className="flex items-center justify-center -space-x-1.5 select-none">
          <div className="w-2.5 h-3.5 bg-[#ED1C24] rounded-xs" />
          <div className="w-2.5 h-3.5 bg-[#005B9C] rounded-xs" />
          <div className="w-2.5 h-3.5 bg-[#007F3E] rounded-xs" />
        </div>
      );

    case 'Diners Club':
      return (
        <div className="flex items-center justify-center gap-0.5 select-none text-[#004B87]">
          <div className="w-4 h-4 rounded-full border-[1.5px] border-[#004B87] flex items-center justify-center">
            <span className="text-[7px] font-bold">DC</span>
          </div>
        </div>
      );

    case 'bKash':
      return (
        <div className="flex items-center justify-center gap-0.5 select-none">
          <svg className="w-3.5 h-3.5 fill-[#E2136E]" viewBox="0 0 24 24">
            <polygon points="12,2 22,20 17,20 12,10 7,20 2,20" />
          </svg>
          <span className="text-[#E2136E] font-black text-[9px] tracking-tighter">bKash</span>
        </div>
      );

    case 'Nagad':
      return (
        <div className="flex items-center justify-center gap-0.5 select-none">
          <div className="w-2.5 h-2.5 rounded-full bg-[#F7941D]" />
          <span className="text-[#ED1C24] font-black text-[9px] tracking-tighter">নগদ</span>
        </div>
      );

    case 'Rocket':
      return (
        <div className="flex items-center justify-center gap-0.5 select-none">
          <span className="text-[#8B2C8D] font-black text-[9px] tracking-tight">Rocket</span>
        </div>
      );

    case 'Upay':
      return (
        <div className="flex items-center justify-center select-none">
          <span className="text-[#00579E] font-black text-[10px] tracking-tighter">upay</span>
        </div>
      );

    case 'Tap':
      return (
        <span className="bg-[#4D148C] text-[#FF6600] font-black text-[9px] px-1 py-0.5 rounded-xs tracking-tight select-none">
          tap
        </span>
      );

    case 'Islami Bank':
      return (
        <div className="flex flex-col items-center justify-center leading-none select-none text-[#006837]">
          <div className="w-3.5 h-2.5 border border-[#006837] rounded-xs flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-[#006837] rounded-full" />
          </div>
          <span className="text-[6.5px] font-bold mt-0.5">IBBL</span>
        </div>
      );

    case 'MTCash':
      return (
        <span className="text-[#008253] font-black text-[8px] tracking-tighter select-none">
          MTCash
        </span>
      );

    case 'LankaBangla':
      return (
        <div className="flex flex-col items-center leading-none select-none text-[#C41230]">
          <span className="font-extrabold text-[7.5px] tracking-tight">Lanka</span>
          <span className="text-[6px] font-bold text-gray-700">Bangla</span>
        </div>
      );

    case 'iPay':
      return (
        <span className="text-[#00B0B9] font-black text-[10px] tracking-tight select-none">
          iPay
        </span>
      );

    case 'Sure Cash':
      return (
        <div className="flex items-center justify-center gap-0.5 select-none">
          <span className="text-[#00A859] font-black text-[8px]">Sure</span>
          <span className="text-[#ED1C24] font-black text-[8px]">Cash</span>
        </div>
      );

    case 'Nexus Pay':
      return (
        <div className="flex items-center justify-center gap-0.5 select-none">
          <div className="w-2.5 h-2.5 bg-[#00897B] rotate-45" />
          <span className="text-[#004D40] font-black text-[8px]">NEXUS</span>
        </div>
      );

    case 'Dutch-Bangla':
      return (
        <div className="flex flex-col items-center leading-none select-none text-[#00853F]">
          <span className="font-black text-[8px] tracking-tighter">DBBL</span>
          <span className="text-[6px] text-[#EB1C24] font-bold">Nexus</span>
        </div>
      );

    case 'Brac Bank':
      return (
        <div className="flex flex-col items-center leading-none select-none text-[#003B71]">
          <span className="font-black text-[8px] tracking-tight">BRAC</span>
          <span className="text-[6px] font-semibold text-[#8B98A5]">BANK</span>
        </div>
      );

    case 'MTB':
      return (
        <div className="flex items-center justify-center select-none text-[#006633]">
          <span className="font-black text-[9px] tracking-tight">MTB</span>
        </div>
      );

    case 'AB Bank':
      return (
        <div className="flex items-center justify-center select-none text-[#E31B23]">
          <span className="font-black text-[9px] tracking-tight">AB Bank</span>
        </div>
      );

    case 'City Bank':
      return (
        <div className="flex flex-col items-center leading-none select-none text-[#005596]">
          <div className="w-3 h-1.5 bg-[#005596] rounded-xs mb-0.5" />
          <span className="font-black text-[7.5px]">CITY</span>
        </div>
      );

    case 'Trust Bank':
      return (
        <div className="flex flex-col items-center leading-none select-none text-[#005A36]">
          <span className="font-black text-[8px] tracking-tight">TRUST</span>
          <span className="text-[6px] font-bold">BANK</span>
        </div>
      );

    case 'Islami Wallet':
      return (
        <div className="flex flex-col items-center leading-none select-none text-[#006837]">
          <span className="font-black text-[7.5px]">Islami</span>
          <span className="text-[6px] text-gray-600 font-bold">Wallet</span>
        </div>
      );

    case 'OK Wallet':
      return (
        <div className="flex items-center justify-center gap-0.5 select-none text-[#E8112d]">
          <span className="font-black text-[8.5px]">OK</span>
          <span className="text-gray-800 font-bold text-[7px]">Wallet</span>
        </div>
      );

    case 'Cash on Delivery':
      return (
        <div className="flex flex-col items-center justify-center leading-none select-none text-[#0B2B22]">
          <svg className="w-3.5 h-3.5 fill-[#0B2B22]" viewBox="0 0 24 24">
            <path d="M2 5h20v14H2V5zm2 2v10h16V7H4zm8 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
          </svg>
          <span className="text-[6.5px] font-black tracking-tight mt-0.5 text-center leading-tight">
            COD
          </span>
        </div>
      );

    default:
      return (
        <span className="text-[8px] font-bold text-gray-700 uppercase">
          {name.slice(0, 4)}
        </span>
      );
  }
};
