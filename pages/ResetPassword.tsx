
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowRight, Lock, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a session (the reset link automatically signs the user in)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Invalid or expired reset link. Please request a new one.');
      }
      setVerifying(false);
    };
    checkSession();
  }, []);

  const validatePassword = (pwd: string) => {
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const isLongEnough = pwd.length >= 8;
    return hasUpper && hasNumber && hasSpecial && isLongEnough;
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!validatePassword(newPassword)) {
      setError('Password does not meet security requirements.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Requirement: Require re-login after reset. Supabase auth update session stays, but we can sign out.
      await supabase.auth.signOut();
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-500" size={48} />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full glass p-10 md:p-16 rounded-[3rem] text-center relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px]"></div>
          
          <div className="flex justify-center mb-8">
            <div className="p-6 bg-emerald-500/10 rounded-3xl text-emerald-500">
              <ShieldCheck size={48} strokeWidth={1} />
            </div>
          </div>
          
          <h1 className="text-3xl font-black tracking-tighter mb-4 text-gradient uppercase">Password Updated.</h1>
          <p className="text-gray-500 mb-10 leading-relaxed text-sm">
            Your security settings have been updated successfully. Redirecting you to the login page...
          </p>
          
          <Link to="/login" className="inline-block bg-white text-black px-10 py-4 rounded-full font-bold hover:scale-105 transition-all shadow-xl uppercase text-xs tracking-widest">
            Go to Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full glass p-10 md:p-16 rounded-[3rem] relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px]"></div>
        
        <h1 className="text-4xl font-black tracking-tighter mb-2 text-gradient">NEW SECURITY.</h1>
        <p className="text-gray-500 mb-12 uppercase text-[10px] tracking-widest font-black">Define Your New Credentials</p>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl flex items-start gap-3">
            <AlertTriangle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                required
                type="password" 
                placeholder="New Password" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-4 outline-none focus:border-blue-500 transition-colors"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                required
                type="password" 
                placeholder="Confirm New Password" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-4 outline-none focus:border-blue-500 transition-colors"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border border-white/5">
            <p className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-3">Requirements:</p>
            <ul className="text-[10px] space-y-2 text-gray-400 font-bold tracking-tight">
              <li className={newPassword.length >= 8 ? 'text-emerald-500' : ''}>• Min 8 characters</li>
              <li className={/[A-Z]/.test(newPassword) ? 'text-emerald-500' : ''}>• At least 1 uppercase letter</li>
              <li className={/[0-9]/.test(newPassword) ? 'text-emerald-500' : ''}>• At least 1 number</li>
              <li className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'text-emerald-500' : ''}>• At least 1 special character</li>
            </ul>
          </div>

          <button 
            type="submit" 
            disabled={loading || !newPassword || !confirmPassword}
            className="w-full bg-white text-black py-5 rounded-full font-black mt-4 hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl"
          >
            {loading ? 'Updating...' : 'Set New Password'} <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
