import React, { useState, useRef, useCallback, FormEvent } from 'react';
import { 
  Calendar, BookOpen, Clock, MapPin, Plus, Sparkles,
  Trash2, X, PlusCircle, CheckCircle, Navigation, Image, Upload, Camera
} from 'lucide-react';
import { Member, Study, UserRole } from '../types';

interface StudiesProps {
  currentUser: Member;
  studies: Study[];
  onAddStudy: (newStudy: Study) => void;
  onDeleteStudy: (id: string) => void;
}

/** Compress an image File to a base64 JPEG, max 800px wide, quality 0.82 */
function compressImageToBase64(file: File, maxSize = 800, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxSize) { h = Math.round(h * maxSize / w); w = maxSize; }
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

export default function ManajemenStudies({ currentUser, studies, onAddStudy, onDeleteStudy }: StudiesProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'All' | 'Tahsin' | 'Kajian' | 'Pelatihan' | 'Lomba' | 'Rapat'>('All');
  
  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formSpeaker, setFormSpeaker] = useState('');
  const [formDate, setFormDate] = useState('2026-06-21');
  const [formTime, setFormTime] = useState('08.00 - 10.00 WIB');
  const [formLocation, setFormLocation] = useState('Masjid Al-Ikhlas UNINUS');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState<'Tahsin' | 'Kajian' | 'Pelatihan' | 'Lomba' | 'Rapat'>('Kajian');
  const [formQuota, setFormQuota] = useState(50);
  const [formLat, setFormLat] = useState(-6.9404285);
  const [formLng, setFormLng] = useState(107.6534246);
  const [formImageUrl, setFormImageUrl] = useState<string | undefined>(undefined);
  const [imgUploading, setImgUploading] = useState(false);

  const imgInputRef = useRef<HTMLInputElement>(null);

  const canEdit = currentUser.role === 'Admin' || currentUser.role === 'Pengurus';

  const handleImageFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('File harus berupa gambar.'); return; }
    setImgUploading(true);
    try {
      const compressed = await compressImageToBase64(file, 800, 0.82);
      setFormImageUrl(compressed);
    } catch {
      alert('Gagal memproses gambar, coba file lain.');
    } finally {
      setImgUploading(false);
      if (imgInputRef.current) imgInputRef.current.value = '';
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formSpeaker) return;

    const added: Study = {
      id: '', // handle by server
      title: formTitle,
      speaker: formSpeaker,
      date: formDate,
      time: formTime,
      location: formLocation,
      description: formDesc,
      type: formType,
      lat: formLat,
      lng: formLng,
      quota: Number(formQuota),
      registeredCount: 0,
      imageUrl: formImageUrl
    };

    onAddStudy(added);
    setShowAddModal(false);

    // Reset fields
    setFormTitle('');
    setFormSpeaker('');
    setFormImageUrl(undefined);
  };

  const resetModal = () => {
    setFormTitle('');
    setFormSpeaker('');
    setFormDate('2026-06-21');
    setFormTime('08.00 - 10.00 WIB');
    setFormLocation('Masjid Al-Ikhlas UNINUS');
    setFormDesc('');
    setFormType('Kajian');
    setFormQuota(50);
    setFormLat(-6.9404285);
    setFormLng(107.6534246);
    setFormImageUrl(undefined);
  };

  const filteredStudies = studies.filter(s => typeFilter === 'All' || s.type === typeFilter);

  const typeColor = (type: Study['type']) => {
    switch (type) {
      case 'Tahsin':    return 'bg-emerald-950 text-emerald-300';
      case 'Kajian':    return 'bg-blue-950 text-blue-300';
      case 'Pelatihan': return 'bg-amber-950 text-amber-300';
      case 'Lomba':     return 'bg-purple-950 text-purple-300';
      default:          return 'bg-orange-950 text-orange-300';
    }
  };

  return (
    <div id="manajemen-studieser" className="flex flex-col gap-6 p-1 select-none font-sans">
      
      {/* Filters and Header Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#011611] border border-yellow-500/10 rounded-xl p-1 self-start">
          {['All', 'Tahsin', 'Kajian', 'Pelatihan', 'Lomba', 'Rapat'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type as any)}
              className={`
                px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer
                ${typeFilter === type 
                  ? 'bg-[#063324] text-[#e5c158] border border-yellow-500/20 shadow' 
                  : 'text-emerald-500 hover:text-[#e5c158]'
                }
              `}
            >
              {type === 'All' ? 'Semua Kajian' : type}
            </button>
          ))}
        </div>

        {/* Create button */}
        {canEdit && (
          <button
            onClick={() => { resetModal(); setShowAddModal(true); }}
            className="bg-gradient-to-r from-[#e5c158] to-[#ab8922] hover:from-[#fccd5d] text-emerald-950 font-black text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 cursor-pointer shadow hover:shadow-yellow-500/10"
          >
            <PlusCircle className="w-4 h-4" />
            Posting Kajian / Kegiatan Baru
          </button>
        )}
      </div>

      {/* ── Grid listing ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStudies.map((study) => (
          <div 
            key={study.id} 
            className="islamic-card rounded-2xl overflow-hidden flex flex-col justify-between border hover:border-yellow-500/20 hover:scale-[1.01] transition-all relative group"
          >
            {/* ── Study Photo (if any) ── */}
            {study.imageUrl ? (
              <div className="w-full h-44 overflow-hidden shrink-0 relative">
                <img 
                  src={study.imageUrl} 
                  alt={study.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* type badge overlay */}
                <span className={`absolute top-2.5 left-2.5 text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-widest backdrop-blur-sm ${typeColor(study.type)}`}>
                  {study.type}
                </span>
              </div>
            ) : (
              /* No photo — decorative gradient header */
              <div className="w-full h-16 bg-gradient-to-br from-[#04261a] to-[#011611] flex items-center px-4 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-widest ${typeColor(study.type)}`}>
                  {study.type}
                </span>
              </div>
            )}

            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-1">
                {study.imageUrl ? null : null /* badge shown in overlay above */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-[9px] text-[#e5c158] font-bold font-mono uppercase bg-[#02130e] px-1.5 py-0.5 rounded border border-emerald-900">
                    {study.id}
                  </span>
                  {canEdit && (
                    <button
                      onClick={() => onDeleteStudy(study.id)}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                      title="Hapus Kegiatan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <h4 className="text-sm font-black text-white tracking-tight mt-1 group-hover:text-yellow-100 transition-colors">
                {study.title}
              </h4>
              <p className="text-[10px] text-[#e5c158] font-bold mt-1">Narasumber: {study.speaker}</p>

              <div className="w-full h-[1px] bg-emerald-950 my-3" />

              {/* Parameters */}
              <div className="flex flex-col gap-2 text-[10px] text-gray-300 font-bold">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Tanggal: <span className="font-mono text-emerald-400">{study.date}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Waktu: <span className="text-emerald-400">{study.time}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">Tempat: <span className="text-emerald-400">{study.location}</span></span>
                </div>
              </div>

              {study.description && (
                <p className="text-[10px] text-emerald-500 mt-3 leading-relaxed bg-[#02140f] p-2 rounded-lg border border-emerald-950">
                  {study.description}
                </p>
              )}

              {/* Quota and registration */}
              <div className="mt-auto pt-4">
                <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold mb-1 ml-0.5">
                  <span>Kuota Terdaftar</span>
                  <span>{study.registeredCount || 0} / {study.quota} Anggota</span>
                </div>
                <div className="w-full bg-[#01140f] h-1.5 rounded-full overflow-hidden mb-4">
                  <div 
                    className="bg-emerald-500 h-full" 
                    style={{ width: `${Math.min(100, Math.round(((study.registeredCount || 0) / study.quota) * 100))}%` }}
                  />
                </div>

                <button 
                  onClick={() => alert("Anda telah terdaftar di kajian/kegiatan ini. Silakan hadir tepat waktu!")}
                  className="w-full py-2 bg-emerald-950 hover:bg-[#063324] border border-yellow-500/10 hover:border-yellow-500/20 text-[#e5c158] font-bold text-[10px] rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-[#e5c158]" />
                  Daftar Sebagai Peserta
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── MODAL: ADD STUDY / ACTIVITY ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#020d0ad0] backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#032117] rounded-2xl border border-yellow-500/25 p-6 w-full max-w-lg shadow-2xl relative my-auto">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-emerald-500 hover:text-yellow-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 pb-3 border-b border-emerald-900 mb-4">
              <PlusCircle className="w-5 h-5 text-[#e5c150]" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Posting Kajian / Kegiatan</h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-left">

              {/* ── Photo Upload for Study ── */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-2">
                  Foto Kegiatan <span className="text-emerald-700 normal-case font-medium">(opsional)</span>
                </label>

                {formImageUrl ? (
                  /* Preview */
                  <div className="relative rounded-xl overflow-hidden border border-yellow-500/20 group">
                    <img src={formImageUrl} alt="preview" className="w-full h-40 object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => imgInputRef.current?.click()}
                        className="flex items-center gap-1.5 bg-[#e5c158] text-emerald-950 font-black text-[10px] px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" /> Ganti Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormImageUrl(undefined)}
                        className="flex items-center gap-1.5 bg-red-900 text-red-200 font-black text-[10px] px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Upload area */
                  <button
                    type="button"
                    onClick={() => imgInputRef.current?.click()}
                    disabled={imgUploading}
                    className="w-full h-32 border-2 border-dashed border-emerald-800 hover:border-yellow-500/40 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-[#011a14] hover:bg-[#02251b] group"
                  >
                    {imgUploading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-[#e5c158] border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] text-emerald-500">Memproses foto...</span>
                      </>
                    ) : (
                      <>
                        <Image className="w-8 h-8 text-emerald-700 group-hover:text-[#e5c158] transition-colors" />
                        <span className="text-[10px] text-emerald-500 group-hover:text-[#e5c158] transition-colors font-bold">
                          Klik untuk pilih foto dari galeri / folder
                        </span>
                        <span className="text-[9px] text-emerald-800">JPG, PNG, WebP — dikompres otomatis</span>
                      </>
                    )}
                  </button>
                )}

                <input
                  ref={imgInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFileChange}
                />
              </div>

              {/* Title & Speaker */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Judul Kajian / Kegiatan</label>
                  <input
                    type="text" required
                    placeholder="Contoh: Tadabbur Surah Al-Kahfi"
                    value={formTitle} onChange={e => setFormTitle(e.target.value)}
                    className="w-full bg-[#011a14] border border-yellow-500/10 focus:border-[#e5c158] rounded-xl px-3 py-2.5 text-xs text-gray-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Penceramah / Narasumber</label>
                  <input
                    type="text" required
                    placeholder="Contoh: Ustadz Adi Hidayat, Lc."
                    value={formSpeaker} onChange={e => setFormSpeaker(e.target.value)}
                    className="w-full bg-[#011a14] border border-yellow-500/10 focus:border-[#e5c158] rounded-xl px-3 py-2.5 text-xs text-gray-200 outline-none"
                  />
                </div>
              </div>

              {/* Category / Date / Time */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Kategori</label>
                  <select
                    value={formType} onChange={e => setFormType(e.target.value as any)}
                    className="w-full bg-[#011a14] border border-yellow-500/10 rounded-xl px-3 py-2.5 text-xs text-gray-200 outline-none"
                  >
                    <option value="Tahsin">Tahsin</option>
                    <option value="Kajian">Kajian Rutin</option>
                    <option value="Pelatihan">Pelatihan</option>
                    <option value="Lomba">Lomba Syiar</option>
                    <option value="Rapat">Rapat UKM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Tanggal</label>
                  <input
                    type="date" required
                    value={formDate} onChange={e => setFormDate(e.target.value)}
                    className="w-full bg-[#011a14] border border-yellow-500/10 rounded-xl px-3 py-2.5 text-xs text-gray-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Jam WIB</label>
                  <input
                    type="text" required
                    placeholder="08.00 - 10.00 WIB"
                    value={formTime} onChange={e => setFormTime(e.target.value)}
                    className="w-full bg-[#011a14] border border-yellow-500/10 rounded-xl px-3 py-2.5 text-xs text-gray-200 outline-none"
                  />
                </div>
              </div>

              {/* Geofencing coordinates */}
              <div className="bg-[#02130e] border border-[#e5c150]/10 rounded-xl p-3 space-y-3">
                <span className="block text-[9px] uppercase font-bold text-[#e5c158] font-mono">Target Koordinat Geofencing GPS (UNINUS Bandung)</span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-emerald-400 mb-1">Target Latitude</label>
                    <input
                      type="number" step="any" required
                      value={formLat} onChange={e => setFormLat(Number(e.target.value) || 0)}
                      className="w-full bg-[#011a14] border border-yellow-500/10 focus:border-[#e5c158] rounded-xl px-3 py-2 text-xs text-gray-200 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-emerald-400 mb-1">Target Longitude</label>
                    <input
                      type="number" step="any" required
                      value={formLng} onChange={e => setFormLng(Number(e.target.value) || 0)}
                      className="w-full bg-[#011a14] border border-yellow-500/10 focus:border-[#e5c158] rounded-xl px-3 py-2 text-xs text-gray-200 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Quota */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Nama Lokasi Fisik</label>
                  <input
                    type="text" required
                    value={formLocation} onChange={e => setFormLocation(e.target.value)}
                    className="w-full bg-[#011a14] border border-yellow-500/10 focus:border-[#e5c158] rounded-xl px-3 py-2.5 text-xs text-gray-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Kuota Kursi Max</label>
                  <input
                    type="number" required
                    value={formQuota} onChange={e => setFormQuota(Number(e.target.value))}
                    className="w-full bg-[#011a14] border border-yellow-500/10 focus:border-[#e5c158] rounded-xl px-3 py-2.5 text-xs text-gray-200 outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Deskripsi Singkat Acara</label>
                <textarea
                  placeholder="Ketik deskripsi atau silabus singkat kajian..."
                  value={formDesc} onChange={e => setFormDesc(e.target.value)}
                  className="w-full bg-[#011a14] border border-yellow-500/10 focus:border-[#e5c158] rounded-xl px-3 py-2.5 text-xs text-gray-200 outline-none h-16 resize-none"
                />
              </div>

              {/* Actions */}
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
                  Syiarkan Kajian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
