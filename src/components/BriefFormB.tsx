'use client';

import React, { useState } from 'react';
import { AlertCircle, Send, Link as LinkIcon, Sparkles } from 'lucide-react';

interface BriefFormBProps {
  initialProduct?: any;
  onSubmitSuccess: (data: { queueNumber: string; customerName: string; totalPrice: number }) => void;
}

export default function BriefFormB({ initialProduct, onSubmitSuccess }: BriefFormBProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [contactPlatform, setContactPlatform] = useState('Line');
  const [contactId, setContactId] = useState('');
  const [targetLink, setTargetLink] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [customStyle, setCustomStyle] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim()) {
      setError('กรุณากรอกชื่อลูกค้า');
      return;
    }
    if (!contactId.trim()) {
      setError('กรุณากรอก ID ช่องทางการติดต่อ');
      return;
    }
    if (!targetLink.trim()) {
      setError('กรุณากรอกลิงก์ที่ต้องการใส่');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        briefType: 'FORM_B',
        customerName: customerName.trim(),
        contactPlatform,
        contactId: contactId.trim(),
        inGameName: 'บรีฟใส่ลิงก์',
        heroName: linkTitle || 'งานลิงก์',
        skinName: 'ลิงก์ต่าง ๆ',
        rank: '-',
        skinLevel: 'ใหม่',
        badgeType: 'ลิงก์',
        badgeValue: 'ลิงก์ทั่วไป',
        formBData: {
          targetLink: targetLink.trim(),
          linkTitle: linkTitle.trim(),
          customStyle: customStyle.trim(),
          additionalNotes: additionalNotes.trim(),
        },
        items: initialProduct
          ? [{ code: initialProduct.code, name: initialProduct.name, price: initialProduct.price, quantity: 1 }]
          : [],
        totalPrice: initialProduct ? initialProduct.price : 0,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการบันทึกบรีฟ');
      }

      onSubmitSuccess({
        queueNumber: data.queueNumber,
        customerName: customerName.trim(),
        totalPrice: initialProduct ? initialProduct.price : 0,
      });
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด ไม่สามารถส่งบรีฟได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg border border-purple-100 max-w-xl mx-auto">
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-semibold font-thai mb-2">
          <Sparkles className="w-3.5 h-3.5" /> บรีฟงาน Form B (Configurable Placeholder)
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 font-thai">
          บรีฟงานใส่ลิงก์ต่าง ๆ
        </h2>
        <p className="text-xs text-gray-500 font-thai mt-1">
          ฟอร์มนี้รองรับการใส่ลิงก์งาน ลิงก์ช่องทาง หรือลิงก์ที่ต้องการให้ตกแต่ง
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2 font-thai">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ชื่อลูกค้า */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 font-thai mb-1">
            ชื่อลูกค้า <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="เช่น คุณแพรว"
            className="w-full px-4 py-2.5 rounded-2xl border border-purple-100 bg-purple-50/20 focus:bg-white focus:border-purple-400 focus:outline-none text-sm font-thai"
          />
        </div>

        {/* ช่องทางการติดต่อ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 font-thai mb-1">
              ช่องทางหลัก <span className="text-rose-500">*</span>
            </label>
            <select
              value={contactPlatform}
              onChange={(e) => setContactPlatform(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl border border-purple-100 bg-purple-50/20 focus:bg-white focus:border-purple-400 focus:outline-none text-sm font-thai"
            >
              <option value="Line">Line</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="Discord">Discord</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 font-thai mb-1">
              ID / ชื่อผู้ใช้ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              placeholder="เช่น @line_id หรือ FB Name"
              className="w-full px-4 py-2.5 rounded-2xl border border-purple-100 bg-purple-50/20 focus:bg-white focus:border-purple-400 focus:outline-none text-sm font-thai"
            />
          </div>
        </div>

        {/* ลิงก์ที่ต้องการใส่ */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 font-thai mb-1">
            URL ลิงก์ที่ต้องการใส่ <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="url"
              required
              value={targetLink}
              onChange={(e) => setTargetLink(e.target.value)}
              placeholder="https://..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-purple-100 bg-purple-50/20 focus:bg-white focus:border-purple-400 focus:outline-none text-sm font-thai"
            />
            <LinkIcon className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* ชื่อปุ่ม / ข้อความลิงก์ */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 font-thai mb-1">
            ชื่อปุ่ม / ข้อความแสดงผล
          </label>
          <input
            type="text"
            value={linkTitle}
            onChange={(e) => setLinkTitle(e.target.value)}
            placeholder="เช่น วาร์ปช่อง TikTok, ลิงก์สตรีมสด"
            className="w-full px-4 py-2.5 rounded-2xl border border-purple-100 bg-purple-50/20 focus:bg-white focus:border-purple-400 focus:outline-none text-sm font-thai"
          />
        </div>

        {/* บรีฟเพิ่มเติม */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 font-thai mb-1">
            บรีฟเพิ่มเติม
          </label>
          <textarea
            rows={3}
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="โทนสี รูปร่างปุ่ม หรือตำแหน่งที่ต้องการให้แปะลิงก์..."
            className="w-full px-4 py-2.5 rounded-2xl border border-purple-100 bg-purple-50/20 focus:bg-white focus:border-purple-400 focus:outline-none text-sm font-thai"
          />
        </div>

        {/* Verbatim Warning */}
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm leading-relaxed font-thai">
          <p className="font-semibold text-rose-600 mb-0.5">⚠️ คำเตือนสำคัญจากทางร้าน:</p>
          "รบกวนบรีฟให้ละเอียดและครบถ้วน หลังจากส่งงานให้เช็ค หากมีการแก้ไขนอกเหนือจากที่บรีฟไว้ จะมีค่าแก้ไขจุดละ 5–20 บาท ตามความยากง่ายค่ะ"
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm sm:text-base font-thai shadow-lg shadow-purple-200 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <span>กำลังบันทึกและจัดคิว...</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>ส่งบรีฟงาน & รับหมายเลขคิว</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
