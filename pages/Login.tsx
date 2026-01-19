
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowRight, Lock, Mail } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full glass p-10 md:p-16 rounded-[3rem] relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px]"></div>
        
        <h1 className="text-4xl font-black tracking-tighter mb-2 text-gradient">WELCOME BACK.</h1>
        <p className="text-gray-500 mb-12 uppercase text-[10px] tracking-widest font-black">Authorized Access Only</p>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                required
                type="email" 
                placeholder="Email Address" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-4 outline-none focus:border-blue-500 transition-colors"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                required
                type="password" 
                placeholder="Password" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-4 outline-none focus:border-blue-500 transition-colors"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" size={14} className="text-[10px] uppercase font-black tracking-widest text-gray-500 hover:text-white transition-colors">
                Forgot password?
              </Link>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black py-5 rounded-full font-black mt-4 hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={20} />
          </button>
        </form>

        <p className="mt-12 text-center text-gray-500 text-sm">
          Don't have an account? <Link to="/signup" className="text-white font-bold hover:underline">Register now</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
