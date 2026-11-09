import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeContextProvider } from '@/components/ThemeContextProvider';
import FloatingHearts from '@/components/FloatingHearts';
import ClickEffect from '@/components/ClickEffect';
import BackgroundMusic from '@/components/BackgroundMusic';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Shernice - ร้านตัดรูป ROV คมชัดระดับพรีเมียม',
  description: 'ยินดีต้อนรับเข้าสู่ร้านของเชอไน้ สนใจบริการตัดรูปแบบใดสามารถเลือก และสอบถามเพิ่มเติมได้นะคะ',
  icons: {
    icon: '/images/avatar.gif',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased selection:bg-rose-200 selection:text-rose-900">
        <ThemeContextProvider>
          {/* Decorative floating hearts background */}
          <FloatingHearts />

          {/* Interactive touch/click sparkle effect */}
          <ClickEffect />

          {/* Background music widget */}
          <BackgroundMusic />

          {/* Main Content Area */}
          <main className="relative z-10 min-h-screen">
            {children}
          </main>

          {/* Sticky Bottom Navigation Bar */}
          <BottomNav />
        </ThemeContextProvider>
      </body>
    </html>
  );
}
