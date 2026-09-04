import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, MapPin, QrCode, Navigation2, Compass, CheckCircle2, 
  AlertCircle, Camera, Sparkles, Sliders, Trash2, Search, Plus, 
  FileText, X, User, ShieldAlert 
} from 'lucide-react';
import { Member, Study, AttendanceRecord } from '../types';

interface PresensiProps {
  currentUser: Member;
  studies: Study[];
  members: Member[];
  attendance: AttendanceRecord[];
  onAttendanceSuccess: (updatedMember: Member) => void;
  onDeleteAttendance: (id: string) => void;
  onAddManualAttendance: (record: {
    studyId: string;
    memberId: string;
    status: 'Hadir' | 'Izin' | 'Alpa' | 'Sakit';
    method: 'QR' | 'GPS' | 'Manual';
  }) => void;
  onNavigate: (tab: string) => void;
}

export default function PresensiGPS({ 
  currentUser, 
  studies, 
  members, 
  attendance, 
  onAttendanceSuccess, 
  onDeleteAttendance, 
  onAddManualAttendance,
  onNavigate 
}: PresensiProps) {
  const [activeSubTab, setActiveSubTab] = useState<'absen' | 'manajemen'>('absen');
  const [selectedStudyId, setSelectedStudyId] = useState('');
  const [method, setMethod] = useState<'GPS' | 'QR'>('GPS');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; points?: number; distance?: number } | null>(null);

  // Search & manual modal states for management
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Manual attendance form state
  const [modalMemberId, setModalMemberId] = useState('');
  const [modalStudyId, setModalStudyId] = useState('');
  const [modalStatus, setModalStatus] = useState<'Hadir' | 'Izin' | 'Alpa' | 'Sakit'>('Hadir');
  const [modalMethod, setModalMethod] = useState<'QR' | 'GPS' | 'Manual'>('Manual');

  // GPS Simulation variables
  // Target coordinates for Masjid Al-Ikhlas UNINUS are: -6.9404285, 107.6534246
  const [userLat, setUserLat] = useState(-6.9404285);
  const [userLng, setUserLng] = useState(107.6534246);
  const [distance, setDistance] = useState<number>(12); // distance in meters

  // Custom coordinate offset simulations
  const simulatePositions = [
    { label: "Masjid Al-Ikhlas UNINUS (Di dalam, Akurat)", lat: -6.9404285, lng: 107.6534246, desc: "Sangat dekat dengan kubah utama. Cocok untuk presensi GPS." },
    { label: "Luar Masjid (Radius 85 Meter)", lat: -6.9409, lng: 107.6539, desc: "Berada dekat gerbang luar Jl. Soekarno Hatta. Jarak aman." },
    { label: "Kampus B UNINUS (Radius 1.3 Km - Berada di luar batasan!)", lat: -6.952, lng: 107.651, desc: "Terlalu jauh! Presensi GPS akan terpental karena radius > 150m." }
  ];

  // Camera QR Simulation variables
  const [cameraOn, setCameraOn] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [selectedQR, setSelectedQR] = useState('');

  const isAdminOrPengurus = currentUser.role === 'Admin' || currentUser.role === 'Pengurus';

  // Force reset modal select values when opened
  useEffect(() => {
    if (showAddModal) {
      if (members.length > 0) setModalMemberId(members[0].id);
      if (studies.length > 0) setModalStudyId(studies[0].id);
      setModalStatus('Hadir');
      setModalMethod('Manual');
    }
  }, [showAddModal, members, studies]);

  // Auto calculate simulated distance local helper
  useEffect(() => {
    const study = studies.find(s => s.id === selectedStudyId) || studies[0];
    if (study) {
      const R = 6371000; // Earth's radius in meters
      const phi1 = (userLat * Math.PI) / 180;
      const phi2 = (study.lat * Math.PI) / 180;
      const deltaPhi = ((study.lat - userLat) * Math.PI) / 180;
      const deltaLambda = ((study.lng - userLng) * Math.PI) / 180;

      const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
                Math.cos(phi1) * Math.cos(phi2) *
                Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = Math.round(R * c);
      setDistance(dist);
    } else {
      setDistance(0);
    }
  }, [userLat, userLng, selectedStudyId, studies]);

  useEffect(() => {
    if (studies.length > 0) {
      setSelectedStudyId(studies[0].id);
      setSelectedQR(studies[0].id);
    }
  }, [studies]);

  const handleGPSPresensi = async () => {
    if (!selectedStudyId) {
      alert("Harap pilih kegiatan kajian terlebih dahulu.");
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyId: selectedStudyId,
          memberId: currentUser.id,
          status: 'Hadir',
          method: 'GPS',
          lat: userLat,
          lng: userLng
        })
      });

      const data = await response.json();
      if (data.success) {
        setResult({
          success: true,
          message: `Alhamdulillah! Presensi GPS Anda divalidasi berhasil. Anda terhitung sejauh ${data.record.distance} meter dari Masjid target.`,
          points: data.record.method === 'GPS' ? 250 : 200,
          distance: data.record.distance
        });
        onAttendanceSuccess(data.member);
      } else {
        setResult({
          success: false,
          message: data.message || "Presensi GPS terpental.",
          distance: data.distance
        });
      }
    } catch {
      setResult({
        success: false,
        message: "Maaf, verifikasi geofencing GPS terputus jaringannya. Silakan coba sesaat lagi."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScanQR = () => {
    if (!selectedQR) {
      alert("Harap pilih QR kajian sasaran.");
      return;
    }
    setCameraOn(true);
    setScanning(true);
    setResult(null);

    // Simulate scanning delay
    setTimeout(async () => {
      setScanning(false);
      setCameraOn(false);
      setLoading(true);

      try {
        const response = await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studyId: selectedQR,
            memberId: currentUser.id,
            status: 'Hadir',
            method: 'QR'
          })
        });

        const data = await response.json();
        if (data.success) {
          setResult({
            success: true,
            message: `Alhamdulillah! QR Code Kajian "${studies.find(s=>s.id===selectedQR)?.title}" berhasil discan dari layar. Presensi tercatat!`,
            points: 200
          });
          onAttendanceSuccess(data.member);
        } else {
          setResult({
            success: false,
            message: data.message || "QR Code tidak valid."
          });
        }
      } catch {
        setResult({
          success: false,
          message: "Layanan offline. Gagal melacak QR."
        });
      } finally {
        setLoading(false);
      }
    }, 2200);
  };

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalMemberId || !modalStudyId) {
      alert("Harap lengkapi semua kolom!");
      return;
    }
    onAddManualAttendance({
      studyId: modalStudyId,
      memberId: modalMemberId,
      status: modalStatus,
      method: modalMethod
    });
    setShowAddModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data presensi untuk ${name}?`)) {
      onDeleteAttendance(id);
    }
  };

  const activeStudy = studies.find(s => s.id === selectedStudyId) || studies[0];

  // Filters for management view logs
  const filteredAttendance = attendance.filter(a => {
    const lookupMember = members.find(m => m.id === a.memberId);
    const mName = a.memberName || lookupMember?.name || '';
    const mProdi = lookupMember?.prodi || '';
    const sTitle = a.studyTitle || '';

    return mName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           mProdi.toLowerCase().includes(searchTerm.toLowerCase()) ||
           sTitle.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-6 select-none">
      
      {/* Sub-Tab Navigation Header (Only visible to Pengurus / Admin) */}
      {isAdminOrPengurus && (
        <div className="flex items-center gap-2 bg-[#02130e] border border-yellow-500/15 rounded-xl p-1 shadow-md w-fit self-start">
          <button
            onClick={() => setActiveSubTab('absen')}
            className={`
              px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer
              ${activeSubTab === 'absen' 
                ? 'bg-gradient-to-r from-[#e5c158] to-[#ab8922] text-[#02130e] font-black' 
                : 'text-emerald-400 hover:text-yellow-400'
              }
            `}
          >
            <Compass className="w-3.5 h-3.5" />
            Papan Absensi Mandiri
          </button>
          <button
            onClick={() => setActiveSubTab('manajemen')}
            className={`
              px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer
              ${activeSubTab === 'manajemen' 
                ? 'bg-gradient-to-r from-[#e5c158] to-[#ab8922] text-[#02130e] font-black' 
                : 'text-emerald-400 hover:text-yellow-400'
              }
            `}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Kelola Log Absensi ({attendance.length})
          </button>
        </div>
      )}

      {/* VIEW A: ABSENSI SCREEN */}
      {activeSubTab === 'absen' && (
        <div id="presensi-gps-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-1 font-sans">
          
          {/* Left panel: Method Selection and Inputs - 5 Cols */}
          <div className="lg:col-span-5 islamic-card rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-emerald-900">
              <CheckSquare className="w-5 h-5 text-[#e5c158]" />
              <div>
                <h3 className="text-sm font-black text-gray-100 uppercase tracking-wider">Metode Presensi</h3>
                <p className="text-[10px] text-emerald-400 font-semibold text-left">GEOFENCING GPS & SCANNER QR</p>
              </div>
            </div>

            {/* User Profile Card Confirmation */}
            <div className="bg-[#011a14] border border-yellow-500/10 rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-emerald-600 overflow-hidden bg-emerald-950 flex items-center justify-center shrink-0">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <div className="text-left overflow-hidden">
                <span className="text-[9px] text-[#e5c158] block uppercase font-bold leading-none">Biodata Presensi</span>
                <strong className="text-gray-100 text-xs font-black block mt-1 truncate">{currentUser.name}</strong>
                <span className="text-[10px] text-emerald-400 block truncate">{currentUser.prodi || 'Program Studi Belum Diatur'}</span>
              </div>
            </div>

            {/* Method Toggles */}
            <div className="grid grid-cols-2 gap-2 bg-[#011611] rounded-xl p-1 border border-yellow-500/10">
              <button
                onClick={() => { setMethod('GPS'); setResult(null); }}
                className={`
                  py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer
                  ${method === 'GPS' 
                    ? 'bg-gradient-to-r from-[#e5c158] to-[#ab8922] text-[#02130e] font-black shadow' 
                    : 'text-emerald-400 hover:text-[#e5c158]'
                  }
                `}
              >
                <Compass className="w-4 h-4" />
                GPS Geofencing
              </button>
              <button
                onClick={() => { setMethod('QR'); setResult(null); }}
                className={`
                  py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer
                  ${method === 'QR' 
                    ? 'bg-gradient-to-r from-[#e5c158] to-[#ab8922] text-[#02130e] font-black shadow' 
                    : 'text-emerald-400 hover:text-[#e5c158]'
                  }
                `}
              >
                <QrCode className="w-4 h-4" />
                Scan QR Code
              </button>
            </div>

            {/* Selected Study Selector */}
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-emerald-300 mb-2">
                Pilih Kajian / Kegiatan Aktif Hari Ini
              </label>
              {studies.length > 0 ? (
                <select
                  value={selectedStudyId}
                  onChange={(e) => setSelectedStudyId(e.target.value)}
                  className="w-full bg-[#011a14] border border-yellow-500/10 focus:border-[#e5c158] rounded-xl px-3 py-3 text-xs text-gray-200 outline-none"
                >
                  {studies.map(study => (
                    <option key={study.id} value={study.id}>
                      [{study.type}] {study.title} — {study.location}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="bg-[#02120e] text-red-400 border border-red-950 p-3 rounded-xl text-center text-xs">
                  Tidak ada agenda kegiatan / kajian yang terdaftar saat ini.
                </div>
              )}
            </div>

            <div className="w-full h-[1px] bg-emerald-950 my-1" />

            {/* SECTION A: GPS GEOFENCING PANEL */}
            {method === 'GPS' && (
              <div className="flex flex-col gap-4">
                
                {/* Custom Coordinate Adjuster */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Sliders className="w-4 h-4 text-[#e5c158]" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">GPS Simulator Sensor</span>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {simulatePositions.map((pos, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => {
                          setUserLat(pos.lat);
                          setUserLng(pos.lng);
                        }}
                        className={`
                          w-full text-left p-3 rounded-xl border transition-all text-xs cursor-pointer flex flex-col gap-0.5
                          ${userLat === pos.lat 
                            ? 'bg-[#063124] border-yellow-500/30' 
                            : 'bg-[#011a14]/60 border-emerald-950 hover:bg-[#02281d]'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between font-extrabold text-gray-100">
                          <span>{pos.label}</span>
                          {userLat === pos.lat && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                        </div>
                        <div className="text-[9px] text-[#e5c158]/80 leading-relaxed truncate">{pos.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* GPS Data */}
                <div className="bg-[#02140f] border border-emerald-950 rounded-xl p-3 grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
                  <div className="border-r border-emerald-950">
                    <div className="text-emerald-500">Latitude GPS Aktif</div>
                    <div className="text-gray-100 font-mono mt-0.5">{userLat.toFixed(6)}</div>
                  </div>
                  <div>
                    <div className="text-emerald-500">Longitude GPS Aktif</div>
                    <div className="text-gray-100 font-mono mt-0.5">{userLng.toFixed(6)}</div>
                  </div>
                </div>

                {/* SubmitGPS Button */}
                <button
                  onClick={handleGPSPresensi}
                  disabled={loading || studies.length === 0}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl shadow transition-all text-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Navigation2 className="w-4 h-4 text-yellow-300 animate-bounce" />
                      Kirim Presensi GPS Terverifikasi
                    </>
                  )}
                </button>
              </div>
            )}

            {/* SECTION B: QR ATTENDANCE PANEL */}
            {method === 'QR' && (
              <div className="flex flex-col gap-4">
                
                {/* QR Selector */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-emerald-300 mb-2">
                    Pilih Barcode QR Kajian Sasaran
                  </label>
                  {studies.length > 0 ? (
                    <select
                      value={selectedQR}
                      onChange={(e) => setSelectedQR(e.target.value)}
                      className="w-full bg-[#011a14] border border-yellow-500/10 rounded-xl px-3 py-3 text-xs text-gray-200 outline-none"
                    >
                      {studies.map(study => (
                        <option key={study.id} value={study.id}>
                          Barcode QR: {study.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="bg-[#02120e] text-red-400 border border-red-950 p-3 rounded-xl text-center text-xs">
                      Tidak ada agenda QR terdaftar.
                    </div>
                  )}
                </div>

                {/* Simulator Camera View Box */}
                <div className="relative h-48 rounded-xl border border-yellow-500/10 overflow-hidden bg-black flex flex-col items-center justify-center">
                  {cameraOn ? (
                    <>
                      {/* Fake camera stream background */}
                      <div className="absolute inset-0 bg-[#0c0d12] flex items-center justify-center">
                        <div className="w-32 h-32 border border-[#e5c158] rounded-xl flex items-center justify-center relative p-2 shadow shadow-yellow-500/10">
                          <QrCode className="w-full h-full text-[#e5c158] opacity-80" />
                          <div className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow shadow-emerald-400/80 animate-bounce top-5" />
                        </div>
                      </div>

                      <span className="absolute bottom-3 left-3 bg-red-600 text-white text-[8px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1.5 shadow animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white block animate-ping" /> Camera Live
                      </span>
                    </>
                  ) : (
                    <div className="text-center p-4 flex flex-col items-center gap-2">
                      <Camera className="w-10 h-10 text-emerald-600" />
                      <div>
                        <h4 className="text-xs font-bold text-gray-400">Simulator Kamera Belum Aktif</h4>
                        <p className="text-[10px] text-emerald-600 mt-0.5 max-w-[200px]">Aktifkan kamera untuk memindai lembar QR Code presensi UKM.</p>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleScanQR}
                  disabled={loading || scanning || studies.length === 0}
                  className="w-full bg-gradient-to-r from-yellow-500 to-[#dca91c] hover:from-yellow-400 hover:to-yellow-600 disabled:opacity-40 disabled:cursor-not-allowed text-[#02130e] font-black py-3 px-4 rounded-xl shadow transition-all text-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Camera className="w-4 h-4 text-emerald-950" />
                  Aktifkan Kamera & Scan QR Code
                </button>
              </div>
            )}

          </div>

          {/* Right panel: Live Map Grid Coordinates & Verification Results - 7 Cols */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Real-time distance indicator */}
            {activeStudy && (
              <div className="islamic-card rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="w-4 h-4 text-[#e5c150]" />
                  <div>
                    <span className="text-[10px] text-emerald-500 block font-bold leading-none uppercase">Lokasi Target Kajian</span>
                    <strong className="text-gray-200 mt-1 block">{activeStudy.title} ({activeStudy.location})</strong>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] text-emerald-500 block font-semibold">Tingkat Geofencing Jarak</span>
                  <span className={`text-base font-black ${distance <= 150 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {distance >= 1000 ? `${(distance/1000).toFixed(2)} Km` : `${distance} meter`}
                  </span>
                </div>
              </div>
            )}

            {/* Custom Visual Interactive Radius Map Circle */}
            <div className="islamic-card rounded-2xl p-5 h-76 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-emerald-900 mb-3 pointer-events-none">
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#e5c158]" />
                    <h4 className="text-xs font-bold text-yellow-100 tracking-wider">RADAR SEBARAN & RADIUS GPS</h4>
                  </div>
                  <span className="text-[9px] text-emerald-500 uppercase font-bold tracking-widest">{activeStudy?.type || 'KAJIAN'} LOCATION</span>
                </div>

                {/* Custom visual compass map rendering */}
                <div className="relative w-full h-44 bg-[#011410] border border-emerald-900 rounded-xl overflow-hidden shadow flex items-center justify-center">
                  
                  {/* Radar circular lines */}
                  <div className="absolute w-40 h-40 rounded-full border border-emerald-950/40 pointer-events-none scale-50" />
                  <div className="absolute w-40 h-40 rounded-full border border-emerald-900/30 border-dashed pointer-events-none" />
                  <div className="absolute w-40 h-40 rounded-full border border-[#e5c158]/5 pointer-events-none scale-150" />
                  
                  {/* Target Radius Green Shade Circle */}
                  <div className="absolute w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-dashed border-emerald-500/35 flex items-center justify-center animate-pulse pointer-events-none">
                    <span className="text-[8px] text-emerald-500 uppercase font-black tracking-widest bg-[#011410] px-1 border border-emerald-900/40">150m GPS Radius</span>
                  </div>

                  {/* Exact Target Center Marker representing Masjid */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none select-none z-10">
                    <div className="w-4 h-4 rounded-full bg-[#113d2f] border border-yellow-500 flex items-center justify-center shadow">
                      <span className="text-[8px]">🕌</span>
                    </div>
                  </div>

                  {/* Interactive simulated User pointer based on chosen offset */}
                  {activeStudy && (
                    <div 
                      className="absolute transition-all duration-500 flex flex-col items-center pointer-events-none select-none z-20"
                      style={{
                        top: userLat === -6.9404285 ? '43%' : userLat === -6.9409 ? '78%' : '15%',
                        left: userLat === -6.9404285 ? '48%' : userLat === -6.9409 ? '54%' : '20%',
                      }}
                    >
                      <div className="relative">
                        <div className="absolute top-0 left-0 w-3 h-3 rounded-full bg-yellow-400/50 animate-ping" />
                        <div className="w-3.5 h-3.5 rounded-full bg-[#02130e] border-2 border-yellow-400 flex items-center justify-center shadow" />
                      </div>
                      <span className="bg-[#02130e] text-yellow-300 font-bold border border-[#e5c150]/20 text-[7px] px-1.5 py-0.5 rounded shadow whitespace-nowrap mt-1">
                        Anda ({distance}m)
                      </span>
                    </div>
                  )}

                  {/* Angle axis indicators */}
                  <div className="absolute left-3 top-2 text-[8px] font-bold text-emerald-700">BUAHBATU BANDUNG RADAR</div>
                </div>
              </div>
              
              <p className="text-[9px] text-emerald-500 font-medium">
                🚩 <strong>Prinsip Kerja Skripsi:</strong> Aplikasi backend menjalankan formula matematika Haversine mengukur jarak busur terpendek antara titik GPS HP dan koordinat Masjid Al-Hidayah. Jarak toleransi radius geofencing diatur 150m meter untuk mencegah kecurangan absen di luar lokasi.
              </p>
            </div>

            {/* SECTION C: VERIFICATION STATUS ALERT DRAWER */}
            {result && (
              <div className={`
                p-5 rounded-2xl border flex flex-col gap-3 relative animate-fadeIn
                ${result.success 
                  ? 'bg-emerald-950/40 border-emerald-500/30' 
                  : 'bg-red-950/40 border-red-500/30'
                }
              `}>
                
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <div className="w-9 h-9 rounded-full bg-emerald-500/25 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-red-500/25 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  )}

                  <div>
                    <h4 className={`text-xs font-black uppercase tracking-wider ${result.success ? 'text-emerald-300' : 'text-red-300'}`}>
                      {result.success ? 'KIRIM PRESENSI SUKSES' : 'PRESENSI GAGAL GEOFENCING'}
                    </h4>
                    <p className="text-xs text-gray-200 leading-relaxed mt-1">
                      {result.message}
                    </p>
                  </div>
                </div>

                {result.success && result.points && (
                  <div className="flex items-center justify-between border-t border-emerald-900/60 pt-3 text-[10px] uppercase font-bold text-[#e5c158] bg-emerald-950/40 p-2.5 rounded-xl border border-yellow-500/10">
                    <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Poin Berkah Tambahan</span>
                    <span className="text-sm font-black">+ {result.points} XP Bertambah!</span>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      )}

      {/* VIEW B: MANAJEMEN LOG ABSENSI (ADMIN / PENGURUS ONLY) */}
      {activeSubTab === 'manajemen' && isAdminOrPengurus && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* Search inputs */}
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-emerald-500 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama, prodi, atau kajian..."
                className="w-full bg-[#011a14] border border-yellow-500/10 focus:border-[#e5c158] focus:ring-1 focus:ring-[#e5c158] rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-100 placeholder-emerald-700 outline-none transition-all"
              />
            </div>

            {/* Actions button group */}
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-[#e5c158] to-[#ab8922] hover:from-[#fdde7c] text-emerald-950 font-black text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow hover:shadow-yellow-500/10"
              >
                <Plus className="w-4 h-4" />
                Tambah Presensi Manual
              </button>
              
              <button
                onClick={() => onNavigate('laporan')}
                className="bg-[#021e17] hover:bg-[#033025] text-emerald-300 border border-emerald-900/60 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow"
              >
                <FileText className="w-4 h-4" />
                Cetak Laporan PDF
              </button>
            </div>

          </div>

          {/* Table list of logs */}
          <div className="islamic-card rounded-2xl overflow-hidden border border-yellow-500/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-emerald-900">
                <thead className="bg-[#021811] text-emerald-400 font-extrabold uppercase tracking-wider text-[9px] pointer-events-none">
                  <tr>
                    <th className="px-5 py-4">Waktu Presensi</th>
                    <th className="px-5 py-4">Nama Anggota</th>
                    <th className="px-5 py-4">Program Studi (Prodi)</th>
                    <th className="px-5 py-4">Judul Kegiatan / Kajian</th>
                    <th className="px-5 py-4 text-center">Metode</th>
                    <th className="px-5 py-4 text-center">Status</th>
                    <th className="px-5 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-950/80 bg-transparent text-gray-200">
                  {filteredAttendance.length > 0 ? (
                    filteredAttendance.map((record) => {
                      const lookupMember = members.find(m => m.id === record.memberId);
                      const memberProdi = lookupMember?.prodi || 'Program Studi Belum Diatur';

                      return (
                        <tr key={record.id} className="hover:bg-emerald-950/20 transition-all">
                          {/* Date and Time */}
                          <td className="px-5 py-4 whitespace-nowrap font-mono text-[10px] font-bold text-gray-400">
                            {record.date} <span className="text-[#e5c158] ml-1">{record.time}</span>
                          </td>
                          {/* Name */}
                          <td className="px-5 py-4 whitespace-nowrap font-extrabold text-gray-100">
                            {record.memberName || lookupMember?.name || 'N/A'}
                          </td>
                          {/* Prodi */}
                          <td className="px-5 py-4 whitespace-nowrap text-emerald-400 font-semibold">
                            {memberProdi}
                          </td>
                          {/* Study */}
                          <td className="px-5 py-4 whitespace-nowrap text-gray-300 font-medium">
                            {record.studyTitle}
                          </td>
                          {/* Method */}
                          <td className="px-5 py-4 whitespace-nowrap text-center">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              record.method === 'GPS' ? 'bg-blue-950 text-blue-300 border border-blue-900/40' :
                              record.method === 'QR' ? 'bg-purple-950 text-purple-300 border border-purple-900/40' :
                              'bg-amber-950 text-amber-300 border border-amber-900/40'
                            }`}>
                              {record.method} {record.distance !== undefined ? `(${record.distance}m)` : ''}
                            </span>
                          </td>
                          {/* Status */}
                          <td className="px-5 py-4 whitespace-nowrap text-center font-black">
                            <span className={`text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              record.status === 'Hadir' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40' :
                              record.status === 'Izin' ? 'bg-blue-950 text-blue-300 border border-blue-900/40' :
                              record.status === 'Alpa' ? 'bg-red-950 text-red-400 border border-red-900/40' :
                              'bg-yellow-950 text-yellow-400 border border-yellow-900/40'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                          {/* Actions */}
                          <td className="px-5 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => handleDelete(record.id, record.memberName || lookupMember?.name || '')}
                              className="p-1 px-2 text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-transparent hover:border-red-900/40 rounded-lg transition-all inline-flex cursor-pointer"
                              title="Hapus Log Presensi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-gray-500 font-bold">
                        Tidak ada riwayat presensi yang sesuai kata kunci pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* MODAL DIALOG: ADD MANUAL ATTENDANCE */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#020d0ad0] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveManual}
            className="bg-[#032117] rounded-2xl border border-yellow-500/25 p-6 w-full max-w-md shadow-2xl relative select-none"
          >
            <button 
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-emerald-500 hover:text-yellow-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 pb-3 border-b border-emerald-900 mb-4">
              <CheckSquare className="w-5 h-5 text-[#e5c158]" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Tambah Presensi Manual</h3>
            </div>

            {/* Input elements wrapper */}
            <div className="space-y-4 text-left">
              
              {/* Select Member */}
              <div>
                <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1.5">
                  Pilih Anggota / Santri
                </label>
                <select
                  value={modalMemberId}
                  onChange={(e) => setModalMemberId(e.target.value)}
                  className="w-full bg-[#011a14] border border-yellow-500/15 focus:border-[#e5c158] focus:ring-1 focus:ring-[#e5c158] rounded-xl px-3 py-3 text-xs text-gray-200 outline-none cursor-pointer"
                  required
                >
                  <option value="" disabled>Pilih nama anggota...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.prodi || 'Tidak ada Prodi'}) [{m.role}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Study / Kegiatan */}
              <div>
                <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1.5">
                  Kajian / Kegiatan Sasaran
                </label>
                <select
                  value={modalStudyId}
                  onChange={(e) => setModalStudyId(e.target.value)}
                  className="w-full bg-[#011a14] border border-yellow-500/15 focus:border-[#e5c158] focus:ring-1 focus:ring-[#e5c158] rounded-xl px-3 py-3 text-xs text-gray-200 outline-none cursor-pointer"
                  required
                >
                  <option value="" disabled>Pilih kegiatan...</option>
                  {studies.map(s => (
                    <option key={s.id} value={s.id}>
                      [{s.type}] {s.title} — {s.speaker}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid 2 Column for Status & Method */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* Select Status */}
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1.5">
                    Status Kehadiran
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as any)}
                    className="w-full bg-[#011a14] border border-yellow-500/15 focus:border-[#e5c158] focus:ring-1 focus:ring-[#e5c158] rounded-xl px-3 py-3 text-xs text-gray-200 outline-none cursor-pointer"
                    required
                  >
                    <option value="Hadir">Hadir</option>
                    <option value="Izin">Izin</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Alpa">Alpa</option>
                  </select>
                </div>

                {/* Select Method */}
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1.5">
                    Metode Pencatatan
                  </label>
                  <select
                    value={modalMethod}
                    onChange={(e) => setModalMethod(e.target.value as any)}
                    className="w-full bg-[#011a14] border border-yellow-500/15 focus:border-[#e5c158] focus:ring-1 focus:ring-[#e5c158] rounded-xl px-3 py-3 text-xs text-gray-200 outline-none cursor-pointer"
                    required
                  >
                    <option value="Manual">Manual</option>
                    <option value="GPS">GPS</option>
                    <option value="QR">QR Code</option>
                  </select>
                </div>

              </div>

              {/* Gamification Points Note Alert */}
              <div className="bg-[#02130e] border border-yellow-500/10 p-3 rounded-xl flex items-start gap-2.5 text-[10px] text-emerald-400 font-semibold leading-relaxed">
                <ShieldAlert className="w-4 h-4 text-[#e5c158] shrink-0 mt-0.5" />
                <span>Pencatatan status <strong>"Hadir"</strong> secara manual akan memberikan bonus +200 XP Poin Berkah secara otomatis ke riwayat poin santri.</span>
              </div>

            </div>

            {/* Modal submit actions */}
            <div className="flex items-center justify-end gap-2.5 border-t border-emerald-900/60 pt-4 mt-6">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 rounded-xl border border-emerald-900/50 hover:bg-[#04281e] text-emerald-500 text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-[#e5c158] to-[#ab8922] hover:from-[#fdde7c] text-emerald-950 text-xs font-black rounded-xl shadow transition-all cursor-pointer"
              >
                Simpan Presensi
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
