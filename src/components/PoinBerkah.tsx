import { useState, useEffect } from 'react';
import { 
  Trophy, Award, Flame, ShoppingBag, ScrollText, CheckCircle2, 
  Sparkles, AlertTriangle, ShieldCheck, Heart, Trash2 
} from 'lucide-react';
import { Member, RewardItem, PointHistory } from '../types';

interface PoinProps {
  currentUser: Member;
  onRedeemCompleted: (updatedMember: Member) => void;
}

export default function PoinBerkah({ currentUser, onRedeemCompleted }: PoinProps) {
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [history, setHistory] = useState<PointHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load catalogs and histories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rRes, hRes] = await Promise.all([
          fetch('/api/rewards'),
          fetch('/api/points/history')
        ]);
        const rData = await rRes.json();
        const hData = await hRes.json();
        setRewards(rData);
        // Filter history only for this active member for safety
        setHistory(hData.filter((item: PointHistory) => item.memberId === currentUser.id));
      } catch {
        // Fallback structures
        console.warn("Using offline fallback points registries");
      }
    };
    fetchData();
  }, [currentUser.id]);

  const handleRedeem = async (rewardId: string, cost: number) => {
    if (currentUser.totalPoints < cost) {
      setAlertMsg({ type: 'error', text: 'Maaf, Poin Berkah Anda tidak mencukupi untuk melakukan penukaran!' });
      return;
    }

    setLoading(true);
    setAlertMsg(null);

    try {
      const response = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: currentUser.id,
          rewardId
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setAlertMsg({
          type: 'success',
          text: `Alhamdulillah! Penukaran hadiah berhasil. Silakan hubungi Pengurus UKM untuk serah terima fisik barang.`
        });
        
        // Pass up updated member total points
        onRedeemCompleted(data.member);
        
        // Refresh local listings
        setRewards(prev => prev.map(r => r.id === rewardId ? { ...r, stock: r.stock - 1 } : r));
        
        // Insert fake entry in transaction logs
        setHistory(prev => [
          {
            id: "P_NEW",
            memberId: currentUser.id,
            memberName: currentUser.name,
            points: cost,
            description: `Tukar Hadiah: ${data.reward.title}`,
            date: new Date().toISOString().split("T")[0],
            type: "Kurang"
          },
          ...prev
        ]);
      } else {
        setAlertMsg({ type: 'error', text: data.error || 'Terjadi hambatan transaksi.' });
      }
    } catch {
      setAlertMsg({ type: 'error', text: 'Jaringan sibuk. Penukaran gagal.' });
    } finally {
      setLoading(false);
    }
  };

  // Static gamified Leaderboard mockup
  const leaderboard: any[] = [];

  return (
    <div id="poin-berkah-viewport" className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-1 select-none font-sans">
      
      {/* Left panel: Balance + Reward Catalog - 8 Cols */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Balance metrics */}
        <div className="rounded-2xl p-6 bg-gradient-to-r from-[#9b7722] to-[#e5c158] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#02130e] flex items-center justify-center text-xl shadow border border-[#ab8922]/20">
              💎
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-[#02130e]">Poin Berkah Utama</span>
              <h2 className="text-2xl font-black text-[#02130e] leading-none mt-1">
                {currentUser.totalPoints.toLocaleString('id-ID')}{' '}
                <span className="text-xs font-bold text-[#021350]/80">Poin Berkah XP</span>
              </h2>
              <p className="text-[11px] text-[#02130e]/70 font-semibold mt-1">
                Kumpulkan poin setoran dari kehadiran kajian dan setoran tajwid harian.
              </p>
            </div>
          </div>

          <div className="bg-[#02130e] border border-[#e5c158]/50 p-3 rounded-xl min-w-[140px] text-center shrink-0">
            <span className="text-[9px] uppercase font-bold text-emerald-400">Peringkat Level</span>
            <div className="text-sm font-black text-white mt-1">Lv {currentUser.level} • {currentUser.levelName}</div>
            {/* dynamic progress indicator */}
            <div className="w-full bg-emerald-950/80 rounded-full h-1 mt-2 overflow-hidden">
              <div className="bg-[#e5c158] h-full" style={{ width: `${((currentUser.xp % 2500)/2500)* 100}%` }} />
            </div>
          </div>
        </div>

        {/* Alerts messages */}
        {alertMsg && (
          <div className={`
            p-4 rounded-xl border text-xs font-semibold flex items-center gap-3 animate-fadeIn
            ${alertMsg.type === 'success' 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
              : 'bg-red-950/40 border-red-500/30 text-red-300'
            }
          `}>
            {alertMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />}
            <span>{alertMsg.text}</span>
          </div>
        )}

        {/* Reward catalogs */}
        <div>
          <div className="flex items-center gap-2 pb-2.5 border-b border-emerald-900 mb-4">
            <ShoppingBag className="w-4.5 h-4.5 text-[#e5c158]" />
            <h3 className="text-xs font-extrabold text-gray-100 uppercase tracking-widest">Katalog Penukaran Hadiah</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map((reward) => (
              <div 
                key={reward.id}
                className="islamic-card rounded-2xl p-4 border flex flex-col justify-between border-yellow-500/10 hover:border-yellow-500/20 hover:scale-[1.01] transition-all relative group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-900 flex items-center justify-center text-base">
                      {reward.id === 'R001' ? '📖' : reward.id === 'R002' ? '🧥' : reward.id === 'R003' ? '🥤' : '📿'}
                    </div>
                    <span className="text-[10px] text-yellow-300 font-extrabold">{reward.cost.toLocaleString('id-ID')} Poin</span>
                  </div>

                  <h4 className="text-sm font-black text-gray-100 mt-3.5 group-hover:text-yellow-100">{reward.title}</h4>
                  <p className="text-[10px] text-emerald-500 leading-normal mt-1">{reward.description}</p>
                </div>

                <div className="flex items-center justify-between border-t border-emerald-900/60 pt-3.5 mt-4">
                  <span className="text-[9px] font-bold text-amber-500">Stok: {reward.stock} Pcs</span>
                  <button
                    onClick={() => handleRedeem(reward.id, reward.cost)}
                    disabled={loading || reward.stock <= 0}
                    className="bg-[#043324] hover:bg-[#e5c158] border border-[#e5c158]/20 hover:border-transparent text-[#e5c150] hover:text-[#02130e] font-black text-[9px] px-3.5 py-2 rounded-xl transition-all uppercase tracking-widest cursor-pointer disabled:opacity-40"
                  >
                    Tukar Hadiah
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right panel: Leaderboard + Point log history - 4 Cols */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Leaderboard points */}
        <div className="islamic-card rounded-2xl p-4">
          <div className="flex items-center gap-2 pb-2 border-b border-emerald-900 mb-3">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <h3 className="text-xs font-black text-yellow-100 uppercase tracking-widest">Klasemen Khidmah</h3>
          </div>

          <div className="flex flex-col gap-2">
            {leaderboard.map((user) => (
              <div 
                key={user.rank}
                className={`
                  p-2.5 rounded-xl flex items-center justify-between transition-all border
                  ${user.isSelf 
                    ? 'bg-[#063b2a] border-yellow-500/20 shadow' 
                    : 'bg-[#011a14]/60 border-emerald-950'
                  }
                `}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-5 h-5 text-[10px] font-black rounded flex items-center justify-center border ${
                    user.rank === 1 ? 'bg-yellow-500/10 border-yellow-500 text-yellow-300' :
                    user.rank === 2 ? 'bg-slate-500/10 border-slate-400 text-slate-300' :
                    'bg-amber-700/10 border-amber-600 text-amber-500'
                  }`}>
                    {user.rank}
                  </span>
                  <div className="w-7 h-7 rounded-full border border-emerald-900 overflow-hidden">
                    <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-gray-100 flex items-center gap-1">
                      {user.name}
                      {user.isSelf && <span className="bg-yellow-500 text-emerald-950 text-[7px] font-extrabold px-1.5 py-0.2 rounded-full">Self</span>}
                    </h5>
                    <p className="text-[8px] text-emerald-500 font-semibold">{user.halaqah} • Lv {user.level}</p>
                  </div>
                </div>

                <span className="text-[10px] font-black text-yellow-300">{user.xp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions log history */}
        <div className="islamic-card rounded-2xl p-4 flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-emerald-900 mb-3">
              <ScrollText className="w-4 h-4 text-[#e5c158]" />
              <h3 className="text-xs font-black text-gray-100 uppercase tracking-widest">Riwayat Perolehan Poin</h3>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1 no-scrollbar select-none">
              {history.map((log) => (
                <div 
                  key={log.id}
                  className="bg-[#02140f] border border-emerald-950 rounded-xl p-2.5 flex items-center justify-between text-[10px] font-bold"
                >
                  <div>
                    <div className="text-gray-200 leading-normal">{log.description}</div>
                    <div className="text-[8px] font-mono text-emerald-600 mt-1">{log.date}</div>
                  </div>

                  <span className={`text-xs font-black ${log.type === 'Tambah' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {log.type === 'Tambah' ? '+' : '-'} {log.points.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}

              {history.length === 0 && (
                <div className="text-center py-8 text-[10px] text-emerald-700 italic">Belum ada riwayat transaksi poin berkah.</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-emerald-900/60 pt-3 mt-4 text-[9px] text-emerald-500 font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#e5c158]" />
            <span>Audit Poin Berkah aman & terenkripsi di server.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
