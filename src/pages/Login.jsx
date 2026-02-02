
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {ChartPieSlice} from 'phosphor-react'
import { MOCK_USER } from '../utils/constants';

export const Login = () => {
  const [email, setEmail] = useState(MOCK_USER.email);
  const [password, setPassword] = useState(MOCK_USER.password);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
          <div className="flex justify-center mb-8">
            <div className="bg-primary size-12 rounded-xl flex items-center justify-center text-black shadow-lg shadow-primary/30">
              <span><ChartPieSlice size={29} weight='fill' /></span>
            </div>
          </div>
          
          <div className="text-center mb-10">
            <h1 className="text-2xl font-black text-slate-900">Welcome Back</h1>
            <p className="text-slate-500 font-medium mt-1">Enter your credentials to access the admin dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                autoComplete='off'
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-slate-900"
                placeholder="admin@platform.com"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs font-bold text-primary hover:underline">Forgot?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-slate-900"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white font-black py-3 rounded-xl shadow-lg shadow-primary/20 bg-black transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Logging in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400 font-bold">
              HireKar <span className="text-slate-900">Admin</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
