import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { BIOBOT_HINTS, STAGES, GENOPEDIA_TERMS } from '../../data/geneticsData';
import { Bot, Sparkles, Lightbulb, ChevronRight, Send } from 'lucide-react';
import { sound } from '../../services/sound';

export const BioBotDrawer = () => {
  const { isBioBotOpen, setIsBioBotOpen, currentStageId } = useGame();
  const [selectedStageId, setSelectedStageId] = useState(currentStageId || 1);
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: `Halo! Aku BioBot, asisten AI belajarmu. Ada yang bisa kubantu mengenai materi genetika atau tantangan di game ini?\n\nSilakan ketik pertanyaanmu di bawah atau pilih salah satu tombol petunjuk cepat!` 
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Sync active stage when drawer opens
  useEffect(() => {
    if (isBioBotOpen && currentStageId) {
      setSelectedStageId(currentStageId);
      const stageName = STAGES.find(s => s.id === currentStageId)?.title || 'Genetika';
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `Selamat datang di **Stage ${currentStageId} - ${stageName}**! Silakan tanyakan kesulitanmu seputar topik ini, atau gunakan tombol bantuan di bawah.`
        }
      ]);
    }
  }, [isBioBotOpen, currentStageId]);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isBioBotOpen) return null;

  // Change stage topic context
  const handleStageChange = (newStageId) => {
    setSelectedStageId(newStageId);
    soundClick();
    const stageName = STAGES.find(s => s.id === newStageId)?.title || 'Genetika';
    const stageTopic = STAGES.find(s => s.id === newStageId)?.topic || '';
    
    setMessages(prev => [
      ...prev,
      {
        sender: 'bot',
        text: `Topik beralih ke **Stage ${newStageId} - ${stageName}** (${stageTopic}). Ada yang ingin kamu tanyakan mengenai tantangan di stage ini?`
      }
    ]);
  };

  const soundClick = () => {
    try { sound.playClick(); } catch(e){}
  };

  const soundMessage = (isBot) => {
    try {
      if (isBot) sound.playCorrect();
      else sound.playClick();
    } catch(e){}
  };

  // Automated Response Engine (Simulated Gemini AI Agent)
  const getBotResponse = (input, stageId) => {
    const cleanInput = input.toLowerCase().trim();
    
    // Greetings
    if (/^(halo|hai|hei|hello|pagi|siang|sore|malam)$/.test(cleanInput)) {
      return `Halo! Aku BioBot, asisten belajarmu. Ada yang bisa kubantu seputar materi genetika atau penyelesaian misi di **Stage ${stageId}**?`;
    }
    
    // Help / Tips / Hints
    if (cleanInput.includes('petunjuk') || cleanInput.includes('tips') || cleanInput.includes('bantuan') || cleanInput.includes('cara menyelesaikan') || cleanInput.includes('misi') || cleanInput.includes('bantu') || cleanInput.includes('bingung') || cleanInput.includes('bagaimana')) {
      const stageHints = BIOBOT_HINTS[stageId] || [];
      if (stageHints.length > 0) {
        return `Tentu! Berikut adalah petunjuk penting untuk menyelesaikan **Stage ${stageId} - ${STAGES.find(s => s.id === stageId)?.title || 'Tantangan'}**:\n\n` + 
          stageHints.map((h, i) => `🔹 **Petunjuk ${i + 1}**: ${h}`).join('\n');
      }
      return "Coba perhatikan baik-baik ciri tanaman yang diminta di papan misi, lalu cocokkan dengan tanaman yang ada di kebun!";
    }

    // Match terms from GENOPEDIA_TERMS
    for (const item of GENOPEDIA_TERMS) {
      const termLower = item.term.toLowerCase();
      if (cleanInput.includes(termLower) || (termLower.length > 3 && cleanInput.includes(termLower.substring(0, termLower.length - 1)))) {
        return `Tentu, berikut penjelasan tentang **${item.term}**:\n\n📖 **Definisi**: ${item.definition}\n\n💡 **Contoh**: ${item.example}`;
      }
    }
    
    // Keywords Fallback
    if (cleanInput.includes('fenotip')) {
      return "**Fenotipe** adalah sifat fisik atau karakteristik luar makhluk hidup yang dapat diamati langsung oleh indra (seperti bunga warna ungu atau biji keriput pada ercis). Apakah kamu ingin tahu tentang genotipe juga?";
    }
    if (cleanInput.includes('genotip')) {
      return "**Genotipe** adalah susunan genetik atau kode huruf tersembunyi yang menentukan sifat fisik makhluk hidup (seperti UU, Uu, uu). Sifat dominan ditulis dengan huruf KAPITAL, sedangkan resesif dengan huruf kecil.";
    }
    if (cleanInput.includes('alel')) {
      return "**Alel** adalah bentuk alternatif dari suatu gen yang mengendalikan sifat yang sama. Misalnya, gen warna bunga memiliki alel U (Ungu) dan alel u (Putih).";
    }
    if (cleanInput.includes('monohibrid')) {
      return "**Persilangan Monohibrid** adalah persilangan antara individu dengan satu sifat beda saja (contoh: persilangan bunga ungu x bunga putih). Rasio fenotipe F2 persilangan monohibrid dominan penuh adalah **3 : 1**.";
    }
    if (cleanInput.includes('dihibrid')) {
      return "**Persilangan Dihibrid** adalah persilangan dengan dua sifat beda sekaligus (contoh: biji bulat-kuning x biji keriput-hijau). Rasio fenotipe F2 dari persilangan dihibrid heterozigot sempurna (AaBb x AaBb) adalah **9 : 3 : 3 : 1**.";
    }
    if (cleanInput.includes('hukum mendel') || cleanInput.includes('hukum 1') || cleanInput.includes('hukum 2') || cleanInput.includes('segregasi') || cleanInput.includes('asortasi')) {
      return "**Hukum Mendel I (Segregasi Bebas)**: Pasangan alel berpisah secara bebas pada saat pembentukan gamet.\n\n**Hukum Mendel II (Asortasi Bebas)**: Alel-alel dari gen yang berbeda mengelompok secara bebas pada saat pembuahan.";
    }
    if (cleanInput.includes('letal') || cleanInput.includes('mati')) {
      return "**Gen Letal** adalah gen yang menyebabkan kematian pada individu yang memilikinya dalam keadaan homozigot (baik homozigot dominan maupun resesif), sehingga merubah perbandingan rasio persilangan.";
    }
    if (cleanInput.includes('intermediet')) {
      return "**Intermediet** adalah sifat campuran/gabungan dari kedua induk akibat tidak adanya sifat dominan penuh. Contoh: bunga merah (MM) x bunga putih (mm) menghasilkan anak berwarna merah muda (Mm).";
    }

    // Default Fallback
    const currentTopic = STAGES.find(s => s.id === stageId)?.topic || 'Hereditas Mendel';
    return `Mengenai topik **${currentTopic}**, apakah kamu ingin menanyakan hal spesifik seperti:\n\n1. Definisi istilah (misal: *'apa itu fenotipe'*, *'apa itu alel'*)\n2. Petunjuk kuis (misal: *'cara menyelesaikan stage'*, *'minta petunjuk'*)\n3. Contoh persilangan (misal: *'rasio monohibrid'*)\n\nSilakan ketik pertanyaan di bawah!`;
  };

  // Submit chat message
  const handleSendMessage = (textToSend) => {
    if (!textToSend.trim()) return;
    
    // Add user message
    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);
    soundMessage(false);
    
    // AI processing delay (looks like real computation)
    setTimeout(() => {
      const botResponse = getBotResponse(textToSend, selectedStageId);
      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
      setIsTyping(false);
      soundMessage(true);
    }, 800);
  };

  // Get stage-specific quick hints
  const getSuggestions = (stageId) => {
    switch(stageId) {
      case 1: return ['Apa itu fenotipe?', 'Bagaimana menyelesaikan Stage 1?', 'Perbedaan dominan & resesif'];
      case 2: return ['Apa itu genotipe?', 'Minta petunjuk Stage 2', 'Beda heterozigot & homozigot'];
      case 3: return ['Jelaskan Hukum Segregasi', 'Minta petunjuk Stage 3', 'Apa itu gamet?'];
      case 4: return ['Cara mengisi Punnett Square', 'Minta petunjuk Stage 4', 'Definisi monohibrid'];
      case 5: return ['Berapa rasio monohibrid?', 'Minta petunjuk Stage 5', 'Apa itu gen letal?'];
      case 6: return ['Definisi persilangan dihibrid', 'Minta petunjuk Stage 6', 'Jelaskan Hukum Asortasi'];
      default: return ['Jelaskan Hukum Mendel', 'Apa itu gen & alel?', 'Bagaimana cara bermain?'];
    }
  };

  const formatMessageText = (text) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split('**');
      const parsedLine = parts.map((part, index) => {
        if (index % 2 === 1) {
          return <strong key={index} className="font-extrabold text-indigo-700">{part}</strong>;
        }
        return part;
      });
      return <div key={i} className="min-h-[1.2em]">{parsedLine}</div>;
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-end">
      <div className="travorra-card w-full max-w-md h-full p-5 border-l border-slate-200 flex flex-col justify-between rounded-none rounded-l-[2rem] bg-white text-left shadow-2xl overflow-hidden">
        
        {/* Drawer Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display font-extrabold text-slate-900 text-base leading-tight">BioBot Assistant</h3>
              <p className="text-[10px] text-slate-500 font-medium">Asisten Belajar Genetika Interaktif</p>
            </div>
          </div>
          <button 
            onClick={() => { soundClick(); setIsBioBotOpen(false); }} 
            className="text-slate-400 hover:text-slate-955 p-1.5 rounded-full hover:bg-slate-100 text-lg font-bold transition focus:outline-none"
          >
            ✕
          </button>
        </div>

        {/* Topic Context Dropdown */}
        <div className="py-2.5 border-b border-slate-100 flex-shrink-0 space-y-1">
          <label className="text-[9px] font-black text-slate-400 tracking-wider uppercase block">Topik Pembahasan AI</label>
          <select 
            value={selectedStageId} 
            onChange={(e) => handleStageChange(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-700 bg-white shadow-3xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {STAGES.map(s => (
              <option key={s.id} value={s.id}>Stage {s.id}: {s.title} ({s.topic})</option>
            ))}
          </select>
        </div>

        {/* Interactive Chat Bubble Logs */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-hide px-0.5">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex items-start gap-2 max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse text-right' : 'mr-auto text-left'
              }`}
            >
              {msg.sender === 'bot' && (
                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div 
                className={`p-3 rounded-2xl text-[11px] font-medium leading-relaxed border shadow-3xs ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white border-indigo-700 rounded-tr-none'
                    : 'bg-slate-50 text-slate-800 border-slate-200/80 rounded-tl-none'
                }`}
              >
                {formatMessageText(msg.text)}
              </div>
            </div>
          ))}

          {/* Typing state */}
          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-[9px] font-black tracking-wide ml-8 animate-pulse">
              <Bot className="w-3.5 h-3.5 animate-spin" />
              <span>BioBot sedang mengetik...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions chips and Input Chat Form */}
        <div className="pt-3 border-t border-slate-100 flex-shrink-0 space-y-3 bg-white">
          
          {/* Quick Suggestions Chips */}
          <div className="flex flex-wrap gap-1.5">
            {getSuggestions(selectedStageId).map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(sug)}
                className="text-[9px] bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 text-slate-650 hover:text-indigo-800 px-2.5 py-1 rounded-full font-bold transition duration-200 cursor-pointer focus:outline-none shadow-3xs"
              >
                💡 {sug}
              </button>
            ))}
          </div>

          {/* Text Input Field */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(chatInput); }}
            className="flex items-center gap-2"
          >
            <input 
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Tanyakan konsep genetika..."
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-3xs"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="w-9 h-9 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center cursor-pointer transition shadow-3xs flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
