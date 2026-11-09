'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore } from '@/components/ThemeContextProvider';
import {
  QrCode,
  CreditCard,
  Wallet,
  Copy,
  Check,
  Upload,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queueParam = searchParams.get('queue') || '';
  const { settings } = useStore();

  const [queueInput, setQueueInput] = useState(queueParam);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // Selected payment tab: 'promptpay' | 'kbank' | 'truemoney'
  const [activeMethod, setActiveMethod] = useState<'promptpay' | 'kbank' | 'truemoney'>('promptpay');

  // Copy transfer note
  const [copiedNote, setCopiedNote] = useState(false);

  // Upload Slip
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Success Popup after slip upload
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fetchOrder = async (qNum: string) => {
    if (!qNum.trim()) return;
    setLoading(true);
    setFetchError('');
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(qNum.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ไม่พบข้อมูลคิวนี้');
      }
      setOrder(data);
      if (data.slipUrl) {
        setSlipPreview(data.slipUrl);
      }
    } catch (e: any) {
      setFetchError(e.message || 'ไม่สามารถดึงข้อมูลคิวได้');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queueParam) {
      setQueueInput(queueParam);
      fetchOrder(queueParam);
    }
  }, [queueParam]);

  const handleCopyNote = () => {
    const noteText = order?.transferNote || `${queueInput} ลูกค้า`;
    navigator.clipboard.writeText(noteText);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSlipFile(file);
      setSlipPreview(URL.createObjectURL(file));
      setUploadError('');
    }
  };

  const handleUploadSlip = async () => {
    if (!order) {
      setUploadError('กรุณาระบุเลขคิวก่อนแจ้งชำระเงิน');
      return;
    }
    if (!slipFile) {
      setUploadError('กรุณาเลือกรูปภาพสลิปการโอนเงิน');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('slip', slipFile);

      const res = await fetch(`/api/orders/${encodeURIComponent(order.queueNumber)}/slip`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการอัปโหลดสลิป');
      }

      // Success
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      setShowSuccessModal(true);
      fetchOrder(order.queueNumber);
    } catch (e: any) {
      setUploadError(e.message || 'เกิดข้อผิดพลาดในการอัปโหลดสลิป');
    } finally {
      setUploading(false);
    }
  };

  const transferNoteText = order?.transferNote || `${order?.queueNumber || queueInput || 'SN...'} คุณ${order?.customerName || ''}`;

  return (
    <div className="max-w-xl mx-auto px-4 pb-28 pt-4">
      {/* Page Header */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold font-thai mb-2">
          💳 ระบบชำระเงิน (Payment)
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 font-thai">
          หน้าชำระเงินค่าบริการ
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-thai mt-1">
          เลือกช่องทางชำระเงิน โน้ตสลิปให้ถูกต้อง แล้วแนบสลิปด้านล่างได้เลยค่ะ
        </p>
      </div>

      {/* Queue Number Input / Confirmation */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-rose-100 mb-6">
        <label className="block text-xs font-semibold text-gray-600 font-thai mb-1.5">
          หมายเลขคิวของคุณ (Queue Number)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={queueInput}
            onChange={(e) => setQueueInput(e.target.value.toUpperCase())}
            placeholder="เช่น SN001"
            className="flex-1 px-4 py-2.5 rounded-2xl border border-rose-100 bg-rose-50/20 focus:bg-white focus:border-rose-400 focus:outline-none text-base font-mono font-bold uppercase"
          />
          <button
            type="button"
            onClick={() => fetchOrder(queueInput)}
            disabled={loading}
            className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm font-thai shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'ค้นหา...' : 'ตรวจสอบ'}
          </button>
        </div>

        {fetchError && (
          <p className="text-xs text-rose-500 font-thai mt-2">{fetchError}</p>
        )}

        {order && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-1.5 text-xs sm:text-sm font-thai">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">หมายเลขคิว:</span>
              <span className="font-mono font-bold text-rose-600 text-base">{order.queueNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">ชื่อลูกค้า:</span>
              <span className="font-semibold text-gray-800">{order.customerName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">ฮีโร่ / สกิน:</span>
              <span className="text-gray-700">{order.heroName} - {order.skinName}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-rose-200">
              <span className="text-gray-700 font-bold">ยอดที่ต้องชำระ:</span>
              <span className="text-lg font-extrabold text-rose-600">{order.totalPrice} บาท</span>
            </div>
          </div>
        )}
      </div>

      {/* Payment Methods (3) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-rose-100 mb-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-800 font-thai mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-rose-500" />
          <span>เลือกช่องทางชำระเงิน</span>
        </h2>

        {/* 3 Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <button
            type="button"
            onClick={() => setActiveMethod('promptpay')}
            className={`py-2.5 px-2 rounded-2xl border flex flex-col items-center justify-center gap-1 text-xs font-bold font-thai transition-all ${
              activeMethod === 'promptpay'
                ? 'border-blue-600 bg-blue-50/60 text-blue-900 shadow-sm'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <QrCode className="w-5 h-5 text-blue-700" />
            <span>พร้อมเพย์</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMethod('kbank')}
            className={`py-2.5 px-2 rounded-2xl border flex flex-col items-center justify-center gap-1 text-xs font-bold font-thai transition-all ${
              activeMethod === 'kbank'
                ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 shadow-sm'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CreditCard className="w-5 h-5 text-emerald-700" />
            <span>กสิกร</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMethod('truemoney')}
            className={`py-2.5 px-2 rounded-2xl border flex flex-col items-center justify-center gap-1 text-xs font-bold font-thai transition-all ${
              activeMethod === 'truemoney'
                ? 'border-orange-500 bg-orange-50/60 text-orange-900 shadow-sm'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Wallet className="w-5 h-5 text-orange-600" />
            <span>TrueMoney</span>
          </button>
        </div>

        {/* Method 5.1: พร้อมเพย์ */}
        {activeMethod === 'promptpay' && (
          <div className="text-center space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs sm:text-sm text-blue-900 font-thai leading-relaxed">
              "คิวอาร์นี้ล็อคยอดไว้อยู่แล้ว ลูกค้าบันทึกรูปคิวอาร์แล้วสแกนจ่ายได้เลยค่ะ"
            </div>

            {/* QR Image display (NO PromptPay number as text per requirement) */}
            <div className="max-w-[260px] mx-auto p-3 rounded-2xl bg-white border-2 border-blue-200 shadow-md">
              <img
                src={settings.promptpayQrUrl || '/images/promptpay-qr.png'}
                alt="PromptPay QR Code"
                className="w-full h-auto rounded-xl object-contain mx-auto"
              />
            </div>

            <div className="text-xs sm:text-sm font-thai text-gray-700 font-semibold">
              ชื่อบัญชี: <span className="text-blue-900 font-bold">{settings.promptpayName || 'น.ส.ปิ่นจุฑา ฟุ้งสกุล'}</span>
            </div>
          </div>
        )}

        {/* Method 5.2: กสิกร */}
        {activeMethod === 'kbank' && (
          <div className="text-center space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm text-emerald-950 font-thai leading-relaxed">
              "รบกวนโน้ตสลิปทุกครั้งที่ใช้บริการ และตรวจสอบชื่อบัญชีก่อนกดโอน โอนผิดทางร้านไม่รับผิดชอบทุกกรณี"
            </div>

            {/* Bank Card Image display (QR scan only, NO account number as text per requirement) */}
            <div className="max-w-[260px] mx-auto p-3 rounded-2xl bg-white border-2 border-emerald-200 shadow-md">
              <img
                src={settings.kbankCardUrl || '/images/kbank-card.png'}
                alt="KBank QR Card"
                className="w-full h-auto rounded-xl object-contain mx-auto"
              />
            </div>

            <div className="text-xs sm:text-sm font-thai text-gray-700 font-semibold">
              ชื่อบัญชี: <span className="text-emerald-900 font-bold">{settings.kbankName || 'น.ส.ปิ่นจุฑา ฟุ้งสกุล'}</span>
              <p className="text-[11px] text-emerald-700 mt-1">ชำระผ่าน QR Scan เท่านั้น</p>
            </div>
          </div>
        )}

        {/* Method 5.3: TrueMoney Wallet */}
        {activeMethod === 'truemoney' && (
          <div className="text-center space-y-4">
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-2xl text-xs sm:text-sm text-orange-950 font-thai leading-relaxed">
              "โอนเข้าวอเลตโดยตรง บวกค่าธรรมเนียม 2.- หากยืนยันตัวตนแล้วสแกนจ่ายผ่านวอเลตแบบนี้ไม่บวกเพิ่มค่ะ"
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md max-w-sm mx-auto">
              <div className="text-xs text-orange-100 font-thai mb-1">เบอร์ TrueMoney Wallet</div>
              <div className="text-2xl sm:text-3xl font-mono font-extrabold tracking-wider">
                {settings.truemoneyNumber || '096-269-4483'}
              </div>
              <div className="text-xs text-white/90 font-thai mt-2">
                ชื่อบัญชี: {settings.truemoneyName || 'น.ส.ปิ่นจุฑา ฟุ้งสกุล'}
              </div>
            </div>

            <p className="text-xs text-gray-500 font-thai">
              *หากโอนเข้าเบอร์โดยตรงมีค่าธรรมเนียม {settings.truemoneyFee || 2} บาท
            </p>
          </div>
        )}

        {/* Requirements for ALL methods:
            - Show transfer note: "คำโน้ตสลิป" + "คัดลอกคำโน้ตสลิป" button
            - Show: "ซื้อขายกับ Line: @832rjuhx"
            - Show warning: "หากลืมโน้ตปรับ 1.- พร้อมโอนใหม่และโน้ตสลิป"
        */}
        <div className="mt-6 pt-5 border-t border-rose-100 space-y-3.5">
          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200">
            <div className="text-xs font-semibold text-rose-800 font-thai mb-1 flex items-center justify-between">
              <span>คำโน้ตสลิป (ต้องระบุในช่องโน้ตตอนโอนเงิน):</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 px-3 py-2 bg-white rounded-xl border border-rose-200 font-mono font-bold text-rose-600 text-sm truncate">
                {transferNoteText}
              </div>
              <button
                type="button"
                onClick={handleCopyNote}
                className="py-2 px-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs font-thai flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0"
              >
                {copiedNote ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedNote ? 'คัดลอกแล้ว!' : 'คัดลอกคำโน้ตสลิป'}</span>
              </button>
            </div>
          </div>

          {/* Line ID announcement */}
          <div className="text-center text-xs sm:text-sm font-semibold text-gray-700 font-thai">
            ซื้อขายกับ Line: <span className="text-rose-600 font-bold">{settings.lineId || '@832rjuhx'}</span>
          </div>

          {/* Verbatim Warning */}
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm text-center font-thai font-medium flex items-center justify-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>หากลืมโน้ตปรับ 1.- พร้อมโอนใหม่และโน้ตสลิป</span>
          </div>
        </div>
      </div>

      {/* Payment Confirmation: แจ้งชำระเงิน (Upload Slip) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-rose-100">
        <h2 className="text-base sm:text-lg font-bold text-gray-800 font-thai mb-2 flex items-center gap-1.5">
          <Upload className="w-4 h-4 text-rose-500" />
          <span>แจ้งชำระเงิน (แนบสลิปโอนเงิน)</span>
        </h2>
        <p className="text-xs text-gray-500 font-thai mb-4">
          อัปโหลดรูปภาพสลิป ระบบจะตรวจสอบความถูกต้องและป้องกันการใช้สลิปซ้ำ
        </p>

        {uploadError && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-thai flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* File picker */}
          <label className="border-2 border-dashed border-rose-200 hover:border-rose-400 rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer bg-rose-50/20 hover:bg-rose-50/40 transition-all text-center">
            {slipPreview ? (
              <div className="relative max-h-64 overflow-hidden rounded-2xl">
                <img src={slipPreview} alt="Slip preview" className="max-h-64 object-contain rounded-2xl" />
                <span className="block text-[11px] text-rose-500 font-thai mt-2">แตะเพื่อเปลี่ยนรูปสลิป</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-gray-700 font-thai">
                  คลิกหรือแตะเพื่อเลือกรูปสลิป
                </div>
                <div className="text-xs text-gray-400 font-thai">
                  รองรับไฟล์ภาพ JPG, PNG, WEBP (ไม่เกิน 10MB)
                </div>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={handleUploadSlip}
            disabled={uploading || !slipFile || !order}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold text-sm sm:text-base font-thai shadow-lg shadow-rose-200 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {uploading ? (
              <span>กำลังตรวจสอบและบันทึกสลิป...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>ยืนยันการแจ้งชำระเงิน</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Popup after Slip Upload */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-2xl border-2 border-rose-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Check className="w-8 h-8" />
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-gray-800 font-thai mb-2">
              คิว {order?.queueNumber} ชำระเงินเรียบร้อยค่ะ
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 font-thai mb-5">
              ทางร้านได้รับสลิปแล้ว กำลังจัดเตรียมงานให้ตามคิวเลยนะคะ อย่าลืมไปสะสมแต้มแลกรางวัลน้าา 💖
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push(`/points?q=${order?.queueNumber}`);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-extrabold text-sm sm:text-base font-thai shadow-lg shadow-rose-200 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>สะสมแต้มจิ้มกงนิ้</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2 text-xs text-gray-500 hover:text-gray-800 font-thai transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-thai text-rose-500">กำลังโหลด...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
