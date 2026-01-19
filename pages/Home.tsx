
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, ShieldCheck, Cpu, ChevronRight, Sparkles, Box, Headphones, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product, Category } from '../types';
import { useAuth } from '../App';

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: prods } = await supabase
        .from('products')
        .select(`*, product_images(*)`)
        .limit(4);
      
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .limit(6);

      if (prods) setFeaturedProducts(prods as any);
      if (cats) setCategories(cats);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleAction = async (e: React.MouseEvent, product: Product, action: 'add' | 'buy') => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    if (product.stock <= 0) return;

    setAddingId(product.id);
    try {
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + 1 })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('cart_items')
          .insert({ 
            user_id: user.id, 
            product_id: product.id, 
            quantity: 1 
          });
      }
      
      if (action === 'buy') {
        navigate('/cart');
      } else {
        alert(`${product.name} added to cart!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="overflow-hidden bg-[#020617]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] delay-1000"></div>
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
        </div>
        
        <div className="relative z-10 text-center max-w-5xl mx-auto reveal-up">
          <div className="inline-flex items-center gap-2 py-2 px-5 glass rounded-full text-[10px] font-black tracking-[0.3em] uppercase text-cyan-400 mb-8 border border-cyan-500/20">
            <Sparkles size={12} fill="currentColor" />
            Engineering Tomorrow
          </div>
          
          <h1 className="text-6xl md:text-[9rem] font-black tracking-tighter leading-[0.85] text-white mb-10 select-none">
            TECH <br /> 
            <span className="text-gradient">EVOLVED.</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Surgical precision meets visionary design. Explore the curated selection of high-performance gadgets.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/products" className="group bg-white text-black px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-cyan-400 transition-all hover:scale-105 shadow-2xl shadow-cyan-500/20 flex items-center gap-3">
              Explore Collection <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#featured" className="group px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm glass text-white hover:bg-white/5 transition-all flex items-center gap-3">
              New Drops <ChevronRight size={18} className="group-hover:rotate-90 transition-transform" />
            </a>
          </div>
        </div>

        {/* Floating Decorative Elements (Desktop) */}
        <div className="hidden lg:block absolute bottom-20 left-20 animate-float">
          <div className="glass p-4 rounded-[2rem] border-white/10 flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
               <Cpu size={24} />
             </div>
             <div>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Processors</p>
               <p className="text-sm font-bold text-white">Quantum X-1</p>
             </div>
          </div>
        </div>
        <div className="hidden lg:block absolute top-1/4 right-20 animate-float [animation-delay:2s]">
          <div className="glass p-4 rounded-[2rem] border-white/10 flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
               <Headphones size={24} />
             </div>
             <div>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Audio</p>
               <p className="text-sm font-bold text-white">Sonic Flow</p>
             </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-32 px-4 border-y border-white/5 bg-slate-950/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: <Zap className="text-cyan-400" size={32} />, 
              title: "HYPER SPEED", 
              desc: "Express delivery across the nation. Your tech arrives before the hype settles.",
              color: "cyan"
            },
            { 
              icon: <ShieldCheck className="text-indigo-400" size={32} />, 
              title: "IRONCLAD", 
              desc: "Genuine warranties on every piece. We stand by the engineering we sell.",
              color: "indigo"
            },
            { 
              icon: <Cpu className="text-emerald-400" size={32} />, 
              title: "NEURAL HELP", 
              desc: "Expert tech support from enthusiasts who actually use the products.",
              color: "emerald"
            }
          ].map((item, idx) => (
            <div key={idx} className="glass-card p-10 rounded-[3rem] group">
              <div className="mb-8 p-4 bg-white/5 rounded-[1.5rem] w-fit group-hover:bg-white/10 transition-colors">
                {item.icon}
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tighter text-white">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Modern Grid */}
      <section className="py-32 max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
          <div>
            <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] mb-4 block">Navigation</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white">TAXONOMY.</h2>
          </div>
          <Link to="/products" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors pb-2 flex items-center gap-2">
            View All Series <ArrowRight size={14} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <Link key={cat.id} to={`/category/${cat.id}`} className="group relative glass-card p-10 rounded-[3rem] overflow-hidden flex flex-col justify-end min-h-[220px]">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Box size={100} strokeWidth={1} />
              </div>
              <div className="relative z-10">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 block">Series 0{idx + 1}</span>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter group-hover:text-cyan-400 transition-colors">{cat.name}</h3>
                <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">
                  Enter Catalog <ChevronRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Cinematic */}
      <section id="featured" className="py-32 bg-[#020617] relative">
        <div className="absolute inset-0 bg-glow-blue pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-4">
            <div>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-4 block">Curated</span>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white">THE HYPE.</h2>
            </div>
            <Link to="/products" className="group glass py-4 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all flex items-center gap-3 border border-white/5">
              Access Full Inventory <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {loading ? (
               [...Array(4)].map((_, i) => <div key={i} className="aspect-[4/5] glass rounded-[3rem] shimmer"></div>)
            ) : featuredProducts.map((prod) => (
              <Link key={prod.id} to={`/product/${prod.id}`} className="group block perspective-1000">
                <div className="relative aspect-[4/5] glass-card rounded-[3rem] overflow-hidden mb-8">
                  <img 
                    src={prod.image_url || `https://picsum.photos/seed/${prod.id}/600/800`} 
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="glass py-1.5 px-3 rounded-full text-[8px] font-black text-white uppercase tracking-widest border-white/10">
                      New Arrival
                    </span>
                  </div>
                  
                  {/* Quick Action Overlay */}
                  <div className="absolute bottom-6 left-6 right-6 flex gap-2 translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                    <button 
                      onClick={(e) => handleAction(e, prod, 'add')}
                      disabled={addingId === prod.id || prod.stock <= 0}
                      className="flex-1 glass py-3 rounded-2xl flex items-center justify-center text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                      <ShoppingCart size={18} />
                    </button>
                    <button 
                      onClick={(e) => handleAction(e, prod, 'buy')}
                      disabled={addingId === prod.id || prod.stock <= 0}
                      className="flex-[2] bg-white text-black py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all disabled:opacity-50"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-cyan-400 transition-colors mb-2 uppercase">{prod.name}</h3>
                  <div className="flex justify-between items-end">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                      {prod.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </p>
                    <p className="text-2xl font-black text-white">৳{prod.price.toLocaleString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="py-32 px-4">
        <div className="max-w-6xl mx-auto glass p-16 md:p-32 rounded-[4rem] text-center relative overflow-hidden border border-white/5 group">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] group-hover:bg-cyan-500/20 transition-all duration-1000"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] group-hover:bg-indigo-500/20 transition-all duration-1000"></div>
          
          <div className="relative z-10">
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em] mb-8 block">Exclusive Intel</span>
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-10 text-white">JOIN THE <br /><span className="text-gradient">NETWORK.</span></h2>
            <p className="text-slate-400 mb-12 max-w-lg mx-auto font-medium leading-relaxed">
              Early access to hardware drops and restricted releases. No spam, just pure tech insights.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto relative">
              <input 
                type="email" 
                placeholder="Enter your neural link (Email)" 
                className="flex-grow bg-[#020617] border border-white/10 rounded-2xl px-8 py-5 outline-none focus:border-cyan-500 transition-all text-sm font-medium placeholder:text-slate-600"
              />
              <button className="bg-white text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-cyan-400 transition-all active:scale-95">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
