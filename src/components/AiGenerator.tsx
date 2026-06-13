import React, { useState } from "react";
import { Sparkles, Loader2, X } from "lucide-react";

interface AiGeneratorProps {
  label: string;
  onGenerate: (text: string) => void;
  type?: "title" | "description" | "philosophy" | "short";
  currentValue?: string;
  theme?: "dark" | "light";
}

export const AiGenerator: React.FC<AiGeneratorProps> = ({
  label,
  onGenerate,
  type = "description",
  currentValue = "",
  theme = "light"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Masukkan instruksi atau kata kunci penuntun terlebih dahulu!");
      return;
    }

    setGenerating(true);
    setError(null);

    let systemInstruction = "";
    if (type === "title") {
      systemInstruction = `Buatkan judul pendek yang estetik, sangat menarik, dan puitis dalam Bahasa Indonesia untuk ${label}. Maksimal 4-8 kata saja. Jangan pernah menyertakan tanda kutip ("") di sekeliling judul hasil generate.`;
    } else if (type === "philosophy") {
      systemInstruction = `Buatkan makna filosofis mendalam, puitis, agung, serta penuh kebijaksanaan tentang motif batik ${label} dalam 2-3 kalimat Bahasa Indonesia yang sangat indah, sarat nilai luhur warisan leluhur budaya Jawa Timur. Jangan menyertakan tanda kutip di sekeliling teks.`;
    } else if (type === "short") {
      systemInstruction = `Buatkan teks slogan ringkas atau sub-judul singkat penjelas untuk ${label} dalam Bahasa Indonesia. Maksimal 10-15 kata, puitis, berwibawa dan mengesankan. Tanpa tanda kutip.`;
    } else {
      systemInstruction = `Buatkan deskripsi lengkap, profesional, informatif, dan kaya nuansa sastra estetika dalam Bahasa Indonesia untuk ${label} sebanyak 2 hingga 3 paragraf pendek (maksimal 100 kata). Gunakan pilihan kata yang elok dan mengundang apresiasi dari pembaca. Tanpa tanda kutip.`;
    }

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          systemInstruction: systemInstruction,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Gagal menghasilkan konten dari Gemini");
      }

      const data = await response.json();
      if (data.text) {
        // Clean any leading/trailing quotes if the model returns them
        let cleanedText = data.text.trim();
        if (cleanedText.startsWith('"') && cleanedText.endsWith('"')) {
          cleanedText = cleanedText.substring(1, cleanedText.length - 1);
        }
        if (cleanedText.startsWith("'") && cleanedText.endsWith("'")) {
          cleanedText = cleanedText.substring(1, cleanedText.length - 1);
        }
        onGenerate(cleanedText);
        setIsOpen(false);
        setPrompt("");
      } else {
        throw new Error("Respons kosong diterima dari Gemini AI.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal terhubung dengan Gemini AI.");
    } finally {
      setGenerating(false);
    }
  };

  const isDark = theme === "dark";

  return (
    <div className="mt-1 text-xs font-sans">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-bold tracking-wide transition-all shadow-xs cursor-pointer ${
            isDark
              ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "bg-[#8B0022]/5 hover:bg-[#8B0022]/10 text-[#8B0022] border border-[#8B0022]/15"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>Bantu tulis dengan Gemini AI</span>
        </button>
      ) : (
        <div
          className={`p-3 rounded-lg border shadow-xs space-y-2 mt-1.5 animate-fade-in text-left ${
            isDark
              ? "bg-slate-900 border-slate-750 text-slate-200"
              : "bg-slate-50 border-slate-250 text-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider text-amber-500">
              <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
              Pandu Gemini AI ({label})
            </span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setError(null);
              }}
              className={`p-1 rounded-full transition ${
                isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-200 text-slate-500"
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed">
            Berikan deskripsi kasar atau kata kunci penuntun (contoh: "kain sidoasih, warna sogan klasik, dipakai pengantin jawa timur melambangkan kasih sayang abadi").
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              className={`flex-1 p-2 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                isDark
                  ? "bg-slate-800 border-slate-750 text-white placeholder-slate-500"
                  : "bg-white border-slate-250 text-slate-850 placeholder-slate-400"
              }`}
              placeholder="Masukkan instruksi khusus atau kata kunci di sini..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              disabled={generating}
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="px-3.5 py-2 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition cursor-pointer text-xs"
            >
              {generating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Mengerjakan...
                </>
              ) : (
                "Hasilkan"
              )}
            </button>
          </div>

          {error && (
            <p className="text-[10px] text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
