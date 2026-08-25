const API_BASE = import.meta.env.VITE_API_URL || '';

export class ApiClient {
  /**
   * Compress PDF with preset or target size
   */
  public static async compressPdf(
    file: File,
    level: string = 'medium',
    targetSizeMB?: number
  ): Promise<{
    blob: Blob;
    originalSizeBytes: number;
    compressedSizeBytes: number;
    reductionPercent: number;
    passes: number;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('level', level);
    if (targetSizeMB) {
      formData.append('targetSizeMB', targetSizeMB.toString());
    }

    const response = await fetch(`${API_BASE}/api/compress`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({ error: 'Compression failed' }));
      throw new Error(errJson.error || `Error ${response.status}: Failed to compress PDF`);
    }

    const originalSize = Number(response.headers.get('X-Original-Size')) || file.size;
    const compressedSize = Number(response.headers.get('X-Compressed-Size')) || 0;
    const reductionPercent = Number(response.headers.get('X-Reduction-Percent')) || 0;
    const passes = Number(response.headers.get('X-Passes')) || 1;

    const blob = await response.blob();
    return {
      blob,
      originalSizeBytes: originalSize,
      compressedSizeBytes: compressedSize || blob.size,
      reductionPercent: reductionPercent || Math.max(0, Math.round(((originalSize - blob.size) / originalSize) * 100)),
      passes,
    };
  }

  /**
   * Word DOCX to PDF
   */
  public static async convertDocxToPdf(file: File): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/api/convert/docx-to-pdf`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Conversion failed' }));
      throw new Error(err.error || 'Failed to convert DOCX to PDF');
    }

    return await response.blob();
  }

  /**
   * Text to PDF
   */
  public static async convertTextToPdf(params: {
    text: string;
    fontSize?: number;
    lineSpacing?: number;
    margin?: number;
    pageSize?: string;
    fontFamily?: string;
  }): Promise<Blob> {
    const response = await fetch(`${API_BASE}/api/convert/text-to-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Generation failed' }));
      throw new Error(err.error || 'Failed to generate PDF from text');
    }

    return await response.blob();
  }

  /**
   * Images to PDF
   */
  public static async convertImagesToPdf(
    files: File[],
    options: { pageSize?: string; fitMode?: string; margin?: number }
  ): Promise<Blob> {
    const formData = new FormData();
    for (const f of files) {
      formData.append('files', f);
    }
    if (options.pageSize) formData.append('pageSize', options.pageSize);
    if (options.fitMode) formData.append('fitMode', options.fitMode);
    if (options.margin !== undefined) formData.append('margin', options.margin.toString());

    const response = await fetch(`${API_BASE}/api/convert/images-to-pdf`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Conversion failed' }));
      throw new Error(err.error || 'Failed to convert images to PDF');
    }

    return await response.blob();
  }

  /**
   * PDF to Text extraction
   */
  public static async extractPdfText(file: File): Promise<{
    text: string;
    pageCount: number;
    wordCount: number;
    characterCount: number;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/api/convert/pdf-to-text`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Extraction failed' }));
      throw new Error(err.error || 'Failed to extract text from PDF');
    }

    return await response.json();
  }

  /**
   * Merge PDFs
   */
  public static async mergePdfs(files: File[]): Promise<Blob> {
    const formData = new FormData();
    for (const f of files) {
      formData.append('files', f);
    }

    const response = await fetch(`${API_BASE}/api/pdf/merge`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Merge failed' }));
      throw new Error(err.error || 'Failed to merge PDF files');
    }

    return await response.blob();
  }

  /**
   * Split PDF
   */
  public static async splitPdf(file: File, ranges: string, mode: 'single' | 'zip' = 'single'): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ranges', ranges);
    formData.append('mode', mode);

    const response = await fetch(`${API_BASE}/api/pdf/split`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Split failed' }));
      throw new Error(err.error || 'Failed to split PDF');
    }

    return await response.blob();
  }

  /**
   * Rotate PDF
   */
  public static async rotatePdf(file: File, rotations: Record<number, number>): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('rotations', JSON.stringify(rotations));

    const response = await fetch(`${API_BASE}/api/pdf/rotate`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Rotation failed' }));
      throw new Error(err.error || 'Failed to rotate PDF');
    }

    return await response.blob();
  }

  /**
   * Delete Pages
   */
  public static async deletePages(file: File, pageNumbers1Indexed: number[]): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pages', pageNumbers1Indexed.join(','));

    const response = await fetch(`${API_BASE}/api/pdf/delete-pages`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Deletion failed' }));
      throw new Error(err.error || 'Failed to delete pages');
    }

    return await response.blob();
  }

  /**
   * Reorder Pages
   */
  public static async reorderPages(file: File, order1Indexed: number[]): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('order', order1Indexed.join(','));

    const response = await fetch(`${API_BASE}/api/pdf/reorder-pages`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Reordering failed' }));
      throw new Error(err.error || 'Failed to reorder pages');
    }

    return await response.blob();
  }

  /**
   * Protect PDF
   */
  public static async protectPdf(file: File, password: string): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);

    const response = await fetch(`${API_BASE}/api/security/protect`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Protection failed' }));
      throw new Error(err.error || 'Failed to protect PDF');
    }

    return await response.blob();
  }

  /**
   * Unlock PDF
   */
  public static async unlockPdf(file: File, password?: string): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    if (password) formData.append('password', password);

    const response = await fetch(`${API_BASE}/api/security/unlock`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Unlock failed' }));
      throw new Error(err.error || 'The password is incorrect or decryption failed.');
    }

    return await response.blob();
  }

  /**
   * Watermark PDF
   */
  public static async watermarkPdf(
    file: File,
    options: {
      text: string;
      fontSize?: number;
      opacity?: number;
      rotation?: number;
      color?: string;
      pages?: 'all' | 'odd' | 'even';
    }
  ): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('text', options.text);
    if (options.fontSize) formData.append('fontSize', options.fontSize.toString());
    if (options.opacity !== undefined) formData.append('opacity', options.opacity.toString());
    if (options.rotation !== undefined) formData.append('rotation', options.rotation.toString());
    if (options.color) formData.append('color', options.color);
    if (options.pages) formData.append('pages', options.pages);

    const response = await fetch(`${API_BASE}/api/security/watermark`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Watermarking failed' }));
      throw new Error(err.error || 'Failed to apply watermark');
    }

    return await response.blob();
  }

  /**
   * Sign PDF
   */
  public static async signPdf(
    file: File,
    signatureBase64OrFile: string | File,
    placements: Array<{ page: number; x: number; y: number; width: number; height: number }>
  ): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);

    if (typeof signatureBase64OrFile === 'string') {
      formData.append('signatureBase64', signatureBase64OrFile);
    } else {
      formData.append('signature', signatureBase64OrFile);
    }

    formData.append('placements', JSON.stringify(placements));

    const response = await fetch(`${API_BASE}/api/security/sign`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Signing failed' }));
      throw new Error(err.error || 'Failed to apply signature to PDF');
    }

    return await response.blob();
  }
}
