import { FastifyPluginAsync } from 'fastify';
import { PdfManageService } from '../services/pdf-manage.service.js';
import { parsePageRangeStringStrict, parsePageNumbersListStrict, isValidRotationAngle } from '../utils/validator.js';
import { PDFDocument } from 'pdf-lib';
import { buildAttachmentDisposition } from '../utils/download.js';
import { isPdfBuffer } from '../utils/file-validation.js';

export const manageRoutes: FastifyPluginAsync = async (fastify) => {
  // Merge multiple PDFs
  fastify.post('/api/pdf/merge', async (request, reply) => {
    const parts = request.parts();
    const pdfBuffers: Buffer[] = [];
    let firstFileName = 'document';

    for await (const part of parts) {
      if (part.type === 'file') {
        if (pdfBuffers.length === 0 && part.filename) {
          firstFileName = part.filename.replace(/\.pdf$/i, '');
        }
        const buf = await part.toBuffer();
        pdfBuffers.push(buf);
      }
    }

    if (pdfBuffers.some((buffer) => !isPdfBuffer(buffer))) {
      return reply.status(400).send({ error: 'Every uploaded file must be a valid PDF.' });
    }

    if (pdfBuffers.length < 2) {
      return reply.status(400).send({ error: 'Please upload at least 2 PDF files to merge.' });
    }

    try {
      const merged = await PdfManageService.mergePdfs(pdfBuffers);
      reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', buildAttachmentDisposition(`${firstFileName}-merged.pdf`))
        .send(merged);
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to merge PDFs. Please try again.' });
    }
  });

  // Split PDF
  fastify.post('/api/pdf/split', async (request, reply) => {
    const parts = request.parts();
    let pdfBuffer: Buffer | null = null;
    let fileName = 'document.pdf';
    const fields: Record<string, any> = {};

    for await (const part of parts) {
      if (part.type === 'file') {
        fileName = part.filename || 'document.pdf';
        pdfBuffer = await part.toBuffer();
      } else {
        fields[part.fieldname] = part.value;
      }
    }

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return reply.status(400).send({ error: 'No PDF file uploaded.' });
    }

    if (!isPdfBuffer(pdfBuffer)) {
      return reply.status(400).send({ error: 'The uploaded file is not a valid PDF.' });
    }

    try {
      const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
      const totalPages = srcDoc.getPageCount();
      const ranges = fields.ranges || `1-${totalPages}`;
      const mode = fields.mode === 'zip' ? 'zip' : 'single';

      const pageIndices = parsePageRangeStringStrict(String(ranges), totalPages);
      if (!pageIndices || pageIndices.length === 0) {
        return reply.status(400).send({ error: 'Selected page range is invalid or empty.' });
      }

      const result = await PdfManageService.splitPdf(pdfBuffer, pageIndices, mode);
      const baseName = fileName.replace(/\.pdf$/i, '');

      if (mode === 'zip') {
        reply
          .header('Content-Type', 'application/zip')
          .header('Content-Disposition', buildAttachmentDisposition(`${baseName}-pages.zip`))
          .send(result);
      } else {
        reply
          .header('Content-Type', 'application/pdf')
          .header('Content-Disposition', buildAttachmentDisposition(`${baseName}-split.pdf`))
          .send(result);
      }
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to split PDF. Please try again.' });
    }
  });

  // Rotate PDF
  fastify.post('/api/pdf/rotate', async (request, reply) => {
    const parts = request.parts();
    let pdfBuffer: Buffer | null = null;
    let fileName = 'document.pdf';
    const fields: Record<string, any> = {};

    for await (const part of parts) {
      if (part.type === 'file') {
        fileName = part.filename || 'document.pdf';
        pdfBuffer = await part.toBuffer();
      } else {
        fields[part.fieldname] = part.value;
      }
    }

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return reply.status(400).send({ error: 'No PDF file uploaded.' });
    }

    if (!isPdfBuffer(pdfBuffer)) {
      return reply.status(400).send({ error: 'The uploaded file is not a valid PDF.' });
    }

    try {
      const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
      const totalPages = doc.getPageCount();
      let rotations: Record<number, number> = {};

      if (fields.rotations !== undefined && fields.rotations !== '') {
        let parsed: unknown = fields.rotations;
        if (typeof fields.rotations === 'string') {
          try {
            parsed = JSON.parse(fields.rotations);
          } catch {
            parsed = Number(fields.rotations);
          }
        }

        if (typeof parsed === 'number') {
          if (!isValidRotationAngle(parsed)) {
            return reply.status(400).send({ error: 'Rotation must be 0, 90, 180, or 270 degrees.' });
          }
          for (let i = 0; i < totalPages; i++) rotations[i] = parsed;
        } else if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          for (const [pageKey, angle] of Object.entries(parsed as Record<string, unknown>)) {
            const pageIndex = Number(pageKey);
            if (!/^\d+$/.test(pageKey) || !Number.isInteger(pageIndex) ||
                pageIndex < 0 || pageIndex >= totalPages || !isValidRotationAngle(angle)) {
              return reply.status(400).send({ error: 'Rotation map contains an invalid page index or angle.' });
            }
            rotations[pageIndex] = angle;
          }
        } else {
          return reply.status(400).send({ error: 'Invalid rotation parameters.' });
        }
      } else if (fields.angle !== undefined) {
        const angle = Number(fields.angle);
        if (!isValidRotationAngle(angle)) {
          return reply.status(400).send({ error: 'Rotation must be 0, 90, 180, or 270 degrees.' });
        }
        for (let i = 0; i < totalPages; i++) rotations[i] = angle;
      }

      const rotated = await PdfManageService.rotatePdf(pdfBuffer, rotations);
      const baseName = fileName.replace(/\.pdf$/i, '');
      reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', buildAttachmentDisposition(`${baseName}-rotated.pdf`))
        .send(rotated);
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to rotate PDF. Please try again.' });
    }
  });

  // Delete Pages
  fastify.post('/api/pdf/delete-pages', async (request, reply) => {
    const parts = request.parts();
    let pdfBuffer: Buffer | null = null;
    let fileName = 'document.pdf';
    const fields: Record<string, any> = {};

    for await (const part of parts) {
      if (part.type === 'file') {
        fileName = part.filename || 'document.pdf';
        pdfBuffer = await part.toBuffer();
      } else {
        fields[part.fieldname] = part.value;
      }
    }

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return reply.status(400).send({ error: 'No PDF file uploaded.' });
    }

    if (!isPdfBuffer(pdfBuffer)) {
      return reply.status(400).send({ error: 'The uploaded file is not a valid PDF.' });
    }

    try {
      const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
      const totalPages = doc.getPageCount();
      const pagesToDelete = fields.pages ? parsePageNumbersListStrict(String(fields.pages), totalPages) : null;

      if (!pagesToDelete || pagesToDelete.length === 0) {
        return reply.status(400).send({ error: 'No pages specified for deletion.' });
      }

      const result = await PdfManageService.deletePages(pdfBuffer, pagesToDelete);
      const baseName = fileName.replace(/\.pdf$/i, '');
      reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', buildAttachmentDisposition(`${baseName}-pages-deleted.pdf`))
        .send(result);
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to delete pages. Please try again.' });
    }
  });

  // Reorder Pages
  fastify.post('/api/pdf/reorder-pages', async (request, reply) => {
    const parts = request.parts();
    let pdfBuffer: Buffer | null = null;
    let fileName = 'document.pdf';
    const fields: Record<string, any> = {};

    for await (const part of parts) {
      if (part.type === 'file') {
        fileName = part.filename || 'document.pdf';
        pdfBuffer = await part.toBuffer();
      } else {
        fields[part.fieldname] = part.value;
      }
    }

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return reply.status(400).send({ error: 'No PDF file uploaded.' });
    }

    if (!isPdfBuffer(pdfBuffer)) {
      return reply.status(400).send({ error: 'The uploaded file is not a valid PDF.' });
    }

    try {
      const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
      const totalPages = doc.getPageCount();
      let orderIndices: number[] = [];

      if (fields.order) {
        orderIndices = fields.order
          .split(',')
          .map((s: string) => parseInt(s.trim(), 10) - 1)
          .filter((idx: number) => !isNaN(idx) && idx >= 0 && idx < totalPages);
      }

      if (orderIndices.length === 0) {
        return reply.status(400).send({ error: 'Invalid page order sequence specified.' });
      }

      const result = await PdfManageService.reorderPages(pdfBuffer, orderIndices);
      const baseName = fileName.replace(/\.pdf$/i, '');
      reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', buildAttachmentDisposition(`${baseName}-reordered.pdf`))
        .send(result);
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to reorder pages. Please try again.' });
    }
  });
};
