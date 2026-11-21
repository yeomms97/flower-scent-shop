'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Order {
  id: number;
  orderType: string;
  paymentMethod: string;
  customerName: string;
  customerPhone: string;
  deliveryDate: string;
  deliveryHour: number;
  addressCity: string;
  addressDistrict: string;
  addressDong: string;
  addressDetail: string;
  request: string;
  isCompleted: boolean;
  createdAt: string;
  product: { name: string; price: number };
}

export default function OrdersPage() {
  const [shopName, setShopName] = useState('꽃향기 플라워');
  const [name, setName] = useState('');
  const [phoneLast4, setPhoneLast4] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(data => {
      if (data.shop_name) setShopName(data.shop_name);
    });
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phoneLast4.trim()) {
      alert('이름과 휴대전화 뒷자리 4자리를 입력해주세요.');
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/orders?name=${encodeURIComponent(name)}&phone=${phoneLast4}`);
    const data = await res.json();
    setOrders(data);
    setSearched(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-600">←</Link>
          <h1 className="text-lg font-bold text-gray-800">{shopName} - 주문내역 확인</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3 mb-6">
          <input type="text" placeholder="이름" value={name} onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" required />
          <input
            type="text"
            placeholder="휴대전화 뒷자리 4자리 (예: 5678)"
            value={phoneLast4}
            onChange={e => {
              const digits = e.target.value.replace(/[^0-9]/g, '');
              if (digits.length > 4) {
                setPhoneLast4(digits.slice(-4));
              } else {
                setPhoneLast4(digits);
              }
            }}
            maxLength={13}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
            required
          />
          <button type="submit" disabled={loading}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-lg text-sm font-semibold transition disabled:opacity-50">
            {loading ? '조회 중...' : '조회하기'}
          </button>
        </form>

        {searched && orders.length === 0 && (
          <p className="text-center text-gray-400 py-10">일치하는 주문 내역이 없습니다.</p>
        )}

        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${order.isCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {order.isCompleted ? '완료' : '접수'}
                </span>
                <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('ko-KR')}</span>
              </div>
              <h3 className="font-semibold text-gray-800">{order.product.name}</h3>
              <p className="text-rose-500 font-bold text-sm">{order.product.price.toLocaleString()}원</p>
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <p>수령 방식: <span className="font-medium">{order.orderType === 'delivery' ? '배달' : '픽업'}</span></p>
                <p>결제 방식: <span className="font-medium">{order.paymentMethod === 'bank_transfer' ? '계좌이체' : '카드결제'}</span></p>
                <p>{order.orderType === 'delivery' ? '배달' : '픽업'} 일시: <span className="font-medium">{order.deliveryDate} {order.deliveryHour}시</span></p>
                {order.orderType === 'delivery' && (
                  <p>배송지: <span className="font-medium">{order.addressCity} {order.addressDistrict} {order.addressDong} {order.addressDetail}</span></p>
                )}
                {order.request && <p>요청사항: <span className="font-medium">{order.request}</span></p>}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
