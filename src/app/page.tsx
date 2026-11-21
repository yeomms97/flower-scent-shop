'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts);
    fetch('/api/admin/settings').then(r => r.json()).then(data => {
      setAnnouncement(data.announcement || '');
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">🌸 꽃향기 플라워</h1>
          <Link
            href="/orders"
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition"
          >
            주문내역 확인
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Announcement */}
        {announcement && (
          <div className="bg-white rounded-xl p-5 mb-6 shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">📢 공지사항</h2>
            <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">{announcement}</p>
          </div>
        )}

        {/* Product List */}
        <h2 className="text-lg font-bold text-gray-800 mb-4">상품 목록</h2>
        {products.length === 0 ? (
          <p className="text-gray-400 text-center py-10">등록된 상품이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((product) => (
              <Link key={product.id} href={`/order?productId=${product.id}`}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition cursor-pointer">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center">
                      <span className="text-5xl">🌷</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800">{product.name}</h3>
                    <p className="text-rose-500 font-bold mt-1">{product.price.toLocaleString()}원</p>
                    {product.description && (
                      <p className="text-gray-500 text-sm mt-2 line-clamp-2">{product.description}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
