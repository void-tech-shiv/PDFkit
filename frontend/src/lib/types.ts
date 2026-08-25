export type ToolCategory = 'all' | 'convert' | 'organize' | 'optimize' | 'security';

export interface ToolDefinition {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: ToolCategory;
  path: string;
  iconName: string;
  badge?: string;
  popular?: boolean;
  acceptedFormats: string[];
  maxFiles?: number;
}

export interface CompressionResultData {
  originalSizeBytes: number;
  compressedSizeBytes: number;
  reductionPercent: number;
  passes: number;
  status: string;
  downloadUrl?: string;
  blob?: Blob;
  fileName?: string;
}

export type ProcessingState = 'idle' | 'configuring' | 'uploading' | 'processing' | 'success' | 'error';
