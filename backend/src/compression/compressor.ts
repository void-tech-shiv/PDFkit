import { PDFDocument, PDFName, PDFRawStream, PDFDict, PDFNumber, PDFArray } from 'pdf-lib';
import sharp from 'sharp';
import { CompressionLevel } from '../utils/validator.js';

export interface CompressionProfile {
  maxDimension: number;
  jpegQuality: number;
  dpi: number;
  stripMetadata: boolean;
}

export const COMPRESSION_PROFILES: Record<CompressionLevel, CompressionProfile> = {
  low: {
    maxDimension: 2400,
    jpegQuality: 85,
    dpi: 220,
    stripMetadata: false,
  },
  medium: {
    maxDimension: 1800,
    jpegQuality: 72,
    dpi: 150,
    stripMetadata: true,
  },
  high: {
    maxDimension: 1200,
    jpegQuality: 52,
    dpi: 100,
    stripMetadata: true,
  },
  extreme: {
    maxDimension: 850,
    jpegQuality: 35,
    dpi: 72,
    stripMetadata: true,
  },
};

export interface CompressionResult {
  originalSizeBytes: number;
  compressedSizeBytes: number;
  reductionPercent: number;
  passes: number;
  buffer: Buffer;
  status: 'target_achieved' | 'optimal_limit_reached' | 'completed';
  passDetails: Array<{ pass: number; sizeBytes: number; reductionPercent: number }>;
}

