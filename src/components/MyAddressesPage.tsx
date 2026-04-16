import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  Loader2, 
  Home, 
  Briefcase, 
  Map as MapIcon,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

interface Address {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
  userId: string;
}

interface MyAddressesPageProps {
  onBack: () => void;
}

export const MyAddressesPage: React.FC<MyAddressesPageProps> = ({ onBack }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({ label: 'Home', address: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const path = 'addresses';
    const q = query(
      collection(db, path),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const addressData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Address[];
      setAddresses(addressData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !formData.address.trim()) return;

    setSubmitting(true);
    const path = 'addresses';
    try {
      if (editingAddress) {
        await updateDoc(doc(db, path, editingAddress.id), {
          label: formData.label,
          address: formData.address,
        });
      } else {
        // If it's the first address, make it default
        const isDefault = addresses.length === 0;
        await addDoc(collection(db, path), {
          userId: auth.currentUser.uid,
          label: formData.label,
          address: formData.address,
          isDefault,
          createdAt: serverTimestamp(),
        });
      }
      setIsModalOpen(false);
      setEditingAddress(null);
      setFormData({ label: 'Home', address: '' });
    } catch (error) {
      handleFirestoreError(error, editingAddress ? OperationType.UPDATE : OperationType.CREATE, path);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    const path = 'addresses';
    try {
      await deleteDoc(doc(db, path, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const setAsDefault = async (id: string) => {
    if (!auth.currentUser) return;
    const path = 'addresses';
    try {
      const batch = writeBatch(db);
      
      // Set all others to false
      addresses.forEach(addr => {
        if (addr.isDefault) {
          batch.update(doc(db, path, addr.id), { isDefault: false });
        }
      });
      
      // Set this one to true
      batch.update(doc(db, path, id), { isDefault: true });
      
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const getLabelIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'home': return <Home size={18} />;
      case 'office': return <Briefcase size={18} />;
      default: return <MapIcon size={18} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8F9FB] h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900">My Addresses</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Saved Locations</p>
          </div>
        </div>
        <button 
          onClick={() => {
            setEditingAddress(null);
            setFormData({ label: 'Home', address: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all"
        >
          <Plus size={18} />
          Add New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p className="font-bold text-sm uppercase tracking-widest">Loading addresses...</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <MapPin size={32} className="text-gray-200" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">No addresses saved</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
                Add your delivery addresses for a faster checkout experience.
              </p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all"
              >
                Add Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <motion.div
                  key={addr.id}
                  layout
                  className={`bg-white rounded-3xl p-6 border transition-all relative group ${
                    addr.isDefault ? 'border-emerald-500 shadow-md ring-4 ring-emerald-500/5' : 'border-gray-100 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        addr.isDefault ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {getLabelIcon(addr.label)}
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900">{addr.label}</h4>
                        {addr.isDefault && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Default Address</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingAddress(addr);
                          setFormData({ label: addr.label, address: addr.address });
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(addr.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 font-medium leading-relaxed mb-6 line-clamp-2">
                    {addr.address}
                  </p>

                  {!addr.isDefault && (
                    <button 
                      onClick={() => setAsDefault(addr.id)}
                      className="w-full py-2.5 border border-gray-100 rounded-xl text-xs font-bold text-gray-500 hover:border-emerald-500 hover:text-emerald-500 transition-all"
                    >
                      Set as Default
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                  </h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Delivery Location</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Label</label>
                  <div className="flex gap-2">
                    {['Home', 'Office', 'Other'].map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setFormData({ ...formData, label })}
                        className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 border-2 ${
                          formData.label === label 
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-100' 
                            : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        {getLabelIcon(label)}
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Complete Address</label>
                  <textarea
                    required
                    placeholder="Enter your full address, building, floor, etc."
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all min-h-[120px] resize-none text-sm font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <>
                      {editingAddress ? 'Update Address' : 'Save Address'}
                      <Check size={20} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
