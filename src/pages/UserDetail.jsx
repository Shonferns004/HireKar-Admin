
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Envelope, Phone, Calendar, Fingerprint, IdentificationCard, ShieldCheck, DotsThreeVertical, Pencil, Trash } from 'phosphor-react';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { MANAGED_USERS_MOCK } from '../utils/constants';

export const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      if (!isSupabaseConfigured || !supabase) {
        const mockUser = MANAGED_USERS_MOCK.find(u => u.id === userId);
        setUser(mockUser || null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('workers')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error(error);
          const mockUser = MANAGED_USERS_MOCK.find(u => u.id === userId);
          setUser(mockUser || null);
        } else {
          setUser(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin size-12 border-4 border-slate-200 border-t-primary rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center bg-slate-50 min-h-screen">
        <div className="max-w-md mx-auto bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-200">
          <IdentificationCard size={64} className="mx-auto text-slate-200 mb-6" />
          <h2 className="text-2xl font-black text-slate-900 mb-2">Worker Not Found</h2>
          <p className="text-slate-500 mb-8 font-medium">The identity you are looking for does not exist in the current directory.</p>
          <button 
            onClick={() => navigate('/users')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark transition-all"
          >
            <ArrowLeft weight="bold" /> Back to Directory
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Success': return 'bg-green-100 text-green-700';
      case 'Verified': return 'bg-blue-100 text-blue-700';
      case 'Pending Login': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-slate-50 min-h-screen max-w-[1200px] mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <button 
          onClick={() => navigate('/users')}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-colors mb-6 group"
        >
          <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:bg-slate-50 transition-all">
            <ArrowLeft size={18} weight="bold" />
          </div>
          <span>Return to Personnel List</span>
        </button>

        <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-slate-200 relative overflow-hidden">
          {/* Decorative Backdrop */}
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <Fingerprint size={240} weight="thin" />
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
            <div className="size-32 sm:size-40 rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-primary font-black text-4xl shadow-inner shrink-0 border-4 border-white ring-1 ring-primary/20">
              {user.name?.split(' ').map((n) => n[0]).join('') || '?'}
            </div>
            
            <div className="flex-1 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{user.name}</h1>
                  <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-widest flex items-center gap-2">
                    <ShieldCheck weight="fill" className="text-primary" /> System Verified Personnel
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm ring-1 ring-black/5 ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                  <button className="p-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all">
                    <DotsThreeVertical size={20} weight="bold" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Envelope size={20} weight="bold" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Identity</p>
                    <p className="text-slate-900 font-bold">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Phone size={20} weight="bold" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Contact</p>
                    <p className="text-slate-900 font-bold">{user.phone || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Calendar size={20} weight="bold" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployment Date</p>
                    <p className="text-slate-900 font-bold">{user.joinedDate || user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-sm border border-slate-200">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
              <ShieldCheck size={24} className="text-primary" /> Security Configuration
            </h3>
            
            <div className="bg-primary/5 rounded-[2rem] p-8 border-2 border-primary/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform group-hover:scale-110">
                <ShieldCheck size={120} weight="bold" />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-black text-primary uppercase tracking-widest mb-4">Master Security Token</p>
                <div className="flex items-center gap-8">
                  <span className="text-5xl font-black tracking-[0.2em] text-primary font-mono drop-shadow-sm">{user.code}</span>
                  <div className="hidden sm:block">
                    <p className="text-[11px] text-primary font-bold opacity-70 leading-relaxed max-w-[200px]">
                      This encrypted token is required for all manual authentication overrides.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 space-y-6">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Access Logs (Sample)</h4>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="size-2 rounded-full bg-green-500"></div>
                      <p className="text-sm font-bold text-slate-700">Login Successful</p>
                    </div>
                    <p className="text-xs font-medium text-slate-400">2 hours ago • IP: 192.168.1.{12 + i}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-900/20 text-white overflow-hidden relative group">
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <h3 className="text-xl font-black mb-2 relative z-10">Quick Actions</h3>
            <p className="text-slate-400 text-sm font-medium mb-8 relative z-10">Modify worker status or account standing.</p>
            
            <div className="space-y-3 relative z-10">
              <button className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/10 hover:bg-white text-white hover:text-slate-900 font-black transition-all">
                <Pencil size={18} weight="bold" /> Edit Identity
              </button>
              <button className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white font-black transition-all">
                <Trash size={18} weight="bold" /> Revoke Access
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-6">Identity Verification</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <ShieldCheck size={14} weight="bold" />
                </div>
                <p className="text-sm font-bold text-slate-600">Email Verified</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <ShieldCheck size={14} weight="bold" />
                </div>
                <p className="text-sm font-bold text-slate-600">KYC Completed</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                  <ShieldCheck size={14} weight="bold" />
                </div>
                <p className="text-sm font-bold text-slate-400">Background Sync Pending</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
