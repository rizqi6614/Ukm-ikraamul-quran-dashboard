import { useState } from 'react';
import { 
  FileText, Download, Printer, Filter, Calendar, Users, 
  MapPin, Award, CheckCircle, ShieldCheck, Percent 
} from 'lucide-react';
import { Member, Study, AttendanceRecord } from '../types';

interface LaporanProps {
  currentUser: Member;
  members: Member[];
  studies: Study[];
  attendance: AttendanceRecord[];
}

export default function LaporanPDF({ currentUser, members, studies, attendance }: LaporanProps) {
  const [reportType, setReportType] = useState<'ANGGOTA' | 'PRESENSI' | 'HAFALAN'>('ANGGOTA');
  const [selectedSemester, setSelectedSemester] = useState('Ganjil 2026');

  const handlePrint = () => {
    window.print();
  };

  const getReportTitle = () => {
    if (reportType === 'ANGGOTA') return 'Laporan Daftar Anggota & Jenjang Kader UKM Ikraamul Qur’an';
    if (reportType === 'PRESENSI') return 'Laporan Rekapitulasi Presensi & Geofencing GPS';
    return 'Laporan Progres Setoran Hafalan & Mutabaah Qur’an';
  };

  return (
    <div id="laporan-pdf-viewport" className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-1 font-sans select-none">
      
      {/* Left panel: Report Configurations - 4 Cols */}
      <div className="lg:col-span-4 islamic-card rounded-2xl p-5 flex flex-col gap-4 h-fit print:hidden">
        <div className="flex items-center gap-2 pb-2.5 border-b border-emerald-900">
          <FileText className="w-5 h-5 text-[#e5c158]" />
          <div>
            <h3 className="text-sm font-black text-gray-100 uppercase tracking-widest">Ekspor PDF & Laporan</h3>
            <p className="text-[10px] text-emerald-400 font-bold">PUSAT PELAPORAN UKM DIGITAL</p>
          </div>
        </div>

        {/* Report Category Selection */}
        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-emerald-300 mb-2">Jenis Laporan</label>
          <div className="flex flex-col gap-2">
            {[
              { id: 'ANGGOTA', title: 'Data Anggota & Kaderisasi', desc: 'Detail biodata, cabang halaqah & point.' },
              { id: 'PRESENSI', title: 'Presensi Kehadiran Geofencing', desc: 'Rincian absensi santri di lokasi kajian.' },
              { id: 'HAFALAN', title: 'Progres Setoran & Ziyadah', desc: 'Rekapitulasi ayat dihafal per halaqah.' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id as any)}
                className={`
                  w-full text-left p-3.5 rounded-xl border transition-all text-xs cursor-pointer flex flex-col gap-0.5
                  ${reportType === type.id 
                    ? 'bg-[#063b2a] border-[#e5c150]/30 shadow' 
                    : 'bg-[#011a14]/60 border-emerald-950 hover:bg-[#02281d]'
                  }
                `}
              >
                <span className="font-extrabold text-gray-100">{type.title}</span>
                <span className="text-[9px] text-[#e5c150]/70 font-semibold leading-relaxed truncate">{type.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Semester Filter Selection */}
        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-emerald-300 mb-2">Periode Akademik / Semester</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-full bg-[#011a14] border border-yellow-500/10 rounded-xl px-3 py-3 text-xs text-gray-200 outline-none"
          >
            <option value="Ganjil 2026">Semester Ganjil TA 2026</option>
            <option value="Genap 2026">Semester Genap TA 2026</option>
            <option value="Khusus Ramadhan">Mukhoyyam Ramadhan 1447 H</option>
          </select>
        </div>

        <div className="w-full h-[1px] bg-emerald-950 my-1" />

        {/* Action Button layout */}
        <button
          onClick={handlePrint}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-bold py-3 px-4 rounded-xl shadow transition-all text-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <Printer className="w-4 h-4 text-yellow-300 animate-bounce" />
          Ekspor / Cetak Laporan PDF
        </button>

        <p className="text-[9px] text-emerald-500 leading-relaxed font-semibold italic text-center">
          💡 Tips: Simpan laporan sebagai file PDF dengan memilih tujuan "Save as PDF" di jendela browser pencetakan.
        </p>
      </div>

      {/* Right panel: Printable Document Sheet rendering - 8 Cols */}
      <div className="lg:col-span-8 flex flex-col gap-4 print:col-span-12 print:p-0">
        
        {/* Mock paper preview */}
        <div className="bg-[#011e16] rounded-2xl p-8 border border-yellow-500/20 shadow-2xl relative min-h-[600px] text-zinc-300 print:bg-white print:text-black print:border-none print:shadow-none select-text">
          
          {/* Islamic Crest header for printable */}
          <div className="flex flex-col items-center text-center pb-6 border-b-2 border-emerald-900/60 mb-6 print:border-black pointer-events-none">
            <span className="font-arabic text-[#e5c158] text-2xl mb-1.5 print:text-emerald-900">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</span>
            <h1 className="text-sm font-black tracking-widest text-white uppercase print:text-black">LAPORAN MUTABAAH UNIVERSITAS ISLAM NUSANTARA</h1>
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mt-0.5 print:text-emerald-900">Lembaga UKM Mahasiswa Ikraamul Qur’an</h2>
            <p className="text-[9px] text-gray-400 mt-1.5 leading-relaxed font-sans max-w-md print:text-gray-600">
              Sekretariat Pusat: Kantor UKM Ikraamul Qur'an, Jl. Soekarno Hatta No.530, Sekejati, Kec. Buahbatu, Kota Bandung, Jawa Barat 40286
            </p>
          </div>

          {/* Document metadata info info */}
          <div className="grid grid-cols-2 gap-4 text-[10px] font-bold border-b border-emerald-950/60 pb-4 mb-6 print:border-zinc-200">
            <div>
              <div className="text-emerald-500 uppercase">Judul Dokumen Dokumen:</div>
              <div className="text-gray-100 text-xs font-black print:text-black mt-1">{getReportTitle()}</div>
            </div>
            <div className="text-right">
              <div className="text-emerald-500 uppercase">Periode Cetak:</div>
              <div className="text-gray-100 print:text-black mt-1">Semester {selectedSemester}</div>
              <div className="text-[9px] text-[#e5c158] mt-1 print:text-zinc-500">Tanggal Unduh: {new Date().toLocaleDateString('id-ID')}</div>
            </div>
          </div>

          {/* Content changes dynamically based on selected reportType */}
          {reportType === 'ANGGOTA' && (
            <div className="space-y-4">
              <p className="text-[11px] text-gray-400 italic leading-relaxed print:text-zinc-650 mb-2">
                Menyajikan daftar biodata seluruh santri atau kader aktif UKM Ikraamul Qur'an UNINUS Bandung yang tercatat secara sah hingga periode ini.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px] border-collapse">
                  <thead>
                    <tr className="border-b border-emerald-900 text-emerald-400 font-extrabold uppercase tracking-wider print:text-emerald-900 print:border-zinc-300">
                      <th className="py-2.5">ID Santri</th>
                      <th className="py-2.5">Nama Lengkap</th>
                      <th className="py-2.5">Email</th>
                      <th className="py-2.5">Struktur Halaqah</th>
                      <th className="py-2.5 text-right">Poin Berkah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-950/40 text-gray-300 print:text-black print:divide-zinc-200">
                    {members.map((m) => (
                      <tr key={m.id}>
                        <td className="py-2.5 font-mono font-bold text-emerald-500 print:text-emerald-900">{m.id}</td>
                        <td className="py-2.5 font-extrabold text-white print:text-black">{m.name}</td>
                        <td className="py-2.5 text-slate-400 print:text-zinc-700">{m.email}</td>
                        <td className="py-2.5 text-emerald-400 print:text-emerald-900">{m.groupMemorization}</td>
                        <td className="py-2.5 text-right font-black text-yellow-100 print:text-black">{m.totalPoints.toLocaleString('id-ID')} XP</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportType === 'PRESENSI' && (
            <div className="space-y-4">
              <p className="text-[11px] text-gray-400 italic leading-relaxed print:text-zinc-650 mb-2">
                Menyajikan rekam kehadiran riwayat absensi santri di lokasi kegiatan target secara geofencing GPS & QR Code.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px] border-collapse">
                  <thead>
                    <tr className="border-b border-emerald-900 text-emerald-400 font-extrabold uppercase print:text-emerald-900 print:border-zinc-300">
                      <th className="py-2.5">Tanggal & Waktu</th>
                      <th className="py-2.5">Nama Anggota</th>
                      <th className="py-2.5">Judul Kegiatan</th>
                      <th className="py-2.5">Metode</th>
                      <th className="py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-950/40 text-gray-300 print:text-black print:divide-zinc-200">
                    {attendance.map((a) => (
                      <tr key={a.id}>
                        <td className="py-2.5 font-mono text-emerald-500 font-bold print:text-emerald-900">{a.date} - {a.time}</td>
                        <td className="py-2.5 font-extrabold text-white print:text-black">{a.memberName}</td>
                        <td className="py-2.5 text-slate-400 print:text-zinc-700">{a.studyTitle}</td>
                        <td className="py-2.5 text-emerald-400 print:text-emerald-900">{a.method} {a.distance !== undefined ? `(${a.distance}m)` : ''}</td>
                        <td className="py-2.5 text-right font-bold text-yellow-100 print:text-black">{a.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportType === 'HAFALAN' && (
            <div className="space-y-4">
              <p className="text-[11px] text-gray-400 italic leading-relaxed print:text-zinc-650 mb-2">
                Menyajikan ringkasan persentase penyetoran hafalan Ziyadah santri kader untuk melacak pencapaian sertifikasi hafalan Al-Qur'an UKM.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px] border-collapse">
                  <thead>
                    <tr className="border-b border-emerald-900 text-emerald-400 font-extrabold uppercase print:text-emerald-900 print:border-zinc-300">
                      <th className="py-2.5">Siswa</th>
                      <th className="py-2.5">Grup Halaqah</th>
                      <th className="py-2.5">Target Capaian</th>
                      <th className="py-2.5">Progres Saat Ini</th>
                      <th className="py-2.5 text-right">Rasio Persentase</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-950/40 text-gray-300 print:text-black print:divide-zinc-200">
                    {members.map((m) => {
                      const perc = Math.round((m.completedMemorization / m.targetMemorization) * 100) || 0;
                      return (
                        <tr key={m.id}>
                          <td className="py-2.5 font-extrabold text-white print:text-black">{m.name}</td>
                          <td className="py-2.5 text-slate-400 print:text-zinc-700">{m.groupMemorization}</td>
                          <td className="py-2.5 text-emerald-400 print:text-emerald-900">{m.targetMemorization} Ayat</td>
                          <td className="py-2.5 text-yellow-300 font-semibold print:text-black">{m.completedMemorization} Ayat</td>
                          <td className="py-2.5 text-right font-black text-emerald-400 print:text-black">{perc}% Selesai</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Signature approval footer section for physical reports */}
          <div className="mt-12 pt-6 border-t border-emerald-950/50 grid grid-cols-2 text-[10px] font-bold text-center text-gray-400 print:text-black print:border-zinc-200">
            <div>
              <p>Mengetahui,</p>
              <p className="text-gray-300 print:text-zinc-700">Al-Ustadz Pembina UKM</p>
              <p className="font-extrabold text-gray-200 mt-12 print:text-black">Dr. H. Endi Suhendi, S.Pd.I., M.Pd.I.</p>
              <p className="text-[9px] text-[#e5c158] font-mono mt-1 print:text-zinc-500">NIP: 19820421 201103 1 004</p>
            </div>
            <div>
              <p>Bandung, {new Date().toLocaleDateString('id-ID')}</p>
              <p className="text-gray-300 print:text-zinc-700">{currentUser.role === 'Admin' ? 'Ketua / Admin UKM' : 'Pengurus UKM'}</p>
              <p className="font-extrabold text-gray-200 mt-12 print:text-black">{currentUser.name}</p>
              <p className="text-[9px] text-[#e5c158] font-mono mt-1 print:text-zinc-500">Role: {currentUser.role}</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
