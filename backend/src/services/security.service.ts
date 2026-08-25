import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import sharp from 'sharp';
import muhammara from 'muhammara';
import fs from 'node:fs';
import path from 'node:path';
import { TempManager } from '../utils/temp-manager.js';

export interface WatermarkOptions {
  text: string;
  fontSize?: number;
  opacity?: number;
  rotation?: number;
  color?: string; // hex #rrggbb
  pages?: 'all' | 'odd' | 'even';
}

export interface SignaturePlacement {
  page: number; // 1-indexed
  x: number;
  y: number;
  width: number;
  height: number;
}

export class SecurityService {
  /**
   * Encrypts/Protects a PDF document with real password protection (Standard Security Handler)
   */
  public static async protectPdf(pdfBuffer: Buffer, password: string): Promise<Buffer> {
    if (!password || password.trim().length === 0) {
      throw new Error('A password is required to encrypt this PDF document.');
    }

    const sandbox = TempManager.createSandbox();
    const inputPath = path.join(sandbox.dirPath, 'raw.pdf');
    const outputPath = path.join(sandbox.dirPath, 'encrypted.pdf');

    try {
      fs.writeFileSync(inputPath, pdfBuffer);

      // Apply real Standard PDF Encryption with User & Owner Passwords
      muhammara.recrypt(inputPath, outputPath, {
        userPassword: password,
        ownerPassword: password + '_owner_key',
        userProtectionFlag: 4, // Restrict modifications, enforce password on open
      });

      if (!fs.existsSync(outputPath)) {
        throw new Error('Encryption process failed to generate output document.');
      }

      const encryptedBytes = fs.readFileSync(outputPath);
      return encryptedBytes;
    } catch (err: any) {
      throw new Error('Failed to encrypt PDF: ' + (err.message || 'Unknown encryption error'));
    } finally {
      TempManager.cleanSandbox(sandbox.dirPath);
    }
  }

  /**
   * Attempts to decrypt/unlock a PDF document with provided password
   */
  public static async unlockPdf(pdfBuffer: Buffer, password?: string): Promise<Buffer> {
    const sandbox = TempManager.createSandbox();
    const inputPath = path.join(sandbox.dirPath, 'encrypted.pdf');
    const outputPath = path.join(sandbox.dirPath, 'decrypted.pdf');

    try {
      fs.writeFileSync(inputPath, pdfBuffer);

      // Attempt decryption using muhammara
      try {
        muhammara.recrypt(inputPath, outputPath, {
          password: password || '',
        });
      } catch (err: any) {
        throw new Error('The password provided is incorrect or the document encryption is unsupported.');
      }

      if (!fs.existsSync(outputPath)) {
        throw new Error('The password provided is incorrect.');
      }

      const decryptedBytes = fs.readFileSync(outputPath);
      return decryptedBytes;
    } finally {
      TempManager.cleanSandbox(sandbox.dirPath);
    }
  }

  /**
   * Stamps a custom text watermark onto PDF pages
   */
  public static async applyWatermark(
    pdfBuffer: Buffer,
    options: WatermarkOptions
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();

    const text = options.text;
    const fontSize = options.fontSize || 48;
    const opacity = Math.max(0.05, Math.min(1.0, options.opacity ?? 0.3));
    const rotationAngle = options.rotation ?? 45;
    const pageFilter = options.pages || 'all';

    // Parse hex color
    const hex = (options.color || '#64748b').replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255 || 0.4;
    const g = parseInt(hex.substring(2, 4), 16) / 255 || 0.45;
    const b = parseInt(hex.substring(4, 6), 16) / 255 || 0.55;

    for (let i = 0; i < pages.length; i++) {
      const pageNum = i + 1;
      if (pageFilter === 'odd' && pageNum % 2 === 0) continue;
      if (pageFilter === 'even' && pageNum % 2 !== 0) continue;

      const page = pages[i];
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const textHeight = font.heightAtSize(fontSize);

      // Center calculation
      const x = (width - textWidth) / 2;
      const y = (height - textHeight) / 2;

      page.drawText(text, {
        x: x,
        y: y,
        size: fontSize,
        font: font,
        color: rgb(r, g, b),
        opacity: opacity,
        rotate: degrees(rotationAngle),
      });
    }

    const outputBytes = await pdfDoc.save({ useObjectStreams: true });
    return Buffer.from(outputBytes);
  }

  /**
   * Stamps signature image onto specified page locations
   */
  public static async applySignature(
    pdfBuffer: Buffer,
    signatureImageBuffer: Buffer,
    placements: SignaturePlacement[]
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });

    // Normalize signature to PNG with transparency support
    const pngBuffer = await sharp(signatureImageBuffer).png().toBuffer();
    const signatureImage = await pdfDoc.embedPng(pngBuffer);

    const pages = pdfDoc.getPages();

    for (const placement of placements) {
      const pageIndex = placement.page - 1;
      if (pageIndex >= 0 && pageIndex < pages.length) {
        const page = pages[pageIndex];
        const pageHeight = page.getHeight();

        // Convert client top-left coordinates to PDF bottom-left coordinates
        const pdfY = pageHeight - placement.y - placement.height;

        page.drawImage(signatureImage, {
          x: placement.x,
          y: Math.max(0, pdfY),
          width: placement.width,
          height: placement.height,
        });
      }
    }

    const outputBytes = await pdfDoc.save({ useObjectStreams: true });
    return Buffer.from(outputBytes);
  }
}
