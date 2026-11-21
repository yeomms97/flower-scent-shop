import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://haizy-fleur.vercel.app'),
  title: '해이지 플레르 | haizy fleur',
  description: '해이지 플레르(haizy fleur) 온라인 꽃 예약 및 주문',
  openGraph: {
    title: '해이지 플레르 | haizy fleur',
    description: '해이지 플레르(haizy fleur) 온라인 꽃 예약 및 주문',
    url: 'https://haizy-fleur.vercel.app',
    siteName: '해이지 플레르',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '해이지 플레르 | haizy fleur',
    description: '해이지 플레르(haizy fleur) 온라인 꽃 예약 및 주문',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-white text-gray-800 min-h-screen">{children}</body>
    </html>
  );
}
