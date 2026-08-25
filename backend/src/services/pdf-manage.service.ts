import { PDFDocument, degrees } from 'pdf-lib';
import pdfParse from 'pdf-parse';
import { ImageConverter } from '../converters/image-converter.js';

export class PdfManageService {
  /**
   * Merges multiple PDF buffers in given order
   */
  public static async mergePdfs(pdfBuffers: Buffer[]): Promise<Buffer> {
    const mergedDoc = await PDFDocument.create();

    for (const buf of pdfBuffers) {
      const srcDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const indices = srcDoc.getPageIndices();
      const copiedPages = await mergedDoc.copyPages(srcDoc, indices);
      for (const page of copiedPages) {
        mergedDoc.addPage(page);
      }
    }

    const mergedBytes = await mergedDoc.save({ useObjectStreams: true });
    return Buffer.from(mergedBytes);
  }

  /**
   * Splits a PDF according to 0-indexed page numbers
   */
  public static async splitPdf(
    pdfBuffer: Buffer,
    pageIndices: number[],
    mode: 'single' | 'zip' = 'single'
  ): Promise<Buffer> {
    const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();
    const validIndices = pageIndices.filter(i => i >= 0 && i < totalPages);

    if (validIndices.length === 0) {
      throw new Error('No valid pages selected for splitting.');
    }

    if (mode === 'single') {
      const targetDoc = await PDFDocument.create();
      const copiedPages = await targetDoc.copyPages(srcDoc, validIndices);
      for (const page of copiedPages) {
        targetDoc.addPage(page);
      }
      const outputBytes = await targetDoc.save({ useObjectStreams: true });
      return Buffer.from(outputBytes);
    } else {
      // Split each page into individual file bundled in ZIP
      const fileEntries: Array<{ name: string; buffer: Buffer }> = [];

      for (let idx = 0; idx < validIndices.length; idx++) {
        const pageNum = validIndices[idx];
        const singlePageDoc = await PDFDocument.create();
        const [copiedPage] = await singlePageDoc.copyPages(srcDoc, [pageNum]);
        singlePageDoc.addPage(copiedPage);

        const singleBytes = await singlePageDoc.save({ useObjectStreams: true });
        fileEntries.push({
          name: `page-${pageNum + 1}.pdf`,
          buffer: Buffer.from(singleBytes),
        });
      }

      return await ImageConverter.createZipArchive(fileEntries);
    }
  }

  /**
   * Rotates specified pages by given degrees (e.g. 90, 180, 270)
   */
  public static async rotatePdf(
    pdfBuffer: Buffer,
    rotations: Record<number, number>
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();

    for (const [pageIdxStr, rotDeg] of Object.entries(rotations)) {
      const pageIdx = parseInt(pageIdxStr, 10);
      if (pageIdx >= 0 && pageIdx < pages.length) {
        const page = pages[pageIdx];
        const currentRot = page.getRotation().angle;
        const newRot = (currentRot + rotDeg) % 360;
        page.setRotation(degrees(newRot));
      }
    }

    const outputBytes = await pdfDoc.save({ useObjectStreams: true });
    return Buffer.from(outputBytes);
  }

  /**
   * Deletes specified 0-indexed page numbers
   */
  public static async deletePages(
    pdfBuffer: Buffer,
    deleteIndices: number[]
  ): Promise<Buffer> {
    const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();
    const deleteSet = new Set(deleteIndices);

    const keepIndices: number[] = [];
    for (let i = 0; i < totalPages; i++) {
      if (!deleteSet.has(i)) {
        keepIndices.push(i);
      }
    }

    if (keepIndices.length === 0) {
      throw new Error('Cannot delete all pages from document.');
    }

    const targetDoc = await PDFDocument.create();
    const copiedPages = await targetDoc.copyPages(srcDoc, keepIndices);
    for (const page of copiedPages) {
      targetDoc.addPage(page);
    }

    const outputBytes = await targetDoc.save({ useObjectStreams: true });
    return Buffer.from(outputBytes);
  }

  /**
   * Reorders pages according to specified sequence of 0-indexed page numbers
   */
  public static async reorderPages(
    pdfBuffer: Buffer,
    newOrderIndices: number[]
  ): Promise<Buffer> {
    const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();
    const validIndices = newOrderIndices.filter(i => i >= 0 && i < totalPages);

    if (validIndices.length === 0) {
      throw new Error('Invalid page reordering sequence provided.');
    }

    const targetDoc = await PDFDocument.create();
    const copiedPages = await targetDoc.copyPages(srcDoc, validIndices);
    for (const page of copiedPages) {
      targetDoc.addPage(page);
    }

    const outputBytes = await targetDoc.save({ useObjectStreams: true });
    return Buffer.from(outputBytes);
  }

  /**
   * Extracts selectable text with document statistics
   */
  public static async extractText(pdfBuffer: Buffer): Promise<{
    text: string;
    pageCount: number;
    wordCount: number;
    characterCount: number;
  }> {
    const parsed = await pdfParse(pdfBuffer);
    const text = parsed.text || '';
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characterCount = text.length;

    return {
      text,
      pageCount: parsed.numpages || 1,
      wordCount,
      characterCount,
    };
  }
}
