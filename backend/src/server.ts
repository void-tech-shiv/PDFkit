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

export function getAllowedOrigins(): string[] {
  const configured = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (configured.length === 0) {
    throw new Error('CORS_ORIGIN must contain at least one explicit http(s) origin.');
  }

  return [...new Set(configured.map((value) => {
    if (value === '*') {
      throw new Error('CORS_ORIGIN entries must be exact http(s) origins without paths or credentials: *');
    }

    let parsed: URL;
    try {
      parsed = new URL(value);
    } catch {
      throw new Error(`Invalid CORS_ORIGIN entry: ${value}`);
    }

    if (
      !['http:', 'https:'].includes(parsed.protocol) ||
      parsed.origin === 'null' ||
      parsed.username ||
      parsed.password ||
      parsed.pathname !== '/' ||
      parsed.search ||
      parsed.hash
    ) {
      throw new Error(`CORS_ORIGIN entries must be exact http(s) origins without paths or credentials: ${value}`);
    }

    return parsed.origin;
  }))];
}

function getMaxFileSizeBytes(): number {
  const configured = Number(process.env.MAX_FILE_SIZE_MB ?? 100);
  if (!Number.isSafeInteger(configured) || configured < 1 || configured > 1024) {
    throw new Error('MAX_FILE_SIZE_MB must be a whole number between 1 and 1024.');
  }
  return configured * 1024 * 1024;
}

export async function buildServer() {
  const maxFileSizeBytes = getMaxFileSizeBytes();
  const allowedOrigins = getAllowedOrigins();

  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
    },
    bodyLimit: maxFileSizeBytes,
  });

  // Exact allowlist; do not reflect arbitrary request origins.
  await fastify.register(cors, {
    origin: allowedOrigins,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposedHeaders: [
      'Content-Disposition',
      'X-Original-Size',
      'X-Compressed-Size',
      'X-Reduction-Percent',
      'X-Passes',
    ],
    maxAge: 600,
  });

  // Multipart file upload support with explicit size/count limits.
  await fastify.register(multipart, {
    limits: {
      fileSize: maxFileSizeBytes,
      files: 20,
      fields: 100,
      parts: 120,
    },
  });

  await fastify.register(healthRoutes);
  await fastify.register(compressRoutes);
  await fastify.register(convertRoutes);
  await fastify.register(manageRoutes);
  await fastify.register(securityRoutes);

  // Serve static frontend files if production build exists.
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

  // Avoid returning internal exception details to API clients.
  fastify.setErrorHandler((error: any, request, reply) => {
    fastify.log.error(error);
    const statusCode = Number.isInteger(error.statusCode) && error.statusCode >= 400 && error.statusCode < 600
      ? error.statusCode
      : 500;
    const message = statusCode >= 500
      ? 'An unexpected internal error occurred.'
      : error.message || 'The request could not be processed.';

    reply.status(statusCode).send({
      error: message,
      statusCode,
    });
  });

  return fastify;
}

if (process.env.NODE_ENV !== 'test') {
  buildServer()
    .then((server) => {
      server.listen({ port: PORT, host: HOST }, (err, address) => {
        if (err) {
          console.error('Failed to start PDFKit Server:', err);
          process.exit(1);
        }
        console.log(`PDFKit Engine listening on ${address}`);
      });
    })
    .catch((err) => {
      console.error('Fatal initialization error:', err);
      process.exit(1);
    });
}
