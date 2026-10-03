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

/**
 * Kirim pertanyaan ke Gemini AI dan dapatkan jawaban
 * @param {string} userMessage - Pertanyaan dari siswa
 * @param {number} stageId - Stage ID yang sedang aktif (1-8)
 * @param {Array} chatHistory - Riwayat chat sebelumnya [{sender, text}]
 * @returns {Promise<string>} - Jawaban dari Gemini
 */
export async function askGemini(userMessage, stageId = 1, chatHistory = []) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    return '⚠️ API Key Gemini belum diatur. Untuk mengaktifkan BioBot AI, tambahkan `VITE_GEMINI_API_KEY` di file `.env` lalu restart server.\n\nSementara itu, aku tetap bisa memberikan petunjuk dasar dari database lokal! 📚';
  }

  // Build conversation history for context
  const contents = [];
  
  // Add recent chat history (max 6 messages for context window efficiency)
  const recentHistory = chatHistory.slice(-6);
  for (const msg of recentHistory) {
    contents.push({
      role: msg.sender === 'bot' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    });
  }
  
  // Add current user message with stage context
  const contextualMessage = `[Siswa sedang di Stage ${stageId}]\n\nPertanyaan siswa: ${userMessage}`;
  contents.push({
    role: 'user',
    parts: [{ text: contextualMessage }]
  });

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 512
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[BioBot Gemini] API Error:', response.status, errorData);
      
      if (response.status === 429) {
        return '⏳ BioBot sedang sibuk menerima banyak pertanyaan. Coba lagi dalam beberapa detik ya!';
      }
      if (response.status === 403) {
        return '🔑 API Key tidak valid atau sudah expired. Hubungi guru/admin untuk memperbarui konfigurasi BioBot.';
      }
      return '❌ Maaf, BioBot mengalami gangguan koneksi. Coba lagi nanti ya!';
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      return '🤔 Hmm, aku tidak bisa menjawab pertanyaan itu. Coba tanyakan dengan cara yang berbeda ya!';
    }

    return text.trim();
  } catch (error) {
    console.error('[BioBot Gemini] Network Error:', error);
    return '🌐 Koneksi internet bermasalah. Pastikan kamu terhubung ke internet dan coba lagi!';
  }
}

/**
 * Cek apakah Gemini API tersedia
 */
export function isGeminiAvailable() {
  return Boolean(import.meta.env.VITE_GEMINI_API_KEY);
}
