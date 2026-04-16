import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Clock, 
  ChevronRight, 
  Package, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Calendar,
  MapPin,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'delivered' | 'cancelled';
  orderType: string;
  branch: string;
  paymentMethod: string;
  createdAt: any;
  customerInfo: {
    name: string;
    phone: string;
    address?: string;
  };
}

interface MyOrdersPageProps {
  onBack: () => void;
  onReorder: (items: OrderItem[]) => void;
}

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({ onBack, onReorder }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const path = 'orders';
    const q = query(
      collection(db, path),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const generateSampleOrders = async () => {
    if (!auth.currentUser) return;
    setGenerating(true);
    const path = 'orders';
    try {
      const samples = [
        {
          items: [
            { id: '1', name: 'Classic Cheeseburger', price: 12.99, quantity: 2, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
            { id: '5', name: 'Crispy French Fries', price: 4.99, quantity: 1, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80' }
          ],
          total: 30.97,
          status: 'delivered'
        },
        {
          items: [
            { id: '8', name: 'Pepperoni Feast Pizza', price: 18.99, quantity: 1, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80' },
            { id: '12', name: 'Garden Fresh Salad', price: 9.99, quantity: 1, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80' }
          ],
          total: 28.98,
          status: 'delivered'
        }
      ];

      for (const sample of samples) {
        await addDoc(collection(db, path), {
          userId: auth.currentUser.uid,
          ...sample,
          orderType: 'delivery',
          branch: 'Downtown Hub',
          paymentMethod: 'card',
          customerInfo: {
            name: auth.currentUser.displayName || 'Valued Customer',
            phone: '123-456-7890',
            address: '123 Sample Street, Food City'
          },
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setGenerating(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'text-orange-500 bg-orange-50';
      case 'preparing': return 'text-blue-500 bg-blue-50';
      case 'delivered': return 'text-emerald-500 bg-emerald-50';
      case 'cancelled': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'preparing': return <Package size={14} />;
      case 'delivered': return <CheckCircle2 size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8F9FB] h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-6 flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900">My Orders</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Order History</p>
          </div>
        </div>
        <button
          onClick={generateSampleOrders}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all disabled:opacity-50"
        >
          {generating ? <Loader2 className="animate-spin" size={14} /> : <Package size={14} />}
          Generate Samples
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p className="font-bold text-sm uppercase tracking-widest">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag size={32} className="text-gray-200" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
                Looks like you haven't placed any orders yet. Explore our menu and find something delicious!
              </p>
              <button 
                onClick={onBack}
                className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all"
              >
                Explore Menu
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <motion.div
                key={order.id}
                layoutId={order.id}
                onClick={() => setSelectedOrder(order)}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                      <ShoppingBag size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900">Order #{order.id.slice(-6).toUpperCase()}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        <Calendar size={10} />
                        {order.createdAt?.toDate().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="shrink-0 relative">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-gray-100" />
                      {item.quantity > 1 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                          {item.quantity}
                        </span>
                      )}
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 text-xs font-bold border border-gray-100">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      Total Amount
                      <p className="text-lg font-black text-gray-900">${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onReorder(order.items);
                      }}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold text-xs hover:bg-emerald-600 transition-all shadow-sm shadow-emerald-100"
                    >
                      Reorder
                    </button>
                    <button className="flex items-center gap-2 text-emerald-500 font-bold text-sm group-hover:translate-x-1 transition-transform">
                      View Details
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              layoutId={selectedOrder.id}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Order Details</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Order #{selectedOrder.id.toUpperCase()}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Status & Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Status</div>
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold w-fit ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="capitalize">{selectedOrder.status}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Order Type</div>
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 w-fit">
                      <Package size={16} className="text-emerald-500" />
                      <span className="capitalize">{selectedOrder.orderType} • {selectedOrder.branch}</span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Items Ordered</div>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                        <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover shadow-sm" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 truncate">{item.name}</h4>
                          <p className="text-xs text-gray-400 font-medium">${item.price.toFixed(2)} x {item.quantity}</p>
                        </div>
                        <div className="text-sm font-black text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery & Payment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-4">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                      <MapPin size={12} />
                      Delivery Address
                    </div>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">
                      {selectedOrder.customerInfo.address || 'Pickup from branch'}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                      <CreditCard size={12} />
                      Payment Details
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-bold">
                      <span className="capitalize">{selectedOrder.paymentMethod}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-emerald-600">Paid</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50 border-t border-gray-100 shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Paid</p>
                    <p className="text-3xl font-black text-emerald-600">${selectedOrder.total.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        onReorder(selectedOrder.items);
                        setSelectedOrder(null);
                      }}
                      className="px-8 py-3 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
                    >
                      Reorder Now
                    </button>
                    <button className="px-8 py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm">
                      Download Invoice
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
