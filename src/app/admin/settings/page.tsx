'use client';

import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [shopName, setShopName] = useState('꽃향기 플라워');
  const [announcement, setAnnouncement] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankHolder, setBankHolder] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(data => {
      if (data.shop_name) setShopName(data.shop_name);
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
        shop_name: shopName,
        announcement,
        bank_name: bankName,
        bank_account: bankAccount,
        bank_holder: bankHolder,
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-800 mb-6">상점 설정</h2>

      <div className="space-y-6">
        {/* Shop Name */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-2">🏠 꽃집 상호명 (가게 이름)</h3>
          <p className="text-xs text-gray-400 mb-3">메인 페이지, 주문서 상단 헤더 및 안내 문구에 노출되는 상호명입니다.</p>
          <input
            type="text"
            placeholder="예: 꽃향기 플라워"
            value={shopName}
            onChange={e => setShopName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        {/* Announcement */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-2">📢 소개글 / 안내문구 (공지사항)</h3>
          <p className="text-xs text-gray-400 mb-3">소비자 메인 화면 상단에 줄바꿈이 유지되어 깔끔하게 노출됩니다.</p>
          <textarea
            value={announcement}
            onChange={e => setAnnouncement(e.target.value)}
            rows={6}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
            placeholder="메인 페이지에 표시될 안내 문구를 입력하세요"
          />
        </div>

        {/* Bank Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-2">💰 계좌이체 결제 정보</h3>
          <p className="text-xs text-gray-400 mb-3">소비자가 배달 주문 또는 픽업(계좌이체) 주문 완료 시 복사 버튼과 함께 노출됩니다.</p>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="은행명 (예: 국민은행)"
              value={bankName}
              onChange={e => setBankName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <input
              type="text"
              placeholder="계좌번호 (예: 123-456-789012)"
              value={bankAccount}
              onChange={e => setBankAccount(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <input
              type="text"
              placeholder="예금주 (예: 김꽃집)"
              value={bankHolder}
              onChange={e => setBankHolder(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-semibold transition"
        >
          {saved ? '✅ 설정이 저장되었습니다' : '설정 저장하기'}
        </button>
      </div>
    </div>
  );
}
