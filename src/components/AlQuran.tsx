import { useState } from "react";
import { BookOpen, Play, Pause, Sparkles, BookMarked, Search, MessageSquare, Heart, RefreshCw } from "lucide-react";

interface Verse {
  number: number;
  arabic: string;
  transliteration: string;
  translation: string;
}

interface Surah {
  number: number;
  name: string;
  englishName: string;
  versesCount: number;
  revelationType: 'Makkah' | 'Madinah';
  verses: Verse[];
}

const SURAH_DATA: Surah[] = [
  {
    number: 1,
    name: "Al-Fatihah",
    englishName: "Pembukaan",
    versesCount: 7,
    revelationType: "Makkah",
    verses: [
      {
        number: 1,
        arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
        transliteration: "Bismillaahir-Rahmaanir-Rahiim",
        translation: "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang."
      },
      {
        number: 2,
        arabic: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ",
        transliteration: "Al-hamdu lillaahi Rabbil-'aalamiin",
        translation: "Segala puji bagi Allah, Tuhan seluruh alam."
      },
      {
        number: 3,
        arabic: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
        transliteration: "Ar-Rahmaanir-Rahiim",
        translation: "Yang Maha Pengasih, Maha Penyayang."
      },
      {
        number: 4,
        arabic: "مَٰلِكِ يَوْمِ ٱلدِّينِ",
        transliteration: "Maaliki Yawmid-Diin",
        translation: "Pemilik hari pembalasan."
      },
      {
        number: 5,
        arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        transliteration: "Iyyaaka na'budu wa iyyaaka nasta'iin",
        translation: "Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami memohon pertolongan."
      },
      {
        number: 6,
        arabic: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
        transliteration: "Ihdinas-Siraatal-Mustaqiim",
        translation: "Bimbinglah kami ke jalan yang lurus,"
      },
      {
        number: 7,
        arabic: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
        transliteration: "Siraatalladziina an'amta 'alayhim ghayril-maghduobi 'alayhim wa lad-daalliin",
        translation: "(yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya; bukan (jalan) mereka yang dimurkai, dan bukan (pula jalan) mereka yang sesat."
      }
    ]
  },
  {
    number: 78,
    name: "An-Naba'",
    englishName: "Berita Besar",
    versesCount: 5,
    revelationType: "Makkah",
    verses: [
      {
        number: 1,
        arabic: "عَمَّ يَتَسَآءَلُونَ",
        transliteration: "'Amma yatasaaa'aluun",
        translation: "Tentang apakah mereka saling bertanya-tanya?"
      },
      {
        number: 2,
        arabic: "عَنِ ٱلنَّبَإِ ٱلْعَظِيمِ",
        transliteration: "'Anin-naba'il-'adhiim",
        translation: "Tentang berita yang besar (hari kebangkitan),"
      },
      {
        number: 3,
        arabic: "ٱلَّذِى هُمْ فِيهِ مُخْتَلِفُونَ",
        transliteration: "Alladzii hum fiihi mukhtalifuun",
        translation: "yang dalam hal itu mereka berselisih."
      },
      {
        number: 4,
        arabic: "كَلَّا سَيَعْلَمُونَ",
        transliteration: "Kallaa saya'lamuun",
        translation: "Sekali-kali tidak! Kelak mereka akan mengetahui,"
      },
      {
        number: 5,
        arabic: "ثُمَّ كَلَّا سَيَعْلَمُونَ",
        transliteration: "Tsumma kallaa saya'lamuun",
        translation: "kemudian sekali-kali tidak! Kelak mereka akan mengetahui."
      }
    ]
  },
  {
    number: 96,
    name: "Al-'Alaq",
    englishName: "Segumpal Darah",
    versesCount: 5,
    revelationType: "Makkah",
    verses: [
      {
        number: 1,
        arabic: "ٱقْرَأْ بِٱسْمِ رَبِّكَ ٱلَّذِى خَلَقَ",
        transliteration: "Iqra' bismi Rabbikalladzii khalaq",
        translation: "Bacalah dengan (menyebut) nama Tuhanmu yang menciptakan!"
      },
      {
        number: 2,
        arabic: "خَلَقَ ٱلْإِنسَٰنَ مِنْ عَلَقٍ",
        transliteration: "Khalaqal-insaana min 'alaq",
        translation: "Dia telah menciptakan manusia dari segumpal darah."
      },
      {
        number: 3,
        arabic: "ٱقْرَأْ وَرَبُّكَ ٱلْأَكْرَمُ",
        transliteration: "Iqra' wa Rabbukal-akram",
        translation: "Bacalah, dan Tuhanmulah Yang Mahamulia,"
      },
      {
        number: 4,
        arabic: "ٱلَّذِى عَلَّمَ بِٱلْقَلَمِ",
        transliteration: "Alladzii 'allama bil-qalam",
        translation: "Yang mengajar (manusia) dengan pena."
      },
      {
        number: 5,
        arabic: "عَلَّمَ ٱلْإِنسَٰنَ مَا لَمْ يَعْلَمْ",
        transliteration: "Allamal-insaana maa lam ya'lam",
        translation: "Dia mengajarkan kepada manusia apa yang tidak diketahuinya."
      }
    ]
  }
];

