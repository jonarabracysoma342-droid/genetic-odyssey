/**
 * Gemini AI Service for BioBot Companion
 * 
 * Menghubungkan BioBot ke Google Gemini API untuk menjawab pertanyaan
 * siswa tentang genetika Mendel secara cerdas dan kontekstual.
 * 
 * Setup:
 *   1. Dapatkan API Key dari https://aistudio.google.com/apikey
 *   2. Buat file .env di root project:
 *      VITE_GEMINI_API_KEY=your_api_key_here
 *   3. Restart dev server (npm run dev)
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `Kamu adalah "BioBot", asisten AI cerdas di dalam game edukasi "Genetic Odyssey" untuk siswa SMA/SMP kelas 9 dan 12 yang sedang mempelajari Hukum Pewarisan Sifat Mendel.

ATURAN KETAT:
1. Jawab HANYA pertanyaan seputar BIOLOGI GENETIKA (Hukum Mendel I & II, genotipe, fenotipe, alel, gamet, persilangan monohibrid & dihibrid, Punnett Square, mutasi genetik, rasio fenotipe/genotipe).
2. Jika pertanyaan di LUAR topik genetika/biologi, tolak dengan sopan: "Maaf, aku hanya bisa membantu soal genetika Mendel ya! 🧬"
3. Jawab dalam Bahasa Indonesia yang mudah dipahami siswa SMA.
4. Gunakan emoji secukupnya untuk membuat jawaban menarik.
5. Jawab SINGKAT dan JELAS (maksimal 3-4 paragraf pendek).
6. Jika ada rumus atau rasio, tulis dengan jelas (contoh: "Rasio fenotipe 3:1").
7. Jangan pernah menyebut bahwa kamu adalah Gemini, ChatGPT, atau AI lain. Kamu adalah BioBot.
8. Berikan contoh konkret menggunakan tanaman ercis (Pisum sativum) Mendel jika relevan.
9. Hindari konten SARA, politik, kekerasan, atau tidak pantas.

KONTEKS GAME:
- Stage 1: Pengenalan fenotipe (C1 - Mengingat)
- Stage 2: Genotipe & alel dominan/resesif (C2 - Memahami)
- Stage 3: Pembentukan gamet & Hukum Segregasi (C3 - Menerapkan)
- Stage 4: Punnett Square monohibrid (C4 - Menganalisis)
- Stage 5: Rasio fenotipe 3:1 (C5 - Mengevaluasi)
- Stage 6: Persilangan dihibrid & Hukum Asortasi, rasio 9:3:3:1 (C6 - Mencipta)
- Stage 7: Miskonsepsi & penyimpangan semu (C5 - Mengevaluasi)
- Stage 8: Boss Battle evaluasi komprehensif (C6)

Siswa sedang bermain game ini dan mungkin bertanya tentang mekanisme game atau konsep genetika.`;

const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro'
];

/**
 * Mengambil API Key dari localStorage (jika diatur di dalam aplikasi)
 * atau dari environment variable VITE_GEMINI_API_KEY
 */
export function getGeminiApiKey() {
  if (typeof window !== 'undefined') {
    const localKey = localStorage.getItem('VITE_GEMINI_API_KEY');
    if (localKey && localKey.trim()) {
      return localKey.trim().replace(/^["']|["']$/g, '');
    }
  }
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === 'string') {
    return envKey.trim().replace(/^["']|["']$/g, '');
  }
  return '';
}

/**
 * Menyimpan API Key ke localStorage agar pengguna bisa mengatur langsung di aplikasi
 */
export function setGeminiApiKey(key) {
  if (typeof window !== 'undefined') {
    if (key && key.trim()) {
      const cleanKey = key.trim().replace(/^["']|["']$/g, '');
      localStorage.setItem('VITE_GEMINI_API_KEY', cleanKey);
    } else {
      localStorage.removeItem('VITE_GEMINI_API_KEY');
    }
  }
}

/**
 * Kirim pertanyaan ke Gemini AI dan dapatkan jawaban
 * @param {string} userMessage - Pertanyaan dari siswa
 * @param {number} stageId - Stage ID yang sedang aktif (1-8)
 * @param {Array} chatHistory - Riwayat chat sebelumnya [{sender, text}]
 * @returns {Promise<string|null>} - Jawaban dari Gemini atau null jika perlu fallback offline
 */
export async function askGemini(userMessage, stageId = 1, chatHistory = []) {
  const apiKey = getGeminiApiKey();
  
  if (!apiKey) {
    return null; // Triggers automatic local database response
  }

  // Build conversation history for context
  const contents = [
    // Include system context in first user/model turn for universal compatibility
    {
      role: 'user',
      parts: [{ text: `Instruksi Peran: ${SYSTEM_PROMPT}\n\nPahami konteks ini dan sapa sebagai BioBot.` }]
    },
    {
      role: 'model',
      parts: [{ text: 'Siap! Aku adalah BioBot, asisten AI resmi game Genetic Odyssey. Aku siap membantu siswa memahami Hukum Pewarisan Sifat Mendel dengan jelas, ramah, dan ringkas! 🧬' }]
    }
  ];
  
  // Add recent chat history (max 6 messages for context window efficiency)
  const recentHistory = chatHistory.slice(-6);
  for (const msg of recentHistory) {
    contents.push({
      role: msg.sender === 'bot' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    });
  }
  
  // Add current user message with stage context
  const contextualMessage = `[Siswa sedang di Stage ${stageId}]\nPertanyaan: ${userMessage}`;
  contents.push({
    role: 'user',
    parts: [{ text: contextualMessage }]
  });

  let lastErrorMessage = '';

  // Try supported Gemini models in sequence (1.5-flash -> 2.0-flash)
  for (const model of GEMINI_MODELS) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 512
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          return text.trim();
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`[BioBot Gemini] Error with model ${model}:`, response.status, errorData);
        
        const errorMsg = errorData?.error?.message || '';
        
        // Handle invalid API Key directly
        if (response.status === 400 && (errorMsg.toLowerCase().includes('api key') || errorMsg.toLowerCase().includes('invalid'))) {
          return `🔑 **API Key Gemini Tidak Valid**\n\nGoogle menolak API Key yang dimasukkan: "${errorMsg}".\n\nSilakan periksa kembali kuncinya di **Pengaturan > API Key BioBot Gemini**. Pastikan kodenya berawalan \`AIzaSy...\` tanpa spasi berlebih.`;
        }

        if (response.status === 403) {
          return `🔑 **Akses API Key Ditolak (403)**\n\nPastikan API Key di Google AI Studio mengaktifkan layanan **Generative Language API** dan tidak dibatasi IP.`;
        }

        if (response.status === 429) {
          return '⏳ **BioBot sedang sibuk** (kuota per menit tercapai). Silakan coba lagi dalam beberapa detik ya!';
        }

        lastErrorMessage = errorMsg;
      }
    } catch (netError) {
      console.warn(`[BioBot Gemini] Network error with model ${model}:`, netError);
      lastErrorMessage = netError?.message || 'Network error';
    }
  }

  // If all models failed, return null to let BioBotDrawer use offline response
  console.warn('[BioBot Gemini] All models exhausted, falling back to offline. Last error:', lastErrorMessage);
  return null;
}

/**
 * Cek apakah Gemini API tersedia
 */
export function isGeminiAvailable() {
  return Boolean(getGeminiApiKey());
}


