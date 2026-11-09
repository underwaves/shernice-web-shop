'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from './ThemeContextProvider';
import { ExternalLink, ClipboardCheck, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';

export default function ProfileHeader() {
  const { settings } = useStore();

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-lg border border-pink-100 bg-white/90 backdrop-blur-md mb-6">
      {/* Cover Image banner */}
      <div className="relative w-full h-36 sm:h-48 overflow-hidden bg-gradient-to-r from-pink-200 via-rose-200 to-pink-300">
        <img
          src={settings.coverUrl || '/images/cover.gif'}
          alt="Shop Cover"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Avatar and Profile Details */}
      <div className="relative px-5 pb-6 pt-0 text-center">
        {/* Avatar centered on top of cover */}
        <div className="relative -mt-16 sm:-mt-20 inline-block mb-3">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1.5 bg-white shadow-xl ring-4 ring-rose-200/80 overflow-hidden mx-auto transition-transform duration-300 hover:scale-105">
            <img
              src={settings.avatarUrl || '/images/avatar.gif'}
              alt={settings.shopName || 'Shernice'}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <span className="absolute bottom-1 right-2 bg-emerald-500 w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-[10px] text-white">
            ✓
          </span>
        </div>

        {/* Shop Name */}
        <div className="flex items-center justify-center gap-1.5 mb-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800 font-thai flex items-center gap-1">
            {settings.shopName || 'Shernice'}
            <Sparkles className="w-5 h-5 text-rose-500 fill-rose-400 animate-pulse" />
          </h1>
        </div>

        {/* Bio */}
        <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto leading-relaxed font-thai px-2 mb-5">
          {settings.bio ||
            'ยินดีต้อนรับเข้าสู่ร้านของเชอไน้ สนใจบริการตัดรูปแบบใดสามารถเลือก และสอบถามเพิ่มเติมได้นะคะ'}
        </p>

        {/* 4 Required Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 max-w-lg mx-auto">
          {/* Button 1: ตัวอย่างงานเพิ่มเติม */}
          <a
            href={settings.driveLink || 'https://drive.google.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-medium text-xs sm:text-sm shadow-md shadow-rose-200 hover:opacity-95 active:scale-95 transition-all font-thai"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            <span>ตัวอย่างงานเพิ่มเติม</span>
          </a>

          {/* Button 2: เช็คสถานะงาน */}
          <Link
            href="/queue"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 text-white font-medium text-xs sm:text-sm shadow-md shadow-pink-200 hover:opacity-95 active:scale-95 transition-all font-thai"
          >
            <ClipboardCheck className="w-4 h-4 shrink-0" />
            <span>เช็คสถานะงาน</span>
          </Link>

          {/* Button 3: ติดต่อทางร้าน */}
          <a
            href={settings.contactLink || 'https://line.me/ti/p/@832rjuhx'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-white border border-rose-200 text-rose-600 font-medium text-xs sm:text-sm shadow-sm hover:bg-rose-50 active:scale-95 transition-all font-thai"
          >
            <MessageCircle className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>ติดต่อทางร้าน</span>
          </a>

          {/* Button 4: ระบบหลังบ้าน */}
          <Link
            href="/admin"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-white border border-gray-200 text-gray-600 font-medium text-xs sm:text-sm shadow-sm hover:bg-gray-50 active:scale-95 transition-all font-thai"
          >
            <ShieldCheck className="w-4 h-4 shrink-0 text-gray-500" />
            <span>ระบบหลังบ้าน</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
