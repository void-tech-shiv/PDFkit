import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';

export type SplitPdfMode = 'single' | 'zip';

function parsePageRanges(input: string, totalPages: number): number[] {
  const value = input.trim().toLowerCase();

  if (!value) {
    throw new Error('Please select at least one page or enter a page range.');
  }

  if (value === 'all') {
    return Array.from({ length: totalPages }, (_, index) => index);
  }

  const pages: number[] = [];
  const seen = new Set<number>();

  for (const rawPart of value.split(',')) {
    const part = rawPart.trim();
    if (!part) continue;

    const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);
    const singleMatch = part.match(/^\d+$/);

    if (rangeMatch) {
      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);

      if (start < 1 || end < 1 || start > end || end > totalPages) {
        throw new Error(`Invalid page range "${part}". This PDF has ${totalPages} page${totalPages === 1 ? '' : 's'}.`);
      }

      for (let page = start; page <= end; page += 1) {
        const index = page - 1;
        if (!seen.has(index)) {
          seen.add(index);
          pages.push(index);
        }
      }
      continue;
    }

    if (singleMatch) {
      const page = Number(part);
      if (page < 1 || page > totalPages) {
        throw new Error(`Page ${page} is outside this PDF. It has ${totalPages} page${totalPages === 1 ? '' : 's'}.`);
      }

      const index = page - 1;
      if (!seen.has(index)) {
        seen.add(index);
        pages.push(index);
      }
      continue;
    }

    throw new Error(`Invalid page range "${part}". Use values like 1-3, 5, 8-10.`);
  }

  if (pages.length === 0) {
    throw new Error('Please select at least one valid page.');
  }

  return pages;
}

async function createSinglePdf(source: PDFDocument, pageIndices: number[]): Promise<Blob> {
  const outputPdf = await PDFDocument.create();
  const copiedPages = await outputPdf.copyPages(source, pageIndices);

  for (const page of copiedPages) {
    outputPdf.addPage(page);
  }

  const bytes = await outputPdf.save();
  const output = new Uint8Array(bytes);
  return new Blob([output.buffer], { type: 'application/pdf' });
}

async function createZip(source: PDFDocument, pageIndices: number[]): Promise<Blob> {
  const zip = new JSZip();
  const digits = Math.max(2, String(source.getPageCount()).length);

  for (const pageIndex of pageIndices) {
    const pagePdf = await PDFDocument.create();
    const [copiedPage] = await pagePdf.copyPages(source, [pageIndex]);
    pagePdf.addPage(copiedPage);

    const bytes = await pagePdf.save();
    const pageNumber = String(pageIndex + 1).padStart(digits, '0');
    zip.file(`page-${pageNumber}.pdf`, bytes);
  }

  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

export async function splitPdfInBrowser(
  file: File,
  ranges: string,
  mode: SplitPdfMode = 'single'
): Promise<Blob> {
  let source: PDFDocument;

  try {
    source = await PDFDocument.load(await file.arrayBuffer());
  } catch {
    throw new Error('Unable to read this PDF. It may be corrupted or password-protected.');
  }

  const pageIndices = parsePageRanges(ranges, source.getPageCount());

  if (mode === 'zip') {
    return createZip(source, pageIndices);
  }

  return createSinglePdf(source, pageIndices);
}
