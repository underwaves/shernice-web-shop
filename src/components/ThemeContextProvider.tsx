'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface StoreSettings {
  id: number;
  shopName: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  driveLink: string;
  statusLink: string;
  contactLink: string;
  lineId: string;
  bgMusicUrl: string;
  bgMusicEnabled: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgColor: string;
  cardColor: string;
  promptpayName: string;
  promptpayQrUrl: string;
  kbankName: string;
  kbankCardUrl: string;
  truemoneyName: string;
  truemoneyNumber: string;
  truemoneyFee: number;
  rewardsDescription: string;
  rewardsListJson: string;
  notes: string;
}

const defaultSettings: StoreSettings = {
  id: 1,
  shopName: 'Shernice',
  bio: 'ยินดีต้อนรับเข้าสู่ร้านของเชอไน้ สนใจบริการตัดรูปแบบใดสามารถเลือก และสอบถามเพิ่มเติมได้นะคะ',
  avatarUrl: '/images/avatar.gif',
  coverUrl: '/images/cover.gif',
  driveLink: 'https://drive.google.com',
  statusLink: '/queue',
  contactLink: 'https://line.me/ti/p/@832rjuhx',
  lineId: '@832rjuhx',
  bgMusicUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
  bgMusicEnabled: true,
  primaryColor: '#fb7185',
  secondaryColor: '#fda4af',
  accentColor: '#c084fc',
  bgColor: '#fff5f7',
  cardColor: '#ffffff',
  promptpayName: 'น.ส.ปิ่นจุฑา ฟุ้งสกุล',
  promptpayQrUrl: '/images/promptpay-qr.png',
  kbankName: 'น.ส.ปิ่นจุฑา ฟุ้งสกุล',
  kbankCardUrl: '/images/kbank-card.png',
  truemoneyName: 'น.ส.ปิ่นจุฑา ฟุ้งสกุล',
  truemoneyNumber: '096-269-4483',
  truemoneyFee: 2.0,
  rewardsDescription: 'เมื่อสะสมครบตามเงื่อนไข สามารถเลือกของรางวัลได้',
  rewardsListJson: '["ส่วนลด STK", "นฟ", "CP", "DM"]',
  notes: 'สงวนสิทธิ์ให้เฉพาะลูกค้าที่รีวิวให้กับทางร้านเท่านั้น หากสะสมครบมีรางวัลสุดพิเศษให้เลือกเย้อมากก',
};

const SettingsContext = createContext<{
  settings: StoreSettings;
  refreshSettings: () => Promise<void>;
  cartCount: number;
  cartItems: any[];
  addToCart: (item: any) => void;
  removeFromCart: (code: string) => void;
  clearCart: () => void;
}>({
  settings: defaultSettings,
  refreshSettings: async () => {},
  cartCount: 0,
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
});

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  useEffect(() => {
    fetchSettings();
    // Load cart from localStorage
    try {
      const saved = localStorage.getItem('shernice_cart');
      if (saved) setCartItems(JSON.parse(saved));
    } catch {}
  }, []);

  // Update CSS variables when settings change
  useEffect(() => {
    const root = document.documentElement;
    if (settings.primaryColor) root.style.setProperty('--theme-primary', settings.primaryColor);
    if (settings.secondaryColor) root.style.setProperty('--theme-secondary', settings.secondaryColor);
    if (settings.accentColor) root.style.setProperty('--theme-accent', settings.accentColor);
    if (settings.bgColor) root.style.setProperty('--theme-bg', settings.bgColor);
    if (settings.cardColor) root.style.setProperty('--theme-card', settings.cardColor);
  }, [settings]);

  const addToCart = (item: any) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i.code === item.code);
      let updated;
      if (exists) {
        updated = prev.map((i) => (i.code === item.code ? { ...i, quantity: (i.quantity || 1) + 1 } : i));
      } else {
        updated = [...prev, { ...item, quantity: 1 }];
      }
      localStorage.setItem('shernice_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCart = (code: string) => {
    setCartItems((prev) => {
      const updated = prev.filter((i) => i.code !== code);
      localStorage.setItem('shernice_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('shernice_cart');
  };

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        refreshSettings: fetchSettings,
        cartCount,
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export const useStore = () => useContext(SettingsContext);
