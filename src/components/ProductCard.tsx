'use client';

import React, { useState } from 'react';
import { Eye, ArrowRight, ShoppingBag, Plus } from 'lucide-react';
import ExampleModal from './ExampleModal';
import { useStore } from './ThemeContextProvider';

export interface ProductItem {
  id: number;
  code: string;
  name: string;
  price: number;
  description: string;
  footnote?: string | null;
  exampleImagesJson: string;
  briefType: string;
}

interface ProductCardProps {
  product: ProductItem;
  onSelectToBrief: (product: ProductItem) => void;
}

export default function ProductCard({ product, onSelectToBrief }: ProductCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { addToCart } = useStore();

  let images: string[] = [];
  try {
    images = JSON.parse(product.exampleImagesJson || '[]');
  } catch {
    images = [];
  }

  const firstImage = images.length > 0 ? images[0] : '/images/avatar.gif';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      code: product.code,
      name: product.name,
      price: product.price,
      briefType: product.briefType,
    });
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md border border-rose-100 transition-all duration-300 flex flex-col justify-between group hover:border-rose-300">
        <div>
          {/* Top thumbnail & Example button */}
          <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden bg-rose-50 mb-3.5">
            <img
              src={firstImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Price Badge */}
            <div className="absolute top-2.5 right-2.5 bg-rose-500/90 backdrop-blur-md text-white font-extrabold text-xs sm:text-sm px-3 py-1 rounded-full shadow-md font-thai">
              {product.price} ฿
            </div>

            {/* In-page EXAMPLE Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(true);
              }}
              className="absolute bottom-2.5 left-2.5 bg-white/95 hover:bg-white text-rose-600 font-bold text-xs px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>EXAMPLE</span>
            </button>
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold text-gray-800 font-thai line-clamp-1 mb-1">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-500 font-thai line-clamp-2 leading-relaxed mb-3">
            {product.description}
          </p>

          {/* Footnote if available */}
          {product.footnote && (
            <p className="text-[11px] text-rose-500 font-thai font-medium mb-3 italic">
              {product.footnote}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2 border-t border-rose-50">
          <button
            type="button"
            onClick={handleAddToCart}
            title="เพิ่มลงในตะกร้า"
            className="w-10 h-10 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onSelectToBrief(product)}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-bold text-xs sm:text-sm font-thai shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>สั่งตัด / บรีฟงาน</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* In-Page Popup Gallery */}
      <ExampleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        productName={product.name}
        images={images}
      />
    </>
  );
}
