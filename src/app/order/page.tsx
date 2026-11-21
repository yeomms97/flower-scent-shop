'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

function OrderForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productIdParam = searchParams.get('productId');

  const [shopName, setShopName] = useState('해이지 플레르');
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'card'>('bank_transfer');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(11);
  const [day, setDay] = useState(25);
  const [hour, setHour] = useState(12);
  const [city, setCity] = useState('부산시');
  const [district, setDistrict] = useState('');
  const [dong, setDong] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [request, setRequest] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bankInfo, setBankInfo] = useState<{ bank_name: string; bank_account: string; bank_holder: string } | null>(null);
  const [orderResult, setOrderResult] = useState<any>(null);

  // 전화번호 자동 하이픈 (010-XXXX-XXXX) 포맷팅 함수
  const formatPhoneNumber = (val: string) => {
    const digits = val.replace(/[^0-9]/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhoneNumber(e.target.value));
  };

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then((data: Product[]) => {
      setProducts(data);
      if (data.length > 0) {
        let initialProduct = data[0];
        if (productIdParam) {
          const found = data.find(p => p.id === parseInt(productIdParam));
          if (found) initialProduct = found;
        }
        setCartItems([{ product: initialProduct, quantity: 1 }]);
      }
    });

    fetch('/api/admin/settings').then(r => r.json()).then(data => {
      if (data.shop_name) setShopName(data.shop_name);
    });

    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
    setDay(now.getDate());
  }, [productIdParam]);

  // 수량 조절
  const updateQuantity = (index: number, delta: number) => {
    setCartItems(prev => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty > 0) {
        updated[index].quantity = newQty;
      }
      return updated;
    });
  };

  // 상품 삭제
  const removeItem = (index: number) => {
    if (cartItems.length <= 1) {
      alert('최소 1개 이상의 상품을 선택해야 합니다.');
      return;
    }
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  // 상품 추가
  const addItem = (productId: number) => {
    const target = products.find(p => p.id === productId);
    if (!target) return;
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === productId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prev, { product: target, quantity: 1 }];
    });
  };

  // 총 결제 금액 계산
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (cartItems.length === 0) { alert('주문할 상품을 최소 1개 이상 선택해주세요.'); return; }
    if (!name.trim()) { alert('이름을 입력해주세요.'); return; }
    if (!phone.trim()) { alert('휴대전화 번호를 입력해주세요.'); return; }

    setIsSubmitting(true);
    const deliveryDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const itemsPayload = cartItems.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderType,
          paymentMethod: orderType === 'delivery' ? 'bank_transfer' : paymentMethod,
          customerName: name,
          customerPhone: phone,
          deliveryDate,
          deliveryHour: hour,
          addressCity: orderType === 'delivery' ? city : '',
          addressDistrict: orderType === 'delivery' ? district : '',
          addressDong: orderType === 'delivery' ? dong : '',
          addressDetail: orderType === 'delivery' ? addressDetail : '',
          request,
          productId: cartItems[0].product.id,
          items: itemsPayload,
          totalAmount,
        }),
      });
      const data = await res.json();
      setOrderResult(data.order);
      setBankInfo(data.bankInfo);
      setSubmitted(true);
    } catch (err) {
      alert('주문 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    const showBankInfo = orderType === 'delivery' || (orderType === 'pickup' && paymentMethod === 'bank_transfer');
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <Link href="/" className="text-xl font-bold text-gray-800">🌸 {shopName}</Link>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">주문이 완료되었습니다!</h2>
            <p className="text-gray-500 mb-5">
              {orderType === 'delivery' ? '배달' : '픽업'} 주문이 정상 접수되었습니다.
            </p>

            {/* 주문한 상품 상세 내역 */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left border border-gray-100 space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 mb-2">주문 상품 내역 (총 {totalItemCount}개)</h4>
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm text-gray-700 py-1 border-b border-gray-200/50 last:border-none">
                  <div>
                    <span className="font-medium">{item.product.name}</span>
                    <span className="text-xs text-gray-500 ml-1">x {item.quantity}개</span>
                  </div>
                  <span className="font-semibold text-gray-800">{(item.product.price * item.quantity).toLocaleString()}원</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 text-base font-bold text-gray-900 border-t border-gray-200">
                <span>총 주문 금액</span>
                <span className="text-rose-500">{totalAmount.toLocaleString()}원</span>
              </div>
            </div>

            {/* 계좌이체 안내 */}
            {showBankInfo && bankInfo && (
              <div className="bg-amber-50 rounded-xl p-4 mb-4 text-left border border-amber-100">
                <h3 className="font-semibold text-amber-800 mb-2">💰 계좌이체 안내</h3>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>은행: <span className="font-medium">{bankInfo.bank_name}</span></p>
                  <p>계좌번호: <span className="font-medium">{bankInfo.bank_account}</span></p>
                  <p>예금주: <span className="font-medium">{bankInfo.bank_holder}</span></p>
                  <p className="text-gray-500 mt-1">입금 금액: <span className="font-bold text-rose-500 text-base">{totalAmount.toLocaleString()}원</span></p>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(bankInfo.bank_account); alert('계좌번호가 복사되었습니다!'); }}
                  className="mt-3 w-full bg-amber-100 hover:bg-amber-200 text-amber-800 py-2.5 rounded-lg text-xs font-semibold transition"
                >
                  📋 계좌번호 복사하기
                </button>
              </div>
            )}

            {orderType === 'pickup' && paymentMethod === 'card' && (
              <div className="bg-blue-50 rounded-xl p-4 mb-4 text-left border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-1">💳 현장 카드결제 안내</h3>
                <p className="text-xs text-gray-700 leading-relaxed">
                  카드결제로 예약이 정상 접수되었습니다.<br />
                  매장에 방문하셔서 픽업 시 카드로 결제해 주세요. (결제 금액: {totalAmount.toLocaleString()}원)
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Link href="/" className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl text-sm font-medium transition">
                홈으로
              </Link>
              <Link href="/orders" className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-xl text-sm font-medium transition">
                주문내역 확인
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-600">←</Link>
          <h1 className="text-lg font-bold text-gray-800">{shopName} - 주문하기</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 상품 선택 및 다중 상품 추가 (장바구니) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-gray-800">주문 상품 목록 ({totalItemCount}개)</label>
              <span className="text-xs text-gray-400">여러 상품을 한 번에 주문할 수 있습니다</span>
            </div>

            {/* 선택된 상품 리스트 */}
            <div className="space-y-3 mb-4">
              {cartItems.map((item, index) => (
                <div key={item.product.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200/60 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.product.price.toLocaleString()}원</p>
                  </div>

                  {/* 수량 조절 버튼 */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(index, -1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-gray-800">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(index, 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* 소계 */}
                    <span className="text-xs font-bold text-rose-500 w-16 text-right">
                      {(item.product.price * item.quantity).toLocaleString()}원
                    </span>

                    {/* 삭제 버튼 */}
                    {cartItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-gray-400 hover:text-red-500 text-xs p-1"
                        title="삭제"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 다른 상품 추가 드롭다운 */}
            <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
              <select
                onChange={e => {
                  if (e.target.value) {
                    addItem(parseInt(e.target.value));
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="flex-1 border border-dashed border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-600 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
              >
                <option value="" disabled>+ 다른 상품 추가하기</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    + {p.name} ({p.price.toLocaleString()}원)
                  </option>
                ))}
              </select>
            </div>

            {/* 총 결제 금액 요약 박스 */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between bg-rose-50/50 p-3 rounded-lg">
              <span className="text-xs font-medium text-gray-600">총 결제 예정 금액</span>
              <span className="text-base font-extrabold text-rose-500">{totalAmount.toLocaleString()}원</span>
            </div>
          </div>

          {/* 수령 방식 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3">수령 방식</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`py-3 rounded-lg text-sm font-medium transition border ${
                  orderType === 'delivery'
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                🚗 배달
              </button>
              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`py-3 rounded-lg text-sm font-medium transition border ${
                  orderType === 'pickup'
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                🏪 픽업
              </button>
            </div>
          </div>

          {/* 주문자 정보 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">주문자 정보</h3>
            <input
              type="text"
              placeholder="이름"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
              required
            />
            <input
              type="tel"
              placeholder="휴대전화 번호 (숫자만 입력해도 자동 변환)"
              value={phone}
              onChange={handlePhoneChange}
              maxLength={13}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
              required
            />
          </div>

          {/* 일시 선택 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              {orderType === 'delivery' ? '배달' : '픽업'} 일시
            </h3>
            <div className="grid grid-cols-4 gap-2">
              <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="border border-gray-200 rounded-lg px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200">
                {[2026, 2027].map(y => <option key={y} value={y}>{y}년</option>)}
              </select>
              <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="border border-gray-200 rounded-lg px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}월</option>)}
              </select>
              <select value={day} onChange={e => setDay(parseInt(e.target.value))} className="border border-gray-200 rounded-lg px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200">
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}일</option>)}
              </select>
              <select value={hour} onChange={e => setHour(parseInt(e.target.value))} className="border border-gray-200 rounded-lg px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200">
                {Array.from({ length: 13 }, (_, i) => i + 8).map(h => <option key={h} value={h}>{h}시</option>)}
              </select>
            </div>
            {orderType === 'delivery' && (
              <p className="mt-2 text-xs text-rose-500 font-medium bg-rose-50 rounded-lg px-3 py-2">
                ※ 배달 일시의 시간은 ±1시간 정도 차이가 날 수 있습니다.
              </p>
            )}
          </div>

          {/* 배송지 (배달 시) */}
          {orderType === 'delivery' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">배송지</h3>
              <div className="grid grid-cols-3 gap-2">
                <input type="text" placeholder="시" value={city} onChange={e => setCity(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                <input type="text" placeholder="구" value={district} onChange={e => setDistrict(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                <input type="text" placeholder="동" value={dong} onChange={e => setDong(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
              </div>
              <input type="text" placeholder="상세주소" value={addressDetail} onChange={e => setAddressDetail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
            </div>
          )}

          {/* 결제 방식 (픽업 선택 시) */}
          {orderType === 'pickup' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3">결제 방식</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setPaymentMethod('bank_transfer')}
                  className={`py-3 rounded-lg text-sm font-medium transition border ${
                    paymentMethod === 'bank_transfer' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}>
                  🏦 계좌이체
                </button>
                <button type="button" onClick={() => setPaymentMethod('card')}
                  className={`py-3 rounded-lg text-sm font-medium transition border ${
                    paymentMethod === 'card' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}>
                  💳 카드결제 (현장)
                </button>
              </div>
            </div>
          )}

          {/* 요청사항 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">요청사항</label>
            <textarea
              placeholder="리본 문구, 메시지 카드 등 요청사항을 입력하세요"
              value={request}
              onChange={e => setRequest(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 resize-none"
            />
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl text-sm font-semibold transition shadow-sm flex items-center justify-center gap-2 ${
              isSubmitting
                ? 'bg-gray-400 text-white cursor-not-allowed opacity-80'
                : 'bg-gray-800 hover:bg-gray-900 text-white active:scale-[0.99]'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>주문 접수 중입니다... 잠시만 기다려주세요</span>
              </>
            ) : (
              `총 ${totalAmount.toLocaleString()}원 주문 완료`
            )}
          </button>
        </form>
      </main>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p>로딩 중...</p></div>}>
      <OrderForm />
    </Suspense>
  );
}
