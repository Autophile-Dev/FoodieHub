import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Loader2, 
  CheckCircle2, 
  ShoppingBag,
  Wallet,
  Banknote,
  ChevronRight,
  Trash2,
  Home,
  Briefcase,
  Map as MapIcon,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

interface Address {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
}

interface CheckoutPageProps {
  items: CartItem[];
  total: number;
  orderType: string;
  branch: string;
  onBack: () => void;
  onSuccess: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
}

type PaymentMethod = 'cash' | 'card' | 'wallet';

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  items,
  total,
  orderType,
  branch,
  onBack,
  onSuccess,
  onRemoveItem,
  onUpdateQuantity
}) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'checkout' | 'success'>('checkout');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: auth.currentUser?.displayName || '',
    phone: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!auth.currentUser) return;
      const path = 'addresses';
      try {
        const q = query(collection(db, path), where('userId', '==', auth.currentUser.uid));
        const snapshot = await getDocs(q);
        const addressData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Address[];
        setAddresses(addressData);
        
        const defaultAddr = addressData.find(a => a.isDefault) || addressData[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setFormData(prev => ({ ...prev, address: defaultAddr.address }));
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    };

    fetchAddresses();
  }, []);

  const handleAddressSelect = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setFormData(prev => ({ ...prev, address: addr.address }));
  };

  const getLabelIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'home': return <Home size={14} />;
      case 'office': return <Briefcase size={14} />;
      default: return <MapIcon size={14} />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (items.length === 0) return;

    setLoading(true);
    const path = 'orders';
    try {
      await addDoc(collection(db, path), {
        userId: auth.currentUser.uid,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        total,
        status: 'pending',
        orderType,
        branch,
        paymentMethod,
        customerInfo: formData,
        createdAt: serverTimestamp(),
      });
      setStep('success');
      setTimeout(() => {
        onSuccess();
        onBack();
      }, 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12 }}
          className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-100"
        >
          <CheckCircle2 size={56} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-black text-gray-900 mb-2">Order Confirmed!</h2>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto">
            Your order has been placed successfully. We'll start preparing your delicious meal right away!
          </p>
          <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold">
            <Loader2 className="animate-spin" size={18} />
            <span>Redirecting to menu...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F8F9FB] h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-6 flex items-center gap-4 shrink-0">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-500"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-900">Checkout</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Review & Pay</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Order Details & Payment */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Order Items */}
            <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <ShoppingBag size={20} className="text-emerald-500" />
                  Order Summary
                </h3>
                <span className="text-xs font-bold text-gray-400">{items.length} Items</span>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-colors group">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 truncate">{item.name}</h4>
                      <p className="text-xs text-gray-400 font-medium">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-gray-100 rounded-lg px-2 py-1">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-emerald-600 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-emerald-600 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <button 
                        onClick={() => onRemoveItem(item.id)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400 font-medium">Your cart is empty</p>
                    <button onClick={onBack} className="text-emerald-500 font-bold text-sm mt-2">Go back to menu</button>
                  </div>
                )}
              </div>
            </section>

            {/* Payment Methods */}
            <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                <Wallet size={20} className="text-emerald-500" />
                Payment Method
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'cash', label: 'Cash', icon: Banknote, desc: 'Pay at your door' },
                  { id: 'card', label: 'Card', icon: CreditCard, desc: 'Debit or Credit' },
                  { id: 'wallet', label: 'Wallet', icon: Wallet, desc: 'Digital payment' },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                    className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${
                      paymentMethod === method.id 
                        ? 'border-emerald-500 bg-emerald-50/50' 
                        : 'border-gray-100 hover:border-emerald-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      paymentMethod === method.id ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <method.icon size={20} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${paymentMethod === method.id ? 'text-emerald-900' : 'text-gray-700'}`}>
                        {method.label}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">{method.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Delivery Info & Totals */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Delivery Details Form */}
            <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                <MapPin size={20} className="text-emerald-500" />
                Delivery Details
              </h3>

              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      required
                      type="text"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all text-sm"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      required
                      type="tel"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                {orderType === 'delivery' && (
                  <div className="space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Delivery Address</div>
                    {addresses.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {addresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => handleAddressSelect(addr)}
                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                              selectedAddressId === addr.id 
                                ? 'border-emerald-500 bg-emerald-50/50' 
                                : 'border-gray-100 hover:border-emerald-200'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              selectedAddressId === addr.id ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                              {getLabelIcon(addr.label)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900">{addr.label}</p>
                              <p className="text-[10px] text-gray-500 truncate">{addr.address}</p>
                            </div>
                            {selectedAddressId === addr.id && (
                              <Check size={16} className="text-emerald-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                        No saved addresses found. Please enter manually below.
                      </p>
                    )}

                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-gray-400" size={18} />
                      <textarea
                        required
                        placeholder="Complete Delivery Address"
                        value={formData.address}
                        onChange={e => {
                          setFormData({ ...formData, address: e.target.value });
                          setSelectedAddressId(null);
                        }}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all min-h-[100px] resize-none text-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Order Notes</div>
                  <textarea
                    placeholder="Notes for the chef (Optional)"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all min-h-[80px] resize-none text-sm"
                  />
                </div>
              </form>
            </section>

            {/* Summary & Place Order */}
            <section className="bg-emerald-900 rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-200">
              <h3 className="text-xl font-black mb-6">Payment Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-emerald-300">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-300">
                  <span className="font-medium">Delivery Fee</span>
                  <span className="font-bold">$0.00</span>
                </div>
                <div className="pt-4 border-t border-emerald-800 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-black text-emerald-500">Total Amount</p>
                    <p className="text-3xl font-black">${total.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest font-black text-emerald-500">Method</p>
                    <p className="text-sm font-bold capitalize">{paymentMethod}</p>
                  </div>
                </div>
              </div>

              <button
                form="checkout-form"
                disabled={loading || items.length === 0}
                type="submit"
                className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-black/20 hover:bg-emerald-400 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    Place Order
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
              
              <p className="text-center mt-4 text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                Secure SSL Encrypted Payment
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
