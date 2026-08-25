import { z } from 'zod';

export const CompressionLevelEnum = z.enum(['low', 'medium', 'high', 'extreme']);
export type CompressionLevel = z.infer<typeof CompressionLevelEnum>;

export const CompressRequestSchema = z.object({
  level: CompressionLevelEnum.default('medium'),
  targetSizeMB: z.coerce.number().positive().max(1000).optional(),
});

export const SplitRequestSchema = z.object({
  ranges: z.string().min(1),
  mode: z.enum(['single', 'zip']).default('single'),
});

export const PageSizeEnum = z.enum(['a4', 'letter', 'fit']);
export const FitModeEnum = z.enum(['contain', 'cover', 'stretch']);

export const ImagesToPdfSchema = z.object({
  pageSize: PageSizeEnum.default('a4'),
  fitMode: FitModeEnum.default('contain'),
  margin: z.coerce.number().min(0).max(100).default(20),
});

export const PdfToImagesSchema = z.object({
  format: z.enum(['png', 'jpeg', 'webp']).default('png'),
  dpi: z.coerce.number().int().min(50).max(600).default(150),
  quality: z.coerce.number().min(10).max(100).default(85),
});

export const WatermarkSchema = z.object({
  text: z.string().min(1).max(200),
  fontSize: z.coerce.number().min(8).max(144).default(48),
  opacity: z.coerce.number().min(0.05).max(1).default(0.3),
  rotation: z.coerce.number().min(-180).max(180).default(45),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).default('#64748b'),
  pages: z.enum(['all', 'odd', 'even']).default('all'),
});

export const SignaturePlacementSchema = z.object({
  page: z.number().int().positive(),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
});

export const SignatureSchema = z.object({
  placements: z.array(SignaturePlacementSchema).min(1),
});

/**
 * Parses page ranges string e.g. "1-3, 5, 8-10" into 0-indexed page numbers
 */
export function parsePageRangeString(rangeStr: string, totalPages: number): number[] {
  const result = new Set<number>();
  const parts = rangeStr.split(',').map(p => p.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map(s => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(totalPages, Math.max(start, end));
        for (let i = min; i <= max; i++) {
          result.add(i - 1);
        }
      }
    } else {
      const page = parseInt(part, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        result.add(page - 1);
      }
    }
  }

  return Array.from(result).sort((a, b) => a - b);
}

/**
 * Parses comma separated page numbers (1-indexed) into 0-indexed array
 */
export function parsePageNumbersList(pagesStr: string, totalPages: number): number[] {
  return pagesStr
    .split(',')
    .map(p => parseInt(p.trim(), 10))
    .filter(p => !isNaN(p) && p >= 1 && p <= totalPages)
    .map(p => p - 1);
}
