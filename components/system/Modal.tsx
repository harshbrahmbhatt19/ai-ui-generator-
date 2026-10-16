'use client';

import React, { useState } from 'react';

export interface ModalProps {
  title: string;
  isOpen?: boolean;
  children: React.ReactNode;
  onClose?: () => void;
}

export function Modal({ title, isOpen = true, children, onClose }: ModalProps) {
  // Track dismissal locally so the X / backdrop actually close the modal
  // even when the generated code doesn't pass an onClose handler.
  const [dismissed, setDismissed] = useState(false);

  if (!isOpen || dismissed) return null;

  const handleClose = () => {
    setDismissed(true);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-500" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
