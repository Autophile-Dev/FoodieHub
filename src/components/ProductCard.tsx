import React from 'react';
import { Plus, Minus, Star, Heart } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  quantity: number;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onAdd: () => void;
  onRemove: () => void;
  onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  quantity, 
  isWishlisted,
  onToggleWishlist,
  onAdd, 
  onRemove, 
  onClick 
}) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onClick}
      className={`group bg-white rounded-[2rem] pt-4 px-4 pb-7 border transition-all relative overflow-hidden shadow-md cursor-pointer ${
        quantity > 0 ? 'border-emerald-500 shadow-xl shadow-emerald-100' : 'border-gray-100 hover:shadow-2xl hover:shadow-gray-200'
      }`}
    >
      <div className="aspect-square rounded-[1.5rem] overflow-hidden mb-5 relative">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        
        {/* Favorite Button */}
        <div className="absolute top-3 right-3 z-10">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist();
            }}
            className={`p-2.5 backdrop-blur-md rounded-full transition-all shadow-sm ${
              isWishlisted 
                ? 'bg-red-50 text-red-500 shadow-inner' 
                : 'bg-white/80 text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full z-10 shadow-lg shadow-orange-200 uppercase tracking-wider">
            {product.discount}
          </div>
        )}

        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg shadow-sm">
          <Star size={12} className="text-yellow-400 fill-yellow-400" />
          <span className="text-[10px] font-bold text-gray-700">4.8</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-bold text-gray-800 leading-tight line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
              {product.description}
            </p>
          )}
        </div>
        
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Price</span>
            <span className="text-lg font-black text-gray-900">${product.price.toFixed(2)}</span>
          </div>

          {quantity > 0 ? (
            <div 
              className="flex items-center bg-gray-900 rounded-2xl p-1 shadow-lg shadow-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="w-8 h-8 flex items-center justify-center text-white hover:bg-gray-800 rounded-xl transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-white font-bold text-sm">{quantity}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd();
                }}
                className="w-8 h-8 flex items-center justify-center text-white hover:bg-gray-800 rounded-xl transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
              className="w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 active:scale-90"
            >
              <Plus size={20} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
