import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { analyzeQuestionImage, cleanQuestionImageServer, getAIStatus } from './server/aiHandler';

function lgsPusulamApiPlugin() {
  const setupMiddleware = (middlewares: any) => {
    middlewares.use('/api/ai/status', (req: any, res: any, next: any) => {
      if (req.method !== 'GET') return next();
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(getAIStatus()));
    });

    middlewares.use('/api/ai/analyze-question', (req: any, res: any, next: any) => {
      if (req.method !== 'POST') return next();
      let body = '';
      req.on('data', (chunk: any) => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        try {
          const parsed = JSON.parse(body || '{}');
          const result = await analyzeQuestionImage(parsed);
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(
            JSON.stringify({
              success: false,
              providerConfigured: false,
              providerName: 'none',
              errorMessage: err?.message || 'İstek işlenirken hata oluştu.',
            })
          );
        }
      });
    });

    middlewares.use('/api/ai/clean-question', (req: any, res: any, next: any) => {
      if (req.method !== 'POST') return next();
      let body = '';
      req.on('data', (chunk: any) => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        try {
          const parsed = JSON.parse(body || '{}');
          const result = await cleanQuestionImageServer(parsed);
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(
            JSON.stringify({
              success: false,
              errorMessage: err?.message || 'İstek işlenirken hata oluştu.',
            })
          );
        }
      });
    });
  };

  return {
    name: 'lgs-pusulam-api-plugin',
    configureServer(server: any) {
      setupMiddleware(server.middlewares);
    },
    configurePreviewServer(server: any) {
      setupMiddleware(server.middlewares);
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), lgsPusulamApiPlugin()],
  server: {
    port: 5173,
    host: true,
  },
});
