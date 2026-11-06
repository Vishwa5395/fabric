import http from 'node:http';
import https from 'node:https';

interface KeepAliveConfig {
  intervalMs?: number;
  url?: string;
}

export class KeepAliveService {
  private timer: NodeJS.Timeout | null = null;
  private intervalMs: number;
  private pingUrl: string | null = null;
  private isRunning = false;

  constructor(config?: KeepAliveConfig) {
    // 10 minutes interval (Render sleeps after 15 min inactivity)
    this.intervalMs = config?.intervalMs || 10 * 60 * 1000;
  }

  public start(port: number = 3001): void {
    if (this.isRunning) return;

    // Detect Render external URL, custom backend URL, or local port
    const renderUrl = process.env.RENDER_EXTERNAL_URL;
    const appUrl = process.env.APP_URL;
    const backendUrl = process.env.BACKEND_URL || process.env.PUBLIC_URL;
    const selfUrl = renderUrl || appUrl || backendUrl || `http://localhost:${port}`;
    this.pingUrl = `${selfUrl.replace(/\/+$/, '')}/api/health`;

    this.isRunning = true;
    console.log(`[KeepAlive] Service started. Pinging ${this.pingUrl} every ${this.intervalMs / 60000} minutes to prevent Render idle sleep.`);

    // First ping after 30 seconds
    setTimeout(() => this.ping(), 30000);

    // Recurring interval
    this.timer = setInterval(() => {
      this.ping();
    }, this.intervalMs);

    // Prevent timer from holding process if needed
    if (this.timer.unref) {
      this.timer.unref();
    }
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('[KeepAlive] Service stopped.');
  }

  private ping(): void {
    if (!this.pingUrl) return;

    try {
      const client = this.pingUrl.startsWith('https://') ? https : http;
      const req = client.get(this.pingUrl, { timeout: 15000 }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode && res.statusCode < 400) {
            console.log(`[KeepAlive] Cron Ping Successful [${new Date().toISOString()}] - Status: ${res.statusCode}`);
          } else {
            console.warn(`[KeepAlive] Cron Ping Returned Status: ${res.statusCode}`);
          }
        });
      });

      req.on('error', (err) => {
        console.warn(`[KeepAlive] Cron Ping Failed: ${err.message}`);
      });

      req.on('timeout', () => {
        req.destroy();
        console.warn('[KeepAlive] Cron Ping Timed Out');
      });
    } catch (e: any) {
      console.warn(`[KeepAlive] Ping Exception: ${e.message}`);
    }
  }
}

export const keepAliveService = new KeepAliveService();

