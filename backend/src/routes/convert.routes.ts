import { FastifyPluginAsync } from 'fastify';
import { DocxConverter } from '../converters/docx-converter.js';
import { TextConverter } from '../converters/text-converter.js';
import { ImageConverter } from '../converters/image-converter.js';
import { PdfManageService } from '../services/pdf-manage.service.js';
import { ImagesToPdfSchema } from '../utils/validator.js';
import { buildAttachmentDisposition } from '../utils/download.js';
import { isPdfBuffer, isDocxPackageBuffer, getSupportedImageType } from '../utils/file-validation.js';

export const convertRoutes: FastifyPluginAsync = async (fastify) => {
  // Word to PDF
  fastify.post('/api/convert/docx-to-pdf', async (request, reply) => {
    const parts = request.parts();
    let docxBuffer: Buffer | null = null;
    let fileName = 'document.pdf';

    for await (const part of parts) {
      if (part.type === 'file') {
        fileName = (part.filename || 'document').replace(/\.docx$/i, '') + '.pdf';
        docxBuffer = await part.toBuffer();
      }
    }

    if (!docxBuffer || docxBuffer.length === 0) {
      return reply.status(400).send({ error: 'No valid DOCX file uploaded.' });
    }

    if (!isDocxPackageBuffer(docxBuffer)) {
      return reply.status(400).send({ error: 'The uploaded file is not a valid DOCX package.' });
    }

    try {
      const pdfBuffer = await DocxConverter.convertToPdf(docxBuffer);
      reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', buildAttachmentDisposition(fileName))
        .send(pdfBuffer);
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to convert DOCX to PDF. Please try again.' });
    }
  });

  // Text to PDF
  fastify.post('/api/convert/text-to-pdf', async (request, reply) => {
    let body: any = request.body;

    // Handle multipart or JSON
    if (request.isMultipart()) {
      const parts = request.parts();
      let textContent = '';
      const fields: Record<string, any> = {};

      for await (const part of parts) {
        if (part.type === 'file') {
          const buf = await part.toBuffer();
          textContent = buf.toString('utf-8');
        } else {
          fields[part.fieldname] = part.value;
        }
      }
      body = { text: fields.text || textContent, ...fields };
    }

    if (!body || !body.text) {
      return reply.status(400).send({ error: 'Text content is required.' });
    }

    try {
      const pdfBuffer = await TextConverter.convertToPdf({
        text: body.text,
        fontSize: body.fontSize ? Number(body.fontSize) : 11,
        lineSpacing: body.lineSpacing ? Number(body.lineSpacing) : 1.3,
        margin: body.margin ? Number(body.margin) : 50,
        pageSize: body.pageSize || 'a4',
        fontFamily: body.fontFamily || 'Helvetica',
      });

      reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', buildAttachmentDisposition('document.pdf'))
        .send(pdfBuffer);
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to generate PDF from text. Please try again.' });
    }
  });

  // Images to PDF
  fastify.post('/api/convert/images-to-pdf', async (request, reply) => {
    const parts = request.parts();
    const imageList: Array<{ buffer: Buffer; mimeType?: string }> = [];
    const fields: Record<string, any> = {};

    for await (const part of parts) {
      if (part.type === 'file') {
        const buf = await part.toBuffer();
        const detectedType = getSupportedImageType(buf);
        if (!detectedType) {
          return reply.status(400).send({ error: 'Only valid JPEG, PNG, and WebP images are supported.' });
        }
        imageList.push({ buffer: buf, mimeType: detectedType });
      } else {
        fields[part.fieldname] = part.value;
      }
    }

    if (imageList.length === 0) {
      return reply.status(400).send({ error: 'No image files uploaded.' });
    }

    const validated = ImagesToPdfSchema.safeParse(fields);
    if (!validated.success) {
      return reply.status(400).send({ error: 'Invalid image-to-PDF parameters.' });
    }
    const options = validated.data;

    try {
      const pdfBuffer = await ImageConverter.imagesToPdf(imageList, options);
      reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', buildAttachmentDisposition('images-combined.pdf'))
        .send(pdfBuffer);
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to convert images to PDF. Please try again.' });
    }
  });

  // PDF to Text
  fastify.post('/api/convert/pdf-to-text', async (request, reply) => {
    const parts = request.parts();
    let pdfBuffer: Buffer | null = null;

    for await (const part of parts) {
      if (part.type === 'file') {
        pdfBuffer = await part.toBuffer();
      }
    }

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return reply.status(400).send({ error: 'No valid PDF file uploaded.' });
    }

    if (!isPdfBuffer(pdfBuffer)) {
      return reply.status(400).send({ error: 'The uploaded file is not a valid PDF.' });
    }

    try {
      const result = await PdfManageService.extractText(pdfBuffer);
      return reply.send({
        success: true,
        ...result,
      });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to extract text from PDF. Please try again.' });
    }
  });
};
