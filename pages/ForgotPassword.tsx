
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowRight, Mail, CheckCircle2 } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    //redirectTo must be a URL configured in Supabase Auth Redirect URLs
    const resetUrl = `${window.location.origin}/#/reset-password`;
    
    // We call the Supabase reset password method
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetUrl,
    });

    // Regardless of whether error exists (to prevent user enumeration), we show a success message
    // Exception: showing an alert if it's a technical error might be okay, 
    // but the requirement says "Always show the same message"
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full glass p-10 md:p-16 rounded-[3rem] text-center relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px]"></div>
          
          <div className="flex justify-center mb-8">
            <div className="p-6 bg-emerald-500/10 rounded-3xl text-emerald-500">
              <CheckCircle2 size={48} strokeWidth={1} />
            </div>
          </div>
          
          <h1 className="text-3xl font-black tracking-tighter mb-4 text-gradient uppercase">Check Your Inbox.</h1>
          <p className="text-gray-500 mb-10 leading-relaxed text-sm">
            If an account exists with <b>{email}</b>, a password reset email has been sent. Please check your spam folder if you don't see it.
          </p>
          
          <Link to="/login" className="inline-block bg-white text-black px-10 py-4 rounded-full font-bold hover:scale-105 transition-all shadow-xl uppercase text-xs tracking-widest">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full glass p-10 md:p-16 rounded-[3rem] relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px]"></div>
        
        <h1 className="text-4xl font-black tracking-tighter mb-2 text-gradient">RESET ACCESS.</h1>
        <p className="text-gray-500 mb-12 uppercase text-[10px] tracking-widest font-black">Secure Recovery Flow</p>

        <form onSubmit={handleResetRequest} className="space-y-6">
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
            <p className="text-[10px] text-gray-600 px-6">We'll send a one-time reset link.</p>
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !email}
            className="w-full bg-white text-black py-5 rounded-full font-black mt-4 hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl"
          >
            {loading ? 'Processing...' : 'Send Reset Link'} <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-12 text-center">
          <Link to="/login" className="text-gray-500 hover:text-white transition-colors text-xs uppercase font-black tracking-widest">
            Wait, I remember it.
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
