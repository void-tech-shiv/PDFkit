import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker using standard CDN matching the version or fallback
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
} catch (e) {
  console.warn('PDF.js worker initialization:', e);
}

export interface RenderedPageThumbnail {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Loads a PDF from a File/Blob/ArrayBuffer and renders thumbnail images of each page
 */
export async function renderPdfThumbnails(
  fileOrBuffer: File | Blob | ArrayBuffer,
  maxPages: number = 50,
  scale: number = 0.5
): Promise<RenderedPageThumbnail[]> {
  const arrayBuffer =
    fileOrBuffer instanceof ArrayBuffer
      ? fileOrBuffer
      : await fileOrBuffer.arrayBuffer();

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await loadingTask.promise;
  const numPages = Math.min(pdfDoc.numPages, maxPages);
  const thumbnails: RenderedPageThumbnail[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (context) {
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      thumbnails.push({
        pageNumber: i,
        dataUrl: canvas.toDataURL('image/jpeg', 0.8),
        width: viewport.width,
        height: viewport.height,
      });
    }
  }

  return thumbnails;
}

/**
 * Count total pages in PDF file
 */
export async function getPdfPageCount(fileOrBuffer: File | Blob | ArrayBuffer): Promise<number> {
  const arrayBuffer =
    fileOrBuffer instanceof ArrayBuffer
      ? fileOrBuffer
      : await fileOrBuffer.arrayBuffer();

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await loadingTask.promise;
  return pdfDoc.numPages;
}
