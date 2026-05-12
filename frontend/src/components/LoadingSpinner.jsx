import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-12 h-12 border-4 border-banking-border border-t-banking-teal rounded-full animate-spin"></div>
      <p className="mt-4 text-banking-slate text-lg font-medium">Değerlendiriliyoruz... Lütfen bekleyiniz</p>
    </div>
  );
}
