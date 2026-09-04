import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Wallet, Plus, Trash2, Search, 
  Calendar, User, FileText, X, AlertCircle, Coins
} from 'lucide-react';
import { Member, CashRecord } from '../types';

interface UangKasProps {
  currentUser: Member;
  cashRecords: CashRecord[];
  onCreateCashRecord: (amount: number, type: 'Masuk' | 'Keluar', description: string) => void;
  onDeleteCashRecord: (id: string) => void;
}

export default function UangKas({ 
  currentUser, 
  cashRecords, 
  onCreateCashRecord, 
  onDeleteCashRecord 
}: UangKasProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'Semua' | 'Masuk' | 'Keluar'>('Semua');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState<'Masuk' | 'Keluar'>('Masuk');
  const [formDescription, setFormDescription] = useState('');
  const [formError, setFormError] = useState('');

  const isAuthorized = currentUser.role === 'Admin' || currentUser.role === 'Pengurus';

  // Calculate totals
  const totalMasuk = cashRecords
    .filter(r => r.type === 'Masuk')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalKeluar = cashRecords
    .filter(r => r.type === 'Keluar')
    .reduce((sum, r) => sum + r.amount, 0);

  const currentBalance = totalMasuk - totalKeluar;

  // Filter records
  const filteredRecords = cashRecords.filter(r => {
    const matchesSearch = r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.recordedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'Semua' || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const amountNum = Number(formAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setFormError('Nominal transaksi harus berupa angka lebih besar dari nol.');
      return;
    }

    if (!formDescription.trim()) {
      setFormError('Keterangan transaksi wajib diisi.');
      return;
    }

    onCreateCashRecord(amountNum, formType, formDescription.trim());
    
    // Reset Form
    setFormAmount('');
    setFormType('Masuk');
    setFormDescription('');
    setShowAddModal(false);
  };

  return (
    <div id="uang-kas-container" className="flex flex-col gap-6 p-1 select-none font-sans">
      
      {/* Upper Cards Area: Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Balance (Saldo Kas) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#063324]/80 to-[#021c14]/90 border border-yellow-500/20 p-5 flex flex-col justify-between shadow-lg h-36">
          <div className="absolute top-0 right-0 w-28 h-28 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none -mr-4 -mt-4" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider">Saldo Kas Saat Ini</span>
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-[#e5c158]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-white tracking-tight">
              {formatCurrency(currentBalance)}
            </span>
            <p className="text-[9px] text-emerald-500 font-bold mt-1 uppercase tracking-widest">
              Laporan Realtime Kas UKM
            </p>
          </div>
        </div>

        {/* Card 2: Total Income */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/60 to-emerald-950/80 border border-emerald-500/10 p-5 flex flex-col justify-between shadow-lg h-36">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider">Total Kas Masuk</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-white tracking-tight">
              {formatCurrency(totalMasuk)}
            </span>
            <p className="text-[9px] text-emerald-500 font-bold mt-1 uppercase tracking-widest">
              Pemasukan & Iuran Anggota
            </p>
          </div>
        </div>

        {/* Card 3: Total Expenses */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-950/40 to-red-950/60 border border-red-500/10 p-5 flex flex-col justify-between shadow-lg h-36">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-red-300 font-extrabold uppercase tracking-wider">Total Kas Keluar</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-white tracking-tight">
              {formatCurrency(totalKeluar)}
            </span>
            <p className="text-[9px] text-red-400/80 font-bold mt-1 uppercase tracking-widest">
              Pembelanjaan & Kegiatan
            </p>
          </div>
        </div>

      </div>

      {/* Row: Search & Filters & Add Cash CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search bar */}
          <div className="relative w-72">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-emerald-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="search-kas"
              type="text"
              placeholder="Cari transaksi kas atau nama pencatat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#011a14] border border-yellow-500/10 focus:border-[#e5c158] focus:ring-1 focus:ring-[#e5c158] rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-100 placeholder-emerald-700 outline-none transition-all"
            />
          </div>

          {/* Type filters */}
          <div className="flex items-center gap-1.5 bg-[#011611] border border-yellow-500/10 rounded-xl p-1">
            <button
              onClick={() => setTypeFilter('Semua')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${typeFilter === 'Semua' ? 'bg-[#063324] text-[#e5c158] border border-yellow-500/20' : 'text-emerald-500 hover:text-[#e5c158]'}`}
            >
              Semua
            </button>
            <button
              onClick={() => setTypeFilter('Masuk')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${typeFilter === 'Masuk' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/20' : 'text-emerald-500 hover:text-emerald-300'}`}
            >
              Kas Masuk
            </button>
            <button
              onClick={() => setTypeFilter('Keluar')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${typeFilter === 'Keluar' ? 'bg-red-950/60 text-red-300 border border-red-500/20' : 'text-emerald-500 hover:text-red-300'}`}
            >
              Kas Keluar
            </button>
          </div>

        </div>

        {/* CTA: Record Button (Only visible to Admin/Pengurus) */}
        {isAuthorized ? (
          <button
            id="btn-tambah-kas"
            onClick={() => {
              setFormError('');
              setShowAddModal(true);
            }}
            className="bg-gradient-to-r from-[#e5c158] to-[#ab8922] hover:from-[#fdde7c] text-emerald-950 font-black text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow hover:shadow-yellow-500/10 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            Catat Kas Baru
          </button>
        ) : (
          <div className="bg-[#011a14] border border-yellow-500/5 rounded-xl px-4 py-2 text-[10px] text-emerald-500 font-bold flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-[#e5c158]" />
            Akses Terbatas: Anggota hanya bisa melihat laporan kas (Read-Only)
          </div>
        )}
      </div>

      {/* Transaction History Table */}
      <div className="islamic-card rounded-2xl overflow-hidden border border-yellow-500/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-emerald-900">
            <thead className="bg-[#021811] text-emerald-400 font-extrabold uppercase tracking-wider text-[9px] pointer-events-none">
              <tr>
                <th className="px-5 py-4">Tanggal</th>
                <th className="px-5 py-4">Keterangan</th>
                <th className="px-5 py-4">Tipe Kas</th>
                <th className="px-5 py-4">Jumlah Nominal</th>
                <th className="px-5 py-4">Pencatat</th>
                {isAuthorized && <th className="px-5 py-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/80 bg-transparent text-gray-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={isAuthorized ? 6 : 5} className="px-5 py-8 text-center text-emerald-700 font-medium">
                    Tidak ada riwayat transaksi kas ditemukan.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-emerald-950/20 transition-all">
                    
                    {/* Date */}
                    <td className="px-5 py-4 whitespace-nowrap text-gray-300 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                        {record.date}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="px-5 py-4">
                      <div className="font-extrabold text-gray-100 max-w-xs md:max-w-md truncate">
                        {record.description}
                      </div>
                    </td>

                    {/* Type badge */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                        record.type === 'Masuk' 
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/20' 
                          : 'bg-red-950/80 text-red-300 border border-red-500/20'
                      }`}>
                        {record.type === 'Masuk' ? 'Masuk' : 'Keluar'}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4 whitespace-nowrap font-black">
                      <span className={record.type === 'Masuk' ? 'text-emerald-400' : 'text-red-400'}>
                        {record.type === 'Masuk' ? '+' : '-'} {formatCurrency(record.amount)}
                      </span>
                    </td>

                    {/* Recorded By */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
                        <User className="w-3.5 h-3.5 text-[#e5c158]" />
                        {record.recordedBy}
                      </span>
                    </td>

                    {/* Actions (Only visible to Admin/Pengurus) */}
                    {isAuthorized && (
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => {
                            if (window.confirm(`Apakah Anda yakin ingin menghapus catatan kas "${record.description}" sebesar ${formatCurrency(record.amount)}?`)) {
                              onDeleteCashRecord(record.id);
                            }
                          }}
                          className="p-1 px-2.5 rounded-lg border border-red-500/25 hover:border-red-500/40 text-red-400 bg-red-950/40 text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition-all inline-flex cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Hapus
                        </button>
                      </td>
                    )}

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL: ADD CASH RECORD */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#020d0ad0] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#032117] rounded-2xl border border-yellow-500/25 p-6 w-full max-w-md shadow-2xl relative select-none">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-emerald-500 hover:text-yellow-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 pb-3 border-b border-emerald-900 mb-4">
              <Coins className="w-5 h-5 text-[#e5c158]" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Catat Aliran Kas Baru</h3>
            </div>

            {formError && (
              <div className="bg-red-950/80 border border-red-900/50 rounded-xl p-3 mb-4 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Type Input */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Tipe Transaksi</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormType('Masuk')}
                    className={`py-2 px-4 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                      formType === 'Masuk' 
                        ? 'bg-emerald-900/50 text-emerald-300 border-emerald-500/30' 
                        : 'bg-[#011a14] text-emerald-600 border-yellow-500/5 hover:text-emerald-400'
                    }`}
                  >
                    KAS MASUK (Debit)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('Keluar')}
                    className={`py-2 px-4 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                      formType === 'Keluar' 
                        ? 'bg-red-950/50 text-red-300 border-red-500/30' 
                        : 'bg-[#011a14] text-emerald-600 border-yellow-500/5 hover:text-red-400'
                    }`}
                  >
                    KAS KELUAR (Kredit)
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Nominal Transaksi (Rupiah)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-black text-emerald-600">
                    Rp
                  </span>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 50000"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full bg-[#011a14] border border-yellow-500/10 focus:border-[#e5c158] rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-200 outline-none font-bold"
                  />
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Keterangan / Deskripsi</label>
                <textarea
                  required
                  placeholder="Contoh: Pembayaran iuran bulanan kas anggota a.n. Zuhair"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#011a14] border border-yellow-500/10 focus:border-[#e5c158] rounded-xl px-3.5 py-2.5 text-xs text-gray-200 outline-none resize-none"
                />
              </div>

              {/* Recorded By info display */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Petugas Pencatat</label>
                <div className="w-full bg-[#01140f] border border-yellow-500/5 rounded-xl px-3.5 py-2.5 text-xs text-emerald-500 font-bold flex items-center gap-2">
                  <User className="w-4 h-4 text-[#e5c158]" />
                  <span>{currentUser.name} ({currentUser.role})</span>
                </div>
              </div>

              {/* Action Handles */}
              <div className="flex items-center gap-2 pt-4 justify-end border-t border-emerald-900/60 mt-4">
                <button
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="bg-emerald-950 hover:bg-emerald-900 border border-yellow-500/5 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#e5c158] to-[#ab8922] hover:from-[#fecc60] text-emerald-950 font-black px-4 py-2.5 rounded-xl text-xs cursor-pointer shadow shadow-yellow-500/10"
                >
                  Simpan Transaksi
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
