'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, KeyRound, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'รหัสผ่านไม่ถูกต้อง');
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-100 text-center relative overflow-hidden">
        {/* Top accent glow */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-400 via-pink-500 to-purple-500" />

        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 ring-8 ring-rose-50/50">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-800 font-thai mb-1">
          ระบบหลังบ้าน (Admin)
        </h1>
        <p className="text-xs text-gray-400 font-thai mb-6">
          กรุณากรอกรหัสผ่านเพื่อเข้าสู่ระบบจัดการร้าน Shernice
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-thai flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="รหัสผ่านเข้าหลังบ้าน"
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-rose-100 bg-rose-50/30 focus:bg-white focus:border-rose-400 focus:outline-none text-center font-mono text-lg tracking-widest"
            />
            <KeyRound className="w-5 h-5 text-rose-400 absolute left-3.5 top-3.5" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold text-sm font-thai shadow-md shadow-rose-200 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>กำลังตรวจสอบ...</span>
            ) : (
              <>
                <span>เข้าสู่ระบบ</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-gray-400 font-thai mt-6">
          *ใช้รหัสผ่านที่ผู้ดูแลกำหนดไว้สำหรับร้านนี้
        </p>
      </div>
    </div>
  );
}
