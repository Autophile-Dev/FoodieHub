import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, 
  ShoppingBag, 
  Heart, 
  MapPin, 
  User, 
  Settings, 
  LogOut,
  LogIn,
  X,
  Utensils,
  ChevronRight
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: FirebaseUser | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
  onOpenAddresses: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  onLogin, 
  onLogout,
  onOpenWishlist,
  onOpenOrders,
  onOpenAddresses 
}) => {
  const navItems = [
    { icon: LayoutGrid, label: 'Explore Menu', active: true, onClick: onClose },
    { icon: ShoppingBag, label: 'My Orders', onClick: () => { onOpenOrders(); onClose(); } },
    { icon: MapPin, label: 'My Addresses', onClick: () => { onOpenAddresses(); onClose(); } },
    { icon: Heart, label: 'My Favourite', onClick: () => { onOpenWishlist(); onClose(); } },
    { icon: User, label: 'Profile', onClick: onClose },
    { icon: Settings, label: 'Settings', onClick: onClose },
  ];
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-2xl z-50 flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                  <Utensils size={20} />
                </div>
                <span className="font-black text-gray-800 tracking-tight">Foodie<span className="text-emerald-500">Hub</span></span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                    item.active 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                      : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon size={20} />
                    <span className="font-bold text-sm">{item.label}</span>
                  </div>
                  {!item.active && <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-100">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-2">
                    <img 
                      src={user.photoURL || ''} 
                      alt={user.displayName || 'User'} 
                      className="w-10 h-10 rounded-full border-2 border-emerald-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{user.displayName}</p>
                      <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { onLogout(); onClose(); }}
                    className="flex items-center gap-4 px-4 py-3 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all w-full"
                  >
                    <LogOut size={20} />
                    <span className="font-bold text-sm">Logout</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => { onLogin(); onClose(); }}
                  className="flex items-center gap-4 px-4 py-3 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all w-full"
                >
                  <LogIn size={20} />
                  <span className="text-sm">Login / Sign Up</span>
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
