import mammoth from 'mammoth';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export class DocxConverter {
  /**
   * Converts a DOCX buffer to a clean, formatted PDF
   */
  public static async convertToPdf(docxBuffer: Buffer): Promise<Buffer> {
    // 1. Extract raw text and HTML from Mammoth
    const [textResult, htmlResult] = await Promise.all([
      mammoth.extractRawText({ buffer: docxBuffer }),
      mammoth.convertToHtml({ buffer: docxBuffer }),
    ]);

    const rawText = textResult.value || '';
    const lines = rawText.split(/\r?\n/).filter(line => line.trim().length > 0);

    // 2. Create PDF document
    const pdfDoc = await PDFDocument.create();
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Standard A4 dimensions
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;
    const lineHeight = 16;
    const headerLineHeight = 22;

    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let currentY = pageHeight - margin;

    // Helper: Wrap line to fit content width
    const wrapText = (text: string, font: typeof fontRegular, size: number): string[] => {
      const words = text.split(' ');
      const wrappedLines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const width = font.widthOfTextAtSize(testLine, size);
        if (width <= contentWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) wrappedLines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) wrappedLines.push(currentLine);
      return wrappedLines;
    };

    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      const isHeader = trimmed.length < 80 && (trimmed.toUpperCase() === trimmed || rawLine.startsWith('#'));
      const font = isHeader ? fontBold : fontRegular;
      const fontSize = isHeader ? 14 : 10.5;
      const currentSpacing = isHeader ? headerLineHeight : lineHeight;

      const wrappedLines = wrapText(trimmed, font, fontSize);

      for (const line of wrappedLines) {
        if (currentY - currentSpacing < margin) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
        }

        currentPage.drawText(line, {
          x: margin,
          y: currentY,
          size: fontSize,
          font: font,
          color: isHeader ? rgb(0.1, 0.15, 0.25) : rgb(0.2, 0.2, 0.2),
        });

        currentY -= currentSpacing;
      }

      currentY -= 6; // paragraph gap
    }

    // Ensure at least one page exists
    if (pdfDoc.getPageCount() === 0) {
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      page.drawText('Document content was empty.', {
        x: margin,
        y: pageHeight - margin,
        size: 12,
        font: fontRegular,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
