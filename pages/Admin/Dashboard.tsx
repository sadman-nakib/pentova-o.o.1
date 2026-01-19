
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Package, ShoppingCart, Users, TrendingUp, ChevronRight, LayoutGrid, DollarSign, Activity, Settings, Database } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    customers: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
      const { count: orderCount, data: orders } = await supabase.from('orders').select('grand_total');
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

      const totalRevenue = orders?.reduce((acc, curr) => acc + curr.grand_total, 0) || 0;

      setStats({
        products: prodCount || 0,
        orders: orderCount || 0,
        revenue: totalRevenue,
        customers: userCount || 0
      });
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 reveal-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
        <div>
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-4 block">System Control</span>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase text-white leading-none">
            CENTRAL<span className="text-gradient">.</span>
          </h1>
          <p className="text-slate-500 uppercase tracking-widest text-[10px] font-black mt-6 flex items-center gap-2">
            Pentova Core Operating Environment v2.5
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="glass px-6 py-4 rounded-2xl flex items-center gap-4 border-white/5">
             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
               <Database size={18} />
             </div>
             <div>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Storage Status</p>
               <p className="text-xs font-bold text-white uppercase">Nominal</p>
             </div>
          </div>
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        {[
          { label: 'Inventory', value: stats.products, icon: <Package size={24} />, color: 'blue' },
          { label: 'Order Flow', value: stats.orders, icon: <ShoppingCart size={24} />, color: 'purple' },
          { label: 'Revenue', value: `৳${(stats.revenue / 1000).toFixed(1)}k`, icon: <DollarSign size={24} />, color: 'emerald' },
          { label: 'Network', value: stats.customers, icon: <Users size={24} />, color: 'slate' }
        ].map((stat, idx) => (
          <div key={idx} className="glass-card p-10 rounded-[3rem] group">
            <div className="flex justify-between items-start mb-8">
              <div className={`p-4 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors`}>
                {React.cloneElement(stat.icon as React.ReactElement, { className: `text-${stat.color}-400` })}
              </div>
              <div className="p-2 glass rounded-lg text-emerald-400">
                <TrendingUp size={14} />
              </div>
            </div>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">{stat.label}</p>
            <h3 className="text-5xl font-black tracking-tighter text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Control Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { 
            title: 'Inventory', 
            path: '/admin/products', 
            desc: 'Calibrate product specs and stock levels.',
            icon: <Activity size={24} /> 
          },
          { 
            title: 'Taxonomy', 
            path: '/admin/categories', 
            desc: 'Refine product classification and sorting.',
            icon: <LayoutGrid size={24} /> 
          },
          { 
            title: 'Fulfillment', 
            path: '/admin/orders', 
            desc: 'Monitor and process logistical output.',
            icon: <Settings size={24} /> 
          }
        ].map((node, idx) => (
          <Link key={idx} to={node.path} className="group glass-card p-12 rounded-[3.5rem] flex flex-col justify-between min-h-[320px]">
            <div>
               <div className="w-16 h-16 rounded-[2rem] glass flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all mb-10 border-white/10 group-hover:border-transparent">
                 {node.icon}
               </div>
               <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter text-white">{node.title}</h2>
               <p className="text-slate-500 font-medium leading-relaxed">{node.desc}</p>
            </div>
            <div className="mt-12 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">Access Interface</span>
              <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-400 transition-all shadow-xl">
                <ChevronRight size={24} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
