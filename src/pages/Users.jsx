
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UserPlus, Pencil, Trash, X, ArrowsCounterClockwise, Warning, UsersThree, CaretRight, MagnifyingGlass } from 'phosphor-react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../config/supabase';
import { MANAGED_USERS_MOCK } from '../utils/constants';
import axios from 'axios';
import api from '../utils/api';


export const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    status: 'Pending Login' 
  });
  const [generatedCode, setGeneratedCode] = useState('------');

  const fetchUsers = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setUsers(MANAGED_USERS_MOCK);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching workers:', error);
        setUsers(MANAGED_USERS_MOCK);
      } else {
        setUsers(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching workers:', err);
      setUsers(MANAGED_USERS_MOCK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return users;
    return users.filter(user => 
      user.name?.toLowerCase().includes(query) || 
      user.email?.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query) ||
      user.code?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const animateCode = useCallback(() => {
    let iterations = 0;
    const interval = setInterval(() => {
      setGeneratedCode(Math.floor(100000 + Math.random() * 900000).toString());
      iterations++;
      if (iterations > 12) {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const generateUniqueCode = async () => {
    if (!supabase) {
      return Math.floor(100000 + Math.random() * 900000).toString();
    }
    let code = '';
    let exists = true;
    while (exists) {
      code = Math.floor(100000 + Math.random() * 900000).toString();
      const { data, error } = await supabase
        .from('workers')
        .select('id')
        .eq('code', code)
        .limit(1);
      if (error) return code;
      exists = !!(data && data.length > 0);
    }
    return code;
  };

  useEffect(() => {
    if (isModalOpen && !editingUser) {
      const runAnim = async () => {
        animateCode();
        const finalCode = await generateUniqueCode();
        if (finalCode) setGeneratedCode(finalCode);
      };
      runAnim();
    }
  }, [isModalOpen, editingUser, animateCode]);

  useEffect(() => {
    if (editingUser) {
      setFormData({ 
        name: editingUser.name, 
        email: editingUser.email, 
        phone: editingUser.phone || '',
        status: editingUser.status 
      });
      setGeneratedCode(editingUser.code);
    } else {
      setFormData({ name: '', email: '', phone: '', status: 'Pending Login' });
    }
  }, [editingUser]);

  const handleOpenEdit = (e, user) => {
    e.stopPropagation();
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (e, user) => {
    e.stopPropagation();
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleRowClick = (userId) => {
    navigate(`/users/${userId}`);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (isSubmitting) return;

  setIsSubmitting(true);

  try {
    // MOCK MODE
    if (!supabase) {
      if (!editingUser) {
        // 1️⃣ SEND MAIL FIRST
        await api.post("/send-mail", {
          name: formData.name,
          email: formData.email,
          code: generatedCode
        });

        // 2️⃣ ONLY AFTER MAIL SUCCESS → CREATE USER
        const newUser = {
          id: `W-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          ...formData,
          code: generatedCode,
          joinedDate: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        };

        setUsers([newUser, ...users]);
      } else {
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
      }

      closeMainModal();
      return;
    }

    // REAL MODE (SUPABASE)
    if (editingUser) {
      const { error } = await supabase
        .from('workers')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          status: formData.status
        })
        .eq('id', editingUser.id);

      if (error) throw error;

    } else {
      // 1️⃣ SEND MAIL FIRST
      await api.post("/send-mail", {
        name: formData.name,
        email: formData.email,
        code: generatedCode
      });

      // 2️⃣ ONLY IF MAIL SUCCEEDS → INSERT INTO DB
      const { error } = await supabase
        .from('workers')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          status: 'Pending Login',
          code: generatedCode
        }]);

      if (error) throw error;
    }

    fetchUsers();
    closeMainModal();

  } catch (err) {
    console.error("Submit failed:", err);
    alert("Failed to send email. User was NOT created.");
  } finally {
    setIsSubmitting(false);
  }
};




  const confirmDelete = async () => {
    if (!userToDelete) return;
    if (!supabase) {
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      return;
    }
    const { error } = await supabase.from('workers').delete().eq('id', userToDelete.id);
    if (error) console.error(error);
    fetchUsers();
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const closeMainModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', phone: '', status: 'Pending Login' });
    setGeneratedCode('------');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Verified': return 'bg-green-100 text-green-700 ring-1 ring-green-600/10';
      case 'Pending Login': return 'bg-amber-100 text-amber-700 ring-1 ring-amber-600/10';
      default: return 'bg-slate-100 text-slate-700 ring-1 ring-slate-600/10';
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 bg-slate-50 min-h-screen max-w-[1600px] mx-auto relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 text-center md:text-left">Worker Directory</h2>
          <p className="text-slate-500 font-medium text-sm sm:text-base text-center md:text-left">Unified worker management system.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative group flex-1 md:min-w-[320px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
              <MagnifyingGlass size={20} weight="bold" />
            </span>
            <input 
              type="text"
              placeholder="Search identity or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-slate-100 focus:ring-1 focus:ring-black focus:border-primary outline-none transition-all font-bold text-slate-900 bg-white placeholder:text-slate-400 placeholder:font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} weight="bold" />
              </button>
            )}
          </div>

          <button 
            onClick={() => {
              setEditingUser(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-black px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all transform active:scale-95"
          >
            <UserPlus size={20} weight="bold" />
            <span>Create New Worker</span>
          </button>
        </div>
      </div>

      {!isSupabaseConfigured && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <Warning size={18} weight="bold" />
          <span>Cloud database not configured. Operating in preview mode with mock data.</span>
        </div>
      )}

      {/* Main Table */}
      <div className="hidden md:block rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-white/50 backdrop-blur-sm flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900">Worker Overview</h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{filteredUsers.length} Found</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Worker Identity</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Contact Details</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Security Token</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400 text-center">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr 
                  key={u.id} 
                  onClick={() => handleRowClick(u.id)}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs shrink-0 ring-2 ring-white group-hover:bg-primary group-hover:text-black transition-all">
                        {u.name?.split(' ').map((n) => n[0]).join('') || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{u.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-600">{u.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-black bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 tracking-widest shadow-inner">
                      {u.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${getStatusColor(u.status)}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={(e) => handleOpenEdit(e, u)} 
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                      >
                        <Pencil size={18} weight="bold" />
                      </button>
                      <button 
                        onClick={(e) => handleOpenDelete(e, u)} 
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash size={18} weight="bold" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredUsers.map((u) => (
          <div 
            key={u.id} 
            onClick={() => handleRowClick(u.id)}
            className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-5 relative overflow-hidden group active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-base">{u.name?.split(' ').map((n) => n[0]).join('') || '?'}</div>
                <div>
                  <h4 className="font-black text-slate-900 leading-tight text-lg">{u.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                </div>
              </div>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${getStatusColor(u.status)}`}>{u.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-4 bg-slate-50/50 rounded-2xl px-4 border border-slate-100">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile</p>
                <p className="text-xs font-bold text-slate-700">{u.phone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Code</p>
                <p className="font-mono text-sm font-black text-primary tracking-widest">{u.code}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={(e) => handleOpenEdit(e, u)} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-100 text-sm font-black text-slate-700 hover:bg-slate-200 transition-colors">
                <Pencil size={16} weight="bold" /> Edit
              </button>
              <button onClick={(e) => handleOpenDelete(e, u)} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-50 text-sm font-black text-red-600 hover:bg-red-100 transition-colors">
                <Trash size={16} weight="bold" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
          <div className="animate-spin size-12 border-4 border-slate-200 border-t-primary rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500 font-black">Loading Workers...</p>
        </div>
      )}

      {!loading && filteredUsers.length === 0 && (
        <div className="p-16 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <div className="bg-slate-50 size-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <UsersThree size={40} className="text-slate-300" />
          </div>
          <h3 className="text-slate-900 font-black text-xl mb-2">No results found</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">Try adjusting your search query or clear it to see all workers.</p>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="mt-6 text-primary font-black hover:underline">Clear Search</button>
          )}
        </div>
      )}

      {/* Main Modal - Mobile Bottom Sheet behavior */}
      {isModalOpen && (
        <div className="fixed top-16 lg:top-0 left-0 lg:left-64 right-0 bottom-0 z-[40] flex items-end sm:items-center justify-center p-0 sm:p-8 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-500" 
            onClick={closeMainModal}
            style={{ background: 'radial-gradient(circle at center, rgba(19, 164, 236, 0.1) 0%, rgba(15, 23, 42, 0.7) 100%)' }}
          />
          <div className="relative bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-[0_-8px_32px_rgba(0,0,0,0.1),0_32px_64px_-12px_rgba(0,0,0,0.25)] border-t sm:border border-white/20 overflow-hidden animate-in slide-in-from-bottom duration-500 sm:zoom-in-95 sm:slide-in-from-top-12 ease-out max-h-[90vh] flex flex-col">
            {/* Drag handle for mobile visual */}
            <div className="sm:hidden flex justify-center py-3">
              <div className="w-12 h-1.5 rounded-full bg-slate-200"></div>
            </div>

            <div className="px-8 pt-4 sm:pt-10 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900 leading-tight">{editingUser ? 'Update Profile' : 'New Worker'}</h3>
                <p className="text-sm font-bold text-slate-400">Identity management</p>
              </div>
              <button onClick={closeMainModal} className="p-2 text-slate-400 hover:text-slate-600 rounded-2xl bg-slate-100 hover:bg-slate-200 transition-all">
                <X size={20} weight="bold" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="px-8 pb-10 sm:pb-12 space-y-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Full Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-2 rounded-2xl border-2 border-slate-100 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all font-bold text-slate-900 bg-slate-50/50" />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Email Address</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-5 py-2 rounded-2xl border-2 border-slate-100 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all font-bold text-slate-900 bg-slate-50/50" />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Mobile Number</label>
                  <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-5 py-2 rounded-2xl border-2 border-slate-100 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all font-bold text-slate-900 bg-slate-50/50" />
                </div>
      
                <div className="bg-primary/5 p-3 rounded-[1rem] border-2 border-primary/10 space-y-1 relative overflow-hidden group">
                  <label className="block text-[10px] font-black text-primary uppercase tracking-widest">Security Token</label>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black tracking-[0.25em] text-primary font-mono drop-shadow-sm">{generatedCode}</span>
                    <button type="button" onClick={animateCode} className="size-10 rounded-full bg-white text-primary flex items-center justify-center hover:bg-primary hover:text-black hover:font-bold transition-all shadow-sm border border-primary/10 active:rotate-180 duration-500">
                      <ArrowsCounterClockwise size={20} weight="bold" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button type="button" onClick={closeMainModal} className="hidden sm:block flex-1 px-4 py-3.5 rounded-2xl border-2 border-slate-100 font-black text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                <button
  type="submit"
  disabled={isSubmitting}
  className={`flex-1 font-black py-4 rounded-2xl shadow-xl transition-all transform active:scale-[0.98]
    ${isSubmitting ? "bg-slate-400 cursor-not-allowed" : "bg-black text-white shadow-primary/30"}
  `}
>
  {isSubmitting ? (
    <span className="flex items-center justify-center gap-2">
      <span className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      Creating...
    </span>
  ) : (
    editingUser ? "Update" : "Create"
  )}
</button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed top-16 left-0 lg:left-64 right-0 bottom-0 z-[40] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-400 border border-white/20">
            <div className="size-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-50/50"><Warning size={40} weight="bold" /></div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Revoke Access?</h3>
            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed px-2">Permanently remove <span className="font-black text-slate-900">{userToDelete?.name}</span>?</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDelete} className="w-full bg-red-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-200 hover:bg-red-600 transition-all transform active:scale-[0.98]">Remove Worker</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="w-full px-4 py-4 rounded-2xl border-2 border-slate-100 font-black text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <footer className="text-center py-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
          <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
          Personnel Cloud Sync Active
        </div>
      </footer>
    </div>
  );
};
