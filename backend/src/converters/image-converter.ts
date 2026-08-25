import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import archiver from 'archiver';
import { PassThrough } from 'node:stream';

export interface ImageToPdfOptions {
  pageSize?: 'a4' | 'letter' | 'fit';
  fitMode?: 'contain' | 'cover' | 'stretch';
  margin?: number;
}

export class ImageConverter {
  /**
   * Converts multiple images into a unified PDF
   */
  public static async imagesToPdf(
    images: Array<{ buffer: Buffer; mimeType?: string }>,
    options: ImageToPdfOptions = {}
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const pageSize = options.pageSize || 'a4';
    const fitMode = options.fitMode || 'contain';
    const margin = options.margin !== undefined ? options.margin : 20;

    for (const item of images) {
      // Normalize and standardize image to PNG/JPEG via Sharp to ensure clean PDF embedding
      const metadata = await sharp(item.buffer).metadata();
      const isPng = metadata.format === 'png';

      let standardBuffer: Buffer;
      let pdfImage;

      if (isPng) {
        standardBuffer = await sharp(item.buffer).png().toBuffer();
        pdfImage = await pdfDoc.embedPng(standardBuffer);
      } else {
        standardBuffer = await sharp(item.buffer).jpeg({ quality: 90 }).toBuffer();
        pdfImage = await pdfDoc.embedJpg(standardBuffer);
      }

      const imgWidth = pdfImage.width;
      const imgHeight = pdfImage.height;

      let pageWidth: number;
      let pageHeight: number;

      if (pageSize === 'fit') {
        pageWidth = imgWidth + margin * 2;
        pageHeight = imgHeight + margin * 2;
      } else if (pageSize === 'letter') {
        pageWidth = 612;
        pageHeight = 792;
      } else {
        // A4 default
        pageWidth = 595.28;
        pageHeight = 841.89;
      }

      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      const availWidth = Math.max(1, pageWidth - margin * 2);
      const availHeight = Math.max(1, pageHeight - margin * 2);

      let drawWidth = imgWidth;
      let drawHeight = imgHeight;
      let drawX = margin;
      let drawY = margin;

      if (fitMode === 'contain') {
        const scale = Math.min(availWidth / imgWidth, availHeight / imgHeight);
        drawWidth = imgWidth * scale;
        drawHeight = imgHeight * scale;
        drawX = margin + (availWidth - drawWidth) / 2;
        drawY = margin + (availHeight - drawHeight) / 2;
      } else if (fitMode === 'cover') {
        const scale = Math.max(availWidth / imgWidth, availHeight / imgHeight);
        drawWidth = imgWidth * scale;
        drawHeight = imgHeight * scale;
        drawX = margin + (availWidth - drawWidth) / 2;
        drawY = margin + (availHeight - drawHeight) / 2;
      } else {
        // stretch
        drawWidth = availWidth;
        drawHeight = availHeight;
        drawX = margin;
        drawY = margin;
      }

      page.drawImage(pdfImage, {
        x: drawX,
        y: drawY,
        width: drawWidth,
        height: drawHeight,
      });
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /**
   * Helper to create a zip stream from an array of file buffers
   */
  public static async createZipArchive(
    files: Array<{ name: string; buffer: Buffer }>
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 9 } });
      const stream = new PassThrough();
      const chunks: Buffer[] = [];

      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
      archive.on('error', reject);

      archive.pipe(stream);

      for (const file of files) {
        archive.append(file.buffer, { name: file.name });
      }

      archive.finalize();
    });
  }
}
