import { useState } from 'react';
import { BookOpen, Award, Calendar, Users, CheckCircle, ArrowRight, Sparkles, ChevronRight, GraduationCap, MapPin, Phone, Mail, Instagram, ShieldCheck, Download, Smartphone, Star, Shield, Zap, Heart, QrCode, Copy, Check, Youtube, Globe } from 'lucide-react';
import { Study } from '../types';

interface LandingPageProps {
  onNavigateDashboard: () => void;
  isLoggedIn: boolean;
  studies?: Study[];
}

const formatIndonesianDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

const getAgendaTerdekat = (studiesList?: Study[]) => {
  if (!studiesList || studiesList.length === 0) return null;
  const todayStr = new Date().toISOString().split('T')[0];
  const upcoming = studiesList.filter(s => s.date >= todayStr);
  if (upcoming.length > 0) {
    return upcoming.sort((a, b) => a.date.localeCompare(b.date))[0];
  }
  return [...studiesList].sort((a, b) => b.date.localeCompare(a.date))[0];
};

export default function LandingPage({ onNavigateDashboard, isLoggedIn, studies = [] }: LandingPageProps) {
  const sections = [
    { id: 'profil', label: 'Profil' },
    { id: 'visi-misi', label: 'Visi & Misi' },
    { id: 'kegiatan', label: 'Kegiatan' },
    { id: 'prestasi', label: 'Prestasi' },
    { id: 'program', label: 'Program' },
    { id: 'unduh', label: 'Unduh Aplikasi' },
    { id: 'infaq', label: 'Infaq & Shadaqah' },
  ];

  const activities = [
    {
      title: 'Halaqah Tahfidz & Murojaah',
      desc: 'Setoran hafalan rutin mingguan dan murajaah bersama asatidz pendamping untuk menjaga keaslian dan kekuatan hafalan.',
      icon: BookOpen,
      time: 'Setiap Hari / Fleksibel',
      location: 'Masjid Al-Ikhlas UNINUS / Online',
      image: '/halaqah.jpg'
    },
    {
      title: 'Kajian Akhlak & Fiqh Ibadah',
      desc: 'Kajian intensif membahas fiqh praktis sehari-hari dan penanaman karakter Qur\'ani di era modern.',
      icon: Users,
      time: 'Sabtu, 10.00 WIB',
      location: 'Masjid Al-Ikhlas UNINUS / Aula',
      image: '/kajian.jpg'
    },
    {
      title: 'Bimtek Tahsin Al-Qur\'an',
      desc: 'Bimbingan teknik membaca Al-Qur\'an dengan tajwid yang benar mulai dari makhraj hingga sifat-sifat huruf.',
      icon: Sparkles,
      time: 'Sabtu, 08.00 WIB',
      location: 'Masjid Al-Ikhlas UNINUS',
      image: '/tahsin.jpg'
    },
    {
      title: 'IQ Mengajar',
      desc: 'Program pengabdian masyarakat di mana kader UKM Ikraamul Qur\'an mengajar membaca Al-Qur\'an dan dasar-dasar agama Islam untuk anak-anak.',
      icon: GraduationCap,
      time: 'Minggu, 09.00 WIB',
      location: 'TPQ Binaan UNINUS / Masjid Sekitar',
      image: '/mengajar.jpg'
    },
    {
      title: 'IQ Award',
      desc: 'Apresiasi tahunan untuk menghargai capaian hafalan terbanyak, keaktifan terbaik, serta kontribusi kader inspiratif UKM.',
      icon: Award,
      time: 'Setiap Akhir Semester',
      location: 'Aula Rektorat UNINUS',
      image: '/award.jpg'
    },
    {
      title: 'Rihlah IQ',
      desc: 'Kegiatan rekreasi, tadabur alam, dan kunjungan edukasi bersama seluruh pengurus dan anggota untuk mempererat tali ukhuwah islamiyah.',
      icon: Users,
      time: 'Satu Kali per Periode',
      location: 'Masjid Raya Al-Jabbar & Wisata Alam',
      image: '/rihlah.jpg'
    },
  ];

  const achievements = [
    {
      title: 'Juara 1 Musabaqah Hifzhil Qur\'an',
      category: 'Kategori 10 Juz - Tingkat Provinsi',
      year: '2025',
      desc: 'Penghargaan atas dedikasi kader utama UKM Ikraamul Qur\'an dalam menjaga hafalan di kancah regional.'
    },
    {
      title: 'Kelulusan Sanad 30 Juz',
      category: 'Sertifikasi Sanad Al-Qur\'an Riwayat Ashim',
      year: '2025',
      desc: 'Dua anggota aktif berhasil menyelesaikan setoran 30 juz ber-sanad muttashil sampai Rasulullah SAW.'
    },
    {
      title: 'UKM Teraktif & Terfavorit',
      category: 'Penghargaan Rektorat UNINUS',
      year: '2026',
      desc: 'Penghargaan atas kontribusi syiar Islam digital dan manajemen keorganisasian terbaik berbasis IT.'
    }
  ];

  const programs = [
    {
      title: 'Tahsin Al-Qur\'an',
      desc: 'Bimbingan intensif membaca Al-Qur\'an secara rutin satu kali seminggu untuk memperbaiki tajwid, kelancaran, dan ketepatan makhraj huruf.',
      badge: '1x Seminggu'
    },
    {
      title: 'Muqaddaman',
      desc: 'Kegiatan khataman Al-Qur\'an bersama sebulan sekali secara bergiliran untuk memelihara kecintaan dan interaksi berkala dengan mushaf.',
      badge: '1x Sebulan'
    },
    {
      title: 'Tasmi\' Hafalan',
      desc: 'Penyimakan hafalan Al-Qur\'an secara berpasangan atau di depan halaqah setiap tiga minggu sekali untuk menjaga kekuatan hafalan anggota.',
      badge: 'Per 3 Minggu'
    },
    {
      title: 'Sharing Session',
      desc: 'Forum diskusi santai dan interaktif bertema motivasi menghafal Al-Qur\'an, problematika mahasiswa, dan kiat-kiat sukses akademik rohani.',
      badge: 'Kaderisasi'
    },
    {
      title: 'Study Tour Religi',
      desc: 'Perjalanan edukatif ke situs-situs bersejarah Islam, masjid agung, atau pesantren terpilih untuk tadabur alam dan memperluas wawasan keagamaan.',
      badge: 'Wawasan'
    },
    {
      title: 'Penghargaan Anggota Teraktif',
      desc: 'Apresiasi khusus berupa tambahan Poin Berkah dan penghargaan bagi anggota dengan keaktifan kehadiran serta setoran hafalan terbaik.',
      badge: 'Apresiasi'
    },
    {
      title: 'Kajian Rutin',
      desc: 'Program kajian keilmuan Islam tematik secara tatap muka untuk membahas kitab fiqh, tauhid, akhlak, dan tafsir Al-Qur\'an kontemporer.',
      badge: 'Kajian Ilmu'
    },
    {
      title: 'Weekly Content Creation',
      desc: 'Pembuatan dan publikasi konten syiar kreatif secara berkala di media sosial berupa video tadabur, poster tajwid, dan quotes motivasi islami.',
      badge: 'Media Syiar'
    }
  ];

  const [copiedState, setCopiedState] = useState<boolean>(false);

  const handleCopyAccount = (accountNo: string) => {
    navigator.clipboard.writeText(accountNo);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#020d0a] text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* 1. NAVIGATION BAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#02130ec0] backdrop-blur-md border-b border-emerald-950/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shadow-md bg-emerald-950 flex items-center justify-center">
            <img src="/logo-iq.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="font-bold text-sm md:text-base tracking-wide bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-400 bg-clip-text text-transparent">
              IKRAAMUL QUR'AN
            </span>
            <p className="text-[9px] text-emerald-400 tracking-wider uppercase font-semibold">UKM DIGITAL PORTAL UNINUS</p>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className="text-emerald-300/80 hover:text-[#e5c158] transition-colors font-medium cursor-pointer"
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* Action Button: Go to Dashboard */}
        <button
          onClick={onNavigateDashboard}
          className="bg-gradient-to-r from-[#e5c158] to-[#bca044] hover:from-[#f3cc5c] hover:to-[#ceaf4b] text-[#02130e] font-bold text-xs md:text-sm px-4 md:px-5 py-2.5 rounded-full flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
        >
          {isLoggedIn ? (
            <>
              Masuk Dashboard <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            <>
              Akses Portal <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </nav>

      {/* 2. HERO / PROFIL SECTION */}
      <section id="profil" className="relative pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 min-h-[90vh]">
        {/* Glow Effects */}
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Text Content */}
        <div className="flex-1 space-y-6 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 text-xs px-4 py-1.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-[#e5c158]" />
            <span>Unit Kegiatan Mahasiswa Pencinta Al-Qur'an</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Membentuk Generasi <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-yellow-300 via-[#e5c158] to-amber-500 bg-clip-text text-transparent">
              Qur'ani & Unggul
            </span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg max-w-2xl leading-relaxed">
            UKM Ikraamul Qur'an adalah wadah pembinaan, pembelajaran, dan pengembangan minat bakat mahasiswa dalam menghafal (Tahfidz) serta memperindah (Tahsin) bacaan Al-Qur'an. Kami menyelaraskan nilai keimanan dengan inovasi teknologi digital untuk melahirkan kader tangguh masa depan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <button
              onClick={() => scrollToSection('visi-misi')}
              className="w-full sm:w-auto border border-emerald-800 hover:border-[#e5c158] text-emerald-300 hover:text-white px-6 py-3 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Tentang Kami <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onNavigateDashboard}
              className="w-full sm:w-auto bg-emerald-900/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 hover:text-white px-6 py-3 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Coba Fitur Dashboard <Sparkles className="w-4 h-4 text-[#e5c158]" />
            </button>
          </div>
        </div>

        {/* Visual / Profile Image Area */}
        <div className="flex-1 w-full max-w-md lg:max-w-none flex justify-center z-10">
          <div className="relative p-3 rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-[#03261c] to-[#01140f] shadow-2xl w-full max-w-[420px]">
            {/* Top gold corner accent */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-[#e5c158] rounded-tl-xl" />
            {/* Bottom gold corner accent */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-[#e5c158] rounded-br-xl" />

            <div className="overflow-hidden rounded-2xl bg-[#02130e] p-5 text-center space-y-4">
              {/* Profile Photo frame */}
              <div className="w-full h-48 rounded-xl overflow-hidden border border-yellow-500/10 shadow-lg relative bg-[#01140f] flex items-center justify-center">
                <img src="/foto-iq.jpg" alt="Pengurus UKM Ikraamul Qur'an" className="w-full h-full object-cover object-center" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-wide">UKM Ikraamul Qur'an</h3>
                <p className="text-xs text-emerald-400 font-medium">Universitas Islam Nusantara (UNINUS)</p>
              </div>
              
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-emerald-950/70 text-center">
                <div>
                  <div className="text-lg font-bold text-yellow-300">30+</div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Anggota</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-emerald-400">12+</div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Halaqah</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-[#e5c158]">90%</div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Target Capaian</div>
                </div>
              </div>

              {(() => {
                const agenda = getAgendaTerdekat(studies);
                if (agenda) {
                  return (
                    <div className="bg-[#011d16] border border-yellow-500/20 rounded-xl p-3 text-left relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-yellow-500/10 to-transparent rounded-bl-xl pointer-events-none" />
                      <div className="text-[11px] text-[#e5c158] font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 animate-pulse" /> Agenda Terdekat ({agenda.type})
                      </div>
                      <p className="text-xs text-gray-200 font-bold leading-snug truncate group-hover:text-yellow-100 transition-colors">
                        {agenda.title}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-emerald-400 mt-1.5 gap-1 font-semibold">
                        <span className="truncate">{formatIndonesianDate(agenda.date)} • {agenda.time}</span>
                        <span className="text-slate-400 shrink-0 font-medium">{agenda.location}</span>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="bg-[#011d16] border border-emerald-900/60 rounded-xl p-3 text-left">
                    <div className="text-[11px] text-[#e5c158] font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Agenda Terdekat
                    </div>
                    <p className="text-xs text-gray-200 font-semibold">Kajian Akhlak Terpadu</p>
                    <div className="flex items-center justify-between text-[10px] text-emerald-500 mt-1">
                      <span>Sabtu, 10.00 WIB</span>
                      <span>Masjid Al-Ikhlas UNINUS</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* 3. VISI & MISI SECTION */}
      <section id="visi-misi" className="py-24 bg-[#01140f] border-y border-emerald-950/30 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-6 z-10 relative">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[#e5c158] text-xs font-bold uppercase tracking-widest">Komitmen Utama Kami</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Visi & Misi UKM</h2>
            <div className="w-16 h-[2px] bg-[#e5c158] mx-auto mt-2" />
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* Visi */}
            <div className="bg-[#021d16] border border-yellow-500/10 rounded-2xl p-8 flex flex-col justify-center space-y-4 hover:border-yellow-500/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#e5c158] to-[#9b7722] flex items-center justify-center mb-2 shadow-lg shadow-yellow-500/5">
                <Sparkles className="w-6 h-6 text-[#02130e]" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-wide">VISI</h3>
              <p className="text-slate-300 text-sm leading-relaxed italic">
                "Terwujudnya UKM Ikraamul Qur'an sebagai pusat generasi qur'ani yang profesional, unggul dalam syiar digital, dan wadah pengembangan bakat Al-Qur'an yang inklusif di lingkungan kampus sehingga terwujud para pecinta al-Qur'an yang berahlakul karimah."
              </p>
            </div>

            {/* Misi */}
            <div className="bg-[#021d16] border border-emerald-900/40 rounded-2xl p-8 space-y-4 hover:border-emerald-800 transition-all">
              <h3 className="text-2xl font-bold text-white tracking-wide">MISI KAMI</h3>
              <ul className="space-y-3 text-slate-300 text-xs">
                {[
                  'Reaktivasi Organisasi: Memperkokoh menjalankan program kerja estafet yang sempat tertunda.',
                  'Mengoptimalisasi UKM IQ sebagai pusat pengembangan mahasiswa dalam menghafal, mendalami, serta mengimplementasikan nilai-nilai Al-Qur\'an.dan menebar manfaat.',
                  'Mewujudkan atmosfer kampus yang religius melalui program pembinaan Tahsin, Tahfidz, dan pelatihan seni Tilawah (Qori) yang berbasis pada minat dan bakat.',
                  'Menyediakan ruang dialektika dan forum diskusi strategis mengenai wawasan ke-Al-Qur\'anan.',
                  'Transformasi Digital: mampu menciptakan inovasi media informasi sebagai sarana dakwah kreatif yang relevan terhadap perkembangan digitalisasi untuk perkembangan UKM IQ',
                  'Menginternalisasi akhlakul karimah dalam kehidupan kampus sebagai cerminan nilai Al-Qur\'an dan Hadits.',
                  'Membangun sinergitas dan solidaritas yang harmonis antara pengurus, anggota, dan demisioner berbasis jiwa sosial.'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800 text-[#e5c158] flex items-center justify-center shrink-0 text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KEGIATAN SECTION */}
      <section id="kegiatan" className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-[#e5c158] text-xs font-bold uppercase tracking-widest">Kiprah Pergerakan</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Kegiatan Rutin Terpadu</h2>
          <div className="w-16 h-[2px] bg-[#e5c158] mx-auto mt-2" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {activities.map((act, idx) => {
            const Icon = act.icon;
            return (
              <div key={idx} className="bg-[#01140f] border border-emerald-950 hover:border-yellow-500/25 rounded-2xl overflow-hidden hover:translate-y-[-4px] transition-all flex flex-col justify-between">
                {act.image ? (
                  <div className="w-full h-40 overflow-hidden relative bg-[#01140f] border-b border-emerald-950">
                    <img src={act.image} alt={act.title} className="w-full h-full object-cover object-center" />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-[#011d16] flex items-center justify-center border-b border-emerald-950 relative">
                    <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[#e5c158]" />
                    </div>
                  </div>
                )}
                
                <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    {act.image && (
                      <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center mb-2">
                        <Icon className="w-4.5 h-4.5 text-[#e5c158]" />
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-white tracking-wide">{act.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{act.desc}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-emerald-950/60 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                      <Calendar className="w-3.5 h-3.5" /> <span>{act.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0" /> <span>{act.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sub-section: Agenda & Kajian Terdekat (Dinamis dari Database) */}
        {studies && studies.length > 0 && (
          <div className="mt-20 border-t border-emerald-950/40 pt-16 space-y-8">
            <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
              <span className="text-[#e5c158] text-xs font-bold uppercase tracking-widest">Pendaftaran & Jadwal</span>
              <h3 className="text-2xl font-bold text-white tracking-wide">Jadwal Kajian & Kegiatan Terdekat</h3>
              <div className="w-10 h-[1.5px] bg-[#e5c158] mx-auto mt-2" />
              <p className="text-xs text-slate-400 mt-2">Daftar agenda kajian ilmiah, bimtek tahsin, dan kegiatan UKM terdekat yang dapat Anda ikuti.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(() => {
                const todayStr = new Date().toISOString().split('T')[0];
                const upcomingStudies = studies.filter(s => s.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date));
                const pastStudies = studies.filter(s => s.date < todayStr).sort((a, b) => b.date.localeCompare(a.date));
                const studiesToShow = upcomingStudies.length > 0 ? upcomingStudies.slice(0, 6) : pastStudies.slice(0, 3);
                
                return studiesToShow.map((study) => {
                  const isPast = study.date < todayStr;
                  return (
                    <div key={study.id} className={`bg-[#01140f] border rounded-2xl overflow-hidden hover:translate-y-[-4px] transition-all flex flex-col justify-between group ${isPast ? 'border-slate-900/60 opacity-75' : 'border-emerald-950 hover:border-yellow-500/25'}`}>
                      {study.imageUrl ? (
                        <div className="w-full h-40 overflow-hidden relative bg-[#01140f] border-b border-emerald-950">
                          <img src={study.imageUrl} alt={study.title} className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-500" />
                          <span className={`absolute top-2.5 left-2.5 text-[8px] border px-2 py-0.5 rounded font-black uppercase tracking-widest ${isPast ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'}`}>
                            {study.type}
                          </span>
                          {isPast && (
                            <span className="absolute top-2.5 right-2.5 text-[8px] bg-red-950/80 text-red-400 border border-red-900 px-2 py-0.5 rounded font-black uppercase tracking-widest">
                              Selesai
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-40 bg-[#011d16] flex items-center justify-center border-b border-emerald-950 relative">
                          <span className={`absolute top-2.5 left-2.5 text-[8px] border px-2 py-0.5 rounded font-black uppercase tracking-widest ${isPast ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'}`}>
                            {study.type}
                          </span>
                          {isPast && (
                            <span className="absolute top-2.5 right-2.5 text-[8px] bg-red-950/80 text-red-400 border border-red-900 px-2 py-0.5 rounded font-black uppercase tracking-widest">
                              Selesai
                            </span>
                          )}
                          <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-[#e5c158]" />
                          </div>
                        </div>
                      )}

                      <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          <h4 className="text-base font-bold text-white tracking-wide group-hover:text-yellow-100 transition-colors">{study.title}</h4>
                          <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">{study.description || "Mari ikuti kajian rutin ini untuk memperdalam ilmu agama dan mempererat silaturahim."}</p>
                          <p className="text-[10px] text-[#e5c158] font-semibold">Narasumber: {study.speaker}</p>
                        </div>

                        <div className="pt-4 border-t border-emerald-950/60 space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                            <Calendar className="w-3.5 h-3.5" /> <span>{formatIndonesianDate(study.date)} | {study.time}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0" /> <span>{study.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* Sub-section: Galeri Kegiatan */}
        <div className="mt-24 border-t border-emerald-950/40 pt-16 space-y-8">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
            <span className="text-[#e5c158] text-xs font-bold uppercase tracking-widest">Dokumentasi Momen</span>
            <h3 className="text-2xl font-bold text-white tracking-wide">Galeri Kegiatan UKM</h3>
            <div className="w-10 h-[1.5px] bg-[#e5c158] mx-auto mt-2" />
          </div>

          {/* Masonry/Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6">
            {/* Image 1 */}
            <div className="lg:col-span-8 overflow-hidden rounded-2xl border border-emerald-950/80 shadow-lg group relative h-64 sm:h-80 lg:h-96">
              <img
                src="/gallery/kegiatan-1.jpg"
                alt="Kegiatan Ikraamul Qur'an 1"
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <span className="text-white text-xs font-semibold tracking-wide">UKM Ikraamul Qur'an</span>
              </div>
            </div>

            {/* Image 2 */}
            <div className="lg:col-span-4 overflow-hidden rounded-2xl border border-emerald-950/80 shadow-lg group relative h-64 sm:h-80 lg:h-96">
              <img
                src="/gallery/kegiatan-2.jpg"
                alt="Kegiatan Ikraamul Qur'an 2"
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <span className="text-white text-xs font-semibold tracking-wide">UKM Ikraamul Qur'an</span>
              </div>
            </div>

            {/* Image 3 */}
            <div className="lg:col-span-4 overflow-hidden rounded-2xl border border-emerald-950/80 shadow-lg group relative h-60">
              <img
                src="/gallery/kegiatan-3.jpg"
                alt="Kegiatan Ikraamul Qur'an 3"
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white text-xs font-semibold tracking-wide">UKM Ikraamul Qur'an</span>
              </div>
            </div>

            {/* Image 4 */}
            <div className="lg:col-span-4 overflow-hidden rounded-2xl border border-emerald-950/80 shadow-lg group relative h-60">
              <img
                src="/gallery/kegiatan-4.jpg"
                alt="Kegiatan Ikraamul Qur'an 4"
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white text-xs font-semibold tracking-wide">UKM Ikraamul Qur'an</span>
              </div>
            </div>

            {/* Image 5 */}
            <div className="lg:col-span-4 overflow-hidden rounded-2xl border border-emerald-950/80 shadow-lg group relative h-60">
              <img
                src="/gallery/kegiatan-5.jpg"
                alt="Kegiatan Ikraamul Qur'an 5"
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white text-xs font-semibold tracking-wide">UKM Ikraamul Qur'an</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRESTASI SECTION */}
      <section id="prestasi" className="py-24 bg-[#01140f] border-y border-emerald-950/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[#e5c158] text-xs font-bold uppercase tracking-widest">Catatan Keberhasilan</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Prestasi Gemilang Kader</h2>
            <div className="w-16 h-[2px] bg-[#e5c158] mx-auto mt-2" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {achievements.map((ach, idx) => (
              <div key={idx} className="bg-[#021d16] border border-yellow-500/10 hover:border-yellow-500/30 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-yellow-500/10 to-transparent rounded-bl-3xl pointer-events-none" />
                <Award className="w-8 h-8 text-[#e5c158] mb-4 group-hover:scale-110 transition-all" />
                <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">{ach.category}</div>
                <h3 className="text-lg font-bold text-white mb-2 leading-snug">{ach.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">{ach.desc}</p>
                <div className="inline-flex items-center justify-center bg-emerald-950 text-[#e5c158] text-[10px] font-bold px-3 py-1 rounded-full">
                  Tahun {ach.year}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PROGRAM UTAMA SECTION */}
      <section id="program" className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-[#e5c158] text-xs font-bold uppercase tracking-widest">Inovasi Layanan</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Program Kerja & Fitur Digital</h2>
          <div className="w-16 h-[2px] bg-[#e5c158] mx-auto mt-2" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs.map((prog, idx) => (
            <div key={idx} className="bg-[#01140f] border border-emerald-950 hover:border-emerald-800 rounded-2xl p-5 space-y-3 hover:translate-y-[-2px] transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-[#e5c158] uppercase tracking-wider bg-emerald-950/70 border border-emerald-800/40 px-2.5 py-0.5 rounded-full inline-block">
                  {prog.badge}
                </span>
                <h3 className="text-base font-bold text-white tracking-wide">{prog.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{prog.desc}</p>
              </div>
              <div className="pt-2 flex items-center text-emerald-500 font-semibold text-xs group cursor-pointer" onClick={onNavigateDashboard}>
                <span>Buka fitur</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. DOWNLOAD APP SECTION */}
      <section id="unduh" className="py-24 bg-[#01140f] border-y border-emerald-950/30 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[200px] h-[200px] bg-emerald-600/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[#e5c158] text-xs font-bold uppercase tracking-widest">Teknologi di Genggaman</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Unduh Aplikasi Mobile</h2>
            <div className="w-16 h-[2px] bg-[#e5c158] mx-auto mt-2" />
            <p className="text-slate-400 text-sm leading-relaxed max-w-xl mx-auto">
              Akses seluruh fitur dashboard UKM Ikraamul Qur'an langsung dari smartphone kamu. Presensi GPS, setoran hafalan, dan poin berkah dalam satu aplikasi.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: App Info & Features */}
            <div className="space-y-8">
              {/* App Card */}
              <div className="flex items-center gap-4 bg-[#021d16] border border-yellow-500/20 rounded-2xl p-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-900 to-[#011d16] border border-emerald-700/40 flex items-center justify-center shrink-0 overflow-hidden shadow-lg shadow-emerald-900/50">
                  <img src="/logo-iq.png" alt="App Icon" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-base tracking-wide">iKRAAMUL QUR'AN</h3>
                  <p className="text-emerald-400 text-xs font-medium">Digital Dashboard UKM</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="w-3 h-3 text-[#e5c158] fill-[#e5c158]" />
                      ))}
                    </div>
                    <span className="text-slate-500 text-[10px]">5.0 Rating</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-0.5 rounded-full">v1.0.0</span>
                </div>
              </div>

              {/* Feature List */}
              <div className="space-y-3">
                {[
                  { icon: Smartphone, title: 'Presensi GPS Real-Time', desc: 'Absensi otomatis berbasis lokasi GPS dengan deteksi radius masjid.' },
                  { icon: BookOpen, title: 'Setoran Hafalan Digital', desc: 'Catat dan lacak progress hafalan Al-Qur\'an setiap saat.' },
                  { icon: Zap, title: 'Poin Berkah & Reward', desc: 'Kumpulkan poin dari keaktifan dan tukar dengan hadiah menarik.' },
                  { icon: Shield, title: 'Aman & Terenkripsi', desc: 'Data pribadi anggota dijaga dengan keamanan tingkat tinggi.' },
                ].map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-[#021d16] border border-emerald-950 hover:border-emerald-800/60 rounded-xl transition-all">
                      <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/60 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-[#e5c158]" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{feat.title}</p>
                        <p className="text-slate-400 text-xs leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Download Button Area */}
            <div className="flex flex-col items-center gap-6">
              {/* Phone Mockup */}\
              <div className="relative">
                {/* Glow behind phone */}
                <div className="absolute inset-0 bg-emerald-500/10 rounded-3xl blur-2xl scale-110" />
                <div className="relative w-56 bg-gradient-to-b from-[#021d16] to-[#010907] border border-emerald-800/40 rounded-3xl p-3 shadow-2xl">
                  {/* Phone top notch */}
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-16 h-1.5 bg-emerald-900 rounded-full" />
                  </div>
                  {/* Actual App Screenshot */}
                  <div className="overflow-hidden rounded-2xl border border-emerald-950">
                    <img
                      src="/app-screenshot.jpg"
                      alt="Screenshot Aplikasi iKRAAMUL QUR'AN"
                      className="w-full h-auto object-cover object-top"
                    />
                  </div>
                  {/* Phone bottom bar */}
                  <div className="flex items-center justify-center mt-2 gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-900" />
                    <div className="w-8 h-1.5 bg-emerald-900 rounded-full" />
                    <div className="w-2 h-2 rounded-full bg-emerald-900" />
                  </div>
                </div>
              </div>


              {/* Download Button */}
              <div className="w-full max-w-xs space-y-3">
                <a
                  id="btn-download-apk"
                  href="/downloads/ikraamul-quran.apk"
                  download="ikraamul-quran.apk"
                  className="w-full bg-gradient-to-r from-[#e5c158] via-[#d4af37] to-[#bca044] hover:from-[#f3cc5c] hover:to-[#ceaf4b] text-[#02130e] font-bold text-sm px-6 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-yellow-500/20 active:scale-95 transition-all group"
                >
                  <Download className="w-5 h-5 group-hover:animate-bounce" />
                  <div className="text-left">
                    <div className="text-xs font-bold uppercase tracking-wider">Unduh Aplikasi</div>
                    <div className="text-[10px] opacity-70 font-normal">Android APK • v1.0.0</div>
                  </div>
                </a>

                <div className="flex items-center gap-2 text-[10px] text-slate-500 justify-center">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  <span>Aman & bebas virus · Diuji oleh tim UKM</span>
                </div>

                {/* iOS Coming Soon */}
                <div className="w-full border border-emerald-950 text-slate-600 text-xs px-6 py-3 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed opacity-50">
                  <Smartphone className="w-4 h-4" />
                  <span>iOS — Segera Hadir</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
                {[
                  { val: '1.0', label: 'Versi' },
                  { val: 'Free', label: 'Gratis' },
                  { val: 'Android', label: 'Platform' },
                ].map((s, i) => (
                  <div key={i} className="text-center bg-[#021d16] border border-emerald-950 rounded-xl p-3">
                    <div className="text-[#e5c158] font-bold text-sm">{s.val}</div>
                    <div className="text-slate-500 text-[9px] uppercase font-semibold">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7.5. INFAQ & SHADAQAH SECTION */}
      <section id="infaq" className="py-24 bg-[#020d0a] border-t border-emerald-950/30 relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[#e5c158] text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500 animate-pulse fill-rose-500" /> Ladang Amal Jariah
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Infaq & Shadaqah UKM</h2>
            <div className="w-16 h-[2px] bg-[#e5c158] mx-auto mt-2" />
            <p className="text-slate-400 text-sm leading-relaxed max-w-xl mx-auto">
              Salurkan infaq terbaik Anda untuk mendukung operasional dakwah, pengadaan mushaf, dan beasiswa pendidikan bagi para penghafal Al-Qur'an UKM Ikraamul Qur'an.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Left: Explanation & Virtue (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#01140f] border border-emerald-900/40 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-3xl pointer-events-none" />
                <p className="text-xs italic text-emerald-300/90 leading-relaxed">
                  "Perumpamaan orang yang menginfakkan hartanya di jalan Allah seperti sebutir biji yang menumbuhkan tujuh tangkai, pada setiap tangkai ada seratus biji. Allah melipatgandakan bagi siapa yang Dia kehendaki, dan Allah Mahaluas, Maha Mengetahui."
                </p>
                <p className="text-[10px] text-[#e5c158] font-bold mt-3 text-right tracking-wider">— QS. Al-Baqarah: 261</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-white font-bold text-base tracking-wide flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#e5c158] rounded-full inline-block"></span>
                  Penyaluran Infaq & Shadaqah
                </h3>
                <div className="space-y-3">
                  {[
                    { title: 'Beasiswa Huffazh', desc: 'Bantuan dana sosial dan biaya pendidikan bagi mahasiswa penghafal Al-Qur\'an yang membutuhkan.' },
                    { title: 'Operasional Kajian & Tahsin', desc: 'Penyediaan modul tajwid, pemateri asatidz, dan konsumsi untuk kajian pekanan.' },
                    { title: 'Buku & Wakaf Mushaf', desc: 'Pengadaan mushaf Al-Qur\'an baru untuk dibagikan kepada anggota baru dan TPQ binaan.' },
                    { title: 'IQ Mengajar', desc: 'Operasional kegiatan pengajaran Al-Qur\'an sukarela untuk anak-anak di pedesaan.' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-start p-4 bg-[#01140f] border border-emerald-950 rounded-xl hover:border-emerald-900 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-800 text-[#e5c158] flex items-center justify-center shrink-0 text-xs font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{item.title}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Right: Bank Transfer Info (7 cols) */}
            <div className="lg:col-span-7 bg-[#01140f] border border-emerald-950 hover:border-emerald-900 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
              {/* Top gold corner accent */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-[#e5c158]/30 rounded-tl-lg" />
              {/* Bottom gold corner accent */}
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-[#e5c158]/30 rounded-br-lg" />

              <div className="space-y-2">
                <h3 className="text-white font-bold text-lg tracking-wide">Informasi Rekening Donasi</h3>
                <p className="text-slate-400 text-xs">Anda dapat menyalurkan infaq dan shadaqah secara langsung melalui transfer bank.</p>
              </div>

              {/* BTN Transfer Card */}
              <div className="bg-[#021d16] border border-yellow-500/20 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-yellow-500/5 to-transparent rounded-bl-3xl pointer-events-none" />
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Bank Penerima
                    </span>
                    <h4 className="text-2xl font-extrabold text-white mt-2 tracking-wide">Bank BTN</h4>
                  </div>
                  <div className="w-12 h-8 bg-white/5 border border-white/10 rounded flex items-center justify-center font-bold text-xs text-slate-400 tracking-wider">
                    BTN
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Nomor Rekening</p>
                    <div className="flex items-center justify-between gap-4 mt-1 bg-[#01140f] border border-emerald-950/80 rounded-xl px-4 py-3">
                      <span className="text-lg md:text-xl font-bold font-mono text-white tracking-widest">
                        9401610006681
                      </span>
                      <button
                        onClick={() => handleCopyAccount('9401610006681')}
                        className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        {copiedState ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#e5c158]" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Atas Nama</p>
                    <p className="text-base font-bold text-slate-200 mt-0.5 tracking-wide">NENENG</p>
                  </div>
                </div>
              </div>

              {/* Confirmation Steps */}
              <div className="space-y-3 pt-2">
                <h4 className="text-white font-bold text-xs tracking-wider uppercase">Langkah Konfirmasi:</h4>
                <div className="space-y-2.5">
                  <div className="flex gap-3 items-start text-xs text-slate-400 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800 text-[#e5c158] flex items-center justify-center shrink-0 font-bold text-[10px]">
                      1
                    </span>
                    <span>Lakukan transfer infaq/shadaqah ke rekening Bank BTN di atas.</span>
                  </div>
                  <div className="flex gap-3 items-start text-xs text-slate-400 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800 text-[#e5c158] flex items-center justify-center shrink-0 font-bold text-[10px]">
                      2
                    </span>
                    <span>Kirim foto/tangkapan layar bukti transfer via WhatsApp ke nomor pengurus UKM.</span>
                  </div>
                  <div className="flex gap-3 items-start text-xs text-slate-400 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800 text-[#e5c158] flex items-center justify-center shrink-0 font-bold text-[10px]">
                      3
                    </span>
                    <span>Dana donasi Anda akan dialokasikan sesuai dengan prioritas pembinaan dan dakwah UKM.</span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Link Card */}
              <div className="bg-[#021d16] border border-emerald-950 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-center sm:text-left">
                  <p className="text-white text-xs font-semibold">Butuh bantuan atau informasi lebih lanjut?</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Silakan hubungi narahubung resmi kami di WhatsApp: <strong>0822-6285-5600</strong>.</p>
                </div>
                <a
                  href="https://wa.me/6282262855600"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer text-center w-full sm:w-auto"
                >
                  Konfirmasi WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="bg-[#010907] border-t border-emerald-950/60 py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 pb-8 border-b border-emerald-950/40">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#e5c158] to-[#9b7722] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#02130e]" />
              </div>
              <span className="font-bold text-white tracking-wide">UKM IKRAAMUL QUR'AN</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sistem Informasi & Manajemen Keaktifan Penghafal Al-Qur'an Berbasis Gamifikasi dan Geofencing GPS Universitas Islam Nusantara.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">Hubungi Kami</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Jl. Soekarno Hatta No.530, Sekejati, Kec. Buahbatu, Kota Bandung, Jawa Barat 40286</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>+62 822-6285-5600</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ikraamulquranuninus@gmail.com</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">Jejaring Sosial</h4>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/iquninus_bdg?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram UKM Ikraamul Qur'an"
                className="w-8 h-8 rounded-full bg-emerald-950/60 border border-emerald-900 flex items-center justify-center hover:border-[#e5c158] text-slate-400 hover:text-white transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/@ikraamulquranuninus4180?si=UT3g9B5P9eMFwA4R"
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube UKM Ikraamul Qur'an"
                className="w-8 h-8 rounded-full bg-emerald-950/60 border border-emerald-900 flex items-center justify-center hover:border-[#e5c158] text-slate-400 hover:text-white transition-all"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://ideal-motivation-production.up.railway.app/"
                target="_blank"
                rel="noopener noreferrer"
                title="Website Utama UKM Ikraamul Qur'an"
                className="w-8 h-8 rounded-full bg-emerald-950/60 border border-emerald-900 flex items-center justify-center hover:border-[#e5c158] text-slate-400 hover:text-white transition-all"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-600">
          <p>© {new Date().getFullYear()} UKM Ikraamul Qur'an UNINUS. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <a href="#" className="hover:text-emerald-500 transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Ketentuan Layanan</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
