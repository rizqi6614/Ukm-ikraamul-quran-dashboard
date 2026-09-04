import React, { useState, useEffect, FormEvent } from 'react';
import { 
  Award, TrendingUp, Calendar, AlertCircle, PlusCircle, CheckCircle, 
  Trash2, X, RefreshCw, Layers, BookOpen, Clock, Activity, BarChart2 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { Member, MemorizationRecord, UserRole } from '../types';

interface StatistikHafalanProps {
  currentUser: Member;
  onMemorizationSubmitted: (updatedMember: Member) => void;
}

export default function StatistikHafalan({ currentUser, onMemorizationSubmitted }: StatistikHafalanProps) {
  const [records, setRecords] = useState<MemorizationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Setoran Form Inputs
  const [formSurah, setFormSurah] = useState('Al-Fatihah');
  const [formStartVerse, setFormStartVerse] = useState(1);
  const [formEndVerse, setFormEndVerse] = useState(7);
  const [formType, setFormType] = useState<'Ziyadah' | 'Murojaah'>('Ziyadah');
  const [formNotes, setFormNotes] = useState('');

  const isScholars = currentUser.role === 'Admin' || currentUser.role === 'Pengurus';

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/memorization');
      const data = await res.json();
      setRecords(data);
    } catch {
      console.warn("Using offline memorization records fallback");
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSetor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/memorization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: currentUser.id,
          memberName: currentUser.name,
          surahName: formSurah,
          startVerse: Number(formStartVerse),
          endVerse: Number(formEndVerse),
          type: formType,
          notes: formNotes
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setShowAddModal(false);
        // Refresh histories
        await fetchRecords();
        // Notify Parent of point gains
        onMemorizationSubmitted(data.member);
        
        // Reset Inputs
        setFormNotes('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/memorization/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        await fetchRecords();
        alert("Setoran hafalan anggota berhasil diverifikasi dan poin disalurkan!");
      }
    } catch {
      alert("Gagal melakukan verifikasi setoran.");
    }
  };

  // Prepare dual charts data representation
  const weeklyTrendData = [
    { day: 'Senin', 'Setoran Ziyadah': 14, 'Murojaah': 28 },
    { day: 'Selasa', 'Setoran Ziyadah': 18, 'Murojaah': 30 },
    { day: 'Rabu', 'Setoran Ziyadah': 23, 'Murojaah': 35 },
    { day: 'Kamis', 'Setoran Ziyadah': 15, 'Murojaah': 22 },
    { day: 'Jumat', 'Setoran Ziyadah': 28, 'Murojaah': 40 },
    { day: 'Sabtu', 'Setoran Ziyadah': 35, 'Murojaah': 54 },
    { day: 'Ahad', 'Setoran Ziyadah': 40, 'Murojaah': 65 },
  ];

  const halaqahComparisonData = [
    { name: 'Halaqah Abu Bakar', 'Hafalan Selesai (Siswa)': 182 },
    { name: 'Halaqah Umar', 'Hafalan Selesai (Siswa)': 154 },
    { name: 'Halaqah Utsman', 'Hafalan Selesai (Siswa)': 120 },
    { name: 'Halaqah Ali', 'Hafalan Selesai (Siswa)': 98 },
  ];

  // If ordinary member, filter records to show only theirs
  const displayRecords = isScholars ? records : records.filter(r => r.memberId === currentUser.id);

  return (
    <div id="statistik-hafalan-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-1 select-none font-sans">
      
      {/* Upper Dual Charts - Col 12 */}
      <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Trend Area Chart */}
        <div className="islamic-card rounded-2xl p-4 h-76 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-900 mb-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-black text-yellow-105 uppercase tracking-widest">Tren Setoran Ayat Harian</h4>
            </div>
            <span className="text-[8px] bg-emerald-950 font-bold px-2 py-0.5 rounded text-emerald-300">Minggu Ini</span>
          </div>

          <div className="w-full h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrendData}>
                <defs>
                  <linearGradient id="colorZiyadah" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e5c158" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#e5c158" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMurojaah" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#022e20" />
                <XAxis dataKey="day" stroke="#047857" style={{ fontSize: '10px' }} />
                <YAxis stroke="#047857" style={{ fontSize: '10px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#021811', border: '1px solid #10b981', borderRadius: '10px', fontSize: '11px', color: '#fff' }} />
                <Area type="monotone" dataKey="Setoran Ziyadah" stroke="#e5c158" fillOpacity={1} fill="url(#colorZiyadah)" strokeWidth={2} />
                <Area type="monotone" dataKey="Murojaah" stroke="#10b981" fillOpacity={1} fill="url(#colorMurojaah)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Halaqah comparison bar chart */}
        <div className="islamic-card rounded-2xl p-4 h-76 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-900 mb-2">
            <div className="flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-[#e5c158]" />
              <h4 className="text-xs font-black text-yellow-105 uppercase tracking-widest">Aktivitas Murojaah per Halaqah</h4>
            </div>
            <span className="text-[8px] bg-emerald-950 font-bold px-2 py-0.5 rounded text-[#e5c158]">Semester Genap</span>
          </div>

          <div className="w-full h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={halaqahComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#022e20" />
                <XAxis dataKey="name" stroke="#047857" style={{ fontSize: '9px' }} />
                <YAxis stroke="#047857" style={{ fontSize: '10px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#021811', border: '1px solid #e5c158', borderRadius: '10px', fontSize: '11px', color: '#fff' }} />
                <Bar dataKey="Hafalan Selesai (Siswa)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Setor Logs / Approvals Table Layout - Col 12 */}
      <div className="lg:col-span-12 flex flex-col gap-4">
        
        {/* Header Action bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4.5 h-4.5 text-[#e5c158]" />
            <span className="text-xs font-black text-gray-100 uppercase tracking-widest">
              {isScholars ? 'Verifikasi Setoran Anggota' : 'Riwayat Setoran Saya'}
            </span>
          </div>

          {/* Members button to setor new verses */}
          {!isScholars && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 text-white text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow"
            >
              <PlusCircle className="w-4 h-4" />
              Setor Hafalan Baru
            </button>
          )}
        </div>

        {/* History table list */}
        <div id="setoran-hafalan-logs" className="islamic-card rounded-2xl overflow-hidden border border-yellow-500/10 mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-emerald-900">
              <thead className="bg-[#021811] text-emerald-400 font-extrabold uppercase tracking-wider text-[9px] pointer-events-none">
                <tr>
                  <th className="px-5 py-4">Siswa</th>
                  <th className="px-5 py-4">Nominal Hafalan</th>
                  <th className="px-5 py-4">Surah Al-Qur'an</th>
                  <th className="px-5 py-4">Tipe Setoran</th>
                  <th className="px-5 py-4">Komentar / Catatan</th>
                  <th className="px-5 py-4">Status Approvals</th>
                  {isScholars && <th className="px-5 py-4 text-right">Tindakan</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/80 bg-transparent text-gray-200">
                {displayRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-emerald-950/20 transition-all">
                    
                    {/* User profile */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-extrabold text-gray-100">{rec.memberName}</div>
                        <div className="text-[9px] text-emerald-600 font-mono mt-0.5">{rec.date}</div>
                      </div>
                    </td>

                    {/* Verses range */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-extrabold text-[#e5c150] text-xs">{(rec.endVerse - rec.startVerse) + 1} <span className="text-[9px] font-medium text-emerald-500">Ayat</span></span>
                    </td>

                    {/* Surah names */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold text-gray-200">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                        QS. {rec.surahName} (Ayat {rec.startVerse}-{rec.endVerse})
                      </div>
                    </td>

                    {/* Type setoran */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider ${
                        rec.type === 'Ziyadah' ? 'bg-[#3b2306] text-[#e5bc58] border border-yellow-500/10' : 'bg-emerald-950 text-emerald-300'
                      }`}>
                        {rec.type}
                      </span>
                    </td>

                    {/* Description comments */}
                    <td className="px-5 py-4 max-w-xs truncate text-[11px] text-gray-400">
                      {rec.notes || '—'}
                    </td>

                    {/* Status approvals validation */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`text-[9px] font-black uppercase tracking-wider flex items-center gap-1 px-2.5 py-0.5 rounded border inline-flex ${
                        rec.status === 'Disetujui' 
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30' 
                          : 'bg-yellow-950/40 text-yellow-300 border-yellow-500/30 animate-pulse'
                      }`}>
                        {rec.status === 'Disetujui' ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <AlertCircle className="w-3 h-3 text-yellow-400" />}
                        {rec.status}
                      </span>
                    </td>

                    {/* Admin verify button */}
                    {isScholars && (
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        {rec.status === 'Menunggu' ? (
                          <button
                            onClick={() => handleApprove(rec.id)}
                            className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 hover:border-emerald-500 text-emerald-300 py-1 px-2.5 rounded-lg text-[9px] font-bold tracking-widest uppercase transition-all cursor-pointer"
                          >
                            Verify & Approve
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-extrabold italic">Verified</span>
                        )}
                      </td>
                    )}

                  </tr>
                ))}

                {displayRecords.length === 0 && (
                  <tr>
                    <td colSpan={isScholars ? 7 : 6} className="text-center py-10 text-[10px] text-emerald-700 italic font-medium">Belum ada catatan setoran mutabaah tersimpan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* MODAL WINDOW: SETORAN BARU HAFALAN */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#020d0ad0] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#032117] rounded-2xl border border-yellow-500/25 p-6 w-full max-w-md shadow-2xl relative select-none">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-emerald-500 hover:text-yellow-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 pb-3 border-b border-emerald-900 mb-4 pointer-events-none">
              <Award className="w-5 h-5 text-[#e5c150]" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Setoran Murotil Qur'an</h3>
            </div>

            <form onSubmit={handleSetor} className="space-y-4 text-left">
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Nama Surah Al-Qur'an</label>
                <select
                  value={formSurah} onChange={e=>setFormSurah(e.target.value)}
                  className="w-full bg-[#011a14] border border-yellow-500/10 rounded-xl px-3 py-2.5 text-xs text-gray-200 outline-none"
                >
                  <option value="Al-Fatihah">Al-Fatihah</option>
                  <option value="Al-Baqarah">Al-Baqarah</option>
                  <option value="Al-Imran">Al-Imran</option>
                  <option value="An-Naba'">An-Naba'</option>
                  <option value="Al-Alaq">Al-Alaq</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Dari Ayat ke-</label>
                  <input
                    type="number" required
                    value={formStartVerse} onChange={e=>setFormStartVerse(Number(e.target.value))}
                    className="w-full bg-[#011a14] border border-yellow-500/10 focus:border-[#e5c158] rounded-xl px-3 py-2.5 text-xs text-gray-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Hingga Ayat ke-</label>
                  <input
                    type="number" required
                    value={formEndVerse} onChange={e=>setFormEndVerse(Number(e.target.value))}
                    className="w-full bg-[#011a14] border border-yellow-500/10 focus:border-[#e5c158] rounded-xl px-3 py-2.5 text-xs text-gray-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Metode Setoran</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button" onClick={() => setFormType('Ziyadah')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${formType === 'Ziyadah' ? 'bg-[#063124] border-[#e5c158] text-[#e5c158]' : 'bg-[#011a14] border-emerald-950 text-emerald-500'}`}
                  >
                    🚀 Ziyadah (Hafalan Baru)
                  </button>
                  <button
                    type="button" onClick={() => setFormType('Murojaah')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${formType === 'Murojaah' ? 'bg-[#063124] border-[#e5c150] text-[#e5c158]' : 'bg-[#011a14] border-emerald-950 text-emerald-500'}`}
                  >
                    🔁 Murojaah (Pengulangan)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Catatan Tambahan Makhraj / Surat</label>
                <textarea
                  placeholder="Contoh: Menyetorkan hafalan lancar dengan tartil makrak bighunnah..."
                  value={formNotes} onChange={e=>setFormNotes(e.target.value)}
                  className="w-full bg-[#011a14] border border-yellow-500/10 focus:border-[#e5c158] rounded-xl px-3 py-2.5 text-xs text-gray-200 outline-none h-20 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-3 justify-end border-t border-emerald-900/60 mt-3">
                <button
                  type="button" onClick={() => setShowAddModal(false)}
                  className="bg-emerald-950 hover:bg-emerald-900 border border-yellow-500/5 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#e5c158] to-[#ab8922] hover:from-[#fecc60] text-emerald-950 font-black px-4 py-2.5 rounded-xl text-xs cursor-pointer shadow shadow-yellow-500/10"
                >
                  Setorkan Hafalan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