export class PdfCompressionEngine {
  /**
   * Optimize embedded images and streams in a PDF document using Sharp and PDF-lib
   */
  public static async compressPass(
    pdfBuffer: Buffer,
    profile: CompressionProfile
  ): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer, {
        ignoreEncryption: true,
        updateMetadata: false,
      });

      const context = pdfDoc.context;
      const indirectObjects = context.enumerateIndirectObjects();

      // Iterate through all PDF objects and locate image streams
      for (const [, object] of indirectObjects) {
        if (object instanceof PDFRawStream) {
          const dict = object.dict;
          const subtype = dict.get(PDFName.of('Subtype'));
          const type = dict.get(PDFName.of('Type'));

          const isImage =
            subtype === PDFName.of('Image') ||
            (type === PDFName.of('XObject') && subtype === PDFName.of('Image'));

          if (isImage) {
            try {
              const rawBytes = object.getContents();
              if (!rawBytes || rawBytes.length < 1024) continue; // Skip tiny icons/masks

              // Check if Sharp can decode this stream
              const imageMetadata = await sharp(rawBytes).metadata().catch(() => null);
              if (imageMetadata && imageMetadata.width && imageMetadata.height) {
                const origWidth = imageMetadata.width;
                const origHeight = imageMetadata.height;

                // Determine resize dimensions
                let targetWidth = origWidth;
                let targetHeight = origHeight;

                if (origWidth > profile.maxDimension || origHeight > profile.maxDimension) {
                  if (origWidth >= origHeight) {
                    targetWidth = profile.maxDimension;
                    targetHeight = Math.round((origHeight / origWidth) * profile.maxDimension);
                  } else {
                    targetHeight = profile.maxDimension;
                    targetWidth = Math.round((origWidth / origHeight) * profile.maxDimension);
                  }
                }

                // Compress using Sharp MozJPEG
                const compressedImgBuffer = await sharp(rawBytes)
                  .resize(targetWidth, targetHeight, {
                    fit: 'inside',
                    withoutEnlargement: true,
                    kernel: sharp.kernel.lanczos3,
                  })
                  .jpeg({
                    quality: profile.jpegQuality,
                    mozjpeg: true,
                    chromaSubsampling: '4:2:0',
                  })
                  .toBuffer();

                // Only replace if compressed is actually smaller
                if (compressedImgBuffer.length < rawBytes.length) {
                  // Update stream object contents and dictionary reference
                  (object as any).contents = new Uint8Array(compressedImgBuffer);
                  dict.set(PDFName.of('Filter'), PDFName.of('DCTDecode'));
                  dict.set(PDFName.of('Width'), PDFNumber.of(targetWidth));
                  dict.set(PDFName.of('Height'), PDFNumber.of(targetHeight));
                  dict.set(PDFName.of('Length'), PDFNumber.of(compressedImgBuffer.length));
                  dict.set(PDFName.of('ColorSpace'), PDFName.of('DeviceRGB'));
                  dict.set(PDFName.of('BitsPerComponent'), PDFNumber.of(8));
                }
              }
            } catch {
              // Gracefully skip unparseable custom image streams
            }
          }
        }
      }

      // Metadata removal if requested
      if (profile.stripMetadata) {
        try {
          const catalog = pdfDoc.catalog;
          catalog.delete(PDFName.of('Metadata'));
          catalog.delete(PDFName.of('PieceInfo'));
          catalog.delete(PDFName.of('Thumb'));
        } catch {
          // Ignore catalog metadata removal errors
        }
      }

      // Save with object streams and maximum compression
      const outputBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      return Buffer.from(outputBytes);
    } catch {
      // Fallback: If deep manipulation fails due to PDF syntax intricacies, return original
      return pdfBuffer;
    }
  }

  /**
   * Main Compression Flow (Presets or Multi-Pass Target Size)
   */
  public static async compress(
    inputBuffer: Buffer,
    options: { level?: CompressionLevel; targetSizeMB?: number }
  ): Promise<CompressionResult> {
    const originalSizeBytes = inputBuffer.length;
    const passDetails: Array<{ pass: number; sizeBytes: number; reductionPercent: number }> = [];

    // Target size multi-pass mode
    if (options.targetSizeMB && options.targetSizeMB > 0) {
      const targetSizeBytes = options.targetSizeMB * 1024 * 1024;

      // If already smaller than target, return as-is
      if (originalSizeBytes <= targetSizeBytes) {
        return {
          originalSizeBytes,
          compressedSizeBytes: originalSizeBytes,
          reductionPercent: 0,
          passes: 0,
          buffer: inputBuffer,
          status: 'target_achieved',
          passDetails: [{ pass: 0, sizeBytes: originalSizeBytes, reductionPercent: 0 }],
        };
      }

      let currentBuffer = inputBuffer;
      let currentSize = originalSizeBytes;
      const maxPasses = 5;

      // Progressive profile stepping
      const profiles: CompressionProfile[] = [
        { maxDimension: 1800, jpegQuality: 75, dpi: 150, stripMetadata: true },
        { maxDimension: 1400, jpegQuality: 60, dpi: 120, stripMetadata: true },
        { maxDimension: 1000, jpegQuality: 48, dpi: 96, stripMetadata: true },
        { maxDimension: 800, jpegQuality: 38, dpi: 72, stripMetadata: true },
        { maxDimension: 600, jpegQuality: 28, dpi: 60, stripMetadata: true },
      ];

      let passCount = 0;
      let status: 'target_achieved' | 'optimal_limit_reached' = 'optimal_limit_reached';

      for (let i = 0; i < maxPasses; i++) {
        passCount++;
        const profile = profiles[i];
        const resultBuffer = await this.compressPass(inputBuffer, profile);
        const newSize = resultBuffer.length;

        // If compression helped, accept it
        if (newSize < currentSize) {
          currentBuffer = resultBuffer;
          currentSize = newSize;
        }

        const reduction = Math.max(0, ((originalSizeBytes - currentSize) / originalSizeBytes) * 100);
        passDetails.push({
          pass: passCount,
          sizeBytes: currentSize,
          reductionPercent: parseFloat(reduction.toFixed(1)),
        });

        // Check if target is achieved
        if (currentSize <= targetSizeBytes) {
          status = 'target_achieved';
          break;
        }
      }

      const finalReduction = Math.max(0, ((originalSizeBytes - currentSize) / originalSizeBytes) * 100);

      return {
        originalSizeBytes,
        compressedSizeBytes: currentSize,
        reductionPercent: parseFloat(finalReduction.toFixed(1)),
        passes: passCount,
        buffer: currentBuffer,
        status,
        passDetails,
      };
    }

    // Standard Preset Mode
    const level = options.level || 'medium';
    const profile = COMPRESSION_PROFILES[level];
    const compressedBuffer = await this.compressPass(inputBuffer, profile);
    const compressedSizeBytes = compressedBuffer.length;
    const reductionPercent = Math.max(
      0,
      parseFloat((((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) * 100).toFixed(1))
    );

    passDetails.push({
      pass: 1,
      sizeBytes: compressedSizeBytes,
      reductionPercent,
    });

    return {
      originalSizeBytes,
      compressedSizeBytes,
      reductionPercent,
      passes: 1,
      buffer: compressedBuffer,
      status: 'completed',
      passDetails,
    };
  }
}
