import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface StorageObjectMetadata {
  key: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface IStorageAdapter {
  saveObject(key: string, buffer: Buffer): Promise<void>;
  getObjectStream(key: string): fs.ReadStream;
  deleteObject(key: string): Promise<boolean>;
  getSignedViewUrl(key: string, expiresInMinutes?: number): string;
}

const UPLOADS_DIR = path.resolve('server/uploads/private');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Secret key for HMAC token generation
const SIGNING_SECRET = process.env.MEDIA_SIGNING_SECRET || 'tod-fun-dept-secret-key-2026';

export class LocalStorageAdapter implements IStorageAdapter {
  public async saveObject(key: string, buffer: Buffer): Promise<void> {
    const fullPath = path.join(UPLOADS_DIR, key);
    const parentDir = path.dirname(fullPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    await fs.promises.writeFile(fullPath, buffer);
  }

  public getObjectStream(key: string): fs.ReadStream {
    const fullPath = path.join(UPLOADS_DIR, key);
    if (!fs.existsSync(fullPath)) {
      throw new Error('Object not found');
    }
    return fs.createReadStream(fullPath);
  }

  public async deleteObject(key: string): Promise<boolean> {
    const fullPath = path.join(UPLOADS_DIR, key);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      return true;
    }
    return false;
  }

  public getSignedViewUrl(key: string, expiresInMinutes: number = 30): string {
    const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
    const dataToSign = `${key}:${expiresAt}`;
    const signature = crypto
      .createHmac('sha256', SIGNING_SECRET)
      .update(dataToSign)
      .digest('hex');

    const token = Buffer.from(
      JSON.stringify({ key, expiresAt, signature })
    ).toString('base64url');

    return `/api/tod/evidence/stream/${token}`;
  }

  public static verifyToken(token: string): string | null {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf-8'));
      if (!decoded.key || !decoded.expiresAt || !decoded.signature) return null;
      if (Date.now() > decoded.expiresAt) return null; // Expired

      const expectedSig = crypto
        .createHmac('sha256', SIGNING_SECRET)
        .update(`${decoded.key}:${decoded.expiresAt}`)
        .digest('hex');

      if (expectedSig !== decoded.signature) return null;
      return decoded.key;
    } catch {
      return null;
    }
  }
}

export const storageAdapter = new LocalStorageAdapter();

