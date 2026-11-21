'use client';

import { useEffect, useState } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', price: 0, description: '', imageUrl: '', isAvailable: true });
  const [uploading, setUploading] = useState(false);

  const loadProducts = () => {
    fetch('/api/admin/products').then(r => r.json()).then(setProducts);
  };

  useEffect(() => { loadProducts(); }, []);

  const resetForm = () => {
    setForm({ name: '', price: 0, description: '', imageUrl: '', isAvailable: true });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (p: Product) => {
    setForm({ name: p.name, price: p.price, description: p.description, imageUrl: p.imageUrl, isAvailable: p.isAvailable });
    setEditing(p);
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    setForm(prev => ({ ...prev, imageUrl: data.url }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { alert('상품명을 입력해주세요.'); return; }
    if (form.price <= 0) { alert('가격을 입력해주세요.'); return; }

    const url = '/api/admin/products';
    const method = editing ? 'PUT' : 'POST';
    const body = editing ? { ...form, id: editing.id } : form;

    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    loadProducts();
    resetForm();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
    loadProducts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">상품 관리</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          + 상품 등록
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">{editing ? '상품 수정' : '상품 등록'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="상품명" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
            <input type="number" placeholder="가격" value={form.price || ''} onChange={e => setForm(p => ({ ...p, price: parseInt(e.target.value) || 0 }))}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
            <textarea placeholder="상품 설명" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none md:col-span-2" />
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">상품 이미지</label>
              <input type="file" accept="image/*" onChange={handleImageUpload}
                className="text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
              {uploading && <span className="text-xs text-gray-400 ml-2">업로드 중...</span>}
              {form.imageUrl && <img src={form.imageUrl} alt="preview" className="mt-2 h-24 rounded-lg object-cover" />}
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isAvailable" checked={form.isAvailable} onChange={e => setForm(p => ({ ...p, isAvailable: e.target.checked }))} />
              <label htmlFor="isAvailable" className="text-sm text-gray-600">판매중</label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
              {editing ? '수정' : '등록'}
            </button>
            <button onClick={resetForm} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition">
              취소
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${!p.isAvailable ? 'opacity-50' : ''}`}>
            {p.imageUrl ? (
              <img src={p.imageUrl} alt={p.name} className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-40 bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center"><span className="text-4xl">🌷</span></div>
            )}
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-800">{p.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {p.isAvailable ? '판매중' : '품절'}
                </span>
              </div>
              <p className="text-rose-500 font-bold text-sm">{p.price.toLocaleString()}원</p>
              {p.description && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{p.description}</p>}
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleEdit(p)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition">수정</button>
                <button onClick={() => handleDelete(p.id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg transition">삭제</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
