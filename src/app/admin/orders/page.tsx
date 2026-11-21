'use client';

import { useEffect, useState, useMemo } from 'react';

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

type SortKey = 'isCompleted' | 'createdAt' | 'deliveryDate' | 'productName' | 'customerName';
type DateFilterType = 'all' | 'created' | 'delivery';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortAsc, setSortAsc] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // 날짜 필터 상태
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadOrders = () => {
    fetch('/api/admin/orders').then(r => r.json()).then(setOrders);
  };

  useEffect(() => { loadOrders(); }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  // 날짜 퀵 필터 헬퍼
  const setQuickDate = (type: 'today' | 'week' | 'month' | 'all') => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (type === 'all') {
      setDateFilterType('all');
      setStartDate('');
      setEndDate('');
      return;
    }

    if (dateFilterType === 'all') {
      setDateFilterType('delivery'); // 기본은 배달/픽업 일자 기준
    }

    if (type === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (type === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      setStartDate(startOfWeek.toISOString().split('T')[0]);
      setEndDate(endOfWeek.toISOString().split('T')[0]);
    } else if (type === 'month') {
      const year = now.getFullYear();
      const month = now.getMonth();
      const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
      const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(lastDay);
    }
  };

  // 날짜 필터링 적용
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (dateFilterType === 'all') return true;
      if (!startDate && !endDate) return true;

      let targetDateStr = '';
      if (dateFilterType === 'created') {
        targetDateStr = new Date(order.createdAt).toISOString().split('T')[0];
      } else {
        targetDateStr = order.deliveryDate;
      }

      if (startDate && targetDateStr < startDate) return false;
      if (endDate && targetDateStr > endDate) return false;
      return true;
    });
  }, [orders, dateFilterType, startDate, endDate]);

  // 정렬 적용
  const sortedOrders = useMemo(() => {
    const sorted = [...filteredOrders].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'isCompleted': cmp = Number(a.isCompleted) - Number(b.isCompleted); break;
        case 'createdAt': cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break;
        case 'deliveryDate': cmp = `${a.deliveryDate}${a.deliveryHour}`.localeCompare(`${b.deliveryDate}${b.deliveryHour}`); break;
        case 'productName': cmp = a.product.name.localeCompare(b.product.name); break;
        case 'customerName': cmp = a.customerName.localeCompare(b.customerName); break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return sorted;
  }, [filteredOrders, sortKey, sortAsc]);

  const toggleComplete = async (order: Order) => {
    await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: order.id, isCompleted: !order.isCompleted }),
    });
    loadOrders();
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/admin/orders?id=${id}`, { method: 'DELETE' });
    setDeleteConfirm(null);
    loadOrders();
  };

  // 엑셀 다운로드 (시/구/동/상세주소 개별 컬럼 분리)
  const downloadExcel = async () => {
    const XLSX = await import('xlsx');
    const data = sortedOrders.map(o => ({
      '완료': o.isCompleted ? 'O' : '',
      '주문일시': new Date(o.createdAt).toLocaleString('ko-KR'),
      '배달/픽업일시': `${o.deliveryDate} ${o.deliveryHour}시`,
      '수령방식': o.orderType === 'delivery' ? '배달' : '픽업',
      '결제방식': o.paymentMethod === 'bank_transfer' ? '계좌이체' : '카드결제',
      '상품명': o.product.name,
      '가격': o.product.price,
      '고객성함': o.customerName,
      '전화번호': o.customerPhone,
      '시': o.orderType === 'delivery' ? o.addressCity : '',
      '구': o.orderType === 'delivery' ? o.addressDistrict : '',
      '동': o.orderType === 'delivery' ? o.addressDong : '',
      '상세주소': o.orderType === 'delivery' ? o.addressDetail : '',
      '요청사항': o.request,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '주문내역');
    const filterInfo = dateFilterType === 'all' ? '전체' : `${dateFilterType === 'created' ? '주문일' : '배달일'}_${startDate || '시작'}~${endDate || '종료'}`;
    XLSX.writeFile(wb, `꽃집_주문내역_${filterInfo}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <th onClick={() => toggleSort(sortKeyName)}
      className="px-3 py-3 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:text-gray-800 select-none whitespace-nowrap">
      {label} {sortKey === sortKeyName ? (sortAsc ? '↑' : '↓') : ''}
    </th>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">주문 관리</h2>
          <p className="text-xs text-gray-500 mt-1">
            조회 결과: <span className="font-semibold text-gray-800">{sortedOrders.length}건</span> (전체 {orders.length}건)
          </p>
        </div>
        <button onClick={downloadExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2">
          <span>📥</span> 엑셀 다운로드 (.xlsx)
        </button>
      </div>

      {/* 날짜 조회 필터 바 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
        <div className="flex flex-wrap items-center gap-3">
          {/* 기준 선택 */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setDateFilterType('all')}
              className={`px-3 py-1.5 rounded-md transition ${dateFilterType === 'all' ? 'bg-white text-gray-800 shadow-sm font-semibold' : 'text-gray-600 hover:text-gray-800'}`}
            >
              전체 기간
            </button>
            <button
              onClick={() => { setDateFilterType('delivery'); if (!startDate) setQuickDate('today'); }}
              className={`px-3 py-1.5 rounded-md transition ${dateFilterType === 'delivery' ? 'bg-white text-gray-800 shadow-sm font-semibold' : 'text-gray-600 hover:text-gray-800'}`}
            >
              🚗 배달/픽업일 기준
            </button>
            <button
              onClick={() => { setDateFilterType('created'); if (!startDate) setQuickDate('today'); }}
              className={`px-3 py-1.5 rounded-md transition ${dateFilterType === 'created' ? 'bg-white text-gray-800 shadow-sm font-semibold' : 'text-gray-600 hover:text-gray-800'}`}
            >
              🕒 주문접수일 기준
            </button>
          </div>

          {/* 날짜 범위 선택 (전체 기간이 아닐 때) */}
          {dateFilterType !== 'all' && (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <span className="text-gray-400 text-xs">~</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              {/* 빠른 선택 버튼 */}
              <div className="flex items-center gap-1 ml-1">
                <button
                  onClick={() => setQuickDate('today')}
                  className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1.5 rounded-lg transition"
                >
                  오늘
                </button>
                <button
                  onClick={() => setQuickDate('week')}
                  className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1.5 rounded-lg transition"
                >
                  이번 주
                </button>
                <button
                  onClick={() => setQuickDate('month')}
                  className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1.5 rounded-lg transition"
                >
                  이번 달
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 주문 목록 테이블 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <SortHeader label="완료" sortKeyName="isCompleted" />
              <SortHeader label="주문 일시" sortKeyName="createdAt" />
              <SortHeader label="배달/픽업 일시" sortKeyName="deliveryDate" />
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">수령/결제</th>
              <SortHeader label="상품" sortKeyName="productName" />
              <SortHeader label="손님" sortKeyName="customerName" />
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sortedOrders.map(order => (
              <tr key={order.id} className={`hover:bg-gray-50 transition ${order.isCompleted ? 'opacity-40' : ''}`}>
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={order.isCompleted}
                    onChange={() => toggleComplete(order)}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                </td>
                <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">
                  {new Date(order.createdAt).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-3 py-3 text-xs text-gray-800 font-medium whitespace-nowrap">
                  {order.deliveryDate} {order.deliveryHour}시
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full inline-block w-fit ${order.orderType === 'delivery' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {order.orderType === 'delivery' ? '배달' : '픽업'}
                    </span>
                    <span className="text-xs text-gray-500">{order.paymentMethod === 'bank_transfer' ? '계좌이체' : '카드결제'}</span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <p className="text-sm font-medium text-gray-800">{order.product.name}</p>
                  <p className="text-xs text-rose-500">{order.product.price.toLocaleString()}원</p>
                </td>
                <td className="px-3 py-3">
                  <p className="text-sm font-medium text-gray-800">{order.customerName}</p>
                  <p className="text-xs text-gray-500">{order.customerPhone}</p>
                  {order.orderType === 'delivery' && (
                    <p className="text-xs text-gray-400 mt-0.5">{order.addressCity} {order.addressDistrict} {order.addressDong} {order.addressDetail}</p>
                  )}
                  {order.request && <p className="text-xs text-amber-600 mt-0.5">📝 {order.request}</p>}
                </td>
                <td className="px-3 py-3">
                  {deleteConfirm === order.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(order.id)} className="text-xs bg-red-500 text-white px-2 py-1 rounded transition hover:bg-red-600">확인</button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded transition hover:bg-gray-300">취소</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(order.id)} className="text-xs text-red-400 hover:text-red-600 transition">삭제</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedOrders.length === 0 && (
          <p className="text-center text-gray-400 py-10">
            {orders.length === 0 ? '등록된 주문 내역이 없습니다.' : '선택한 기간에 일치하는 주문 내역이 없습니다.'}
          </p>
        )}
      </div>
    </div>
  );
}
