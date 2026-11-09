'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { Copy, Check, CreditCard, X, AlertTriangle, Sparkles } from 'lucide-react';

interface QueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  queueNumber: string;
  customerName?: string;
  totalPrice?: number;
}

export default function QueueModal({
  isOpen,
  onClose,
  queueNumber,
  customerName,
  totalPrice,
}: QueueModalProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fb7185', '#fda4af', '#c084fc', '#facc15', '#ffffff'],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(queueNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const goToPayment = () => {
    onClose();
    router.push(`/payment?queue=${queueNumber}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        id="queue-ticket-card"
        className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-rose-300 p-6 text-center transition-all"
      >
        {/* Decorative corner stars */}
        <div className="absolute top-3 left-4 text-rose-300">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div className="absolute top-3 right-4">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-rose-50 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Header */}
        <div className="mb-2 mt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold font-thai mb-2">
            ✨ บันทึกคิวสำเร็จแล้วค่ะ ✨
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 font-thai">
            คิวของลูกค้าลำดับที่
          </h2>
        </div>

        {/* Large Queue Display Ticket (Easy to screenshot) */}
        <div className="my-4 py-4 px-6 bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-2xl text-white shadow-lg shadow-rose-200 border-2 border-white/60 relative overflow-hidden">
          <div className="text-4xl sm:text-5xl font-extrabold tracking-wider font-mono drop-shadow-md">
            {queueNumber}
          </div>
          {customerName && (
            <div className="text-sm font-thai text-rose-100 mt-1 opacity-95">
              คุณ {customerName}
            </div>
          )}
          {totalPrice !== undefined && totalPrice > 0 && (
            <div className="text-xs font-thai text-white/90 mt-1 font-semibold">
              ยอดชำระ: {totalPrice.toLocaleString()} บาท
            </div>
          )}
          <div className="text-[10px] tracking-widest text-rose-200 uppercase mt-2">
            SHERNICE ROV CUT TICKET
          </div>
        </div>

        {/* Verbatim Warning Text */}
        <div className="my-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-left flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-amber-900 font-thai leading-snug font-medium">
            <span className="font-bold text-rose-600">สำคัญ! </span>
            รบกวนลูกค้าคัดลอกเลขคิวไว้ส่งให้ทางแชทร้าน หากไม่ส่งให้ร้าน ทางร้านไม่รันคิวให้ทุกกรณีนะคะ
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mt-5">
          <button
            onClick={copyToClipboard}
            className={`w-full py-3 px-4 rounded-2xl font-bold text-sm sm:text-base font-thai flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
              copied
                ? 'bg-emerald-500 text-white shadow-emerald-200'
                : 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                <span>คัดลอกเลขคิวแล้ว!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>คัดลอกเลขคิว</span>
              </>
            )}
          </button>

          <button
            onClick={goToPayment}
            className="w-full py-2.5 px-4 rounded-2xl font-bold text-sm sm:text-base font-thai flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md shadow-pink-200 hover:opacity-95 transition-all active:scale-95"
          >
            <CreditCard className="w-5 h-5" />
            <span>ไปหน้าชำระเงิน</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-xs sm:text-sm text-gray-500 hover:text-gray-800 font-thai transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
