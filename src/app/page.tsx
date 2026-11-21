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
  const [shopName, setShopName] = useState('해이지 플레르');
  const [products, setProducts] = useState<Product[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts);
    fetch('/api/admin/settings').then(r => r.json()).then(data => {
      if (data.shop_name) setShopName(data.shop_name);
      setAnnouncement(data.announcement || '');
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">🌸 {shopName}</h1>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col"
              >
                {/* 세로 비율(aspect-[3/4]) 이미지 영역 - 세로 사진이 잘리지 않고 온전히 노출 */}
                <div
                  onClick={() => setViewProduct(product)}
                  className="w-full aspect-[3/4] bg-gray-50 overflow-hidden cursor-pointer relative group flex items-center justify-center"
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-50 to-rose-100 flex flex-col items-center justify-center">
                      <span className="text-6xl mb-2">🌷</span>
                      <span className="text-xs text-rose-400">사진 준비중</span>
                    </div>
                  )}
                  {/* 사진에 마우스 올렸을 때 힌트 오버레이 */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                      🔍 크게보기
                    </span>
                  </div>
                </div>

                {/* 상품 정보 */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-base">{product.name}</h3>
                    <p className="text-rose-500 font-bold text-base mt-1">{product.price.toLocaleString()}원</p>
                    {product.description && (
                      <p className="text-gray-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">{product.description}</p>
                    )}
                  </div>

                  {/* 2가지 버튼: 사진보기 / 구매하기 */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setViewProduct(product)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1"
                    >
                      <span>🔍</span> 사진보기
                    </button>
                    <Link
                      href={`/order?productId=${product.id}`}
                      className="bg-gray-800 hover:bg-gray-900 text-white py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>🛒</span> 구매하기
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 사진보기 모달 팝업 */}
      {viewProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setViewProduct(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            {/* 모달 상단 헤더 */}
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-base">{viewProduct.name}</h3>
              <button
                onClick={() => setViewProduct(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* 모달 원본 사진 표시 영역 (세로 사진 전체 보기) */}
            <div className="max-h-[60vh] bg-black/5 flex items-center justify-center overflow-hidden">
              {viewProduct.imageUrl ? (
                <img
                  src={viewProduct.imageUrl}
                  alt={viewProduct.name}
                  className="max-h-[60vh] w-auto object-contain"
                />
              ) : (
                <div className="py-20 text-center">
                  <span className="text-6xl">🌷</span>
                  <p className="text-gray-400 text-xs mt-2">등록된 이미지가 없습니다.</p>
                </div>
              )}
            </div>

            {/* 모달 하단 정보 및 구매 버튼 */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl font-bold text-rose-500">{viewProduct.price.toLocaleString()}원</span>
              </div>
              {viewProduct.description && (
                <p className="text-gray-600 text-xs whitespace-pre-line leading-relaxed mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {viewProduct.description}
                </p>
              )}
              <Link
                href={`/order?productId=${viewProduct.id}`}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <span>🛒</span> 이 상품 구매하러 가기
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
