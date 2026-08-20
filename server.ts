import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { generateStudyBuddyReply, StudyBuddyServiceError } from './src/services/studyBuddyService';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Route for StudyBuddy AI Chat
  app.post('/api/studybuddy', async (req: express.Request, res: express.Response) => {
    try {
      res.json(await generateStudyBuddyReply(req.body));
    } catch (error) {
      const serviceError = error instanceof StudyBuddyServiceError ? error : null;
      if (!serviceError) console.error('StudyBuddy API error:', error);
      res.status(serviceError?.status || 500).json({
        error: serviceError?.message || 'Internal server error.',
        code: serviceError?.code || 'INTERNAL_ERROR',
      });
    }
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'StudyPrepHub API' });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
