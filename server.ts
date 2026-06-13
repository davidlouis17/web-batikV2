import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Initialize Gemini API client if key exists
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing. Please set it in the Settings secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// REST API for Gemini generation
app.post("/api/gemini/generate", async (req, res) => {
  const { prompt, systemInstruction } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "Kolom prompt wajib diisi!" });
    return;
  }

  try {
    const ai = getGeminiClient();
    const systemPrompt = systemInstruction || "Anda adalah asisten AI profesional untuk Paguyuban Putera Puteri Batik Jawa Timur. Bantu pengguna menghasilkan teks atau deskripsi yang indah, bermakna, puitis, dan profesional tentang batik Jawa Timur, fashion, motif, atau nilai kultur luhur, dalam Bahasa Indonesia yang formal dan menarik.";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Kesalahan panggilan Gemini:", error);
    res.status(500).json({ 
      error: error.message || "Gagal menghubungi layanan Gemini AI. Silakan periksa kembali kunci API Anda di Settings > Secrets." 
    });
  }
});

// Configure Vite or Static Assets depending on Environment
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from dist/ folder.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Gagal menyalakan server express:", error);
});
