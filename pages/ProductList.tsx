
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product, Category } from '../types';
import { Filter, Search, Grid, List, ArrowUpRight, ShoppingCart, Zap } from 'lucide-react';
import { useAuth } from '../App';

const ProductList: React.FC = () => {
  const { categoryId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [categoryId, searchTerm]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    if (data) setCategories(data);
  };

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase.from('products').select(`*, product_images(*)`);
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }

    const { data, error } = await query;
    if (data) setProducts(data as any);
    setLoading(false);
  };

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
    <div className="max-w-7xl mx-auto px-4 py-20 reveal-up">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
        <div>
          <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] mb-4 block">Hardware Catalog</span>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase text-white leading-none">
            INVENTORY<span className="text-gradient">.</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-6 flex items-center gap-2">
            {categoryId ? categories.find(c => c.id === categoryId)?.name : 'Full Spectrum Collection'}
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
            {products.length} Units Found
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search specifications..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f172a] border border-white/5 rounded-2xl pl-16 pr-6 py-4 outline-none focus:border-cyan-500 transition-all text-sm font-medium"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full no-scrollbar">
            <Link to="/products" className={`px-6 py-4 rounded-2xl text-[10px] font-black whitespace-nowrap uppercase tracking-widest transition-all ${!categoryId ? 'bg-white text-black shadow-lg shadow-white/10' : 'glass text-slate-400 hover:text-white border-white/5'}`}>
              Full
            </Link>
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                to={`/category/${cat.id}`} 
                className={`px-6 py-4 rounded-2xl text-[10px] font-black whitespace-nowrap uppercase tracking-widest transition-all ${categoryId === cat.id ? 'bg-white text-black shadow-lg shadow-white/10' : 'glass text-slate-400 hover:text-white border-white/5'}`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/5] glass rounded-[3rem] mb-8 shimmer"></div>
              <div className="h-8 bg-white/5 rounded-xl w-3/4 mb-3"></div>
              <div className="h-4 bg-white/5 rounded-xl w-1/2 mb-6"></div>
              <div className="h-10 bg-white/5 rounded-xl w-1/3"></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-40 text-center glass rounded-[4rem] border-dashed border-2 border-white/5">
          <h3 className="text-3xl font-black text-slate-600 uppercase tracking-tighter">Zero Match Detected.</h3>
          <p className="text-slate-500 mt-4 uppercase tracking-widest text-[10px] font-bold">Try adjusting your parameters or browse categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16">
          {products.map((prod) => (
            <Link key={prod.id} to={`/product/${prod.id}`} className="group relative block">
              <div className="relative aspect-[4/5] glass-card rounded-[3rem] overflow-hidden mb-8">
                <img 
                  src={prod.image_url || (prod as any).product_images?.[0]?.image_url || `https://picsum.photos/seed/${prod.id}/600/800`} 
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 via-transparent to-transparent"></div>
                
                <div className={`absolute top-6 left-6 px-4 py-2 rounded-2xl text-[8px] font-black uppercase tracking-widest backdrop-blur-xl border border-white/10 ${prod.stock > 0 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-red-500/20 text-red-400'}`}>
                  {prod.stock > 0 ? 'Available' : 'Restocking'}
                </div>

                {/* Quick Actions Overlay */}
                <div className="absolute inset-x-6 bottom-6 flex flex-col gap-2 translate-y-32 group-hover:translate-y-0 transition-transform duration-500">
                  <button 
                    onClick={(e) => handleAction(e, prod, 'add')}
                    disabled={addingId === prod.id || prod.stock <= 0}
                    className="w-full glass py-3 rounded-2xl flex items-center justify-center gap-2 text-white hover:bg-white/10 transition-all disabled:opacity-50 text-[10px] font-black uppercase tracking-widest"
                  >
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                  <button 
                    onClick={(e) => handleAction(e, prod, 'buy')}
                    disabled={addingId === prod.id || prod.stock <= 0}
                    className="w-full bg-white text-black py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all disabled:opacity-50 text-[10px] font-black uppercase tracking-widest"
                  >
                    <Zap size={16} fill="currentColor" /> Buy Now
                  </button>
                </div>

                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center text-white border border-white/10">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              </div>
              
              <div className="px-2">
                <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-cyan-400 transition-colors mb-2 uppercase truncate">{prod.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Premium Grade</span>
                  <p className="text-2xl font-black text-white">৳{prod.price.toLocaleString()}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
