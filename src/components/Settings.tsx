import React, { useState, useRef, useCallback } from 'react';
import { 
  Settings, Database, Award, Clipboard, Check, RefreshCw, 
  Map, User, Sliders, Shield, BookOpen, Clock, Camera, Upload, X
} from 'lucide-react';
import { Member } from '../types';

interface SettingsProps {
  currentUser: Member;
  onUpdateProfile: (updated: Partial<Member>) => void;
}

/** Compress an image File to a base64 JPEG string, max 300x300, quality 0.85 */
function compressImageToBase64(file: File, maxSize = 300, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > h) { if (w > maxSize) { h = Math.round(h * maxSize / w); w = maxSize; } }
        else { if (h > maxSize) { w = Math.round(w * maxSize / h); h = maxSize; } }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function SettingsView({ currentUser, onUpdateProfile }: SettingsProps) {
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'database'>('profile');

  // Profile Form States
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '+628');
  const [target, setTarget] = useState(currentUser.targetMemorization);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar (JPG, PNG, WebP, dll)');
      return;
    }
    setUploading(true);
    try {
      const compressed = await compressImageToBase64(file, 300, 0.85);
      setAvatar(compressed);
    } catch {
      alert('Gagal memproses gambar, coba file lain.');
    } finally {
      setUploading(false);
      // Reset so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, []);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      phone,
      targetMemorization: Number(target),
      avatar
    });
    alert("Profil Anda berhasil diperbarui!");
  };

  const sqlBlueprint = `
-- =====================================================================
-- DATABASE SCHEMA BLUEPRINT FOR UKM IKRAAMUL QUR'AN DIGITAL PORTAL
-- TARGET ENGINE: MySQL 8.0+ / PostgreSQL 14+
-- =====================================================================

-- 1. Table: members (Data Anggota)
CREATE TABLE members (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30),
    role ENUM('Admin', 'Pengurus', 'Anggota') DEFAULT 'Anggota',
    branch VARCHAR(100) DEFAULT 'Kader Bandung',
    avatar MEDIUMTEXT,
    total_points INT DEFAULT 0,
    xp INT DEFAULT 0,
    level INT DEFAULT 1,
    level_name VARCHAR(50) DEFAULT 'Mubtadi',
    group_memorization VARCHAR(100) DEFAULT 'Halaqah Abu Bakar',
    target_memorization INT DEFAULT 100,
    completed_memorization INT DEFAULT 0,
    joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Table: studies (Data Kajian & Kegiatan)
CREATE TABLE studies (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    speaker VARCHAR(150),
    date DATE NOT NULL,
    time_range VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    lat DECIMAL(9,6) NOT NULL,
    lng DECIMAL(9,6) NOT NULL,
    description TEXT,
    image_url MEDIUMTEXT,
    type ENUM('Tahsin', 'Kajian', 'Pelatihan', 'Lomba', 'Rapat') DEFAULT 'Kajian',
    quota INT DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Table: attendance_records (Riwayat Presensi GPS & QR)
CREATE TABLE attendance_records (
    id VARCHAR(50) PRIMARY KEY,
    study_id VARCHAR(50) NOT NULL,
    member_id VARCHAR(50) NOT NULL,
    status ENUM('Hadir', 'Izin', 'Alfa') DEFAULT 'Hadir',
    date DATE NOT NULL,
    time VARCHAR(30) NOT NULL,
    method ENUM('GPS', 'QR') NOT NULL,
    lat DECIMAL(9,6),
    lng DECIMAL(9,6),
    distance_meters INT,
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Table: memorization_records (Setoran Hafalan Santri)
CREATE TABLE memorization_records (
    id VARCHAR(50) PRIMARY KEY,
    member_id VARCHAR(50) NOT NULL,
    member_name VARCHAR(150) NOT NULL,
    surah_name VARCHAR(100) NOT NULL,
    start_verse INT NOT NULL,
    end_verse INT NOT NULL,
    type ENUM('Ziyadah', 'Murojaah') DEFAULT 'Ziyadah',
    status ENUM('Menunggu', 'Disetujui') DEFAULT 'Menunggu',
    notes TEXT,
    date DATE NOT NULL,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sqlBlueprint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const avatarsList = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  ];

  return (
    <div id="settings-viewport" className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-1 select-none font-sans">
      
      {/* Left pane menu selector: 3 Cols */}
      <div className="lg:col-span-3 flex flex-col gap-2.5">
        
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`
            w-full p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer
            ${activeSubTab === 'profile' 
              ? 'bg-[#063324] border-[#e5c158]/30 text-[#e5c158]' 
              : 'bg-[#011a14]/60 border-emerald-950 text-emerald-500 hover:bg-[#02281d]'
            }
          `}
        >
          <User className="w-4 h-4 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-black">Sunting Profil</span>
            <span className="text-[8px] opacity-70">Identitas, foto, target hafalan</span>
          </div>
        </button>

        <button
          onClick={() => setActiveSubTab('database')}
          className={`
            w-full p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer
            ${activeSubTab === 'database' 
              ? 'bg-[#063324] border-[#e5c150]/30 text-[#e5c158]' 
              : 'bg-[#011a14]/60 border-emerald-950 text-emerald-500 hover:bg-[#02281d]'
            }
          `}
        >
          <Database className="w-4 h-4 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-black">Skema MySQL</span>
            <span className="text-[8px] opacity-70">Blueprint DDL Skripsi</span>
          </div>
        </button>

      </div>

      {/* Right pane workspace canvas: 9 Cols */}
      <div className="lg:col-span-9">
        
        {/* SUBTAB A: PROFILE SETTINGS */}
        {activeSubTab === 'profile' && (
          <div className="islamic-card rounded-2xl p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-emerald-900 mb-5">
              <Settings className="w-5 h-5 text-[#e5c158]" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Sunting Biodata Santri</h3>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              
              {/* ── Profile Photo Upload Area ── */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-3">
                  Foto Profil
                </label>

                <div className="flex items-start gap-5">
                  {/* Avatar preview circle — click to open file picker */}
                  <div className="relative shrink-0 group">
                    <div className="w-24 h-24 rounded-full border-2 border-yellow-500/40 overflow-hidden shadow-lg shadow-emerald-900/40">
                      {uploading ? (
                        <div className="w-full h-full flex items-center justify-center bg-[#02130e]">
                          <div className="w-6 h-6 border-2 border-[#e5c158] border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : (
                        <img src={avatar} alt="foto profil" className="w-full h-full object-cover" />
                      )}
                    </div>

                    {/* Overlay camera icon on hover */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      title="Ganti Foto dari Galeri"
                    >
                      <Camera className="w-7 h-7 text-white" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 flex-1">
                    {/* Upload from folder/gallery button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 bg-[#053224] hover:bg-[#063b2a] border border-yellow-500/20 hover:border-yellow-500/40 text-[#e5c158] text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer w-fit"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Pilih Foto dari Galeri / Folder
                    </button>

                    <p className="text-[9px] text-emerald-600 leading-relaxed">
                      Mendukung JPG, PNG, WebP, HEIC. Foto akan dikompres otomatis sebelum disimpan.
                    </p>

                    {/* Or choose preset */}
                    <div>
                      <p className="text-[9px] uppercase text-emerald-600 font-bold mb-1.5">Atau pilih avatar preset:</p>
                      <div className="flex gap-2 flex-wrap">
                        {avatarsList.map((presetImg, presetIdx) => (
                          <button
                            key={presetIdx}
                            type="button"
                            onClick={() => setAvatar(presetImg)}
                            className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all duration-300 cursor-pointer ${avatar === presetImg ? 'border-[#e5c158] scale-110 shadow shadow-yellow-500/20' : 'border-emerald-900 hover:border-[#e5c158]/50'}`}
                          >
                            <img src={presetImg} alt="preset" className="w-full h-full object-cover" />
                          </button>
                        ))}
                        {/* Clear / reset button if user uploaded custom photo */}
                        {avatar.startsWith('data:') && (
                          <button
                            type="button"
                            onClick={() => setAvatar(avatarsList[0])}
                            className="w-10 h-10 rounded-full border-2 border-red-900 bg-red-950 flex items-center justify-center cursor-pointer hover:border-red-500 transition-all"
                            title="Hapus foto yang diupload"
                          >
                            <X className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                />
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1.5">Nama Lengkap Anda</label>
                  <input
                    type="text" required
                    value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-[#011a14] border border-yellow-500/10 focus:border-[#e5c150] rounded-xl px-4 py-3 text-xs text-gray-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1.5">Nomor Telepon WhatsApp</label>
                  <input
                    type="text" required
                    value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full bg-[#011a14] border border-yellow-500/10 focus:border-[#e5c150] rounded-xl px-4 py-3 text-xs text-gray-200 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1.5">Target Hafalan Ayat Semester Ini</label>
                  <input
                    type="number" required
                    value={target} onChange={e => setTarget(Number(e.target.value))}
                    className="w-full bg-[#011a14] border border-yellow-500/10 focus:border-[#e5c158] rounded-xl px-4 py-3 text-xs text-gray-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1.5">Email Terdaftar (Read-only)</label>
                  <input
                    type="text" disabled
                    value={currentUser.email}
                    className="w-full bg-[#01110c] border border-emerald-950 rounded-xl px-4 py-3 text-xs text-emerald-600 outline-none opacity-50 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-emerald-900/60 flex justify-end">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#e5c158] to-[#ab8922] hover:from-[#fecc60] text-emerald-950 font-black px-6 py-2.5 rounded-xl text-xs cursor-pointer shadow shadow-yellow-500/10"
                >
                  Perbarui Profil
                </button>
              </div>

            </form>
          </div>
        )}

        {/* SUBTAB B: MYSQL BLUEPRINT EXPORTER */}
        {activeSubTab === 'database' && (
          <div className="islamic-card rounded-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900 mb-5">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#e5c158]" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Skema MySQL UKM Portal (Skripsi DDL)</h3>
              </div>

              <button
                onClick={handleCopyCode}
                className="bg-[#053224] hover:bg-[#e5c158] border border-yellow-500/10 hover:border-transparent text-[#e5c150] hover:text-emerald-950 font-bold text-[9px] px-3.5 py-2 rounded-xl transition-all uppercase tracking-widest cursor-pointer flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy SQL'}
              </button>
            </div>

            <p className="text-[11px] text-gray-400 italic leading-relaxed mb-4">
              Semua struktur tabel di bawah ini telah disesuaikan demi mendukung pemenuhan tugas akhir sistem informasi keanggotaan UKM. Mendukung relasi Geofencing, absensi siswa QR, setoran hafalan, dan poin gamifikasi.
            </p>

            <div className="relative">
              <pre className="bg-[#01110c] border border-emerald-950 text-[#10b981] font-mono text-[10px] p-4 rounded-xl overflow-x-auto max-h-[400px] leading-relaxed">
                {sqlBlueprint}
              </pre>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
