'use client';

import { useEffect, useState } from 'react';

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
  product: { name: string; price: number };
}

export default function CalendarPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch('/api/admin/orders').then(r => r.json()).then(setOrders);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const ordersByDate: Record<string, Order[]> = {};
  orders.forEach(order => {
    if (!ordersByDate[order.deliveryDate]) ordersByDate[order.deliveryDate] = [];
    ordersByDate[order.deliveryDate].push(order);
  });

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedOrders(ordersByDate[dateStr] || []);
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">📅 일별 주문 캘린더</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <button onClick={prevMonth} className="text-gray-400 hover:text-gray-600 text-lg px-3 py-1">←</button>
          <h3 className="text-lg font-bold text-gray-800">{year}년 {month + 1}월</h3>
          <button onClick={nextMonth} className="text-gray-400 hover:text-gray-600 text-lg px-3 py-1">→</button>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-lg overflow-hidden">
          {['일', '월', '화', '수', '목', '금', '토'].map(d => (
            <div key={d} className="bg-gray-50 py-2 text-center text-xs font-semibold text-gray-500">{d}</div>
          ))}
          {days.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} className="bg-white p-2 min-h-[80px]" />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayOrders = ordersByDate[dateStr] || [];
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const isSelected = dateStr === selectedDate;

            return (
              <div key={day} onClick={() => handleDateClick(dateStr)}
                className={`bg-white p-2 min-h-[80px] cursor-pointer hover:bg-gray-50 transition ${isSelected ? 'ring-2 ring-gray-800 ring-inset' : ''}`}>
                <span className={`text-xs font-medium ${isToday ? 'bg-gray-800 text-white px-1.5 py-0.5 rounded-full' : 'text-gray-600'}`}>
                  {day}
                </span>
                {dayOrders.length > 0 && (
                  <div className="mt-1">
                    <span className="text-xs bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full font-medium">
                      {dayOrders.length}건
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected date details */}
      {selectedDate && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">📋 {selectedDate} 주문 내역</h3>
          {selectedOrders.length === 0 ? (
            <p className="text-gray-400 text-sm">해당 날짜에 주문이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {selectedOrders.map(order => (
                <div key={order.id} className={`border border-gray-100 rounded-lg p-3 ${order.isCompleted ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">{order.deliveryHour}시</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${order.orderType === 'delivery' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {order.orderType === 'delivery' ? '배달' : '픽업'}
                      </span>
                      <span className="text-xs text-gray-500">{order.paymentMethod === 'bank_transfer' ? '계좌이체' : '카드결제'}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${order.isCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.isCompleted ? '완료' : '접수'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{order.product.name} <span className="text-rose-500">{order.product.price.toLocaleString()}원</span></p>
                  <p className="text-xs text-gray-500 mt-1">{order.customerName} | {order.customerPhone}</p>
                  {order.orderType === 'delivery' && (
                    <p className="text-xs text-gray-400 mt-0.5">{order.addressCity} {order.addressDistrict} {order.addressDong} {order.addressDetail}</p>
                  )}
                  {order.request && <p className="text-xs text-amber-600 mt-1">📝 {order.request}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
