import React from 'react';
import { X, Star, Heart, Plus, Minus, ShieldCheck, Clock, Truck } from 'lucide-react';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDetailsModalProps {
  product: Product;
  quantity: number;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onAdd: () => void;
  onRemove: () => void;
  onClose: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  quantity,
  isWishlisted,
  onToggleWishlist,
  onAdd,
  onRemove,
  onClose,
}) => {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-10 overflow-hidden">
        {/* Immersive Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0A0A0A]/95 backdrop-blur-2xl"
        >
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/10 blur-[120px]" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: 'spring', damping: 30, stiffness: 200 }}
          className="relative w-full max-w-6xl h-full md:h-[85vh] bg-[#FDFCFB] md:rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col md:flex-row"
        >
          {/* Close Button - Minimal & Elegant */}
          <button
            onClick={onClose}
            className="absolute top-8 right-8 z-40 p-4 bg-white/10 backdrop-blur-md rounded-full text-white md:text-gray-400 hover:text-gray-900 hover:bg-white transition-all duration-500 group"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform duration-500" />
          </button>

          {/* Left Side: Immersive Image Gallery Style */}
          <div className="w-full md:w-[55%] h-[50vh] md:h-full relative overflow-hidden">
            <motion.div 
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
              className="w-full h-full"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            
            {/* Elegant Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#FDFCFB] via-transparent to-black/20" />
            
            <div className="absolute bottom-12 left-12 right-12 flex items-end justify-between">
              <motion.div 
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className={`${s <= 4 ? 'text-amber-400 fill-amber-400' : 'text-white/30'}`} />
                  ))}
                </div>
                <span className="text-white md:text-gray-900 text-xs font-bold tracking-[0.3em] uppercase">
                  Exceptional Quality
                </span>
              </motion.div>

              {product.discount && (
                <motion.div 
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.7, type: 'spring' }}
                  className="w-24 h-24 rounded-full bg-orange-500 flex flex-col items-center justify-center text-white shadow-2xl shadow-orange-500/40"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">Save</span>
                  <span className="text-xl font-black">{product.discount}</span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Side: Editorial Content */}
          <div className="w-full md:w-[45%] h-full flex flex-col p-10 md:p-16 lg:p-20 bg-[#FDFCFB]">
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-4 mb-8"
              >
                <span className="h-px w-12 bg-emerald-500" />
                <span className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.4em]">
                  {product.category}
                </span>
              </motion.div>

              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="font-serif text-5xl md:text-6xl lg:text-7xl text-gray-900 mb-8 leading-[0.9] italic"
              >
                {product.name}
              </motion.h2>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-8 mb-12 border-y border-gray-100 py-6"
              >
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-gray-400" />
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">20 MIN</span>
                </div>
                <div className="flex items-center gap-3">
                  <Truck size={18} className="text-gray-400" />
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">FREE DELIVERY</span>
                </div>
              </motion.div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-gray-500 text-lg leading-relaxed mb-12 font-light italic"
              >
                "{product.description || "A masterpiece of culinary art, crafted with passion and the finest seasonal ingredients to create an unforgettable dining experience."}"
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-4 mb-12"
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-100">
                      <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" />
                    </div>
                  ))}
                </div>
                <span className="text-xs font-medium text-gray-400">Loved by 2.4k+ foodies</span>
              </motion.div>
            </div>

            {/* Footer: The Grand Action */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-auto pt-12 flex flex-col gap-8"
            >
              <div className="flex items-end justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Investment</span>
                  <span className="text-5xl font-serif italic text-gray-900">${product.price.toFixed(2)}</span>
                </div>
                
                <button 
                  onClick={onToggleWishlist}
                  className={`group flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-500 ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 hover:text-red-400'}`}
                >
                  <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-4">
                {quantity > 0 ? (
                  <div className="flex items-center bg-gray-900 rounded-full p-2 shadow-2xl">
                    <button
                      onClick={onRemove}
                      className="w-14 h-14 flex items-center justify-center text-white hover:bg-gray-800 rounded-full transition-all"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="w-14 text-center text-white font-serif italic text-2xl">{quantity}</span>
                    <button
                      onClick={onAdd}
                      className="w-14 h-14 flex items-center justify-center text-white hover:bg-gray-800 rounded-full transition-all"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onAdd}
                    className="flex-1 bg-gray-900 text-white h-20 rounded-full font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-emerald-600 transition-all duration-700 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] group"
                  >
                    <Plus size={20} className="group-hover:rotate-180 transition-transform duration-700" />
                    Reserve Selection
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
