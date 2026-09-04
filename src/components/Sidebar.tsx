import { 
  LayoutDashboard, BookOpen, GraduationCap, Calendar, MapPin, 
  CheckSquare, Users, Trophy, FileText, Bot, Settings, LogOut, Menu, X,
  Coins
} from "lucide-react";
import { UserRole } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  userName: string;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  userRole, 
  userName, 
  onLogout,
  isOpen,
  setIsOpen
}: SidebarProps) {

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, roles: ['Admin', 'Pengurus', 'Anggota'] },
    { id: 'kajian', label: 'Kajian & Kegiatan', icon: Calendar, roles: ['Admin', 'Pengurus', 'Anggota'] },
    { id: 'presensi', label: 'Presensi GPS', icon: CheckSquare, roles: ['Admin', 'Pengurus', 'Anggota'] },
    { id: 'anggota', label: 'Anggota', icon: Users, roles: ['Admin', 'Pengurus', 'Anggota'] },
    { id: 'poin', label: 'Poin Berkah', icon: Trophy, roles: ['Admin', 'Pengurus', 'Anggota'] },
    { id: 'laporan', label: 'Laporan & SQL', icon: FileText, roles: ['Admin', 'Pengurus', 'Anggota'] },
    { id: 'kas', label: 'Uang Kas', icon: Coins, roles: ['Admin', 'Pengurus', 'Anggota'] },
    { id: 'ai', label: 'AI Islami', icon: Bot, roles: ['Admin', 'Pengurus', 'Anggota'] },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings, roles: ['Admin', 'Pengurus', 'Anggota'] },
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-emerald-950 border-b border-emerald-900/50 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          {/* Gold mosque mini icon */}
          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-[#01140f] border border-yellow-500/10 p-0.5">
            <img src="/logo-iq.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-white tracking-wider">IKRAAMUL QUR'AN</h1>
            <p className="text-[8px] text-emerald-400 font-medium uppercase tracking-widest">Management System</p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-emerald-300 p-1 bg-emerald-900/50 rounded-lg border border-emerald-800 cursor-pointer"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar background overlay on mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Main Frame */}
      <aside className={`
        fixed inset-y-0 left-0 z-45 w-64 bg-emerald-950 border-r border-emerald-900/50 flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen shrink-0 text-emerald-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col gap-6">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3 px-1 pt-2">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-[#01140f] border border-yellow-500/10 p-0.5">
              <img src="/logo-iq.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-white leading-tight">IKRAAMUL QUR'AN</span>
              <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-widest leading-none mt-0.5">Management System</span>
            </div>
          </div>

          <div className="w-full h-[1px] bg-emerald-900/50" />

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1.5 overflow-y-auto no-scrollbar max-h-[50vh]">
            {allowedItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-4 py-3 rounded-xl text-left font-medium text-xs flex items-center gap-3 transition-colors cursor-pointer group
                    ${isActive 
                      ? 'bg-emerald-800/50 text-white font-semibold shadow-inner' 
                      : 'text-emerald-200 hover:text-white hover:bg-emerald-900/40'
                    }
                  `}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-emerald-400 group-hover:text-white transition-colors'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dynamic Mihrab Quote Arch (Bottom left from image) */}
        <div className="flex flex-col gap-4 mt-auto">
          <div className="relative border border-emerald-900/60 rounded-2xl bg-emerald-900/20 p-4 text-center overflow-hidden">
            {/* Islamic Dome / Mihrab Shape Background drawn via CSS SVG */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-yellow-300 via-emerald-800 to-transparent pointer-events-none" />
            
            {/* Callout mosque decoration */}
            <div className="mx-auto w-10 h-10 flex items-center justify-center rounded-full bg-emerald-950/80 border border-emerald-800 mb-2.5">
              <span className="text-yellow-400 text-xs">📖</span>
            </div>
            
            {/* Arabic Script & Translation */}
            <p className="font-arabic text-emerald-200 text-sm leading-relaxed mb-1.5" dir="rtl">
              ٱقْرَأْ بِٱسْمِ RABBILADZI KHALAQ
            </p>
            <p className="text-[10px] text-yellow-300/80 italic font-medium leading-relaxed">
              "Iqra' bismi rabbikalladzi khalaq"
            </p>
            <p className="text-[8px] text-emerald-400 font-bold tracking-widest mt-1">
              (QS. AL-'ALAQ: 1)
            </p>
          </div>

          {/* User Signout Button */}
          <div className="flex items-center justify-between bg-emerald-900/30 border border-emerald-900/50 rounded-xl p-3">
            <div className="flex flex-col select-none">
              <span className="text-[10px] font-bold text-gray-100 truncate max-w-[100px]">{userName}</span>
              <span className="text-[8px] text-emerald-400 uppercase font-semibold">{userRole}</span>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 transition-all cursor-pointer"
              title="Keluar"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
