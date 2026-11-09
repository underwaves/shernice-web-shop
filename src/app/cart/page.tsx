'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/components/ThemeContextProvider';
import { ShoppingCart, Trash2, ArrowRight, Sparkles, Store } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { cartItems, removeFromCart, clearCart } = useStore();

  const total = cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  return (
    <div className="max-w-xl mx-auto px-4 pb-28 pt-4">
      {/* Page Header */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold font-thai mb-2">
          🛒 ตะกร้าบริการ (Cart)
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 font-thai">
          รายการที่เลือก
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-thai mt-1">
          ตรวจสอบบริการที่เลือกและดำเนินการส่งบรีฟงาน
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-rose-100 space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-gray-700 font-thai">
            ยังไม่มีรายการในตะกร้า
          </h2>
          <p className="text-xs text-gray-400 font-thai max-w-xs mx-auto">
            เลือกลวดลายและรูปแบบการตัดรูป ROV ที่ถูกใจได้ที่หน้าร้านเลยนะคะ
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm font-thai shadow-md shadow-rose-200 transition-all active:scale-95"
          >
            <Store className="w-4 h-4" />
            <span>กลับไปเลือกบริการหน้าร้าน</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-rose-100 divide-y divide-rose-50">
            {cartItems.map((item) => (
              <div key={item.code} className="py-3.5 flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="font-bold text-sm sm:text-base text-gray-800 font-thai">
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-400 font-thai mt-0.5">
                    ราคา {item.price} บาท × {item.quantity || 1}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-rose-600 text-sm sm:text-base">
                    {item.price * (item.quantity || 1)} ฿
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.code)}
                    className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-rose-100 text-gray-400 hover:text-rose-600 flex items-center justify-center transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="pt-4 flex justify-between items-center text-sm sm:text-base font-thai font-bold">
              <span className="text-gray-700">ยอดรวมทั้งหมด:</span>
              <span className="text-xl sm:text-2xl font-extrabold text-rose-600 font-mono">
                {total} บาท
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearCart}
              className="py-3 px-4 rounded-2xl bg-white border border-gray-200 text-gray-500 font-thai text-xs sm:text-sm font-semibold hover:bg-gray-50 active:scale-95 transition-all"
            >
              ล้างตะกร้า
            </button>
            <Link
              href="/#brief-section"
              className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold text-sm sm:text-base font-thai shadow-lg shadow-rose-200 flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>ไปกรอกบรีฟงาน</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
