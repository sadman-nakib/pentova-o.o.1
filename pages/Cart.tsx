
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../App';

const Cart: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  const fetchCart = async () => {
    setLoading(true);
    // Fetching ONLY the required fields as requested, joining with products to get image_url
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        product_id,
        quantity,
        products (
          id,
          name,
          price,
          image_url,
          description
        )
      `)
      .eq('user_id', user?.id);
    
    if (error) {
      console.error('Error fetching cart:', error);
    } else if (data) {
      setItems(data);
    }
    setLoading(false);
  };

  const updateQuantity = async (id: string, newQty: number) => {
    if (newQty < 1) return;
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQty })
      .eq('id', id);
    
    if (!error) {
      setItems(items.map(item => item.id === id ? { ...item, quantity: newQty } : item));
    }
  };

  const removeItem = async (id: string) => {
    const { error } = await supabase.from('cart_items').delete().eq('id', id);
    if (!error) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const subtotal = items.reduce((acc, item) => {
    return acc + (item.products?.price || 0) * item.quantity;
  }, 0);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  if (items.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 py-32 text-center">
      <div className="mb-8 flex justify-center">
        <div className="p-8 glass rounded-[2.5rem] text-gray-500">
          <ShoppingBag size={64} strokeWidth={1} />
        </div>
      </div>
      <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase">Your bag is empty.</h1>
      <p className="text-gray-500 mb-10 max-w-md mx-auto font-light">
        Looks like you haven't added any tech masterpieces to your cart yet. Browse our collections to find something extraordinary.
      </p>
      <Link to="/products" className="inline-block bg-white text-black px-12 py-4 rounded-full font-bold hover:scale-105 transition-all shadow-xl">
        Explore Collections
      </Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-16 uppercase text-gradient">Your Bag</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Left: Items */}
        <div className="lg:col-span-2 space-y-10">
          {items.map((item) => (
            <div key={item.id} className="flex gap-6 pb-10 border-b border-white/5 last:border-0 group">
              <Link to={`/product/${item.product_id}`} className="w-32 h-32 md:w-48 md:h-48 glass rounded-3xl overflow-hidden flex-shrink-0 relative">
                {/* Using ONLY the products.image_url as required */}
                <img 
                  src={item.products?.image_url} 
                  alt={item.products?.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </Link>
              <div className="flex-grow flex flex-col">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-1">{item.products?.name}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-1 max-w-sm">{item.products?.description}</p>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-gray-500 hover:text-red-400 p-2 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
                
                <div className="mt-auto flex justify-between items-end">
                  <div className="flex items-center glass rounded-full px-2 py-1">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="text-xl font-black text-gradient">৳{((item.products?.price || 0) * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-1">
          <div className="glass p-10 rounded-[2.5rem] sticky top-24 border border-white/5 shadow-2xl">
            <h2 className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-8">Order Summary</h2>
            <div className="space-y-6">
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Subtotal</span>
                <span className="text-white font-bold">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Shipping</span>
                <span className="text-[10px] uppercase font-black tracking-widest text-blue-500">Calculated at checkout</span>
              </div>
              <div className="h-px bg-white/5 my-2"></div>
              <div className="flex justify-between items-end">
                <span className="text-white font-bold text-sm">Estimated Total</span>
                <span className="text-3xl font-black text-gradient">৳{subtotal.toLocaleString()}</span>
              </div>
              
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-white text-black py-5 rounded-full font-black mt-10 hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 shadow-xl"
              >
                Proceed to Checkout <ArrowRight size={20} />
              </button>
              
              <div className="mt-8 flex flex-col gap-4">
                 <div className="flex items-center gap-3 text-[10px] text-gray-600 uppercase tracking-widest justify-center">
                    <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                    Secure Pentova Processing
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
