import express from 'express';
import http from 'node:http';
import cors from 'cors';
import { Server } from 'socket.io';
import { apiRouter, renderSecretVaultHtml } from './routes/api';
import { setupSocketHandlers } from './socket/socketHandler';
import { keepAliveService } from './services/keepAlive';

const app = express();
const server = http.createServer(app);

const PORT = parseInt(process.env.PORT || '3001', 10);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';

// Middleware
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Secret Vault human-readable dashboard direct routes
app.get('/secret-vault', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderSecretVaultHtml());
});

app.get('/vault', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderSecretVaultHtml());
});

// REST API routes
app.use('/api', apiRouter);

// Socket.IO configuration
export const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 30000,
  pingInterval: 10000
});

setupSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`[TruthOrDare] Server listening on http://localhost:${PORT}`);
  // Start the background keep-alive ping loop to prevent Render from going to sleep
  keepAliveService.start(PORT);
});

export { app, server };

