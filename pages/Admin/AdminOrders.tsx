
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Order } from '../../types';
import { Search, Package, Truck, CheckCircle, XCircle, Mail, Phone, MapPin, Calendar, Hash } from 'lucide-react';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    // Fetching ONLY from the requested admin_orders view
    const { data, error } = await supabase
      .from('admin_orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching admin orders:', error);
    } else if (data) {
      setOrders(data);
    }
    setLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    // We update the orders table directly as views are usually read-only
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } else {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
    }
  };

  const getDeliveryZoneLabel = (zone?: string) => {
    return zone === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka';
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">Admin Fulfillment</h1>
          <p className="text-gray-500 uppercase tracking-widest text-[10px] font-black mt-2">Manage customer gadgets and delivery</p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search ID, Name, Phone or Email..." 
            className="w-full bg-white/5 border border-white/10 rounded-full pl-16 pr-6 py-4 outline-none focus:border-white/30 transition-all text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-8">
        {loading ? (
          <div className="animate-pulse space-y-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-64 glass rounded-[3rem]"></div>)}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 glass rounded-[3rem]">
            <p className="text-gray-500">No matching orders found.</p>
          </div>
        ) : filteredOrders.map((order) => (
          <div key={order.id} className="glass p-8 md:p-12 rounded-[3rem] border border-white/5 hover:border-white/10 transition-all overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Order Identity & Status */}
              <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-white/5 pb-8 lg:pb-0 lg:pr-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[10px] bg-white text-black px-3 py-1 rounded-full font-black uppercase tracking-widest">
                    #{order.id.slice(0, 8)}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar size={14} />
                    {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-1">Total Amount</p>
                  <h3 className="text-4xl font-black text-gradient">৳{order.grand_total.toLocaleString()}</h3>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Pending', value: 'cod_pending', color: 'bg-orange-500/10 text-orange-400', icon: <Package size={12} /> },
                      { label: 'Process', value: 'processing', color: 'bg-blue-500/10 text-blue-400', icon: <Package size={12} /> },
                      { label: 'Ship', value: 'shipped', color: 'bg-purple-500/10 text-purple-400', icon: <Truck size={12} /> },
                      { label: 'Done', value: 'delivered', color: 'bg-emerald-500/10 text-emerald-400', icon: <CheckCircle size={12} /> },
                      { label: 'Cancel', value: 'cancelled', color: 'bg-red-500/10 text-red-400', icon: <XCircle size={12} /> }
                    ].map(status => (
                      <button
                        key={status.value}
                        onClick={() => updateStatus(order.id, status.value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${order.status === status.value ? status.color + ' ring-1 ring-white/20' : 'glass text-gray-500 hover:text-white'}`}
                      >
                        {status.icon} {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="lg:col-span-8 flex flex-col justify-between">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-2">
                        <Hash size={12} /> Full Name
                      </div>
                      <p className="text-lg font-bold text-white">{order.customer_name}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-2">
                        <Mail size={12} /> Email Address
                      </div>
                      <p className="text-sm text-gray-300 font-medium">{order.customer_email || 'No email provided'}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-2">
                        <Phone size={12} /> Contact Number
                      </div>
                      <p className="text-lg font-black text-blue-400">{order.customer_phone}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-2">
                        <Truck size={12} /> Delivery Zone
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                          {getDeliveryZoneLabel(order.delivery_zone)}
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                          COD
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-2">
                        <MapPin size={12} /> Full Address
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed italic">
                        "{order.customer_address}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap gap-8 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <div className="flex flex-col gap-1">
                    <span>Subtotal</span>
                    <span className="text-white">৳{order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span>Delivery</span>
                    <span className="text-white">৳{order.delivery_charge}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span>Status</span>
                    <span className="text-blue-500">{order.status.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;
