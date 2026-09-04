export type UserRole = 'Admin' | 'Pengurus' | 'Anggota';

export interface Member {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branch: string; // Pengurus Wilayah, etc
  prodi?: string; // Program Studi
  avatar: string;
  totalPoints: number;
  xp: number;
  level: number;
  levelName: string;
  groupMemorization: string; // Kelompok Halaqah
  targetMemorization: number; // Target ayat (e.g. 100)
  completedMemorization: number; // Ayat tercapai (e.g. 87)
  phone: string;
  joinedDate: string;
}

export interface Study {
  id: string;
  title: string;
  speaker: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g., "08.00 - 10.00 WIB"
  location: string;
  description: string;
  type: 'Tahsin' | 'Kajian' | 'Pelatihan' | 'Lomba' | 'Rapat';
  lat: number;
  lng: number;
  quota: number;
  registeredCount: number;
  isOngoing?: boolean;
  imageUrl?: string; // Optional photo (base64 or URL) for the study post
}

export interface AttendanceRecord {
  id: string;
  studyId: string;
  studyTitle: string;
  memberId: string;
  memberName: string;
  date: string;
  time: string;
  status: 'Hadir' | 'Izin' | 'Alpa' | 'Sakit';
  method: 'QR' | 'GPS' | 'Manual';
  lat?: number;
  lng?: number;
  distance?: number; // Jarak dari lokasi target dalam meter
}

export interface MemorizationRecord {
  id: string;
  memberId: string;
  memberName: string;
  surahName: string;
  ayatRange: string;
  ayatCount: number;
  juz: number;
  date: string;
  reviewer: string;
  status: 'Disetujui' | 'Revisi';
}

export interface PointHistory {
  id: string;
  memberId: string;
  memberName: string;
  points: number;
  description: string;
  date: string;
  type: 'Tambah' | 'Kurang';
}

export interface RewardItem {
  id: string;
  title: string;
  cost: number;
  description: string;
  stock: number;
  icon: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CashRecord {
  id: string;
  amount: number;
  type: 'Masuk' | 'Keluar';
  description: string;
  date: string;
  recordedBy: string;
}
