import { useEffect, useState } from 'react';
import { 
  Users, Calendar as CalendarIcon, Compass, Award, BookOpen, MapPin, 
  Clock, Navigation, CheckCircle2, ChevronLeft, ChevronRight, Info, Sparkles, Bot, PhoneCall
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Member, Study, AttendanceRecord, MemorizationRecord } from '../types';

interface DashboardProps {
  currentUser: Member;
  members: Member[];
  studies: Study[];
  attendance: AttendanceRecord[];
  memorization: MemorizationRecord[];
  onNavigate: (tabId: string) => void;
}

export default function DashboardOverview({ 
  currentUser, 
  members,
  studies, 
  attendance, 
  memorization, 
  onNavigate 
}: DashboardProps) {
  
  const [timeStr, setTimeStr] = useState("20 Juni 2026 | 08:30 WIB");
  const [selectedDay, setSelectedDay] = useState(20);

  // Sync real-time simulated WIB clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      };
      const formatted = now.toLocaleDateString('id-ID', options);
      setTimeStr(formatted + " WIB");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Generate last 5 days chart data dynamically based on actual memorization records
  const getLineChartData = () => {
    const dataPoints = [];
    const today = new Date();
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      const dailyCount = memorization
        .filter(m => m.date === dateStr)
        .reduce((sum, m) => sum + m.ayatCount, 0);
      dataPoints.push({ name: label, ayat: dailyCount });
    }
    return dataPoints;
  };
  const lineChartData = getLineChartData();
  const activeStudy = studies.length > 0 ? studies[0] : null;

  // Quick statistics based on our loaded database
  const activeAttendeesCount = new Set(attendance.map(a => a.memberId)).size; 
  const totalAnggota = members.length || 3;
  const kajianBulanIni = studies.length;
  const hafalanTercapaiAyat = memorization.reduce((sum, rec) => sum + rec.ayatCount, 0);

  // Render Category dot color helper
  const getCategoryDotClass = (type: string) => {
    switch(type) {
      case 'Tahsin': return 'bg-emerald-500';
      case 'Kajian': return 'bg-blue-500';
      case 'Pelatihan': return 'bg-amber-500';
      case 'Lomba': return 'bg-purple-500';
      case 'Rapat': return 'bg-orange-500';
      default: return 'bg-gray-400';
    }
  };

  // Static Calendar simulation for June 2026
  const calendarDays = [
    { day: 25, prev: true }, { day: 26, prev: true }, { day: 27, prev: true }, { day: 28, prev: true }, { day: 29, prev: true }, { day: 30, prev: true }, { day: 31, prev: true },
    { day: 1, type: 'Kajian' }, { day: 2 }, { day: 3, type: 'Tahsin' }, { day: 4, type: 'Pelatihan' }, { day: 5, type: 'Lomba' }, { day: 6 }, { day: 7, type: 'Rapat' },
    { day: 8 }, { day: 9 }, { day: 10, type: 'Tahsin' }, { day: 11, type: 'Pelatihan' }, { day: 12 }, { day: 13, type: 'Kajian' }, { day: 14 },
    { day: 15 }, { day: 16 }, { day: 17, type: 'Tahsin' }, { day: 18, type: 'Pelatihan' }, { day: 19 }, { day: 20, type: 'Kajian', current: true }, { day: 21 },
    { day: 22, type: 'Kajian' }, { day: 23 }, { day: 24, type: 'Tahsin' }, { day: 25, type: 'Pelatihan' }, { day: 26 }, { day: 27, type: 'Rapat' }, { day: 28 },
    { day: 29 }, { day: 30 }, { day: 1, next: true }, { day: 2, next: true }, { day: 3, next: true }, { day: 4, next: true }, { day: 5, next: true }
  ];

  return (
    <div id="dashboard-overview" className="flex flex-col gap-6 font-sans">
      
      {/* 1. Dashboard Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-100 tracking-tight">
              Assalamu'alaikum, {currentUser.name} 👋
            </h1>
            <span className="bg-yellow-500/10 text-[#e5c158] border border-yellow-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {currentUser.role}
            </span>
          </div>
          <p className="text-xs text-emerald-400 font-semibold mt-1">
            {currentUser.branch}
          </p>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-500 font-medium">
            <span className="text-[#e5c150]">“</span>
            <span className="italic">Belajar, Mengamalkan, dan Menebarkan Al-Qur'an</span>
            <span className="text-[#e5c150]">”</span>
          </div>
        </div>

        {/* Calendar / Dynamic WIB Clock & Profile Badge */}
        <div className="flex items-center gap-4 self-end md:self-center">
          <div className="text-right select-none shrink-0">
            <div className="text-[#e5c158] font-bold text-xs tracking-wider">{timeStr}</div>
            <div className="text-[10px] text-emerald-500 font-semibold">UKM IKRAAMUL QUR'AN UTAMA</div>
          </div>
          <div className="relative group cursor-pointer" onClick={() => onNavigate('pengaturan')}>
            <div className="w-10 h-10 rounded-full border-2 border-[#e5c158]/50 overflow-hidden shadow">
              <img 
                src={currentUser.avatar} 
                alt="profile" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
                }}
              />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#02130e] rounded-full" />
          </div>
        </div>
      </div>

      {/* 2. Headline stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Anggota */}
        <div className="islamic-card rounded-2xl p-4 flex items-center gap-3.5 relative overflow-hidden group hover:scale-[1.01] transition-transform">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-500">Total Anggota</div>
            <div className="text-xl font-extrabold text-white mt-0.5">{totalAnggota}</div>
            <div className="text-[9px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <span className="text-emerald-300 font-bold">+15</span> dari bulan lalu
            </div>
          </div>
        </div>

        {/* Kegiatan Bulan Ini */}
        <div className="islamic-card rounded-2xl p-4 flex items-center gap-3.5 relative overflow-hidden group hover:scale-[1.01] transition-transform">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/10 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-500">Kegiatan Bulan Ini</div>
            <div className="text-xl font-extrabold text-white mt-0.5">{kajianBulanIni}</div>
            <div className="text-[9px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <span className="text-emerald-300 font-bold">+4</span> dari bulan lalu
            </div>
          </div>
        </div>

        {/* Peserta Aktif */}
        <div className="islamic-card rounded-2xl p-4 flex items-center gap-3.5 relative overflow-hidden group hover:scale-[1.01] transition-transform">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/10 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-500">Peserta Aktif</div>
            <div className="text-xl font-extrabold text-white mt-0.5">{activeAttendeesCount}</div>
            <div className="text-[9px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <span className="text-emerald-300 font-bold">80.8%</span> dari total anggota
            </div>
          </div>
        </div>

        {/* Hafalan Tercapai */}
        <div className="islamic-card rounded-2xl p-4 flex items-center gap-3.5 relative overflow-hidden group hover:scale-[1.01] transition-transform">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-500">Hafalan Tercapai</div>
            <div className="text-xl font-extrabold text-white mt-0.5">{hafalanTercapaiAyat.toLocaleString('id-ID')} <span className="text-[10px] font-medium text-emerald-400">Ayat</span></div>
            <div className="text-[9px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <span className="text-emerald-300 font-bold">+320</span> ayat hari ini
            </div>
          </div>
        </div>

        {/* Poin Berkah Card (Highlight) */}
        <div className="col-span-2 lg:col-span-1 rounded-2xl p-4 bg-gradient-to-tr from-[#9b7722] to-[#e5c158] flex flex-col justify-between relative overflow-hidden group cursor-pointer shadow hover:scale-[1.01] transition-all" onClick={() => onNavigate('poin')}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-black/15 flex items-center justify-center">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[9px] uppercase font-bold tracking-widest text-emerald-950">Poin Berkah XP</div>
              <div className="text-base font-black text-emerald-950">{currentUser.totalPoints.toLocaleString('id-ID')} <span className="text-[9px] font-bold">XP</span></div>
            </div>
          </div>
          {/* Level indicators */}
          <div className="mt-3.5">
            <div className="flex items-center justify-between text-[8px] text-emerald-950/80 font-extrabold uppercase tracking-wider">
              <span>Lv {currentUser.level} ♦ {currentUser.levelName}</span>
              <span>{(currentUser.xp % 2500)} / 2500 XP</span>
            </div>
            {/* XP progress bar */}
            <div className="w-full bg-black/15 rounded-full h-1 mt-1 overflow-hidden">
              <div 
                className="bg-[#032117] h-full rounded-full transition-all" 
                style={{ width: `${((currentUser.xp % 2500) / 2500) * 100}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* 3. Map, Schedules & Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Lokasi Kegiatan Hari Ini - 5 Cols */}
        <div className="lg:col-span-5 islamic-card rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pointer-events-none mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5 text-[#e5c158]" />
                <h3 className="text-xs font-bold text-gray-100 tracking-wider">Lokasi Kegiatan Hari Ini</h3>
              </div>
              <span className="text-[10px] text-[#e5c158] font-bold">Lihat Semua</span>
            </div>

            {/* Custom Interactive Map Box */}
            <div className="relative h-44 rounded-xl border border-yellow-500/10 overflow-hidden bg-emerald-950/40 divide-y divide-emerald-900 mb-3.5">
              {/* Virtual Leaflet Map Layout Canvas */}
              <div className="absolute inset-0 bg-[#042017]/80 opacity-40 mix-blend-overlay pointer-events-none" />
              {/* Fake roads, university, and center gold icon representing UNINUS Bandung */}
              <div className="absolute inset-0 p-4 font-mono text-[9px] text-emerald-800 pointer-events-none select-none">
                <div className="absolute top-4 left-6">{activeStudy ? activeStudy.location : "UNINUS Bandung"}</div>
                <div className="absolute bottom-6 right-10">Gedung Rektorat UNINUS</div>
                <div className="absolute top-1/2 left-1/3 rotate-15 w-60 h-[1px] bg-emerald-950" />
                <div className="absolute top-1/3 left-1/4 rotate-45 w-40 h-[1px] bg-emerald-950" />
                <div className="absolute bottom-1/3 right-8 font-serif italic">Buahbatu, Bandung</div>
              </div>

              {/* Gold Mosque Pin layout */}
              <div className="absolute top-[48%] left-[45%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="relative">
                  <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-[#e5c158]/20 border border-[#e5c158]/50 animate-ping" />
                  <div className="w-8 h-8 rounded-full bg-[#113d2f] border-2 border-[#e5c158] flex items-center justify-center shadow-lg relative z-10">
                    <span className="text-sm">🕌</span>
                  </div>
                </div>
                <div className="bg-[#02130e] border border-yellow-500/30 text-[8px] text-[#e5c158] font-bold px-2 py-0.5 rounded shadow mt-1.5 whitespace-nowrap">
                  {activeStudy ? `${activeStudy.location} (Target GPS)` : "Masjid Al-Ikhlas UNINUS (Target GPS)"}
                </div>
              </div>
            </div>

            {/* Text description details */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[8px] font-bold px-2 py-0.5 rounded">
                    {activeStudy ? "Kajian Terjadwal" : "Belum Ada Kajian"}
                  </span>
                  {activeStudy && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                </div>
                <h4 className="text-sm font-bold text-gray-100 mt-1">
                  {activeStudy ? activeStudy.title : "Tidak Ada Kajian Terjadwal"}
                </h4>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="font-semibold text-[#e5c158]">
                    {activeStudy ? activeStudy.location : "Masjid Al-Ikhlas UNINUS"}
                  </span>
                </div>
                <p className="text-[9px] text-emerald-500 mt-1">
                  {activeStudy 
                    ? `Koordinat GPS: ${activeStudy.lat.toFixed(6)}, ${activeStudy.lng.toFixed(6)}` 
                    : "Jl. Soekarno Hatta No.530, Buahbatu, Bandung"}
                </p>
              </div>
            </div>
          </div>

          {/* Location details buttons */}
          <div className="flex items-center gap-2 mt-4">
            <button 
              onClick={() => onNavigate('presensi')}
              className="flex-1 bg-emerald-900/60 hover:bg-emerald-900 border border-yellow-500/10 hover:border-yellow-500/25 text-emerald-300 font-bold text-[10px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-[#e5c158]" />
              Lihat Detail
            </button>
            <button 
              onClick={() => onNavigate('presensi')}
              className="flex-1 bg-gradient-to-r from-[#e5c158] to-[#ab8922] hover:from-[#fdde7c] text-emerald-950 font-black text-[10px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow hover:shadow-yellow-500/10"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Presensi Sekarang
            </button>
          </div>
        </div>

        {/* Jadwal Kegiatan Hari Ini - 4 Cols */}
        <div className="lg:col-span-4 islamic-card rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 pointer-events-none">
              <div className="flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-[#e5c158]" />
                <h3 className="text-xs font-bold text-gray-100 tracking-wider">Jadwal Kegiatan Hari Ini</h3>
              </div>
              <span className="text-[10px] text-[#e5c158] font-bold">Lihat Semua</span>
            </div>

            {/* List with timeline line dots */}
            <div className="flex flex-col gap-3.5 relative pl-3 border-l border-emerald-900/60 ml-1 py-1">
              {studies.slice(0, 5).map((study, idx) => (
                <div key={study.id} className="relative group select-none">
                  {/* Timeline dot decoration */}
                  <span className={`absolute -left-[16.5px] top-1.5 w-2.5 h-2.5 rounded-full border border-[#02130e] ${getCategoryDotClass(study.type)}`} />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[11px] font-extrabold text-gray-200 group-hover:text-[#e5c158] transition-colors">{study.title}</h4>
                      <p className="text-[9px] text-[#e5c158] font-semibold">{study.location}</p>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900">
                      {study.time.split(" ")[0]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#02140f] border border-yellow-500/10 rounded-xl p-2 text-center text-[9px] text-emerald-400 mt-4 leading-relaxed">
            🔔 <strong>Pengingat:</strong> Silakan aktifkan GPS HP Anda untuk kemudahan Verifikasi Presensi Geofencing di lokasi.
          </div>
        </div>

        {/* Kalender Kegiatan - 3 Cols */}
        <div className="lg:col-span-3 islamic-card rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pointer-events-none">
              <h3 className="text-xs font-extrabold text-gray-100 tracking-wider">Kalender Kegiatan</h3>
              
              <div className="flex items-center gap-1.5 text-[#e5c158]">
                <button className="p-0.5 rounded bg-emerald-950/50 border border-yellow-500/10"><ChevronLeft className="w-3.5 h-3.5" /></button>
                <span className="text-[9px] uppercase font-bold tracking-widest px-1">Juni 2026</span>
                <button className="p-0.5 rounded bg-emerald-950/50 border border-yellow-500/10"><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* Micro grid calendar headers */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[8px] text-emerald-500 uppercase tracking-wider mt-4">
              <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
            </div>

            {/* Grid Days */}
            <div className="grid grid-cols-7 gap-0.5 text-center mt-2">
              {calendarDays.map((d, index) => (
                <button
                  key={index}
                  onClick={() => !d.prev && !d.next && setSelectedDay(d.day)}
                  className={`
                    py-1.5 rounded-lg text-[10px] font-bold transition-all relative flex flex-col items-center justify-between cursor-pointer
                    ${d.prev || d.next ? 'text-emerald-950/50 pointer-events-none' : 'text-gray-300 hover:bg-emerald-950/40'}
                    ${d.current ? 'bg-gradient-to-b from-[#e5c158] to-[#ab8922] text-[#02130e] font-black scale-105 shadow' : ''}
                    ${selectedDay === d.day && !d.current && !d.prev && !d.next ? 'bg-emerald-900 text-yellow-300 font-black border border-yellow-500/20' : ''}
                  `}
                >
                  <span>{d.day}</span>
                  {/* Category bullet indicator */}
                  {d.type && !d.current && (
                    <span className={`w-1 h-1 rounded-full ${getCategoryDotClass(d.type)} absolute bottom-0.5`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Dots legend */}
          <div className="flex flex-wrap gap-2 text-[8px] font-bold text-emerald-400 mt-4 border-t border-emerald-900/60 pt-3 self-center">
            <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Tahsin</div>
            <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Kajian</div>
            <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pelatihan</div>
            <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Lomba</div>
            <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Rapat</div>
          </div>

        </div>

      </div>

      {/* 4. Monitoring Kehadiran, Statistik Hafalan & Flyer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Monitoring Kehadiran - 4 Cols */}
        <div className="lg:col-span-4 islamic-card rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/60">
              <h3 className="text-xs font-bold text-gray-100 tracking-wider">Monitoring Kehadiran</h3>
              <span className="text-[10px] text-[#e5c158] font-bold hover:underline cursor-pointer" onClick={() => onNavigate('presensi')}>Lihat Detail</span>
            </div>

            {/* Circular Donut mock visual */}
            <div className="flex items-center gap-5 mt-4">
              
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                {/* Visual SVG Donut Chart representing stats: Hadir 185, Izin 30, Alpa 35 = Total 250 */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Gray background */}
                  <path className="text-emerald-950" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  {/* Hadir (Green): 74% = dasharray 74 100 */}
                  <path className="text-emerald-500" strokeWidth="4.2" strokeLeft-cap="round" strokeDasharray="74, 100" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" />
                  {/* Izin (Yellow): 12% = offset 74, draft 12 100 */}
                  <path className="text-amber-500" strokeWidth="3.5" strokeDasharray="12, 100" strokeDashoffset="-74" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" />
                  {/* Alpa (Red): 14% = offset 86, draft 14 100 */}
                  <path className="text-red-500" strokeWidth="3.5" strokeDasharray="14, 100" strokeDashoffset="-86" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" />
                </svg>
                {/* Center text of Circle */}
                <div className="absolute flex flex-col items-center">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold">Total</span>
                  <span className="text-lg font-black text-white">250</span>
                  <span className="text-[8px] text-emerald-500 font-semibold">Peserta</span>
                </div>
              </div>

              {/* Legends list */}
              <div className="flex flex-col gap-2.5 text-[11px] font-bold text-gray-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Hadir: 185 <span className="text-[9px] text-emerald-400 font-normal">(74%)</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Izin: 30 <span className="text-[9px] text-emerald-400 font-normal">(12%)</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span>Alpa: 35 <span className="text-[9px] text-emerald-400 font-normal">(14%)</span></span>
                </div>
              </div>

            </div>
          </div>

          <div className="flex items-center justify-between border-t border-emerald-900/60 pt-3 mt-4 text-[10px] uppercase font-bold">
            <span className="text-emerald-500">Tingkat Kehadiran</span>
            <span className="text-emerald-400 text-sm font-black">86%</span>
          </div>
        </div>

        {/* Statistik Hafalan - 5 Cols */}
        <div className="lg:col-span-5 islamic-card rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/60">
              <h3 className="text-xs font-bold text-gray-100 tracking-wider">Statistik Hafalan</h3>
              <span className="text-[10px] text-[#e5c158] font-bold hover:underline cursor-pointer" onClick={() => onNavigate('laporan')}>Lihat Detail</span>
            </div>

            {/* Flex grid content */}
            <div className="grid grid-cols-12 gap-3 mt-3.5">
              
              <div className="col-span-4 flex flex-col justify-around select-none">
                <div>
                  <div className="text-[8px] font-bold uppercase text-emerald-500">Setoran Hari Ini</div>
                  <div className="text-sm font-black text-gray-100 mt-0.5">125 Ayat</div>
                </div>
                <div>
                  <div className="text-[8px] font-bold uppercase text-emerald-500">Murojaah</div>
                  <div className="text-sm font-black text-gray-100 mt-0.5">87 Ayat</div>
                </div>
                <div>
                  <div className="text-[8px] font-bold uppercase text-emerald-500">Target Juz 30</div>
                  <div className="text-xs font-extrabold text-[#e5c158] mt-0.5">78% <span className="text-[8px] text-emerald-400 font-normal">Tercapai</span></div>
                  {/* Mini target progress */}
                  <div className="w-full bg-[#02130e] rounded-full h-1 mt-1 overflow-hidden">
                    <div className="bg-[#e5c158] h-full rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>
              </div>

              {/* Line chart */}
              <div className="col-span-8 h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData} margin={{ top: 5, right: 5, left: -25, bottom: -5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.05)" />
                    <XAxis dataKey="name" stroke="#047857" tick={{ fontSize: 8, fontWeight: 'bold' }} />
                    <YAxis stroke="#047857" tick={{ fontSize: 8 }} />
                    <Tooltip contentStyle={{ background: '#02130e', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: 8, fontSize: 10, color: '#fff' }} />
                    <Line type="monotone" dataKey="ayat" stroke="#e5c158" strokeWidth={2.5} dot={{ r: 3, fill: '#032117', stroke: '#e5c158', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

            </div>
          </div>

          <div className="text-[8px] text-emerald-500 mt-4 text-center leading-normal">
            Garis tren menunjukkan total ayat Al-Qur'an terkonsolidasi yang disetorkan oleh UKM dalam 5 hari terakhir.
          </div>
        </div>

        {/* Kajian Terbaru Flyer Card - 3 Cols */}
        <div className="lg:col-span-3 rounded-2xl bg-[#052c1f] p-4 border border-yellow-500/10 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-[#031d14] opacity-20 group-hover:scale-105 transition-all duration-300 pointer-events-none" />
          
          <div>
            <span className="bg-yellow-500/10 text-[#e5c158] border border-yellow-500/25 text-[8px] font-bold px-2 py-0.5 rounded tracking-widest uppercase">
              {activeStudy ? activeStudy.type : "Agenda Terdekat"}
            </span>
            <h4 className="text-sm font-black text-yellow-100 tracking-tight leading-snug mt-1.5 font-serif">
              {activeStudy ? activeStudy.title : "Belum Ada Kajian Aktif"}
            </h4>
            <div className="w-12 h-[1px] bg-yellow-500/30 mt-1.5" />

            <div className="flex flex-col gap-1.5 mt-3 text-[9px] font-bold text-emerald-400">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e5c158]" />
                <span>Pemateri: <strong className="text-gray-200">{activeStudy ? activeStudy.speaker : "-"}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e5c158]" />
                <span>Tanggal: <strong className="text-gray-200">{activeStudy ? activeStudy.date : "-"}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e5c158]" />
                <span>Waktu: <strong className="text-gray-200">{activeStudy ? activeStudy.time : "-"}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e5c158]" />
                <span>Lokasi: <strong className="text-gray-200">{activeStudy ? activeStudy.location : "Masjid Al-Ikhlas UNINUS"}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 relative z-10">
            <button 
              onClick={() => onNavigate('kajian')}
              className="flex-1 border border-yellow-500/10 hover:border-yellow-500/30 text-emerald-300 py-1.5 px-2 bg-emerald-950/40 rounded-lg text-[9px] font-bold cursor-pointer transition-all text-center"
            >
              Detail
            </button>
            <button 
              onClick={() => {
                if (activeStudy) {
                  alert("Pendaftaran Berhasil! Sampai jumpa di lokasi kajian.");
                } else {
                  alert("Belum ada kajian aktif untuk didaftar.");
                }
              }}
              className="flex-1 bg-[#e5c158] hover:bg-[#ffe17d] text-emerald-950 font-black py-1.5 px-2 rounded-lg text-[9px] cursor-pointer transition-all shadow shadow-yellow-500/10 text-center"
            >
              Daftar
            </button>
          </div>
        </div>

      </div>

      {/* 5. Al-Hadits motivasi banner & AI quick helper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-1 select-none">
        
        {/* Hadits Banner */}
        <div className="lg:col-span-8 rounded-2xl border border-emerald-900 bg-gradient-to-r from-[#031c13] to-[#043324] p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-emerald-500/5 border border-yellow-500/20 flex items-center justify-center shrink-0 text-xl font-serif text-[#e5c158]">
            📖
          </div>
          <div>
            <blockquote className="text-[11px] text-gray-200 font-semibold leading-relaxed">
              "Sebaik-baik kalian adalah orang yang belajar Al-Qur'an dan mengajarkannya."
            </blockquote>
            <cite className="text-[9px] text-[#e5c158] uppercase font-bold tracking-widest mt-1 block">
              (HR. Bukhari)
            </cite>
          </div>
        </div>

        {/* AI Quick Banner */}
        <div className="lg:col-span-4 rounded-2xl border border-[#e5c158]/15 bg-gradient-to-r from-[#031f15] to-[#01140f] p-4 flex items-center justify-between gap-3 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-100 flex items-center gap-1">
                AI Islami Assistant <Sparkles className="w-3 h-3 text-[#e5c158]" />
              </h4>
              <p className="text-[9px] text-emerald-500 mt-0.5 truncate max-w-[160px]">
                Tanya Al-Qur'an, Fiqih, & Tajwid
              </p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('ai')}
            className="bg-gradient-to-r from-[#e5c158] to-[#ab8922] hover:from-[#fede7c] text-emerald-950 font-black text-[9px] py-2 px-3 rounded-xl transition-all cursor-pointer shadow hover:shadow-yellow-500/10 whitespace-nowrap"
          >
            Mulai Tanya
          </button>
        </div>

      </div>

    </div>
  );
}
