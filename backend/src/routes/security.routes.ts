import { FastifyPluginAsync } from 'fastify';
import { SecurityService } from '../services/security.service.js';
import { WatermarkSchema } from '../utils/validator.js';

export const securityRoutes: FastifyPluginAsync = async (fastify) => {
  // Protect PDF
  fastify.post('/api/security/protect', async (request, reply) => {
    const parts = request.parts();
    let pdfBuffer: Buffer | null = null;
    let fileName = 'document.pdf';
    let password = '';
    const fields: Record<string, any> = {};

    for await (const part of parts) {
      if (part.type === 'file') {
        fileName = part.filename || 'document.pdf';
        pdfBuffer = await part.toBuffer();
      } else {
        fields[part.fieldname] = part.value;
        if (part.fieldname === 'password') password = String(part.value);
      }
    }

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return reply.status(400).send({ error: 'No PDF file uploaded.' });
    }

    if (!password || password.trim().length === 0) {
      return reply.status(400).send({ error: 'Password is required to protect the document.' });
    }

    if (password.length < 3) {
      return reply.status(400).send({ error: 'Password must be at least 3 characters long.' });
    }

    try {
      const protectedPdf = await SecurityService.protectPdf(pdfBuffer, password);
      const baseName = fileName.replace(/\.pdf$/i, '');
      reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', `attachment; filename="${baseName}-protected.pdf"`)
        .send(protectedPdf);
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to protect PDF: ' + err.message });
    }
  });

  // Unlock PDF
  fastify.post('/api/security/unlock', async (request, reply) => {
    const parts = request.parts();
    let pdfBuffer: Buffer | null = null;
    let fileName = 'document.pdf';
    let password = '';
    const fields: Record<string, any> = {};

    for await (const part of parts) {
      if (part.type === 'file') {
        fileName = part.filename || 'document.pdf';
        pdfBuffer = await part.toBuffer();
      } else {
        fields[part.fieldname] = part.value;
        if (part.fieldname === 'password') password = String(part.value);
      }
    }

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return reply.status(400).send({ error: 'No encrypted PDF file uploaded.' });
    }

    try {
      const unlockedPdf = await SecurityService.unlockPdf(pdfBuffer, password);
      const baseName = fileName.replace(/\.pdf$/i, '');
      reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', `attachment; filename="${baseName}-unlocked.pdf"`)
        .send(unlockedPdf);
    } catch (err: any) {
      return reply.status(401).send({ error: 'The password is incorrect or the document could not be decrypted.' });
    }
  });

  // Watermark PDF
  fastify.post('/api/security/watermark', async (request, reply) => {
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

    const validated = WatermarkSchema.safeParse(fields);
    if (!validated.success) {
      return reply.status(400).send({ error: 'Invalid watermark parameters: ' + validated.error.message });
    }

    try {
      const watermarked = await SecurityService.applyWatermark(pdfBuffer, validated.data);
      const baseName = fileName.replace(/\.pdf$/i, '');
      reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', `attachment; filename="${baseName}-watermarked.pdf"`)
        .send(watermarked);
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to apply watermark: ' + err.message });
    }
  });

  // Signature PDF
  fastify.post('/api/security/sign', async (request, reply) => {
    const parts = request.parts();
    let pdfBuffer: Buffer | null = null;
    let signatureBuffer: Buffer | null = null;
    let fileName = 'document.pdf';
    const fields: Record<string, any> = {};

    for await (const part of parts) {
      if (part.type === 'file') {
        if (part.fieldname === 'signature' || part.fieldname === 'signatureImage') {
          signatureBuffer = await part.toBuffer();
        } else {
          fileName = part.filename || 'document.pdf';
          pdfBuffer = await part.toBuffer();
        }
      } else {
        fields[part.fieldname] = part.value;
      }
    }

    // Support signature passed as base64 in fields
    if (!signatureBuffer && fields.signatureBase64) {
      const base64Data = fields.signatureBase64.replace(/^data:image\/\w+;base64,/, '');
      signatureBuffer = Buffer.from(base64Data, 'base64');
    }

    if (!pdfBuffer || !signatureBuffer) {
      return reply.status(400).send({ error: 'Both PDF file and signature image are required.' });
    }

    let placements = [
      {
        page: fields.page ? Number(fields.page) : 1,
        x: fields.x ? Number(fields.x) : 100,
        y: fields.y ? Number(fields.y) : 100,
        width: fields.width ? Number(fields.width) : 150,
        height: fields.height ? Number(fields.height) : 60,
      },
    ];

    if (fields.placements) {
      try {
        placements = typeof fields.placements === 'string' ? JSON.parse(fields.placements) : fields.placements;
      } catch {
        // use default placement
      }
    }

    try {
      const signedPdf = await SecurityService.applySignature(pdfBuffer, signatureBuffer, placements);
      const baseName = fileName.replace(/\.pdf$/i, '');
      reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', `attachment; filename="${baseName}-signed.pdf"`)
        .send(signedPdf);
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to apply signature: ' + err.message });
    }
  });
};
