import { FastifyPluginAsync } from 'fastify';
import { PdfManageService } from '../services/pdf-manage.service.js';
import { parsePageRangeString, parsePageNumbersList } from '../utils/validator.js';
import { PDFDocument } from 'pdf-lib';

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

    if (pdfBuffers.length < 2) {
      return reply.status(400).send({ error: 'Please upload at least 2 PDF files to merge.' });
    }

    try {
      const merged = await PdfManageService.mergePdfs(pdfBuffers);
      reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', `attachment; filename="${firstFileName}-merged.pdf"`)
        .send(merged);
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to merge PDFs: ' + err.message });
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

    try {
      const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
      const totalPages = srcDoc.getPageCount();
      const ranges = fields.ranges || `1-${totalPages}`;
      const mode = fields.mode === 'zip' ? 'zip' : 'single';

      const pageIndices = parsePageRangeString(ranges, totalPages);
      if (pageIndices.length === 0) {
        return reply.status(400).send({ error: 'Selected page range is invalid or empty.' });
      }

      const result = await PdfManageService.splitPdf(pdfBuffer, pageIndices, mode);
      const baseName = fileName.replace(/\.pdf$/i, '');

      if (mode === 'zip') {
        reply
          .header('Content-Type', 'application/zip')
          .header('Content-Disposition', `attachment; filename="${baseName}-pages.zip"`)
          .send(result);
      } else {
        reply
          .header('Content-Type', 'application/pdf')
          .header('Content-Disposition', `attachment; filename="${baseName}-split.pdf"`)
          .send(result);
      }
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to split PDF: ' + err.message });
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

    try {
      let rotations: Record<number, number> = {};
      if (fields.rotations) {
        try {
          rotations = typeof fields.rotations === 'string' ? JSON.parse(fields.rotations) : fields.rotations;
        } catch {
          // If scalar angle passed e.g. angle=90 for all pages
          const angle = parseInt(fields.rotations || fields.angle || '90', 10);
          const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
          for (let i = 0; i < doc.getPageCount(); i++) {
            rotations[i] = angle;
          }
        }
      }

      const rotated = await PdfManageService.rotatePdf(pdfBuffer, rotations);
      const baseName = fileName.replace(/\.pdf$/i, '');
      reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', `attachment; filename="${baseName}-rotated.pdf"`)
        .send(rotated);
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to rotate PDF: ' + err.message });
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

    try {
      const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
      const totalPages = doc.getPageCount();
      const pagesToDelete = fields.pages ? parsePageNumbersList(fields.pages, totalPages) : [];

      if (pagesToDelete.length === 0) {
        return reply.status(400).send({ error: 'No pages specified for deletion.' });
      }

      const result = await PdfManageService.deletePages(pdfBuffer, pagesToDelete);
      const baseName = fileName.replace(/\.pdf$/i, '');
      reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', `attachment; filename="${baseName}-pages-deleted.pdf"`)
        .send(result);
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to delete pages: ' + err.message });
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
        .header('Content-Disposition', `attachment; filename="${baseName}-reordered.pdf"`)
        .send(result);
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to reorder pages: ' + err.message });
    }
  });
};
