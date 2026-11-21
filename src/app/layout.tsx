import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '해이지 플레르 | haizy fleur',
  description: '해이지 플레르(haizy fleur) 온라인 꽃 예약 및 주문',
  openGraph: {
    title: '해이지 플레르 | haizy fleur',
    description: '해이지 플레르(haizy fleur) 온라인 꽃 예약 및 주문',
    siteName: '해이지 플레르',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-white text-gray-800 min-h-screen">{children}</body>
    </html>
  );
}
