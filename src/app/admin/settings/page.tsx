'use client';

import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [announcement, setAnnouncement] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankHolder, setBankHolder] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(data => {
      setAnnouncement(data.announcement || '');
      setBankName(data.bank_name || '');
      setBankAccount(data.bank_account || '');
      setBankHolder(data.bank_holder || '');
    });
  }, []);

  const handleSave = async () => {
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        announcement, bank_name: bankName, bank_account: bankAccount, bank_holder: bankHolder,
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-800 mb-6">상점 설정</h2>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-3">📢 소개글 / 안내문구</h3>
          <textarea value={announcement} onChange={e => setAnnouncement(e.target.value)} rows={6}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
            placeholder="메인 페이지에 표시될 안내 문구를 입력하세요" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-3">💰 계좌이체 정보</h3>
          <div className="space-y-3">
            <input type="text" placeholder="은행명" value={bankName} onChange={e => setBankName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
            <input type="text" placeholder="계좌번호" value={bankAccount} onChange={e => setBankAccount(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
            <input type="text" placeholder="예금주" value={bankHolder} onChange={e => setBankHolder(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
          </div>
        </div>

        <button onClick={handleSave}
          className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-semibold transition">
          {saved ? '✅ 저장되었습니다' : '저장하기'}
        </button>
      </div>
    </div>
  );
}
