import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeQuestionImage, cleanQuestionImageServer, getAIStatus } from './aiHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json({ limit: '25mb' }));

app.get('/api/ai/status', (_req, res) => {
  res.json(getAIStatus());
});

app.post('/api/ai/analyze-question', async (req, res) => {
  try {
    const result = await analyzeQuestionImage(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      providerConfigured: false,
      providerName: 'none',
      errorMessage: err?.message || 'Sunucu hatası oluştu.',
    });
  }
});

app.post('/api/ai/clean-question', async (req, res) => {
  try {
    const result = await cleanQuestionImageServer(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      errorMessage: err?.message || 'Sunucu hatası oluştu.',
    });
  }
});

// Serve static production build if available
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

app.listen(PORT, () => {
  console.log(`LGS Pusulam – Antalya API Sunucusu çalışıyor: http://localhost:${PORT}`);
});
