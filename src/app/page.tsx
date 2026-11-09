'use client';

import React, { useEffect, useState, useRef } from 'react';
import ProfileHeader from '@/components/ProfileHeader';
import ProductCard, { ProductItem } from '@/components/ProductCard';
import BriefFormA from '@/components/BriefFormA';
import BriefFormB from '@/components/BriefFormB';
import QueueModal from '@/components/QueueModal';
import { Sparkles, Scissors, Layers, MessageSquareQuote } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [activeBriefTab, setActiveBriefTab] = useState<'FORM_A' | 'FORM_B'>('FORM_A');

  // Queue Modal state
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [queueNumber, setQueueNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);

  const briefSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectToBrief = (prod: ProductItem) => {
    setSelectedProduct(prod);
    if (prod.briefType === 'FORM_B') {
      setActiveBriefTab('FORM_B');
    } else {
      setActiveBriefTab('FORM_A');
    }
    // Scroll smoothly to brief form
    setTimeout(() => {
      briefSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleQueueSuccess = (result: {
    queueNumber: string;
    customerName: string;
    totalPrice: number;
  }) => {
    setQueueNumber(result.queueNumber);
    setCustomerName(result.customerName);
    setTotalPrice(result.totalPrice);
    setQueueModalOpen(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-28 pt-4">
      {/* 1. Profile Header with Bio and 4 Links */}
      <ProfileHeader />

      {/* 2. Shop Section (หน้าร้าน) */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold font-thai mb-2 shadow-sm">
          <Scissors className="w-3.5 h-3.5" />
          <span>ROV Skin Cutting Service</span>
        </div>
        {/* Verbatim Heading */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 font-thai tracking-tight flex items-center justify-center gap-1.5">
          <span>ตัดรูป ROV กับเชอไน้ !</span>
          <Sparkles className="w-5 h-5 text-rose-500 fill-rose-300" />
        </h2>
        {/* Verbatim Subheading */}
        <p className="text-sm sm:text-base text-rose-600 font-thai font-medium mt-1">
          ลูกค้าสนใจตัดรูปแบบไหนจิ้มเล้ยย
        </p>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-left">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-5 shadow-sm border border-rose-100 h-64 animate-pulse flex flex-col justify-between"
              >
                <div className="w-full h-32 bg-rose-50 rounded-2xl" />
                <div className="w-2/3 h-5 bg-rose-50 rounded mt-3" />
                <div className="w-full h-4 bg-rose-50 rounded mt-2" />
              </div>
            ))
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectToBrief={handleSelectToBrief}
              />
            ))
          )}
        </div>

        {/* Required Footnotes */}
        <div className="mt-6 p-4 rounded-3xl bg-white border border-rose-100 text-left shadow-sm space-y-1">
          <p className="text-xs text-rose-500 font-thai font-medium leading-relaxed">
            *1.3 สำหรับลูกค้าที่มีหน้าโหลดหรือกรอบใสอยู่แล้ว
          </p>
          <p className="text-xs text-rose-500 font-thai font-medium leading-relaxed">
            *1.4 สำหรับลูกค้าที่มีเพียงชื่อ ไม่มีหน้าโหลดหรือกรอบใส
          </p>
        </div>
      </div>

      {/* 3. Brief Form Section (หน้าบรีฟงาน) */}
      <div id="brief-section" ref={briefSectionRef} className="pt-6">
        {/* Form Selector Tabs (Form A vs Form B) */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex rounded-2xl bg-white p-1.5 border border-rose-100 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveBriefTab('FORM_A')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-thai transition-all ${
                activeBriefTab === 'FORM_A'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                  : 'text-gray-600 hover:text-rose-600'
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>บรีฟตัดรูป (Form A)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveBriefTab('FORM_B')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-thai transition-all ${
                activeBriefTab === 'FORM_B'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>บรีฟใส่ลิงก์ (Form B)</span>
            </button>
          </div>
        </div>

        {/* Active Form */}
        {activeBriefTab === 'FORM_A' ? (
          <BriefFormA
            initialProduct={selectedProduct}
            onSubmitSuccess={handleQueueSuccess}
          />
        ) : (
          <BriefFormB
            initialProduct={selectedProduct}
            onSubmitSuccess={handleQueueSuccess}
          />
        )}
      </div>

      {/* 4. Queue Modal Popup */}
      <QueueModal
        isOpen={queueModalOpen}
        onClose={() => setQueueModalOpen(false)}
        queueNumber={queueNumber}
        customerName={customerName}
        totalPrice={totalPrice}
      />
    </div>
  );
}
