import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

import { compressRoutes } from './routes/compress.routes.js';
import { convertRoutes } from './routes/convert.routes.js';
import { manageRoutes } from './routes/manage.routes.js';
import { securityRoutes } from './routes/security.routes.js';
import { healthRoutes } from './routes/health.routes.js';

dotenv.config();

const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || '0.0.0.0';
const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB || 100);

export async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
    },
    bodyLimit: MAX_FILE_SIZE_MB * 1024 * 1024,
  });

  // CORS configuration
  await fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposedHeaders: [
      'Content-Disposition',
      'X-Original-Size',
      'X-Compressed-Size',
      'X-Reduction-Percent',
      'X-Passes',
    ],
  });

  // Multipart file upload support
  await fastify.register(multipart, {
    limits: {
      fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
      files: 50,
    },
  });

  // Register API Routes
  await fastify.register(healthRoutes);
  await fastify.register(compressRoutes);
  await fastify.register(convertRoutes);
  await fastify.register(manageRoutes);
  await fastify.register(securityRoutes);

  // Serve static frontend files if production build exists
  const publicDir = path.resolve('./public');
  const frontendDistDir = path.resolve('../frontend/dist');
  const staticPath = fs.existsSync(publicDir)
    ? publicDir
    : fs.existsSync(frontendDistDir)
    ? frontendDistDir
    : null;

  if (staticPath) {
    await fastify.register(fastifyStatic, {
      root: staticPath,
      prefix: '/',
      wildcard: false,
    });

    fastify.setNotFoundHandler((req, reply) => {
      if (req.raw.url && req.raw.url.startsWith('/api')) {
        return reply.status(404).send({ error: 'Endpoint not found' });
      }
      return reply.sendFile('index.html');
    });
  }

  // Global Error Handler
  fastify.setErrorHandler((error: any, request, reply) => {
    fastify.log.error(error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'An unexpected internal error occurred.';
    reply.status(statusCode).send({
      error: message,
      statusCode,
    });
  });

  return fastify;
}

// Start standalone server
if (process.env.NODE_ENV !== 'test') {
  buildServer()
    .then((server) => {
      server.listen({ port: PORT, host: HOST }, (err, address) => {
        if (err) {
          console.error('Failed to start PDFKit Server:', err);
          process.exit(1);
        }
        console.log(`🚀 PDFKit Engine listening on ${address}`);
      });
    })
    .catch((err) => {
      console.error('Fatal initialization error:', err);
      process.exit(1);
    });
}
