'use client';

import React, { useState } from 'react';
import { AlertCircle, Send, Sparkles } from 'lucide-react';

interface BriefFormAProps {
  initialProduct?: any;
  onSubmitSuccess: (data: { queueNumber: string; customerName: string; totalPrice: number }) => void;
}

export default function BriefFormA({ initialProduct, onSubmitSuccess }: BriefFormAProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [contactPlatform, setContactPlatform] = useState('Line');
  const [contactId, setContactId] = useState('');
  const [inGameName, setInGameName] = useState('');
  const [heroName, setHeroName] = useState('');
  const [skinName, setSkinName] = useState('');
  const [rank, setRank] = useState('');
  const [skinLevel, setSkinLevel] = useState<'เก่า' | 'ใหม่'>('ใหม่');

  // Badge / Pill (Single choice only)
  // Categories: โล่ or เม็ด
  const [badgeCategory, setBadgeCategory] = useState<'โล่' | 'เม็ด'>('โล่');
  const [badgeValue, setBadgeValue] = useState<string>('โล่เริ่มต้น');

  const shieldOptions = ['โล่เริ่มต้น', 'โล่เขียว', 'โล่ฟ้า', 'โล่ม่วง', 'โล่ตัน'];
  const pillOptions = ['เม็ดตำบล', 'เม็ดเขียว', 'เม็ดฟ้า', 'เม็ดม่วง', 'เม็ดแดง', 'เม็ดส้ม'];

  const [powerTrait, setPowerTrait] = useState('');
  const [additionalBrief, setAdditionalBrief] = useState('');

  const handleCategoryChange = (category: 'โล่' | 'เม็ด') => {
    setBadgeCategory(category);
    if (category === 'โล่') {
      setBadgeValue(shieldOptions[0]);
    } else {
      setBadgeValue(pillOptions[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!customerName.trim()) {
      setError('กรุณากรอกชื่อลูกค้า');
      return;
    }
    if (!contactId.trim()) {
      setError('กรุณากรอก ID ช่องทางการติดต่อ');
      return;
    }
    if (!inGameName.trim()) {
      setError('กรุณากรอกชื่อในเกมส์');
      return;
    }
    if (!heroName.trim()) {
      setError('กรุณากรอกฮีโร่ / Hero');
      return;
    }
    if (!skinName.trim()) {
      setError('กรุณากรอกสกิน / Skin');
      return;
    }
    if (!rank.trim()) {
      setError('กรุณาระบุแรงค์ (เช่น คอนกี่ดาว หรือกลออันดับที่เท่าไหร่)');
      return;
    }
    if (!badgeValue) {
      setError('กรุณาเลือกโล่หรือเม็ด');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        briefType: 'FORM_A',
        customerName: customerName.trim(),
        contactPlatform,
        contactId: contactId.trim(),
        inGameName: inGameName.trim(),
        heroName: heroName.trim(),
        skinName: skinName.trim(),
        rank: rank.trim(),
        skinLevel,
        badgeType: badgeCategory,
        badgeValue,
        powerTrait: powerTrait.trim(),
        additionalBrief: additionalBrief.trim(),
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
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg border border-rose-100 max-w-xl mx-auto">
      {/* Form Title */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold font-thai mb-2">
          <Sparkles className="w-3.5 h-3.5" /> บรีฟงาน Form A
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 font-thai">
          บรีฟงานตัดรูปหน้าโหลด & กรอบใส
        </h2>
        {initialProduct && (
          <p className="text-sm text-rose-500 font-thai mt-1 font-medium">
            บริการที่เลือก: {initialProduct.name} ({initialProduct.price} บาท)
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2 font-thai">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. ชื่อลูกค้า */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 font-thai mb-1">
            ชื่อลูกค้า <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="เช่น คุณแพรว, น้องมายด์"
            className="w-full px-4 py-2.5 rounded-2xl border border-rose-100 bg-rose-50/30 focus:bg-white focus:border-rose-400 focus:outline-none text-sm font-thai transition-colors"
          />
        </div>

        {/* 2. ช่องทางการติดต่อหลัก */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <div className="sm:col-span-1">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 font-thai mb-1">
              ช่องทางหลัก <span className="text-rose-500">*</span>
            </label>
            <select
              value={contactPlatform}
              onChange={(e) => setContactPlatform(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl border border-rose-100 bg-rose-50/30 focus:bg-white focus:border-rose-400 focus:outline-none text-sm font-thai"
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
              className="w-full px-4 py-2.5 rounded-2xl border border-rose-100 bg-rose-50/30 focus:bg-white focus:border-rose-400 focus:outline-none text-sm font-thai"
            />
          </div>
        </div>

        {/* 3. ชื่อในเกมส์ */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 font-thai mb-1">
            ชื่อในเกมส์ <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={inGameName}
            onChange={(e) => setInGameName(e.target.value)}
            placeholder="ชื่อในเกม ROV ตรงตามในเกม"
            className="w-full px-4 py-2.5 rounded-2xl border border-rose-100 bg-rose-50/30 focus:bg-white focus:border-rose-400 focus:outline-none text-sm font-thai"
          />
        </div>

        {/* 4. ฮีโร่ & สกิน */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 font-thai mb-1">
              ฮีโร่ / Hero <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={heroName}
              onChange={(e) => setHeroName(e.target.value)}
              placeholder="เช่น Florentino, Violet"
              className="w-full px-4 py-2.5 rounded-2xl border border-rose-100 bg-rose-50/30 focus:bg-white focus:border-rose-400 focus:outline-none text-sm font-thai"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 font-thai mb-1">
              สกิน / Skin <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={skinName}
              onChange={(e) => setSkinName(e.target.value)}
              placeholder="เช่น Dimension Breaker"
              className="w-full px-4 py-2.5 rounded-2xl border border-rose-100 bg-rose-50/30 focus:bg-white focus:border-rose-400 focus:outline-none text-sm font-thai"
            />
          </div>
        </div>

        {/* 5. แรงค์ */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 font-thai mb-1">
            แรงค์ <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            placeholder="ระบุคอนกี่ดาว หรือกลออันดับที่เท่าไหร่ให้ชัดเจน"
            className="w-full px-4 py-2.5 rounded-2xl border border-rose-100 bg-rose-50/30 focus:bg-white focus:border-rose-400 focus:outline-none text-sm font-thai"
          />
          <p className="text-[11px] text-gray-500 font-thai mt-1">
            *ระบุคอนกี่ดาว หรือกลออันดับที่เท่าไหร่ให้ชัดเจน
          </p>
        </div>

        {/* 6. ระดับสกิน (Radio: เก่า / ใหม่) */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 font-thai mb-1.5">
            ระดับสกิน <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['ใหม่', 'เก่า'] as const).map((lvl) => (
              <label
                key={lvl}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border-2 cursor-pointer font-thai text-sm font-medium transition-all ${
                  skinLevel === lvl
                    ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-rose-200'
                }`}
              >
                <input
                  type="radio"
                  name="skinLevel"
                  checked={skinLevel === lvl}
                  onChange={() => setSkinLevel(lvl)}
                  className="accent-rose-500"
                />
                <span>สกิน{lvl}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 7. โล่ / เม็ด (Single select, one choice only) */}
        <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/20 space-y-3">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 font-thai">
            โล่ / เม็ด (เลือกได้เพียง 1 อย่าง) <span className="text-rose-500">*</span>
          </label>

          {/* Category Tabs: โล่ or เม็ด */}
          <div className="flex rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => handleCategoryChange('โล่')}
              className={`flex-1 py-1.5 rounded-lg text-xs sm:text-sm font-bold font-thai transition-all ${
                badgeCategory === 'โล่'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              🛡️ หมวดโล่
            </button>
            <button
              type="button"
              onClick={() => handleCategoryChange('เม็ด')}
              className={`flex-1 py-1.5 rounded-lg text-xs sm:text-sm font-bold font-thai transition-all ${
                badgeCategory === 'เม็ด'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              💎 หมวดเม็ด
            </button>
          </div>

          {/* Options grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {(badgeCategory === 'โล่' ? shieldOptions : pillOptions).map((opt) => (
              <label
                key={opt}
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs sm:text-sm font-thai transition-all ${
                  badgeValue === opt
                    ? 'border-rose-500 bg-rose-100/70 text-rose-800 font-bold shadow-sm'
                    : 'border-rose-100 bg-white text-gray-600 hover:bg-rose-50/50'
                }`}
              >
                <input
                  type="radio"
                  name="badgeOption"
                  checked={badgeValue === opt}
                  onChange={() => setBadgeValue(opt)}
                  className="accent-rose-500"
                />
                <span className="truncate">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 8. พลังแฝง */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 font-thai mb-1">
            พลังแฝง (ถ้ามี)
          </label>
          <input
            type="text"
            value={powerTrait}
            onChange={(e) => setPowerTrait(e.target.value)}
            placeholder="เช่น พลังแฝงสีแดง / เขียว หรือระบุตามต้องการ"
            className="w-full px-4 py-2.5 rounded-2xl border border-rose-100 bg-rose-50/30 focus:bg-white focus:border-rose-400 focus:outline-none text-sm font-thai"
          />
        </div>

        {/* 9. บรีฟเพิ่มเติม */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 font-thai mb-1">
            บรีฟเพิ่มเติม
          </label>
          <textarea
            rows={3}
            value={additionalBrief}
            onChange={(e) => setAdditionalBrief(e.target.value)}
            placeholder="รายละเอียดเพิ่มเติม โทนสี ข้อความพิเศษ หรือสิ่งที่อยากเน้น..."
            className="w-full px-4 py-2.5 rounded-2xl border border-rose-100 bg-rose-50/30 focus:bg-white focus:border-rose-400 focus:outline-none text-sm font-thai"
          />
        </div>

        {/* Verbatim Warning Text */}
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm leading-relaxed font-thai">
          <p className="font-semibold text-rose-600 mb-0.5">⚠️ คำเตือนสำคัญจากทางร้าน:</p>
          &ldquo;รบกวนบรีฟให้ละเอียดและครบถ้วน หลังจากส่งงานให้เช็ค หากมีการแก้ไขนอกเหนือจากที่บรีฟไว้ จะมีค่าแก้ไขจุดละ 5–20 บาท ตามความยากง่ายค่ะ&rdquo;
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold text-sm sm:text-base font-thai shadow-lg shadow-rose-200 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
