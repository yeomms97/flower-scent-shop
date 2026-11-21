'use client';

import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [shopName, setShopName] = useState('해이지 플레르');
  const [announcement, setAnnouncement] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankHolder, setBankHolder] = useState('');
  const [saved, setSaved] = useState(false);

  // 비밀번호 변경 상태
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordMsg({ text: '현재 비밀번호를 입력해주세요.', type: 'error' });
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setPasswordMsg({ text: '새 비밀번호는 최소 4자리 이상이어야 합니다.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: '새 비밀번호와 확인 입력이 일치하지 않습니다.', type: 'error' });
      return;
    }

    const res = await fetch('/api/admin/auth', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();
    if (res.ok) {
      setPasswordMsg({ text: '비밀번호가 성공적으로 변경되었습니다!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(null), 3000);
    } else {
      setPasswordMsg({ text: data.error || '비밀번호 변경에 실패했습니다.', type: 'error' });
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-gray-800 mb-6">상점 설정</h2>

      <div className="space-y-6">
        {/* Shop Name */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-2">🏠 꽃집 상호명 (가게 이름)</h3>
          <p className="text-xs text-gray-400 mb-3">소비자 메인 페이지, 주문서 상단 헤더 및 안내 문구에 노출되는 상호명입니다.</p>
          <input
            type="text"
            placeholder="예: 해이지 플레르"
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
          {saved ? '✅ 기본 설정이 저장되었습니다' : '기본 설정 저장하기'}
        </button>

        {/* Admin Password Change Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mt-8">
          <h3 className="font-semibold text-gray-700 mb-2">🔐 관리자 비밀번호 변경</h3>
          <p className="text-xs text-gray-400 mb-4">
            관리자 페이지(/admin) 접속 시 사용하는 비밀번호를 안전하게 변경할 수 있습니다. (초기 비밀번호: 1234)
          </p>
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">현재 비밀번호</label>
              <input
                type="password"
                placeholder="현재 사용 중인 비밀번호"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">새 비밀번호</label>
              <input
                type="password"
                placeholder="새로운 비밀번호 (4자리 이상)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">새 비밀번호 확인</label>
              <input
                type="password"
                placeholder="새로운 비밀번호 한 번 더 입력"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                required
              />
            </div>

            {passwordMsg && (
              <p className={`text-xs font-medium p-2.5 rounded-lg ${passwordMsg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                {passwordMsg.text}
              </p>
            )}

            <button
              type="submit"
              className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition"
            >
              비밀번호 변경하기
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
