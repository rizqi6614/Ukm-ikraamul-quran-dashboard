import { useState, useEffect } from 'react';
import { Member, Study, AttendanceRecord, MemorizationRecord, CashRecord } from './types';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import DashboardOverview from './components/DashboardOverview';
import PresensiGPS from './components/PresensiGPS';
import ManajemenAnggota from './components/ManajemenAnggota';
import ManajemenStudies from './components/ManajemenStudies';
import PoinBerkah from './components/PoinBerkah';
import LaporanPDF from './components/LaporanPDF';
import AIIslami from './components/AIIslami';
import SettingsView from './components/Settings';
import UangKas from './components/UangKas';

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Synchronized server databases state
  const [members, setMembers] = useState<Member[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [memorization, setMemorization] = useState<MemorizationRecord[]>([]);
  const [cashRecords, setCashRecords] = useState<CashRecord[]>([]);

  // Load backend statistics
  const syncDatabase = async () => {
    try {
      const [membersRes, studiesRes, attendanceRes, memorizationRes, cashRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/studies'),
        fetch('/api/attendance'),
        fetch('/api/memorization'),
        fetch('/api/cash')
      ]);

      if (membersRes.ok && studiesRes.ok && attendanceRes.ok && memorizationRes.ok && cashRes.ok) {
        const membersData = await membersRes.json();
        const studiesData = await studiesRes.json();
        const attendanceData = await attendanceRes.json();
        const memorizationData = await memorizationRes.json();
        const cashData = await cashRes.json();

        setMembers(membersData);
        setStudies(studiesData);
        setAttendance(attendanceData);
        setMemorization(memorizationData);
        setCashRecords(cashData);

        // Sync active user points and levels if logged in
        if (currentUser) {
          const syncedSelf = membersData.find((m: Member) => m.id === currentUser.id);
          if (syncedSelf) {
            setCurrentUser(syncedSelf);
          }
        }
      }
    } catch {
      console.warn("Using offline fallback data streams");
    }
  };

  useEffect(() => {
    syncDatabase();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      syncDatabase();
    }
  }, [isLoggedIn]);

  // Handle post-action callbacks to avoid stale points values
  const handleAttendanceSuccess = (updatedMember: Member) => {
    setCurrentUser(updatedMember);
    syncDatabase();
  };

  const handleRedeemCompleted = (updatedMember: Member) => {
    setCurrentUser(updatedMember);
    syncDatabase();
  };

  const handleMemorizationSubmitted = (updatedMember: Member) => {
    setCurrentUser(updatedMember);
    syncDatabase();
  };

  const handleUpdateProfile = async (updatedFields: Partial<Member>) => {
    if (!currentUser) return;
    try {
      const response = await fetch(`/api/members/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (response.ok) {
        const updated = await response.json();
        setCurrentUser(updated);
        syncDatabase();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (newMember: Member) => {
    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember)
      });
      if (response.ok) {
        await syncDatabase();
        alert("Pendaftaran anggota baru sukses!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateMember = async (id: string, updatedMember: Partial<Member>) => {
    try {
      const response = await fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMember)
      });
      if (response.ok) {
        await syncDatabase();
        alert("Detail profil anggota berhasil diproses!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      const response = await fetch(`/api/members/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await syncDatabase();
        alert("Anggota berhasil dihapus.");
      } else {
        const data = await response.json();
        alert(data.error || "Gagal menghapus anggota.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCashRecord = async (amount: number, type: 'Masuk' | 'Keluar', description: string) => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          type,
          description,
          recordedBy: currentUser.name
        })
      });
      if (response.ok) {
        await syncDatabase();
        alert("Transaksi kas berhasil dicatat!");
      } else {
        const data = await response.json();
        alert(data.error || "Gagal mencatat transaksi.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCashRecord = async (id: string) => {
    try {
      const response = await fetch(`/api/cash/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await syncDatabase();
        alert("Transaksi kas berhasil dihapus.");
      } else {
        const data = await response.json();
        alert(data.error || "Gagal menghapus transaksi.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStudy = async (newStudy: Study) => {
    try {
      const response = await fetch('/api/studies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudy)
      });
      if (response.ok) {
        await syncDatabase();
        alert("Posting agenda kajian / kegiatan baru sukses disebarkan!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStudy = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kajian/kegiatan ini? Semua data presensi terkait juga akan dihapus.")) return;
    try {
      const response = await fetch(`/api/studies/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await syncDatabase();
        alert("Kajian/Kegiatan berhasil dihapus!");
      } else {
        const data = await response.json();
        alert(data.error || "Gagal menghapus kajian/kegiatan.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAttendance = async (id: string) => {
    try {
      const response = await fetch(`/api/attendance/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await syncDatabase();
      } else {
        const data = await response.json();
        alert(data.error || "Gagal menghapus data presensi.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddManualAttendance = async (record: {
    studyId: string;
    memberId: string;
    status: 'Hadir' | 'Izin' | 'Alpa' | 'Sakit';
    method: 'QR' | 'GPS' | 'Manual';
  }) => {
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        await syncDatabase();
        alert("Presensi manual berhasil dicatat!");
      } else {
        alert(data.message || "Gagal mencatat presensi.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveTab('overview');
    setView('landing');
  };

  if (view === 'landing') {
    return (
      <LandingPage 
        onNavigateDashboard={() => setView('dashboard')}
        isLoggedIn={isLoggedIn && currentUser !== null}
        studies={studies}
      />
    );
  }

  // Login component condition wrapper
  if (!isLoggedIn || !currentUser) {
    return (
      <Login 
        onLoginSuccess={(user: Member) => {
          setCurrentUser(user);
          setIsLoggedIn(true);
        }} 
        onBackToLanding={() => setView('landing')}
      />
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-100 text-slate-800 antialiased overflow-x-hidden">
      
      {/* Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={currentUser.role}
        userName={currentUser.name}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content View with Top Header */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8 shrink-0">
          <div className="flex items-center gap-2 md:gap-4 text-slate-500">
            <span className="text-xs md:text-sm font-semibold text-emerald-700">
              {activeTab === 'overview' && 'Dashboard'}
              {activeTab === 'kajian' && 'Jadwal'}
              {activeTab === 'presensi' && 'Presensi'}
              {activeTab === 'anggota' && 'Anggota'}
              {activeTab === 'poin' && 'Gamifikasi'}
              {activeTab === 'laporan' && 'Laporan'}
              {activeTab === 'kas' && 'Uang Kas'}
              {activeTab === 'ai' && 'Asisten AI'}
              {activeTab === 'pengaturan' && 'Pengaturan'}
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-xs md:text-sm text-slate-600 font-medium">
              {activeTab === 'overview' && 'Statistik Terpadu'}
              {activeTab === 'kajian' && 'Jadwal Kegiatan Terdekat'}
              {activeTab === 'presensi' && 'Presensi GPS'}
              {activeTab === 'anggota' && 'Manajemen Keanggotaan'}
              {activeTab === 'poin' && 'Poin Berkah'}
              {activeTab === 'laporan' && 'Export PDF & Schema SQL'}
              {activeTab === 'kas' && 'Laporan Uang Kas UKM'}
              {activeTab === 'ai' && 'AI Islami Assistant'}
              {activeTab === 'pengaturan' && 'Sunting Profil & MySQL Skema'}
            </span>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-[10px] font-mono text-slate-500 font-bold">DB: MySQL CONNECTED</span>
            </div>
            {/* Quick status indicator count notifications */}
            <div className="relative p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-slate-400">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">3</span>
            </div>
          </div>
        </header>

        {/* Main viewport area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto no-scrollbar bg-slate-50">
          
          {/* State Tab Routing */}
          {activeTab === 'overview' && (
            <DashboardOverview 
              currentUser={currentUser} 
              members={members}
              studies={studies}
              attendance={attendance}
              memorization={memorization}
              onNavigate={setActiveTab} 
            />
          )}



          {activeTab === 'kajian' && (
            <ManajemenStudies 
              currentUser={currentUser}
              studies={studies}
              onAddStudy={handleAddStudy}
              onDeleteStudy={handleDeleteStudy}
            />
          )}

          {activeTab === 'presensi' && (
            <PresensiGPS 
              currentUser={currentUser}
              studies={studies}
              members={members}
              attendance={attendance}
              onAttendanceSuccess={handleAttendanceSuccess}
              onDeleteAttendance={handleDeleteAttendance}
              onAddManualAttendance={handleAddManualAttendance}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'anggota' && (
            <ManajemenAnggota 
              currentUser={currentUser}
              members={members}
              onAddMember={handleAddMember}
              onUpdateMember={handleUpdateMember}
              onDeleteMember={handleDeleteMember}
            />
          )}

          {activeTab === 'kas' && (
            <UangKas 
              currentUser={currentUser}
              cashRecords={cashRecords}
              onCreateCashRecord={handleCreateCashRecord}
              onDeleteCashRecord={handleDeleteCashRecord}
            />
          )}

          {activeTab === 'poin' && (
            <PoinBerkah 
              currentUser={currentUser}
              onRedeemCompleted={handleRedeemCompleted}
            />
          )}

          {activeTab === 'laporan' && (
            <LaporanPDF 
              currentUser={currentUser}
              members={members}
              studies={studies}
              attendance={attendance}
            />
          )}

          {activeTab === 'ai' && (
            <AIIslami />
          )}

          {activeTab === 'pengaturan' && (
            <SettingsView 
              currentUser={currentUser}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

        </main>
      </div>

    </div>
  );
}
