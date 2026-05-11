import React from 'react';
import { FiAlertCircle, FiX } from 'react-icons/fi';

export default function ErrorMessage({ message, onDismiss }) {
  return (
    <div className="p-4 bg-banking-red/10 border border-banking-red/20 rounded-lg flex items-start gap-3">
      <FiAlertCircle className="text-banking-red flex-shrink-0 mt-0.5" size={20} />
      <div className="flex-1">
        <h3 className="text-banking-red font-semibold">Hata</h3>
        <p className="text-banking-red text-sm opacity-80">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-banking-red hover:opacity-70 transition-opacity"
        >
          <FiX size={20} />
        </button>
      )}
    </div>
  );
}
