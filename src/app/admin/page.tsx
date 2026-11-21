'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, todayOrders: 0 });

  useEffect(() => {
    fetch('/api/admin/orders').then(r => r.json()).then((orders: any[]) => {
      const today = new Date().toISOString().split('T')[0];
      setStats({
        total: orders.length,
        pending: orders.filter(o => !o.isCompleted).length,
        completed: orders.filter(o => o.isCompleted).length,
        todayOrders: orders.filter(o => o.deliveryDate === today).length,
      });
    });
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">대시보드</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">전체 주문</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">미완료</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">완료</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">오늘 배달/픽업</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.todayOrders}</p>
        </div>
      </div>
    </div>
  );
}