export default function AlQuran() {
  const [selectedSurah, setSelectedSurah] = useState<Surah>(SURAH_DATA[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [playingVerse, setPlayingVerse] = useState<number | null>(null);
  const [aiTafsir, setAiTafsir] = useState<string>("");
  const [loadingTafsir, setLoadingTafsir] = useState<boolean>(false);
  const [tafsirTitle, setTafsirTitle] = useState("");

  const handlePlayAudio = (vNum: number) => {
    if (playingVerse === vNum) {
      setPlayingVerse(null);
    } else {
      setPlayingVerse(vNum);
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(320 + (vNum * 40), audioCtx.currentTime); // simulated Qur'an cantor sound frequency
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 2.0);

      setTimeout(() => {
        setPlayingVerse(null);
      }, 2000);
    }
  };

  const handleAskTafsir = async (verse: Verse) => {
    setLoadingTafsir(true);
    setTafsirTitle(`Tafsir Tematik Ayat ${verse.number} - QS ${selectedSurah.name}`);
    setAiTafsir("");

    const promptText = `Tolong jelaskan secara mendalam tafsir tematik dan kontekstual, keutamaan, serta pelajaran kehidupan sehari-hari (ibrah) untuk ayat berikut:
    QS. ${selectedSurah.name} (${selectedSurah.englishName}) Ayat ${verse.number}
    Lafaz: "${verse.arabic}"
    Makna: "${verse.translation}"
    Jelaskan dengan bahasa yang mencerahkan bagi mahasiswa UKM Ikraamul Qur'an.`;

    try {
      const res = await fetch("/api/ai-islami", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: promptText }],
          option: "Tafsir Al-Qur'an"
        })
      });
      const data = await res.json();
      setAiTafsir(data.content);
    } catch {
      setAiTafsir("Gagal memanggil asisten AI. Menampilkan ulasan offline: Ayat ini mengingatkan kita akan keagungan Allah SWT serta kewajiban manusia untuk merenungi tanda-tanda kebesaran-Nya secara mendalam demi memperkokoh ukhuwah.");
    } finally {
      setLoadingTafsir(false);
    }
  };

  const filteredSurahs = SURAH_DATA.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.englishName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="alquran-explorer" className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-1 h-full select-none">
      
      {/* Left List Pane: Surah Switcher - 4 Cols */}
      <div className="lg:col-span-4 islamic-card rounded-2xl p-4 flex flex-col gap-4 h-[calc(100vh-140px)] overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-2 pb-2 border-b border-emerald-900">
          <BookOpen className="w-5 h-5 text-[#e5c158]" />
          <div>
            <h3 className="text-sm font-black text-gray-100 uppercase tracking-wider">Mushaf Al-Qur'an</h3>
            <p className="text-[10px] text-emerald-400">UKM IKRAAMUL QUR'AN DIGITAL READING</p>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-emerald-500">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text" 
            placeholder="Cari nama surah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#011a13] border border-yellow-500/10 focus:border-[#e5c158] focus:ring-1 focus:ring-[#e5c158] rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-100 placeholder-emerald-700 outline-none transition-all"
          />
        </div>

        {/* Surahs buttons list */}
        <div className="flex flex-col gap-2 overflow-y-auto pr-1">
          {filteredSurahs.map((surah) => {
            const isSelected = selectedSurah.number === surah.number;
            return (
              <button
                key={surah.number}
                onClick={() => {
                  setSelectedSurah(surah);
                  setAiTafsir("");
                }}
                className={`
                  w-full p-3.5 rounded-xl text-left transition-all border cursor-pointer flex items-center justify-between group
                  ${isSelected
                    ? 'bg-[#063b2a] border-yellow-500/30 shadow'
                    : 'bg-[#011812]/50 border-emerald-950 hover:border-yellow-500/10 hover:bg-[#022118]'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center border transition-all
                    ${isSelected ? 'bg-yellow-500 text-[#02130e] border-[#e5c158]' : 'bg-[#011d16] text-[#e5c158] border-emerald-900 group-hover:bg-[#e5c150] group-hover:text-emerald-950'}
                  `}>
                    {surah.number}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-100 group-hover:text-yellow-100">{surah.name}</h4>
                    <p className="text-[10px] text-emerald-500 font-semibold">{surah.englishName} • {surah.versesCount} Ayat</p>
                  </div>
                </div>
                
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  surah.revelationType === 'Makkah' ? 'bg-[#3b2306] text-[#e5bc58]' : 'bg-emerald-950 text-emerald-300'
                }`}>
                  {surah.revelationType}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right List Pane: Verses details - 8 Cols */}
      <div className="lg:col-span-8 flex flex-col gap-4 h-[calc(100vh-140px)] overflow-y-auto no-scrollbar">
        
        {/* Active Surah banner */}
        <div className="islamic-card rounded-2xl p-5 flex items-center justify-between relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <span className="text-[9px] text-[#e5c158] font-bold uppercase tracking-widest bg-emerald-900/60 px-2 py-0.5 rounded">
              Surah {selectedSurah.number}
            </span>
            <h2 className="text-xl font-extrabold text-white mt-1.5">{selectedSurah.name}</h2>
            <p className="text-xs text-emerald-400 font-semibold mt-0.5">
              "{selectedSurah.englishName}" • diturunkan di {selectedSurah.revelationType} • {selectedSurah.versesCount} Ayah
            </p>
          </div>

          <div className="text-right">
            <span className="font-arabic text-yellow-300/40 text-4xl block pointer-events-none select-none">
              ﷽
            </span>
          </div>
        </div>

        {/* Verses Loop list */}
        <div className="flex flex-col gap-4 overflow-y-auto pb-4">
          
          {selectedSurah.verses.map((verse) => (
            <div 
              key={verse.number} 
              className="islamic-card rounded-2xl p-5 hover:border-yellow-500/10 transition-all flex flex-col gap-4 relative group"
            >
              <div className="flex items-center justify-between">
                {/* Verse badge */}
                <span className="text-[10px] font-bold bg-[#011a14] border border-yellow-500/10 text-[#e5c158] w-7 h-7 flex items-center justify-center rounded-lg shadow uppercase">
                  {verse.number}
                </span>

                {/* Recite Audio and Ask Tafsir buttons */}
                <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => handlePlayAudio(verse.number)}
                    className={`
                      p-1.5 rounded-lg text-xs cursor-pointer flex items-center gap-1.5 transition-all
                      ${playingVerse === verse.number 
                        ? 'bg-[#e5c158] text-[#02130e] font-bold border border-[#e5c158]' 
                        : 'bg-emerald-950 hover:bg-[#063124] text-[#e5c158] border border-yellow-500/10'
                      }
                    `}
                  >
                    {playingVerse === verse.number ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span className="text-[9px] uppercase font-bold tracking-widest animate-pulse">Playing</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span className="text-[9px] uppercase font-bold tracking-widest">Recite</span>
                      </>
                    )}
                  </button>

                  <button 
                    onClick={() => handleAskTafsir(verse)}
                    className="p-1.5 rounded-lg bg-[#053224] hover:bg-[#ebcc70] text-[#e5c158] hover:text-emerald-950 border border-yellow-500/10 transition-all cursor-pointer flex items-center gap-1.5 font-bold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-[9px] uppercase font-bold tracking-widest">Tafsir AI</span>
                  </button>
                </div>
              </div>

              {/* Arabic typography */}
              <p className="font-arabic text-[#e5c15e] text-2xl font-bold leading-normal text-right tracking-wide pt-2 select-text">
                {verse.arabic}
              </p>

              {/* Transliteration & Indonesian Translations */}
              <div className="space-y-1 select-text">
                <p className="text-[11px] text-emerald-400 italic leading-relaxed">
                  {verse.transliteration}
                </p>
                <p className="text-gray-300 text-xs font-medium leading-relaxed">
                  "{verse.translation}"
                </p>
              </div>
            </div>
          ))}

        </div>

        {/* AI Tafsir drawer widget under query */}
        {aiTafsir && (
          <div className="islamic-card border border-yellow-500/20 rounded-2xl p-5 bg-[#011c14] relative shrink-0">
            <button 
              onClick={() => setAiTafsir("")}
              className="absolute top-4 right-4 text-emerald-500 hover:text-yellow-400 text-xs font-bold cursor-pointer transition-colors"
            >
              [Tutup tafsir]
            </button>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <h4 className="text-xs font-black text-yellow-100 uppercase tracking-widest">{tafsirTitle}</h4>
            </div>
            
            {loadingTafsir ? (
              <div className="flex items-center gap-2 text-xs py-4 text-emerald-400 font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#e5c158]" />
                <span>Asisten AI Islami sedang merangkum kajian Tafsir dari kitab-kitab muktabar...</span>
              </div>
            ) : (
              <div className="text-xs text-slate-300 leading-relaxed font-sans space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {aiTafsir.split("\n").map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
                ))}
              </div>
            )}
            <div className="text-[9px] text-[#e5c158] font-bold tracking-wider mt-3 text-right">
              — Ditafsirkan instan via Google Gemini 3.5
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
