import React, { useState } from 'react';
import { Lock, User, KeyRound, ShieldCheck } from 'lucide-react';

interface AccessModalProps {
  isOpen: boolean;
  onLogin: (userName: string) => void;
  expectedCode: string;
}

export const AccessModal: React.FC<AccessModalProps> = ({
  isOpen,
  onLogin,
  expectedCode,
}) => {
  const [userName, setUserName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setError('Silakan masukkan nama Anda!');
      return;
    }
    if (accessCode.trim() !== expectedCode.trim()) {
      setError('Kode akses salah! Hubungi administrator.');
      return;
    }

    setError('');
    onLogin(userName.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Aplikasi Kasir Kharisma</h3>
          <p className="text-xs text-slate-500 mt-1">Masukkan nama kasir dan kode akses PIN untuk masuk</p>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Petugas / Kasir</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Masukkan namamu (cth: Mas Rohman)"
                required
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Akses (PIN)</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Kode default: 1234"
                required
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 tracking-widest focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-lg transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <Lock className="w-4 h-4" />
            <span>Masuk ke Sistem Kasir</span>
          </button>
        </form>
      </div>
    </div>
  );
};
