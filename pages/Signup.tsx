
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowRight, UserPlus, Mail, Lock } from 'lucide-react';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full glass p-10 md:p-16 rounded-[3rem] text-center">
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Mail size={40} />
          </div>
          <h1 className="text-3xl font-black mb-4">CHECK YOUR EMAIL.</h1>
          <p className="text-gray-500 mb-10 leading-relaxed">
            We've sent a verification link to <b>{email}</b>. Please verify your email to access the world of Pentova.
          </p>
          <Link to="/login" className="inline-block bg-white text-black px-10 py-4 rounded-full font-bold hover:bg-gray-200 transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full glass p-10 md:p-16 rounded-[3rem] relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px]"></div>
        
        <h1 className="text-4xl font-black tracking-tighter mb-2 text-gradient">CREATE ACCOUNT.</h1>
        <p className="text-gray-500 mb-12 uppercase text-[10px] tracking-widest font-black">Join the Innovation</p>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
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
                placeholder="Secure Password" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-4 outline-none focus:border-blue-500 transition-colors"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <p className="text-[10px] text-gray-600 px-6">Must be at least 6 characters.</p>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black py-5 rounded-full font-black mt-4 hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'} <ArrowRight size={20} />
          </button>
        </form>

        <p className="mt-12 text-center text-gray-500 text-sm">
          Already have an account? <Link to="/login" className="text-white font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
