import { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/health', async () => {
    return {
      status: 'ok',
      service: 'PDFKit Engine',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  });
};
