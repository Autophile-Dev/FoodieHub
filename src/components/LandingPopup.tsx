import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ShoppingBag, Truck, UtensilsCrossed, Check, Search, ChevronDown } from 'lucide-react';

interface LandingPopupProps {
  isOpen: boolean;
  onComplete: (orderType: string, branch: string) => void;
}

const ORDER_TYPES = [
  { id: 'delivery', name: 'Delivery', icon: Truck, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'pickup', name: 'Pickup', icon: ShoppingBag, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'dine-in', name: 'Dine-in', icon: UtensilsCrossed, color: 'text-orange-500', bg: 'bg-orange-50' },
];

const BRANCHES = [
  { id: 'downtown', name: 'Downtown Branch', address: '123 Main St, City Center' },
  { id: 'uptown', name: 'Uptown Branch', address: '456 Park Ave, North Side' },
  { id: 'westside', name: 'Westside Branch', address: '789 Beach Rd, West Coast' },
  { id: 'eastside', name: 'Eastside Branch', address: '321 East Blvd, Business District' },
  { id: 'suburb', name: 'Suburban Branch', address: '555 Oak Ln, Residential Area' },
];

export const LandingPopup: React.FC<LandingPopupProps> = ({ isOpen, onComplete }) => {
  const [selectedOrderType, setSelectedOrderType] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  
  const [isOrderTypeDropdownOpen, setIsOrderTypeDropdownOpen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  
  const [orderTypeSearch, setOrderTypeSearch] = useState('');
  const [branchSearch, setBranchSearch] = useState('');

  const orderTypeRef = useRef<HTMLDivElement>(null);
  const branchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('foodiehub_selection');
      if (saved) {
        const { orderType, branch } = JSON.parse(saved);
        setSelectedOrderType(orderType);
        setSelectedBranch(branch);
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (orderTypeRef.current && !orderTypeRef.current.contains(event.target as Node)) {
        setIsOrderTypeDropdownOpen(false);
      }
      if (branchRef.current && !branchRef.current.contains(event.target as Node)) {
        setIsBranchDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFinish = () => {
    if (selectedOrderType && selectedBranch) {
      localStorage.setItem('foodiehub_selection', JSON.stringify({
        orderType: selectedOrderType,
        branch: selectedBranch
      }));
      onComplete(selectedOrderType, selectedBranch);
    }
  };

  const filteredOrderTypes = ORDER_TYPES.filter(type => 
    type.name.toLowerCase().includes(orderTypeSearch.toLowerCase())
  );

  const filteredBranches = BRANCHES.filter(branch => 
    branch.name.toLowerCase().includes(branchSearch.toLowerCase()) ||
    branch.address.toLowerCase().includes(branchSearch.toLowerCase())
  );

  const currentOrderType = ORDER_TYPES.find(t => t.id === selectedOrderType);
  const currentBranch = BRANCHES.find(b => b.id === selectedBranch);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl"
        >
          <div className="p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-100">
                <UtensilsCrossed className="text-white" size={28} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">Welcome to FoodieHub</h2>
              <p className="text-sm text-gray-500">Please select your preferences to start ordering</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Type Dropdown */}
              <div className="space-y-2" ref={orderTypeRef}>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">1. Order Type</label>
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsOrderTypeDropdownOpen(!isOrderTypeDropdownOpen);
                      setIsBranchDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 bg-white ${
                      isOrderTypeDropdownOpen ? 'border-emerald-500 ring-4 ring-emerald-500/5' : 'border-gray-100 hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {currentOrderType ? (
                        <>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentOrderType.bg} ${currentOrderType.color}`}>
                            <currentOrderType.icon size={18} />
                          </div>
                          <span className="font-bold text-sm text-gray-800">{currentOrderType.name}</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400 font-medium">Select order type...</span>
                      )}
                    </div>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isOrderTypeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isOrderTypeDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                      >
                        <div className="p-3 border-b border-gray-50">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                              type="text"
                              placeholder="Search order type..."
                              value={orderTypeSearch}
                              onChange={(e) => setOrderTypeSearch(e.target.value)}
                              className="w-full bg-gray-50 border-none rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <div className="max-h-[200px] overflow-y-auto p-2 space-y-1">
                          {filteredOrderTypes.length > 0 ? (
                            filteredOrderTypes.map((type) => (
                              <button
                                key={type.id}
                                onClick={() => {
                                  setSelectedOrderType(type.id);
                                  setIsOrderTypeDropdownOpen(false);
                                  setOrderTypeSearch('');
                                }}
                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                                  selectedOrderType === type.id ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${type.bg} ${type.color}`}>
                                    <type.icon size={18} />
                                  </div>
                                  <span className="font-bold text-sm">{type.name}</span>
                                </div>
                                {selectedOrderType === type.id && <Check size={16} strokeWidth={3} />}
                              </button>
                            ))
                          ) : (
                            <div className="py-8 text-center text-gray-400 text-xs">No results found</div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Branch Dropdown */}
              <div className="space-y-2" ref={branchRef}>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">2. Select Branch</label>
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsBranchDropdownOpen(!isBranchDropdownOpen);
                      setIsOrderTypeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 bg-white ${
                      isBranchDropdownOpen ? 'border-emerald-500 ring-4 ring-emerald-500/5' : 'border-gray-100 hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {currentBranch ? (
                        <>
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                            <MapPin size={18} />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-sm text-gray-800">{currentBranch.name}</p>
                            <p className="text-[10px] text-gray-400 line-clamp-1">{currentBranch.address}</p>
                          </div>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400 font-medium">Select branch...</span>
                      )}
                    </div>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isBranchDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isBranchDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                      >
                        <div className="p-3 border-b border-gray-50">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                              type="text"
                              placeholder="Search branch..."
                              value={branchSearch}
                              onChange={(e) => setBranchSearch(e.target.value)}
                              className="w-full bg-gray-50 border-none rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <div className="max-h-[200px] overflow-y-auto p-2 space-y-1">
                          {filteredBranches.length > 0 ? (
                            filteredBranches.map((branch) => (
                              <button
                                key={branch.id}
                                onClick={() => {
                                  setSelectedBranch(branch.id);
                                  setIsBranchDropdownOpen(false);
                                  setBranchSearch('');
                                }}
                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left ${
                                  selectedBranch === branch.id ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                    <MapPin size={18} />
                                  </div>
                                  <div>
                                    <p className="font-bold text-sm">{branch.name}</p>
                                    <p className="text-[10px] text-gray-400">{branch.address}</p>
                                  </div>
                                </div>
                                {selectedBranch === branch.id && <Check size={16} strokeWidth={3} />}
                              </button>
                            ))
                          ) : (
                            <div className="py-8 text-center text-gray-400 text-xs">No results found</div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <button
              disabled={!selectedOrderType || !selectedBranch}
              onClick={handleFinish}
              className="w-full mt-10 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              Start Ordering
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
