import { PDFDocument, PDFImage } from 'pdf-lib';

export interface BrowserImageToPdfOptions {
  pageSize?: string;
  fitMode?: string;
  margin?: number;
}

const PAGE_SIZES: Record<string, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

async function rasterizeToPng(file: File): Promise<Uint8Array> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.decoding = 'async';
    image.src = objectUrl;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error(`Unable to read ${file.name}.`));
    });

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Your browser could not create an image canvas.');
    }

    context.drawImage(image, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => {
        if (value) resolve(value);
        else reject(new Error(`Unable to process ${file.name}.`));
      }, 'image/png');
    });

    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function embedImage(pdf: PDFDocument, file: File): Promise<PDFImage> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (type === 'image/jpeg' || type === 'image/jpg' || /\.jpe?g$/.test(name)) {
    return pdf.embedJpg(bytes);
  }

  if (type === 'image/png' || name.endsWith('.png')) {
    return pdf.embedPng(bytes);
  }

  // pdf-lib cannot embed WebP directly. Converting it in the browser also
  // makes the tool work without a backend on static/Vercel deployments.
  return pdf.embedPng(await rasterizeToPng(file));
}

export async function convertImagesToPdfInBrowser(
  files: File[],
  options: BrowserImageToPdfOptions = {}
): Promise<Blob> {
  if (files.length === 0) {
    throw new Error('Select at least one image.');
  }

  const pdf = await PDFDocument.create();
  const pageSize = (options.pageSize || 'a4').toLowerCase();
  const fitMode = (options.fitMode || 'contain').toLowerCase();
  const margin = Math.max(0, Number(options.margin ?? 20));

  for (const file of files) {
    const image = await embedImage(pdf, file);

    let pageWidth: number;
    let pageHeight: number;

    if (pageSize === 'fit') {
      pageWidth = image.width + margin * 2;
      pageHeight = image.height + margin * 2;
    } else {
      [pageWidth, pageHeight] = PAGE_SIZES[pageSize] || PAGE_SIZES.a4;
    }

    const page = pdf.addPage([pageWidth, pageHeight]);
    const availableWidth = Math.max(1, pageWidth - margin * 2);
    const availableHeight = Math.max(1, pageHeight - margin * 2);

    let drawWidth = availableWidth;
    let drawHeight = availableHeight;

    if (fitMode !== 'stretch') {
      const scaleX = availableWidth / image.width;
      const scaleY = availableHeight / image.height;
      const scale = fitMode === 'cover'
        ? Math.max(scaleX, scaleY)
        : Math.min(scaleX, scaleY);

      drawWidth = image.width * scale;
      drawHeight = image.height * scale;
    }

    const x = margin + (availableWidth - drawWidth) / 2;
    const y = margin + (availableHeight - drawHeight) / 2;

    page.drawImage(image, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });
  }

  const bytes = await pdf.save();
  return new Blob([bytes], { type: 'application/pdf' });
}
