import { FastifyPluginAsync } from 'fastify';
import { DocxConverter } from '../converters/docx-converter.js';
import { TextConverter } from '../converters/text-converter.js';
import { ImageConverter } from '../converters/image-converter.js';
import { PdfManageService } from '../services/pdf-manage.service.js';
import { ImagesToPdfSchema } from '../utils/validator.js';

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

    try {
      const pdfBuffer = await DocxConverter.convertToPdf(docxBuffer);
      reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', `attachment; filename="${fileName}"`)
        .send(pdfBuffer);
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to convert DOCX to PDF: ' + err.message });
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
        .header('Content-Disposition', 'attachment; filename="document.pdf"')
        .send(pdfBuffer);
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to generate PDF from text: ' + err.message });
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
        imageList.push({ buffer: buf, mimeType: part.mimetype });
      } else {
        fields[part.fieldname] = part.value;
      }
    }

    if (imageList.length === 0) {
      return reply.status(400).send({ error: 'No image files uploaded.' });
    }

    const validated = ImagesToPdfSchema.safeParse(fields);
    const options = validated.success
      ? validated.data
      : { pageSize: 'a4' as const, fitMode: 'contain' as const, margin: 20 };

    try {
      const pdfBuffer = await ImageConverter.imagesToPdf(imageList, options);
      reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', 'attachment; filename="images-combined.pdf"')
        .send(pdfBuffer);
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to convert images to PDF: ' + err.message });
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

    try {
      const result = await PdfManageService.extractText(pdfBuffer);
      return reply.send({
        success: true,
        ...result,
      });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to extract text from PDF: ' + err.message });
    }
  });
};
