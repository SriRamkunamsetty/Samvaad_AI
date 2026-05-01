import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './src/server/utils/logger.js';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import analyzeRoute from './src/server/routes/analyze.js';
import outreachRoute from './src/server/routes/outreach.js';
import responseRoute from './src/server/routes/response.js';
import followupRoute from './src/server/routes/followup.js';
import refineRoute from './src/server/routes/refine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI endpoints Rate Limiter (Stricter)
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 AI requests per windowMs
  message: { success: false, error: 'Too many AI requests from this IP, please try again after 5 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for local Vite dev
  }));
  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: '100kb' })); // Payload size limit
  
  app.use(pinoHttp({
    logger,
    genReqId: function (req, res) {
      const existingID = req.id ?? req.headers["x-request-id"];
      if (existingID) return existingID;
      const id = uuidv4();
      res.setHeader('X-Request-Id', id);
      return id;
    },
    customLogLevel: function (req, res, err) {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        return 'warn'
      } else if (res.statusCode >= 500 || err) {
        return 'error'
      }
      return 'info'
    },
    autoLogging: {
      ignore: (req) => req.url === '/api/health'
    }
  }));

  app.use(globalLimiter);

  // API Routes
  app.use('/api/analyze', aiLimiter, analyzeRoute);
  app.use('/api/outreach', aiLimiter, outreachRoute);
  app.use('/api/response', aiLimiter, responseRoute);
  app.use('/api/followup', aiLimiter, followupRoute);
  app.use('/api/refine', aiLimiter, refineRoute);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Samvaad AI Backend Running' });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
