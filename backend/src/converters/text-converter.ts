import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface TextToPdfOptions {
  text: string;
  fontSize?: number;
  lineSpacing?: number;
  margin?: number;
  pageSize?: 'a4' | 'letter';
  fontFamily?: 'Helvetica' | 'TimesRoman' | 'Courier';
}

export class TextConverter {
  /**
   * Converts plain/formatted text to a clean PDF with proper pagination
   */
  public static async convertToPdf(options: TextToPdfOptions): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();

    const fontChoice = options.fontFamily || 'Helvetica';
    let font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    if (fontChoice === 'TimesRoman') font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    if (fontChoice === 'Courier') font = await pdfDoc.embedFont(StandardFonts.Courier);

    const isLetter = options.pageSize === 'letter';
    const pageWidth = isLetter ? 612 : 595.28;
    const pageHeight = isLetter ? 792 : 841.89;

    const margin = options.margin || 50;
    const fontSize = options.fontSize || 11;
    const lineSpacingMultiplier = options.lineSpacing || 1.3;
    const lineHeight = fontSize * lineSpacingMultiplier;
    const contentWidth = pageWidth - margin * 2;

    const wrapText = (text: string): string[] => {
      const words = text.split(' ');
      const lines: string[] = [];
      let cur = '';

      for (const w of words) {
        const test = cur ? `${cur} ${w}` : w;
        const width = font.widthOfTextAtSize(test, fontSize);
        if (width <= contentWidth) {
          cur = test;
        } else {
          if (cur) lines.push(cur);
          cur = w;
        }
      }
      if (cur) lines.push(cur);
      return lines;
    };

    const rawParagraphs = options.text.split(/\r?\n/);
    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let currentY = pageHeight - margin;

    for (const paragraph of rawParagraphs) {
      if (paragraph.trim() === '') {
        currentY -= lineHeight * 0.8; // empty line spacing
        continue;
      }

      const lines = wrapText(paragraph);
      for (const line of lines) {
        if (currentY - lineHeight < margin) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
        }

        currentPage.drawText(line, {
          x: margin,
          y: currentY,
          size: fontSize,
          font: font,
          color: rgb(0.1, 0.1, 0.1),
        });

        currentY -= lineHeight;
      }
    }

    if (pdfDoc.getPageCount() === 0) {
      pdfDoc.addPage([pageWidth, pageHeight]);
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
