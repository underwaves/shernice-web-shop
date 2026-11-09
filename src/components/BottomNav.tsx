'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, ClipboardList, Gift, ShoppingCart, MessageCircle } from 'lucide-react';
import { useStore } from './ThemeContextProvider';

export default function BottomNav() {
  const pathname = usePathname();
  const { cartCount, settings } = useStore();

  const navItems = [
    { label: 'หน้าร้าน', href: '/', icon: Store },
    { label: 'เช็คคิว', href: '/queue', icon: ClipboardList },
    { label: 'สะสมแต้ม', href: '/points', icon: Gift },
    { label: 'ตะกร้า', href: '/cart', icon: ShoppingCart, badge: cartCount },
    {
      label: 'ติดต่อ',
      href: settings.contactLink || 'https://line.me/ti/p/@832rjuhx',
      icon: MessageCircle,
      isExternal: true,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-rose-100 shadow-[0_-4px_16px_rgba(244,63,94,0.08)] py-1.5 px-2 max-w-lg mx-auto sm:rounded-t-3xl">
      <nav className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isExternal) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center py-1 px-3 text-gray-500 hover:text-rose-500 active:scale-95 transition-all"
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium font-thai mt-0.5">{item.label}</span>
              </a>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative ${
                isActive
                  ? 'text-rose-600 font-bold'
                  : 'text-gray-500 hover:text-rose-400 active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-rose-500' : ''
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce-slow shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium font-thai mt-0.5">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-3 h-1 bg-rose-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
