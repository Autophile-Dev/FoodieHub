import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Menu as MenuIcon, ShoppingCart, Star, ArrowRight, Utensils, X, Heart, User, LogOut } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { CartModal } from './components/CartModal';
import { WishlistModal } from './components/WishlistModal';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { LandingPopup } from './components/LandingPopup';
import { CheckoutPage } from './components/CheckoutPage';
import { MyOrdersPage } from './components/MyOrdersPage';
import { MyAddressesPage } from './components/MyAddressesPage';
import { AuthModal } from './components/AuthModal';
import { CATEGORIES, PRODUCTS } from './data';
import { CartItem, Product } from './types';
import { motion } from 'motion/react';
import { MapPin, Truck, ShoppingBag, UtensilsCrossed, ChevronDown } from 'lucide-react';
import { auth, loginWithGoogle, logout } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isAddressesOpen, setIsAddressesOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLandingPopupOpen, setIsLandingPopupOpen] = useState(() => {
    return !localStorage.getItem('foodiehub_selection');
  });
  const [orderType, setOrderType] = useState(() => {
    const saved = localStorage.getItem('foodiehub_selection');
    return saved ? JSON.parse(saved).orderType : '';
  });
  const [branch, setBranch] = useState(() => {
    const saved = localStorage.getItem('foodiehub_selection');
    return saved ? JSON.parse(saved).branch : '';
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const productsByCategory = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const filtered = PRODUCTS.filter((product) => 
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query))
    );

    const grouped: Record<string, Product[]> = {};
    CATEGORIES.forEach(cat => {
      if (cat.id === 'all') return;
      const catProducts = filtered.filter(p => p.category === cat.id);
      if (catProducts.length > 0) {
        grouped[cat.id] = catProducts;
      }
    });
    return grouped;
  }, [searchQuery]);

  const scrollToCategory = (categoryId: string) => {
    if (categoryId === 'all') {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      setSelectedCategory('all');
      return;
    }

    const element = document.getElementById(`category-${categoryId}`);
    if (element && scrollContainerRef.current) {
      const containerTop = scrollContainerRef.current.getBoundingClientRect().top;
      const elementTop = element.getBoundingClientRect().top;
      // Adjusted offset to account for the sticky category header height + margin
      const scrollOffset = elementTop - containerTop + scrollContainerRef.current.scrollTop - 90;
      
      scrollContainerRef.current.scrollTo({
        top: scrollOffset,
        behavior: 'smooth'
      });
      setSelectedCategory(categoryId);
    }
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing) {
        const newQuantity = existing.quantity + delta;
        if (newQuantity <= 0) {
          return prev.filter((item) => item.id !== productId);
        }
        return prev.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        );
      }
      return prev;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const getQuantity = (productId: string) => {
    return cart.find((item) => item.id === productId)?.quantity || 0;
  };

  const wishlistItems = useMemo(() => {
    return PRODUCTS.filter(p => wishlist.includes(p.id));
  }, [wishlist]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalWithTax = cartTotal * 1.1;

  const handleCheckoutTrigger = () => {
    if (!user) {
      setAuthMode('login');
      setIsAuthModalOpen(true);
    } else {
      setIsCartOpen(false);
      setIsCheckoutOpen(true);
    }
  };

  const handleReorder = (items: any[]) => {
    setCart(prev => {
      const newCart = [...prev];
      items.forEach(item => {
        const existingIndex = newCart.findIndex(c => c.id === item.id);
        if (existingIndex > -1) {
          newCart[existingIndex] = {
            ...newCart[existingIndex],
            quantity: newCart[existingIndex].quantity + item.quantity
          };
        } else {
          const product = PRODUCTS.find(p => p.id === item.id);
          if (product) {
            newCart.push({ ...product, quantity: item.quantity });
          } else {
            newCart.push({
              id: item.id,
              name: item.name,
              price: item.price,
              image: item.image,
              quantity: item.quantity,
              category: 'Other',
              isVeg: false
            });
          }
        }
      });
      return newCart;
    });
    setIsOrdersOpen(false);
    setIsCartOpen(true);
  };

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex h-screen bg-[#F8F9FB] font-sans overflow-hidden relative">
      {!isCheckoutOpen && !isOrdersOpen && !isAddressesOpen && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          user={user}
          onLogin={() => {
            setAuthMode('login');
            setIsAuthModalOpen(true);
          }}
          onLogout={logout}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenOrders={() => {
            if (!user) {
              setAuthMode('login');
              setIsAuthModalOpen(true);
            } else {
              setIsOrdersOpen(true);
            }
          }}
          onOpenAddresses={() => {
            if (!user) {
              setAuthMode('login');
              setIsAuthModalOpen(true);
            } else {
              setIsAddressesOpen(true);
            }
          }}
        />
      )}

      {isCheckoutOpen ? (
        <CheckoutPage 
          items={cart}
          total={totalWithTax}
          orderType={orderType}
          branch={branch}
          onBack={() => setIsCheckoutOpen(false)}
          onSuccess={() => setCart([])}
          onRemoveItem={removeFromCart}
          onUpdateQuantity={updateQuantity}
        />
      ) : isOrdersOpen ? (
        <MyOrdersPage 
          onBack={() => setIsOrdersOpen(false)} 
          onReorder={handleReorder}
        />
      ) : isAddressesOpen ? (
        <MyAddressesPage onBack={() => setIsAddressesOpen(false)} />
      ) : (
        <main className="flex-1 flex flex-col p-8 overflow-hidden">
          {/* Header Top Bar */}
          <div className="flex items-center justify-between mb-6 pt-2">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2.5 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-emerald-500 hover:border-emerald-100 transition-all shadow-sm"
              >
                <MenuIcon size={20} />
              </button>

              {orderType && branch && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 md:gap-3 bg-white border border-gray-100 px-2 md:px-4 py-1.5 md:py-2 rounded-xl shadow-sm cursor-pointer hover:border-emerald-100 transition-colors"
                  onClick={() => setIsLandingPopupOpen(true)}
                >
                  <div className="flex items-center gap-1 md:gap-2 pr-2 md:pr-3 border-r border-gray-100">
                    {orderType === 'delivery' && <Truck size={14} className="text-blue-500" />}
                    {orderType === 'pickup' && <ShoppingBag size={14} className="text-emerald-500" />}
                    {orderType === 'dine-in' && <UtensilsCrossed size={14} className="text-orange-500" />}
                    <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest text-gray-400">{orderType}</span>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
                    <MapPin size={14} className="text-gray-400 shrink-0" />
                    <span className="text-[10px] md:text-[11px] font-bold text-gray-700 capitalize truncate max-w-[60px] md:max-w-none">{branch}</span>
                    <ChevronDown size={12} className="text-gray-300 shrink-0" />
                  </div>
                </motion.div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <Utensils className="text-white" size={20} />
              </div>
              <span className="text-xl font-black tracking-tight text-gray-800">Foodie<span className="text-emerald-500">Hub</span></span>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsWishlistOpen(true)}
                className="relative p-2.5 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm flex items-center gap-2"
              >
                <Heart size={20} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {wishlist.length}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-emerald-500 hover:border-emerald-100 transition-all shadow-sm"
              >
                <ShoppingCart size={20} />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-8 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search for your favorite food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-12 text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
        >
          {/* Hero Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-48 rounded-3xl overflow-hidden mb-8 bg-emerald-600 text-white group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/60 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80" 
              alt="Promotion"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="relative z-20 h-full flex flex-col justify-center px-10 max-w-lg">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-2">
                <Star size={12} fill="currentColor" />
                <span>Special Offer</span>
              </div>
              <h1 className="text-3xl font-black mb-2 leading-tight">Get 50% Discount on your first order!</h1>
              <p className="text-emerald-50/80 text-sm mb-4">Use code: <span className="font-bold text-white">WELCOME50</span></p>
              <button className="flex items-center gap-2 bg-white text-emerald-600 px-6 py-2.5 rounded-xl font-bold text-sm w-fit hover:bg-emerald-50 transition-colors">
                Order Now
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>

          {/* Categories */}
          <div className="sticky top-0 z-30 bg-[#F8F9FB]/90 backdrop-blur-md py-3 -mx-4 px-4 mb-8 border-b border-gray-100 shadow-sm">
            <div className="overflow-hidden">
              <CategoryFilter
                categories={CATEGORIES}
                selectedId={selectedCategory}
                onSelect={scrollToCategory}
              />
            </div>
          </div>

          {/* Product Sections */}
          <div className="space-y-20 pb-12">
            {Object.keys(productsByCategory).length > 0 ? (
              Object.entries(productsByCategory).map(([catId, products]) => {
                const category = CATEGORIES.find(c => c.id === catId);
                const productList = products as Product[];
                return (
                  <section key={catId} id={`category-${catId}`} className="scroll-mt-[90px]">
                    {category?.banner && (
                      <div className="relative h-48 rounded-3xl overflow-hidden mb-6 shadow-md">
                        <img 
                          src={category.banner} 
                          alt={category.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mb-6">
                      <h2 className="text-2xl font-black text-gray-900">{category?.name}</h2>
                      <div className="h-px flex-1 bg-gray-100" />
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{productList.length} Items</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                      {productList.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          quantity={getQuantity(product.id)}
                          isWishlisted={wishlist.includes(product.id)}
                          onToggleWishlist={() => toggleWishlist(product.id)}
                          onAdd={() => addToCart(product)}
                          onRemove={() => updateQuantity(product.id, -1)}
                          onClick={() => setSelectedProduct(product)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Search size={40} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-500 max-w-xs mx-auto">
                  We couldn't find any food matching "{searchQuery}". Try searching for something else!
                </p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                  }}
                  className="mt-6 text-emerald-500 font-bold hover:underline"
                >
                  Clear search
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    )}

      <CartModal 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={handleCheckoutTrigger}
      />

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        items={wishlistItems}
        onRemove={toggleWishlist}
        onAddToCart={addToCart}
      />

      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          quantity={getQuantity(selectedProduct.id)}
          isWishlisted={wishlist.includes(selectedProduct.id)}
          onToggleWishlist={() => toggleWishlist(selectedProduct.id)}
          onAdd={() => addToCart(selectedProduct)}
          onRemove={() => updateQuantity(selectedProduct.id, -1)}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <LandingPopup 
        isOpen={isLandingPopupOpen}
        onComplete={(type, br) => {
          if (br !== branch) {
            setCart([]);
          }
          setOrderType(type);
          setBranch(br);
          setIsLandingPopupOpen(false);
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
