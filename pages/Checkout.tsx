
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../App';
import { CartItem, DeliveryZone } from '../types';
import { Truck, CreditCard, ChevronRight, CheckCircle2 } from 'lucide-react';

const Checkout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [items, setItems] = useState<CartItem[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([
    { id: 'inside_dhaka', name: 'Inside Dhaka', charge: 60 },
    { id: 'outside_dhaka', name: 'Outside Dhaka', charge: 120 }
  ]);
  const [selectedZone, setSelectedZone] = useState<string>('inside_dhaka');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: ''
  });

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  const fetchCart = async () => {
    const { data } = await supabase
      .from('cart_items')
      .select(`*, product:products(*)`)
      .eq('user_id', user?.id);
    
    if (data) setItems(data as any);
    if (data?.length === 0) navigate('/cart');
    setLoading(false);
  };

  const subtotal = items.reduce((acc, item) => (acc + (item.product?.price || 0) * item.quantity), 0);
  const delivery_charge = zones.find(z => z.id === selectedZone)?.charge || 0;
  const grandTotal = subtotal + delivery_charge;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.phone) {
      alert('Please fill in all details');
      return;
    }

    const delivery_zone = selectedZone;
    
    // Debug protection as requested
    console.log("delivery_zone being sent:", delivery_zone);
    
    // Validation check
    if (delivery_zone !== 'inside_dhaka' && delivery_zone !== 'outside_dhaka') {
      console.error("Critical Error: Invalid delivery_zone selected.");
      alert('An error occurred with the delivery zone selection. Please refresh and try again.');
      return;
    }

    setSubmitting(true);
    try {
      const pricing = {
        subtotal,
        delivery_charge,
        total_price: subtotal,
        grand_total: subtotal + delivery_charge,
      };

      // 1. Create Order using the requested exact field structure
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          payment_method: 'cod',
          status: 'cod_pending',
          subtotal: pricing.subtotal,
          delivery_charge: pricing.delivery_charge,
          total_price: pricing.total_price,
          grand_total: pricing.grand_total,
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_address: formData.address,
          delivery_zone: delivery_zone,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Payment Record
      await supabase.from('payments').insert({
        order_id: order.id,
        amount: pricing.grand_total,
        status: 'pending',
        payment_method: 'cod'
      });

      // 3. Clear Cart
      await supabase.from('cart_items').delete().eq('user_id', user.id);

      setOrderComplete(true);
    } catch (err) {
      console.error("Order creation failed:", err);
      alert('Failed to place order. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="mb-10 flex justify-center">
          <div className="p-8 bg-emerald-500/10 rounded-[3rem] text-emerald-500 animate-bounce">
            <CheckCircle2 size={80} strokeWidth={1} />
          </div>
        </div>
        <h1 className="text-5xl font-black tracking-tighter mb-4">ORDER CONFIRMED.</h1>
        <p className="text-gray-500 mb-12 max-w-md mx-auto">
          Your order has been placed successfully. We'll start processing your gadgets right away.
        </p>
        <button onClick={() => navigate('/orders')} className="bg-white text-black px-12 py-4 rounded-full font-bold hover:scale-105 transition-all">
          View Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-16 uppercase">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Left: Forms */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 glass rounded-2xl flex items-center justify-center text-blue-500">
                <Truck size={20} />
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight">Shipping Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 px-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-colors"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 px-1">Phone Number</label>
                <input 
                  required
                  type="tel" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-colors"
                  placeholder="01xxxxxxxxx"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 px-1">Full Delivery Address</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-colors"
                  placeholder="Street, House, Area..."
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 glass rounded-2xl flex items-center justify-center text-purple-500">
                <Truck size={20} />
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight">Delivery Zone</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {zones.map(zone => (
                <button
                  type="button"
                  key={zone.id}
                  onClick={() => setSelectedZone(zone.id)}
                  className={`relative p-8 rounded-3xl text-left transition-all border-2 ${selectedZone === zone.id ? 'border-white glass' : 'border-white/5 bg-transparent opacity-60'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg">{zone.name}</h3>
                      <p className="text-sm text-gray-400">Arrives in {zone.id === 'inside_dhaka' ? '24-48h' : '3-5 days'}</p>
                    </div>
                    <p className="text-xl font-black">৳{zone.charge}</p>
                  </div>
                  {selectedZone === zone.id && (
                    <div className="absolute -top-2 -right-2 bg-white text-black rounded-full p-1">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 glass rounded-2xl flex items-center justify-center text-emerald-500">
                <CreditCard size={20} />
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tight">Payment Method</h2>
            </div>
            <div className="p-8 glass rounded-3xl border border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="font-bold">Cash on Delivery</h3>
                  <p className="text-xs text-emerald-500/70 uppercase tracking-widest font-black mt-1">Active</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">No Online Payment Required</div>
            </div>
          </section>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-1">
          <div className="glass p-10 rounded-[2.5rem] sticky top-24">
            <h2 className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-8">Summary</h2>
            <div className="space-y-4 mb-8">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-400 max-w-[150px] truncate">{item.product?.name} x{item.quantity}</span>
                  <span className="font-bold">৳{((item.product?.price || 0) * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-6 pt-6 border-t border-white/10">
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Subtotal</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Shipping</span>
                <span>৳{delivery_charge}</span>
              </div>
              <div className="flex justify-between items-end pt-4">
                <span className="font-black text-white">Grand Total</span>
                <span className="text-3xl font-black text-gradient">৳{grandTotal.toLocaleString()}</span>
              </div>
              
              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-white text-black py-5 rounded-full font-black mt-6 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {submitting ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
