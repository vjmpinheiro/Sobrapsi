import "server-only";

import sharp from "sharp";

export const IMAGE_UPLOAD_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const DEFAULT_QUALITY = 82;

export function isImageMimeType(mime: string) {
  return (IMAGE_UPLOAD_MIME_TYPES as readonly string[]).includes(mime);
}

export interface ConvertToWebpOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export async function convertImageBufferToWebp(
  input: Buffer,
  options: ConvertToWebpOptions = {}
): Promise<Buffer> {
  const { maxWidth, maxHeight, quality = DEFAULT_QUALITY } = options;

  let pipeline = sharp(input).rotate();

  if (maxWidth || maxHeight) {
    pipeline = pipeline.resize({
      width: maxWidth,
      height: maxHeight,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  return pipeline.webp({ quality }).toBuffer();
}
