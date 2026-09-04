import React, { useState } from 'react';
import { LogIn, Key, Sparkles, AlertCircle, ShieldCheck, UserPlus, User, Bookmark } from 'lucide-react';
import { Member } from '../types';

interface LoginProps {
  onLoginSuccess: (member: Member) => void;
  onBackToLanding?: () => void;
}

export default function Login({ onLoginSuccess, onBackToLanding }: LoginProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [prodi, setProdi] = useState('');
  const [role, setRole] = useState<'Pengurus' | 'Anggota'>('Anggota');

  const presets = [
    { name: 'Rizqi', email: 'rizqielektronika@gmail.com', role: 'Admin' },
    { name: 'Ahmad Hidayat', email: 'ahmad@gmail.com', role: 'Pengurus' },
    { name: 'Zuhair', email: 'zuhair@gmail.com', role: 'Anggota' }
  ];

  const handleLogin = async (e: React.FormEvent, selectedEmail?: string) => {
    e.preventDefault();
    const loginEmail = selectedEmail || email;
    if (!loginEmail) {
      setError('Masukkan alamat email.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail })
      });

      const data = await response.json();
      if (data.success) {
        onLoginSuccess(data.member);
      } else {
        setError(data.message || 'Gagal masuk. Periksa kembali email Anda.');
      }
    } catch (err) {
      setError('Terjadi kesalahan relasi server. Menggunakan autentikasi cadangan.');
      // Fallback
      const fallbackMember = presets.find(p => p.email === loginEmail);
      if (fallbackMember) {
        onLoginSuccess({
          id: loginEmail === 'rizqielektronika@gmail.com' ? 'M001' : loginEmail === 'ahmad@gmail.com' ? 'M002' : 'M003',
          name: fallbackMember.name,
          email: fallbackMember.email,
          role: fallbackMember.role as any,
          branch: 'Pengurus Wilayah IKRAAMUL QUR\'AN',
          avatar: loginEmail === 'rizqielektronika@gmail.com' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          totalPoints: loginEmail === 'rizqielektronika@gmail.com' ? 12500 : 8400,
          xp: loginEmail === 'rizqielektronika@gmail.com' ? 12500 : 8400,
          level: loginEmail === 'rizqielektronika@gmail.com' ? 5 : 4,
          levelName: loginEmail === 'rizqielektronika@gmail.com' ? 'Mujahid' : 'Muqarrab',
          groupMemorization: 'Halaqah Abu Bakar',
          targetMemorization: 100,
          completedMemorization: loginEmail === 'rizqielektronika@gmail.com' ? 87 : 50,
          phone: '+6281234567890',
          joinedDate: '2025-01-10'
        });
      } else {
        setError('Sistem offline: Silakan pilih salah satu Preset Akun di bawah ini.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role) {
      setError('Harap lengkapi semua kolom pendaftaran.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, prodi })
      });

      const data = await response.json();
      if (data.success) {
        onLoginSuccess(data.member);
      } else {
        setError(data.message || 'Pendaftaran gagal.');
      }
    } catch (err) {
      setError('Terjadi kesalahan relasi server. Menggunakan registrasi cadangan.');
      // Fallback
      onLoginSuccess({
        id: 'M' + Date.now().toString().slice(-3),
        name,
        email,
        role: role as any,
        branch: role === 'Pengurus' ? 'Kader Inti UNINUS Bandung' : 'Anggota Aktif UNINUS',
        prodi,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        totalPoints: 0,
        xp: 0,
        level: 1,
        levelName: 'Mubtadi',
        groupMemorization: 'Halaqah Utsman',
        targetMemorization: 100,
        completedMemorization: 0,
        phone: '',
        joinedDate: new Date().toISOString().split('T')[0]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-[#02130e] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Decorative Islamic Star Pattern & Ambient Moons */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-96 h-96 bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-gradient-to-b from-[#052b1e] to-[#01140f] rounded-2xl border border-yellow-500/20 p-8 shadow-2xl relative z-10">
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="absolute top-4 left-4 text-emerald-400 hover:text-[#e5c158] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            ← Beranda
          </button>
        )}
        
        {/* Header LOGO */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shadow-lg shadow-yellow-500/10 mb-4 border border-yellow-500/20 bg-emerald-950 p-1">
            <img src="/logo-iq.png" alt="Logo UKM" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-400 bg-clip-text text-transparent tracking-wide">
            IKRAAMUL QUR'AN
          </h1>
          <p className="text-xs text-emerald-400 font-medium tracking-widest mt-1 uppercase">
            UKM IKRAAMUL QUR'AN DIGITAL PORTAL
          </p>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent mt-3" />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 bg-red-950/40 border border-red-500/30 text-red-300 rounded-lg p-3 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1.5 ml-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-emerald-500/60">
                    <User className="w-4 h-4 text-emerald-500/60" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Muhammad Zuhair"
                    className="w-full bg-[#011a14] border border-yellow-500/15 focus:border-[#e5c158] focus:ring-1 focus:ring-[#e5c158] rounded-xl pl-9 pr-4 py-3 text-sm text-gray-200 placeholder-emerald-800 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1.5 ml-1">
                  Program Studi (Prodi)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#e5c158]/50">
                    <Bookmark className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={prodi}
                    onChange={(e) => setProdi(e.target.value)}
                    placeholder="Contoh: Teknik Informatika"
                    className="w-full bg-[#011a14] border border-yellow-500/15 focus:border-[#e5c158] focus:ring-1 focus:ring-[#e5c158] rounded-xl pl-9 pr-4 py-3 text-sm text-gray-200 placeholder-emerald-800 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1.5 ml-1">
              Alamat Email Kampus / UKM
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-emerald-500/60">
                @
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@ikraamulquran.or.id"
                className="w-full bg-[#011a14] border border-yellow-500/15 focus:border-[#e5c158] focus:ring-1 focus:ring-[#e5c158] rounded-xl pl-9 pr-4 py-3 text-sm text-gray-200 placeholder-emerald-800 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1.5 ml-1">
              Sandi Akun (Akses Cadangan)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#e5c158]/50">
                <Key className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#011a14] border border-yellow-500/15 focus:border-[#e5c158] focus:ring-1 focus:ring-[#e5c158] rounded-xl pl-9 pr-4 py-3 text-sm text-gray-200 placeholder-emerald-800 outline-none transition-all"
                required
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1.5 ml-1">
                Peran / Jabatan
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-[#011a14] border border-yellow-500/15 focus:border-[#e5c158] focus:ring-1 focus:ring-[#e5c158] rounded-xl px-3 py-3 text-sm text-gray-200 outline-none transition-all cursor-pointer"
              >
                <option value="Anggota">Anggota Biasa (Hanya Lihat)</option>
                <option value="Pengurus">Pengurus Harian (Bisa Edit/Tambah)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#e5c158] to-[#bca044] hover:from-[#f3cc5c] hover:to-[#ceaf4b] text-[#02130e] font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-yellow-500/20 active:scale-[0.99] transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-emerald-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isRegister ? (
                  <>
                    <UserPlus className="w-4 h-4 text-[#02130e]" />
                    Daftar Akun Baru
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-[#02130e]" />
                    Masuk ke Dashboard
                  </>
                )}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-emerald-400 hover:text-[#e5c158] transition-colors font-semibold cursor-pointer"
          >
            {isRegister ? 'Sudah punya akun? Masuk di sini' : 'Belum punya akun? Daftar di sini'}
          </button>
        </div>



        {/* Footer info */}
        <p className="text-center text-[10px] text-emerald-600 mt-6 leading-relaxed">
          Sistem Informasi Administrasi Qur'an Mandiri & Terpadu <br />
          UKM IKRAAMUL QUR'AN © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
