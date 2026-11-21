'use client';

import { useState, useEffect, createContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AuthContext = createContext<{ authenticated: boolean; setAuthenticated: (v: boolean) => void }>({ authenticated: false, setAuthenticated: () => {} });

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    document.title = '해이지 플레르_관리자';
    const saved = sessionStorage.getItem('admin_auth');
    if (saved === 'true') setAuthenticated(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setError('');
    } else {
      setError('비밀번호가 올바르지 않습니다.');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-gray-800 mb-1 text-center">🔐 해이지 플레르_관리자</h1>
          <p className="text-xs text-gray-400 mb-6 text-center">관리자 로그인</p>
          <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-gray-300" />
          {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
          <button type="submit" className="w-full bg-gray-800 text-white py-3 rounded-lg text-sm font-semibold hover:bg-gray-900 transition">
            로그인
          </button>
          <p className="text-xs text-gray-400 text-center mt-4">초기 비밀번호: 1234</p>
        </form>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: '대시보드', icon: '📊' },
    { href: '/admin/products', label: '상품관리', icon: '🌷' },
    { href: '/admin/orders', label: '주문관리', icon: '📋' },
    { href: '/admin/calendar', label: '캘린더', icon: '📅' },
    { href: '/admin/settings', label: '설정', icon: '⚙️' },
  ];

  return (
    <AuthContext.Provider value={{ authenticated, setAuthenticated }}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/admin" className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>🌸</span> 해이지 플레르_관리자
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">소비자 페이지 →</Link>
              <button onClick={() => { setAuthenticated(false); sessionStorage.removeItem('admin_auth'); }}
                className="text-xs text-red-400 hover:text-red-600 ml-3">로그아웃</button>
            </div>
          </div>
        </header>
        <nav className="bg-white border-b border-gray-100 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 flex gap-1">
            {navItems.map(item => (
              <Link key={item.href} href={item.href}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition border-b-2 ${
                  pathname === item.href ? 'border-gray-800 text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                {item.icon} {item.label}
              </Link>
            ))}
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </div>
    </AuthContext.Provider>
  );
}
