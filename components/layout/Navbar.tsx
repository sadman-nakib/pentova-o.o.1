
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, ShieldAlert, Zap } from 'lucide-react';
import { useAuth } from '../../App';
import { supabase } from '../../lib/supabase';

const Navbar: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      const fetchCartCount = async () => {
        const { count } = await supabase
          .from('cart_items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        setCartCount(count || 0);
      };
      fetchCartCount();
      
      const channel = supabase
        .channel('cart_updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cart_items', filter: `user_id=eq.${user.id}` }, () => {
          fetchCartCount();
        })
        .subscribe();

      return () => { channel.unsubscribe(); };
    } else {
      setCartCount(0);
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ${isScrolled ? 'py-3 bg-[#020617]/70 backdrop-blur-2xl border-b border-white/5' : 'py-6 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-black tracking-tighter text-white flex items-center gap-1 group">
              <Zap className="text-cyan-400 group-hover:scale-110 transition-transform" size={24} fill="currentColor" />
              <span>PENTOVA</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-2">
              {[
                { label: 'Home', path: '/' },
                { label: 'Gadgets', path: '/products' }
              ].map(link => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-full ${isActive(link.path) ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  {link.label}
                </Link>
              ))}
              
              {profile?.role === 'admin' && (
                <Link to="/admin" className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-full flex items-center gap-2 ${location.pathname.startsWith('/admin') ? 'bg-indigo-500/20 text-indigo-400' : 'text-indigo-400 hover:bg-indigo-500/10'}`}>
                  <ShieldAlert size={14} /> Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link 
              to="/cart" 
              className={`relative p-2.5 rounded-full transition-all ${isActive('/cart') ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className={`absolute -top-1 -right-1 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#020617] ${isActive('/cart') ? 'bg-white text-black' : 'bg-cyan-500 text-black'}`}>
                  {cartCount}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-1">
                <Link 
                  to="/orders" 
                  className={`p-2.5 rounded-full transition-all ${isActive('/orders') ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <User size={20} />
                </Link>
                <button 
                  onClick={handleSignOut} 
                  className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-white text-black px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-cyan-400 transition-all active:scale-95 shadow-lg shadow-cyan-500/10">
                Log In
              </Link>
            )}

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-400 hover:text-white">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed inset-0 z-50 transition-all duration-500 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setIsMenuOpen(false)}></div>
        <div className={`absolute right-0 top-0 bottom-0 w-3/4 max-w-sm glass border-l border-white/10 p-8 pt-24 space-y-6 transition-transform duration-500 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <Link to="/" className="block text-2xl font-black tracking-tighter uppercase text-white" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/products" className="block text-2xl font-black tracking-tighter uppercase text-white" onClick={() => setIsMenuOpen(false)}>Gadgets</Link>
          {profile?.role === 'admin' && (
            <Link to="/admin" className="block text-2xl font-black tracking-tighter uppercase text-indigo-400" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>
          )}
          {user && (
            <Link to="/orders" className="block text-2xl font-black tracking-tighter uppercase text-white" onClick={() => setIsMenuOpen(false)}>My Orders</Link>
          )}
          <div className="pt-8 border-t border-white/5">
            {user ? (
               <button onClick={handleSignOut} className="flex items-center gap-3 text-red-400 font-black uppercase tracking-widest text-sm">
                 <LogOut size={20} /> Sign Out
               </button>
            ) : (
              <Link to="/login" className="block w-full text-center bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-sm" onClick={() => setIsMenuOpen(false)}>Log In</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
