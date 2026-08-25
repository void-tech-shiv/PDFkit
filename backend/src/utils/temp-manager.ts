import fs from 'node:fs';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';

const BASE_TEMP_DIR = path.resolve(process.env.TEMP_DIR || './temp');
const TTL_MINUTES = Number(process.env.TEMP_FILE_TTL_MINUTES || 15);

// Ensure base temp directory exists
if (!fs.existsSync(BASE_TEMP_DIR)) {
  fs.mkdirSync(BASE_TEMP_DIR, { recursive: true });
}

export class TempManager {
  /**
   * Create an isolated sandbox folder for a single request
   */
  public static createSandbox(): { id: string; dirPath: string } {
    const id = uuidv4();
    const dirPath = path.join(BASE_TEMP_DIR, id);
    fs.mkdirSync(dirPath, { recursive: true });
    return { id, dirPath };
  }

  /**
   * Safely delete a sandbox directory and all its contents
   */
  public static cleanSandbox(dirPath: string): void {
    try {
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 });
      }
    } catch {
      // Will be collected by background reaper
    }
  }

  /**
   * Periodic garbage collector sweeping orphaned sandboxes older than TTL
   */
  public static runGarbageCollector(): void {
    try {
      if (!fs.existsSync(BASE_TEMP_DIR)) return;

      const now = Date.now();
      const maxAgeMs = TTL_MINUTES * 60 * 1000;
      const entries = fs.readdirSync(BASE_TEMP_DIR, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const itemPath = path.join(BASE_TEMP_DIR, entry.name);
          try {
            const stats = fs.statSync(itemPath);
            if (now - stats.mtimeMs > maxAgeMs) {
              fs.rmSync(itemPath, { recursive: true, force: true });
            }
          } catch {
            // Ignore stat errors for concurrently deleted items
          }
        }
      }
    } catch (err) {
      console.error('Error during temp garbage collection sweep:', err);
    }
  }
}

// Start automatic background sweeper every 5 minutes
setInterval(() => {
  TempManager.runGarbageCollector();
}, 5 * 60 * 1000);
