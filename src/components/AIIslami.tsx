import { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Sparkles, MessageSquare, BookOpen, AlertCircle, 
  HelpCircle, ShieldAlert, CheckCircle, RefreshCw 
} from 'lucide-react';
import { ChatMessage } from '../types';

export default function AIIslami() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: 'Assalamu\'alaikum wr. wb. Saya adalah asisten AI Islami asatidz UKM Ikraamul Qur\'an. Silakan tanyakan hal-hal menarik seputar Tafsir Al-Qur\'an, tata cara makhraj & tajwid cara membaca kamil, kajian fiqh peradaban, atau motivasi ibadah menghafal Al-Qur\'an. Insya Allah saya akan membantu menguraikan secara santun.',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'Tafsir' | 'Fiqh' | 'Tajwid' | 'Umum'>('Tafsir');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMsg;
    if (!textToSend.trim()) return;

    const userMessage: ChatMessage = {
      id: "U_" + Date.now(),
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMsg('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai-islami', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          option: selectedOption
        })
      });

      const data = await response.json();
      if (response.ok && data.content) {
        setMessages(prev => [...prev, {
          id: "A_" + Date.now(),
          sender: 'assistant',
          content: data.content,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        throw new Error();
      }
    } catch {
      setMessages(prev => [...prev, {
        id: "A_ERR_" + Date.now(),
        sender: 'assistant',
        content: 'Afwan ghonimah, asisten AI sedang menelaah kitab rujukan dan mengalami sedikit kendala koneksi. Kami rukunkan kembali jembatan data, silakan klik tombol Kirim ulang pertanyaan mulia Anda.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    { title: "Murojaah Istiqomah", text: "Bagaimana cara agar istiqomah menjaga hafalan Al-Qur'an dan konsisten melakukan murojaah?", option: "Tafsir" },
    { title: "Tajwid Nun Mati", text: "Apa perbedaan cara membaca hukum Idgham Bighunnah dan Bilaghunnah disertakan contoh surat?", option: "Tajwid" },
    { title: "Zakat Digital Finansial", text: "Bagaimana hukum syariat mengenai penyaluran zakat produktif secara digital melalui platform crowdfunding?", option: "Fiqh" },
    { title: "Tafsir Al-Alaq Ayat 1-5", text: "Tolong uraikan tafsir kontekstual wahyu pertama Surat Al-'Alaq ayat 1-5 berkaitan dengan literasi umat.", option: "Tafsir" }
  ];

  return (
    <div id="ai-islami-helper" className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-1 h-full font-sans select-none">
      
      {/* Selector Options Box: Left - Col 4 */}
      <div className="lg:col-span-4 islamic-card rounded-2xl p-4 flex flex-col gap-4 h-[calc(100vh-140px)] overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-2 pb-2.5 border-b border-emerald-900 pointer-events-none">
          <Sparkles className="w-5 h-5 text-[#e5c158]" />
          <div>
            <h3 className="text-sm font-black text-gray-100 uppercase tracking-widest">Asisten AI Islami</h3>
            <p className="text-[10px] text-emerald-400 font-semibold">TANYA QUR'AN & KONSULTASI ADAB</p>
          </div>
        </div>

        {/* Option Chips Selector */}
        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#e5c158] mb-2.5">Opsi Bidang Syariah</label>
          <div className="flex flex-col gap-2">
            {[
              { id: 'Tafsir', title: 'Tafsir & Motivasi Qur\'ani', desc: 'Bedah makna ayat dan motivasi murojaah.' },
              { id: 'Tajwid', title: 'Makharijul Huruf & Tajwid', desc: 'Latihan pengucapan gunnah, mad, dsb.' },
              { id: 'Fiqh', title: 'Fiqh Kontemporer & Muamalah', desc: 'Hukum islam era kemajuan teknologi digital.' },
              { id: 'Umum', title: 'Adab Akhlak Kader UKM', desc: 'Konsultasi kepribadian dan kepemimpinan.' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedOption(opt.id as any)}
                className={`
                  w-full text-left p-3 rounded-xl border transition-all text-xs cursor-pointer flex flex-col gap-0.5
                  ${selectedOption === opt.id 
                    ? 'bg-[#063b2a] border-[#e5c150]/30 shadow' 
                    : 'bg-[#011a14]/60 border-emerald-950 hover:bg-[#02281d]'
                  }
                `}
              >
                <div className="font-extrabold text-gray-100 flex items-center gap-1.5">
                  <span>{opt.title}</span>
                  {selectedOption === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />}
                </div>
                <div className="text-[9px] text-[#e5c150]/70 font-semibold leading-relaxed truncate">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="w-full h-[1px] bg-emerald-950 my-1" />

        {/* Suggested Quick Questions */}
        <div>
          <span className="block text-[10px] uppercase font-bold tracking-wider text-emerald-400 mb-2">Saran Pertanyaan Tematik</span>
          <div className="flex flex-col gap-2">
            {suggestedQuestions.map((q, qIndex) => (
              <button
                key={qIndex}
                onClick={() => {
                  setSelectedOption(q.option as any);
                  handleSend(q.text);
                }}
                className="w-full text-left p-2.5 bg-[#01140f] border border-emerald-950 hover:border-yellow-500/10 rounded-xl hover:bg-[#021f17] transition-all text-[10px] font-bold text-gray-300 leading-relaxed cursor-pointer"
              >
                🤔 {q.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messaging chat panel: Right - Col 8 */}
      <div className="lg:col-span-8 islamic-card rounded-2xl flex flex-col justify-between h-[calc(100vh-140px)] overflow-hidden">
        
        {/* Chat top header */}
        <div className="bg-[#021811] px-5 py-4 border-b border-emerald-900 shrink-0 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-yellow-500/25 flex items-center justify-center text-[#e5c158]">
            <Bot className="w-4 h-4 text-yellow-300 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-black text-gray-100 uppercase tracking-widest">Ruang Studi Tanya-Jawab</h4>
            <p className="text-[9px] text-emerald-500 font-bold">KATEGORI: {selectedOption.toUpperCase()}</p>
          </div>
        </div>

        {/* Chat Box Streams */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 no-scrollbar bg-gradient-to-b from-transparent to-[#01110c]/40">
          
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex items-start gap-3.5 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse text-right' : 'text-left'}`}
            >
              <div className={`
                w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs border
                ${msg.sender === 'user' ? 'bg-[#e5c158] text-[#02130e] border-[#ab8922]' : 'bg-emerald-900 border-emerald-800 text-[#e5c158]'}
              `}>
                {msg.sender === 'user' ? '👤' : '🕌'}
              </div>

              <div className={`
                p-4 rounded-2xl shadow border text-xs leading-relaxed
                ${msg.sender === 'user' 
                  ? 'bg-gradient-to-br from-[#063324] to-[#04281c] border-emerald-900 text-gray-100 rounded-tr-none text-left' 
                  : 'bg-gradient-to-br from-[#021811] to-[#01140f] border-yellow-500/10 text-slate-200 rounded-tl-none select-text'
                }
              `}>
                {msg.content.split("\n").map((para, idx) => (
                  <p key={idx} className={idx > 0 ? "mt-2" : ""}>{para}</p>
                ))}
                
                <span className={`text-[8px] font-mono text-emerald-500 block mt-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3 max-w-[80%]">
              <div className="w-7 h-7 rounded-full bg-emerald-900 border border-emerald-800 flex items-center justify-center text-xs text-[#e5c158]">
                🕌
              </div>
              <div className="bg-[#021811] border border-yellow-500/10 p-4 rounded-2xl rounded-tl-none text-xs text-emerald-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#e5c158]" />
                <span className="font-semibold">Menelaah maraji' tafsir kamil & ijtihad fikih dari server...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Send prompt bar footer */}
        <div className="p-4 bg-[#021a14] border-t border-emerald-900 shrink-0">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Tanyakan persoalan adab, tajwid makhraj, atau fiqh kontemporer...`}
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              disabled={loading}
              className="flex-1 bg-[#01110c] border border-yellow-500/10 focus:border-[#e5c158] rounded-xl px-4 py-3 text-xs text-gray-100 placeholder-emerald-800 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={loading || !inputMsg.trim()}
              className="bg-gradient-to-r from-[#e5c158] to-[#ab8922] hover:from-[#fecc60] text-emerald-950 p-3 rounded-xl shadow cursor-pointer transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4 shrink-0" />
            </button>
          </form>
          <p className="text-center text-[8px] text-emerald-700 mt-2.5">
            Asisten asatidz AI bertenaga model Gemini 3.5. Diselaraskan khusus demi mencerminkan rukun adab & rujukan ahlu sunnah wal jama'ah.
          </p>
        </div>

      </div>

    </div>
  );
}
