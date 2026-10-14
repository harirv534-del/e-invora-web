import 'dotenv/config'; // must be first so .env is loaded before other modules read it
import express from 'express';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { initDb } from './server/db.ts';
import { apiRouter } from './server/routes.ts';
import { initAuth } from './server/auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const requestedPort = Number(process.env.PORT) || 3000;

  // Initialize database and load persistent data
  initDb();
  initAuth();

  // Basic security headers
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Middleware
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Mount API endpoints
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', brand: 'E-INVORA', timestamp: new Date().toISOString() });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode: Vite middleware mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built client assets
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // If the port is busy, try the next ones and say clearly which URL to open.
  const listen = (port: number, attemptsLeft: number) => {
    const server = app.listen(port, () => {
      console.log('');
      console.log(`[E-INVORA] Website running at http://localhost:${port}`);
      if (port !== requestedPort) {
        console.log(`[E-INVORA] Port ${requestedPort} was busy, so port ${port} is being used instead.`);
      }
      console.log('[E-INVORA] Press Ctrl+C to stop the server.');
      if (process.env.OPEN_BROWSER === '1') {
        const url = `http://localhost:${port}`;
        const [cmd, args] =
          process.platform === 'win32' ? ['cmd', ['/c', 'start', '""', url]]
          : process.platform === 'darwin' ? ['open', [url]]
          : ['xdg-open', [url]];
        try {
          spawn(cmd, args, { stdio: 'ignore', detached: true }).on('error', () => {}).unref();
        } catch {
          /* browser could not be opened automatically; the URL above still works */
        }
      }
    });
    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE' && attemptsLeft > 0) {
        listen(port + 1, attemptsLeft - 1);
      } else {
        console.error('[E-INVORA] Could not start the server:', err.message);
        process.exit(1);
      }
    });
  };
  listen(requestedPort, 10);
}

startServer().catch((err) => {
  console.error('[E-INVORA] Server failed to start:', err);
  process.exit(1);
});
