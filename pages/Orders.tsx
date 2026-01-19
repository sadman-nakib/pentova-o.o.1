
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../App';
import { Order } from '../types';
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    
    if (data) setOrders(data);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'cod_pending': return <Clock className="text-orange-400" size={18} />;
      case 'processing': return <Package className="text-blue-400" size={18} />;
      case 'shipped': return <Truck className="text-purple-400" size={18} />;
      case 'delivered': return <CheckCircle className="text-emerald-400" size={18} />;
      case 'cancelled': return <XCircle className="text-red-400" size={18} />;
      default: return <Clock className="text-gray-400" size={18} />;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-16 uppercase">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 glass rounded-[3rem]">
          <p className="text-gray-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="glass p-8 md:p-12 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-8 border border-white/5 hover:border-white/20 transition-all">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] bg-white/10 px-3 py-1 rounded-full text-gray-400 font-bold uppercase tracking-widest">#{order.id.slice(0, 8)}</span>
                  <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="text-3xl font-black text-gradient mb-2">৳{order.grand_total.toLocaleString()}</h3>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                  {getStatusIcon(order.status)}
                  {formatStatus(order.status)}
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-2 text-sm text-gray-400">
                <p><span className="text-gray-600">Method:</span> <span className="text-white">{order.payment_method.toUpperCase()}</span></p>
                <p><span className="text-gray-600">Items:</span> <span className="text-white">৳{order.subtotal.toLocaleString()}</span></p>
                <p><span className="text-gray-600">Delivery:</span> <span className="text-white">৳{order.delivery_charge}</span></p>
              </div>

              <div className="pt-6 md:pt-0 md:pl-8 md:border-l border-white/10">
                <button className="w-full md:w-auto px-10 py-4 glass rounded-full font-bold hover:bg-white/10 transition-colors uppercase text-xs tracking-widest">
                  Track Package
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
