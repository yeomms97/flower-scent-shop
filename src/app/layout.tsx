import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '꽃향기 플라워',
  description: '꽃집 온라인 예약 주문',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-white text-gray-800 min-h-screen">{children}</body>
    </html>
  );
}
