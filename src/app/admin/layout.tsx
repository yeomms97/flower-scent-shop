import type { Metadata } from 'next';
import AdminLayoutClient from './AdminLayoutClient';

export const metadata: Metadata = {
  title: '해이지 플레르_관리자',
  description: '해이지 플레르 관리자 시스템',
  openGraph: {
    title: '해이지 플레르_관리자',
    description: '해이지 플레르 관리자 시스템',
    url: 'https://haizy-fleur.vercel.app/admin',
    siteName: '해이지 플레르_관리자',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '해이지 플레르_관리자',
    description: '해이지 플레르 관리자 시스템',
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
