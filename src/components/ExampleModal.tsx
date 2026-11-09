'use client';

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface ExampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  images: string[];
}

export default function ExampleModal({
  isOpen,
  onClose,
  productName,
  images,
}: ExampleModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  const validImages = images && images.length > 0 ? images : ['/images/avatar.gif'];

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-rose-100 bg-rose-50/80">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-rose-500 fill-rose-300" />
            <h3 className="text-sm sm:text-base font-bold text-gray-800 font-thai line-clamp-1">
              ตัวอย่างงาน: {productName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-gray-400 hover:text-gray-700 hover:bg-rose-100 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Display */}
        <div className="relative flex-1 bg-gray-900/90 flex items-center justify-center min-h-[280px] sm:min-h-[350px] overflow-hidden select-none">
          <img
            src={validImages[currentIndex]}
            alt={`ตัวอย่าง ${currentIndex + 1}`}
            className="max-h-[60vh] max-w-full object-contain p-2 transition-all duration-300"
          />

          {validImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg transition-all active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg transition-all active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Indicator */}
          {validImages.length > 1 && (
            <div className="absolute bottom-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-medium">
              {currentIndex + 1} / {validImages.length}
            </div>
          )}
        </div>

        {/* Thumbnail Selector */}
        {validImages.length > 1 && (
          <div className="p-3 bg-white border-t border-rose-50 flex gap-2 overflow-x-auto justify-center">
            {validImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                  currentIndex === idx
                    ? 'border-rose-500 scale-105 shadow-md shadow-rose-200'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Footer Note */}
        <div className="px-5 py-2.5 bg-rose-50/50 text-center">
          <p className="text-[11px] sm:text-xs text-rose-600 font-thai">
            ✨ งานตัดจริงเนียนกริบ คมชัดระดับ HD ตามบรีฟของลูกค้าเลยนะคะ
          </p>
        </div>
      </div>
    </div>
  );
}
