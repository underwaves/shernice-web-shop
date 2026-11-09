'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ClipboardList,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';

function QueueContent() {
  const searchParams = useSearchParams();
  const qParam = searchParams.get('q') || '';

  const [inputVal, setInputVal] = useState(qParam);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchQueue = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ไม่พบข้อมูลคิวนี้');
      }
      setOrder(data);
    } catch (e: any) {
      setError(e.message || 'ไม่พบคิวที่ระบุ กรุณาตรวจสอบเลขคิวอีกครั้ง');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (qParam) {
      setInputVal(qParam);
      searchQueue(qParam);
    }
  }, [qParam]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'รอชำระเงิน':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>รอชำระเงิน</span>
          </span>
        );
      case 'กำลังดำเนินการ':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-blue-100 text-blue-800 border border-blue-200 animate-pulse">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>กำลังดำเนินการ</span>
          </span>
        );
      case 'เสร็จแล้ว':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>เสร็จแล้ว ✨</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-gray-100 text-gray-800 border border-gray-200">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 pb-28 pt-4">
      {/* Header */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold font-thai mb-2">
          📋 ตรวจสอบสถานะงาน (Queue Tracker)
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 font-thai">
          เช็คคิวตัดรูป ROV
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-thai mt-1">
          กรอกหมายเลขคิวของคุณ เช่น SN001 เพื่อดูสถานะการดำเนินงานแบบเรียลไทม์
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-rose-100 mb-6">
        <label className="block text-xs font-semibold text-gray-600 font-thai mb-1.5">
          หมายเลขคิว (Queue Number)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value.toUpperCase())}
            placeholder="เช่น SN001"
            className="flex-1 px-4 py-2.5 rounded-2xl border border-rose-100 bg-rose-50/20 focus:bg-white focus:border-rose-400 focus:outline-none text-base font-mono font-bold uppercase"
          />
          <button
            type="button"
            onClick={() => searchQueue(inputVal)}
            disabled={loading}
            className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm font-thai shadow-sm transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'กำลังค้นหา...' : 'เช็คคิว'}</span>
          </button>
        </div>

        {error && (
          <p className="text-xs text-rose-500 font-thai mt-2 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </p>
        )}
      </div>

      {/* Order Status Display */}
      {order && (
        <div className="bg-white rounded-3xl p-6 shadow-md border border-rose-100 space-y-5 animate-fade-in">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-rose-100 gap-3">
            <div>
              <span className="text-xs font-thai text-gray-400">หมายเลขคิว</span>
              <div className="text-3xl font-extrabold font-mono text-rose-600 tracking-wider">
                {order.queueNumber}
              </div>
            </div>
            <div>{getStatusBadge(order.status)}</div>
          </div>

          {/* Customer & Game Info */}
          <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm font-thai">
            <div className="p-3 rounded-2xl bg-rose-50/40">
              <span className="text-gray-400 block text-[11px]">ชื่อลูกค้า</span>
              <span className="font-bold text-gray-800">{order.customerName}</span>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50/40">
              <span className="text-gray-400 block text-[11px]">ช่องทางติดต่อ ({order.contactPlatform})</span>
              <span className="font-bold text-gray-800">{order.contactId}</span>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50/40">
              <span className="text-gray-400 block text-[11px]">ชื่อในเกมส์</span>
              <span className="font-bold text-gray-800">{order.inGameName}</span>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50/40">
              <span className="text-gray-400 block text-[11px]">แรงค์</span>
              <span className="font-bold text-gray-800">{order.rank}</span>
            </div>
          </div>

          {/* Brief Details */}
          <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-2 text-xs sm:text-sm font-thai">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">ฮีโร่ / Hero:</span>
              <span className="font-bold text-gray-800">{order.heroName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">สกิน / Skin:</span>
              <span className="font-bold text-gray-800">{order.skinName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">ระดับสกิน:</span>
              <span className="font-semibold text-gray-700">สกิน{order.skinLevel}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">โล่ / เม็ด:</span>
              <span className="font-semibold text-rose-600 bg-rose-100/60 px-2 py-0.5 rounded-lg">
                {order.badgeValue}
              </span>
            </div>
            {order.powerTrait && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">พลังแฝง:</span>
                <span className="text-gray-700">{order.powerTrait}</span>
              </div>
            )}
            {order.additionalBrief && (
              <div className="pt-2 border-t border-pink-100">
                <span className="text-gray-500 block mb-1">บรีฟเพิ่มเติม:</span>
                <p className="text-gray-700 bg-white p-2.5 rounded-xl border border-pink-100 text-xs">
                  {order.additionalBrief}
                </p>
              </div>
            )}
          </div>

          {/* Payment Status & Action */}
          <div className="pt-2">
            {order.status === 'รอชำระเงิน' ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-thai flex items-center justify-between">
                  <span>ยังไม่ได้แจ้งชำระเงิน (ยอดรวม {order.totalPrice} บาท)</span>
                </div>
                <Link
                  href={`/payment?queue=${order.queueNumber}`}
                  className="w-full py-3 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm font-thai shadow-md shadow-rose-200 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>ไปหน้าชำระเงิน / แนบสลิป</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : order.slipApproved ? (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-thai flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>ชำระเงินเรียบร้อยแล้ว ทางร้านกำลังดูแลงานให้อย่างดีค่ะ 💖</span>
              </div>
            ) : order.slipUrl ? (
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs sm:text-sm font-thai flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                <span>ส่งสลิปเรียบร้อยแล้ว รอแอดมินตรวจสอบความถูกต้องค่ะ</span>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default function QueuePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-thai text-rose-500">กำลังโหลด...</div>}>
      <QueueContent />
    </Suspense>
  );
}
