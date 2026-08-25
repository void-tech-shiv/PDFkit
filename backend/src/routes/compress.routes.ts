import { FastifyPluginAsync } from 'fastify';
import { PdfCompressionEngine } from '../compression/compressor.js';
import { CompressRequestSchema } from '../utils/validator.js';

export const compressRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/api/compress', async (request, reply) => {
    const parts = request.parts();
    let pdfBuffer: Buffer | null = null;
    let fileName = 'compressed.pdf';
    const fields: Record<string, any> = {};

    for await (const part of parts) {
      if (part.type === 'file') {
        fileName = part.filename || 'compressed.pdf';
        pdfBuffer = await part.toBuffer();
      } else {
        fields[part.fieldname] = part.value;
      }
    }

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return reply.status(400).send({ error: 'No valid PDF file uploaded.' });
    }

    const validated = CompressRequestSchema.safeParse(fields);
    const options = validated.success
      ? validated.data
      : { level: 'medium' as const, targetSizeMB: undefined };

    try {
      const result = await PdfCompressionEngine.compress(pdfBuffer, options);

      // Check if client expects JSON metadata or binary PDF
      const accept = request.headers['accept'] || '';
      const wantsJson = (fields['returnJson'] === 'true') || accept.includes('application/json');

      if (wantsJson) {
        return reply.send({
          success: true,
          originalSizeBytes: result.originalSizeBytes,
          compressedSizeBytes: result.compressedSizeBytes,
          reductionPercent: result.reductionPercent,
          passes: result.passes,
          status: result.status,
          passDetails: result.passDetails,
          pdfBase64: result.buffer.toString('base64'),
        });
      }

      // Return PDF binary stream with headers
      const baseName = fileName.replace(/\.pdf$/i, '');
      reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', `attachment; filename="${baseName}-compressed.pdf"`)
        .header('X-Original-Size', result.originalSizeBytes.toString())
        .header('X-Compressed-Size', result.compressedSizeBytes.toString())
        .header('X-Reduction-Percent', result.reductionPercent.toString())
        .header('X-Passes', result.passes.toString())
        .send(result.buffer);
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Failed to compress PDF. ' + err.message });
    }
  });
};
