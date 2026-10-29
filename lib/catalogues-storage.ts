import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

export interface CatalogueMetadata {
  brandId: string;
  brandName: string;
  originalFilename: string;
  s3Key: string;
  contentType: string;
  expectedBytes: number;
  sha256: string;
}

export const CATALOGUES_REGISTRY: Record<string, CatalogueMetadata> = {
  'ADIDAS CATALOGUE- N.pdf': {
    brandId: 'adidas',
    brandName: 'Adidas',
    originalFilename: 'ADIDAS CATALOGUE- N.pdf',
    s3Key: 'catalogues/adidas-catalogue-n.pdf',
    contentType: 'application/pdf',
    expectedBytes: 8517038,
    sha256: '83d25466cf61fa1beef4148e76aa4ae10c48f5078513584dd3368d5d813563d3',
  },
  'First Leaf T-Shirt Catalogue.pdf': {
    brandId: 'first-leaf',
    brandName: 'First Leaf',
    originalFilename: 'First Leaf T-Shirt Catalogue.pdf',
    s3Key: 'catalogues/first-leaf-t-shirt-catalogue.pdf',
    contentType: 'application/pdf',
    expectedBytes: 42037135,
    sha256: '40d4e50311fba1a1a588a1d514a461ae45108c75292d70b8f9af0a09438dc2b4',
  },
  'Jack&Jones_VeroModa - T-shirt  29.1.25.pdf': {
    brandId: 'jack-jones-veromoda',
    brandName: 'Jack & Jones / Vero Moda (T-Shirts)',
    originalFilename: 'Jack&Jones_VeroModa - T-shirt  29.1.25.pdf',
    s3Key: 'catalogues/jack-jones-veromoda-t-shirt-29-1-25.pdf',
    contentType: 'application/pdf',
    expectedBytes: 5239014,
    sha256: 'e360fab4c4e920333565983d5df39afe56659cfa7d13b84d157617335430c209',
  },
  'LEVIS PDF.pdf': {
    brandId: 'levis',
    brandName: "Levi's",
    originalFilename: 'LEVIS PDF.pdf',
    s3Key: 'catalogues/levis-pdf.pdf',
    contentType: 'application/pdf',
    expectedBytes: 54928452,
    sha256: 'b5663cc9f3b834d82b2333a2dccadce7275a1e2936cf0269894de59567f6ebb2',
  },
  'REEBOK 2026-27 Catalogue.pdf': {
    brandId: 'reebok',
    brandName: 'Reebok',
    originalFilename: 'REEBOK 2026-27 Catalogue.pdf',
    s3Key: 'catalogues/reebok-2026-27-catalogue.pdf',
    contentType: 'application/pdf',
    expectedBytes: 4140677,
    sha256: '050cae8587ed71403fbdf899875858ac4c146bce1ec5f500f15120971cb9b0dc',
  },
  'Rare Rabbit Curated Lookbook.pdf': {
    brandId: 'rare-rabbit',
    brandName: 'Rare Rabbit',
    originalFilename: 'Rare Rabbit Curated Lookbook.pdf',
    s3Key: 'catalogues/rare-rabbit-curated-lookbook.pdf',
    contentType: 'application/pdf',
    expectedBytes: 64474977,
    sha256: 'fdf6b1f13cd9748a8dbe0820719b0be646d0ae708d2e3e0cd8872c672fa6ae32',
  },
  'SKECHERS -Jackets & Hoodies.pdf': {
    brandId: 'skechers',
    brandName: 'Skechers',
    originalFilename: 'SKECHERS -Jackets & Hoodies.pdf',
    s3Key: 'catalogues/skechers-jackets-hoodies.pdf',
    contentType: 'application/pdf',
    expectedBytes: 1307356,
    sha256: 'a41c378a2f32c8395bcf6dc25594154f65afd3aacb0e3d8fbfe76debe660f1dc',
  },
  'UBIQ June Catalog_compressed.pdf': {
    brandId: 'ubiq',
    brandName: 'UBIQ',
    originalFilename: 'UBIQ June Catalog_compressed.pdf',
    s3Key: 'catalogues/ubiq-june-catalog-compressed.pdf',
    contentType: 'application/pdf',
    expectedBytes: 7952997,
    sha256: 'af89bfedeaeb9a16ce3ffc02a66cafa06ee394560dd08fac3d479e899b0f998e',
  },
  'jack & jones.pdf': {
    brandId: 'jack-jones-veromoda',
    brandName: 'Jack & Jones (Core)',
    originalFilename: 'jack & jones.pdf',
    s3Key: 'catalogues/jack-and-jones-core.pdf',
    contentType: 'application/pdf',
    expectedBytes: 2791336,
    sha256: '47f8c2a20376d861b985b6fc298b4536724ea7eadc20b5295e93a8805313440a',
  },
};

const endpoint = process.env.AWS_ENDPOINT_URL_S3;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION || 'ap-southeast-1';
const bucketName = process.env.NEON_STORAGE_BUCKET || process.env.S3_BUCKET_NAME || 'assets';

export const catalogueS3Client = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || '',
  },
  forcePathStyle: true,
});

export function getCatalogueMeta(filename: string): CatalogueMetadata | null {
  if (!filename) return null;
  let decoded = filename;
  try {
    decoded = decodeURIComponent(filename);
  } catch {
    // If decodeURIComponent fails due to malformed URI sequence, keep raw
  }
  const safe = path.basename(decoded);
  return CATALOGUES_REGISTRY[safe] || CATALOGUES_REGISTRY[filename] || null;
}


export function isAllowedCatalogue(filename: string): boolean {
  return getCatalogueMeta(filename) !== null;
}

export async function getCatalogueSignedUrl(filename: string, expiresIn: number = 3600): Promise<string | null> {
  const meta = getCatalogueMeta(filename);
  if (!meta) return null;

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: meta.s3Key,
    ResponseContentType: meta.contentType,
    ResponseContentDisposition: `inline; filename="${encodeURIComponent(meta.originalFilename)}"`,
  });

  return getSignedUrl(catalogueS3Client, command, { expiresIn });
}

export interface CatalogueStreamResult {
  stream: ReadableStream<Uint8Array>;
  contentLength: number;
  contentRange?: string;
  statusCode: 200 | 206;
  contentType: string;
  source: 's3' | 'fallback';
  originalFilename: string;
}

export type FetchCatalogueResult =
  | { type: 'success'; data: CatalogueStreamResult }
  | { type: 'invalid_range'; contentRange: string }
  | { type: 'not_found'; error: string }
  | { type: 'error'; error: string };

/**
 * Parses a standard single-range HTTP Range header (RFC 7233).
 * Returns { start, end } if valid, 'invalid' if unsatisfiable, or null if no Range header.
 */
export function parseRangeHeader(
  rangeHeader: string | null | undefined,
  totalBytes: number
): { start: number; end: number } | 'invalid' | null {
  if (!rangeHeader || !rangeHeader.startsWith('bytes=')) {
    return null;
  }

  const rawRange = rangeHeader.slice(6).trim();
  // We only support single byte ranges (PDF viewers request single ranges)
  if (rawRange.includes(',')) {
    return 'invalid';
  }

  const match = rawRange.match(/^(\d*)-(\d*)$/);
  if (!match) {
    return 'invalid';
  }

  const [_, startStr, endStr] = match;
  if (!startStr && !endStr) {
    return 'invalid';
  }

  let start: number;
  let end: number;

  if (!startStr) {
    // Suffix range: e.g. -500 (last 500 bytes)
    const suffix = parseInt(endStr, 10);
    if (isNaN(suffix) || suffix <= 0) return 'invalid';
    start = Math.max(0, totalBytes - suffix);
    end = totalBytes - 1;
  } else if (!endStr) {
    // Prefix range: e.g. 500- (from byte 500 to end)
    start = parseInt(startStr, 10);
    if (isNaN(start) || start < 0 || start >= totalBytes) return 'invalid';
    end = totalBytes - 1;
  } else {
    // Explicit range: e.g. 0-1023
    start = parseInt(startStr, 10);
    end = parseInt(endStr, 10);
    if (isNaN(start) || isNaN(end) || start < 0 || start > end || start >= totalBytes) {
      return 'invalid';
    }
    if (end >= totalBytes) {
      end = totalBytes - 1;
    }
  }

  return { start, end };
}

/**
 * Fetches a catalogue stream from S3 (with byte range support),
 * falling back to the local file copy if S3 retrieval encounters an unexpected error.
 */
export async function fetchCatalogueStream(
  filename: string,
  rangeHeader?: string | null
): Promise<FetchCatalogueResult> {
  const meta = getCatalogueMeta(filename);
  if (!meta) {
    return { type: 'not_found', error: 'Catalogue not found in allowlist' };
  }

  // Parse and validate Range header against expected file bytes
  const parsedRange = parseRangeHeader(rangeHeader, meta.expectedBytes);
  if (parsedRange === 'invalid') {
    return {
      type: 'invalid_range',
      contentRange: `bytes */${meta.expectedBytes}`,
    };
  }

  // 1. Attempt S3 retrieval
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: meta.s3Key,
      Range: parsedRange ? `bytes=${parsedRange.start}-${parsedRange.end}` : undefined,
    });

    const s3Res = await catalogueS3Client.send(command);
    if (s3Res.Body) {
      const stream = s3Res.Body.transformToWebStream();
      const contentLength =
        s3Res.ContentLength ?? (parsedRange ? parsedRange.end - parsedRange.start + 1 : meta.expectedBytes);

      return {
        type: 'success',
        data: {
          stream,
          contentLength,
          contentRange: s3Res.ContentRange,
          statusCode: parsedRange ? 206 : 200,
          contentType: meta.contentType,
          source: 's3',
          originalFilename: meta.originalFilename,
        },
      };
    }
  } catch (err: any) {
    // If S3 explicitly reports InvalidRange, propagate 416
    if (err.name === 'InvalidRange' || err.$metadata?.httpStatusCode === 416) {
      return {
        type: 'invalid_range',
        contentRange: `bytes */${meta.expectedBytes}`,
      };
    }

    // Otherwise log underlying S3 failure and attempt local disk fallback
    console.error(`[Catalogue S3 Storage] Error fetching "${meta.s3Key}":`, err?.message || err);
  }

  // 2. Safe local file fallback
  const localPath = path.join(process.cwd(), 'app', 'brands_pdfs & images', meta.originalFilename);
  if (fs.existsSync(localPath)) {
    try {
      const stat = fs.statSync(localPath);
      if (parsedRange) {
        const localRange = parseRangeHeader(rangeHeader, stat.size);
        if (localRange === 'invalid') {
          return {
            type: 'invalid_range',
            contentRange: `bytes */${stat.size}`,
          };
        }
        const effectiveRange = localRange || parsedRange;
        const nodeStream = fs.createReadStream(localPath, {
          start: effectiveRange.start,
          end: effectiveRange.end,
        });

        return {
          type: 'success',
          data: {
            stream: Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>,
            contentLength: effectiveRange.end - effectiveRange.start + 1,
            contentRange: `bytes ${effectiveRange.start}-${effectiveRange.end}/${stat.size}`,
            statusCode: 206,
            contentType: meta.contentType,
            source: 'fallback',
            originalFilename: meta.originalFilename,
          },
        };
      } else {
        const nodeStream = fs.createReadStream(localPath);
        return {
          type: 'success',
          data: {
            stream: Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>,
            contentLength: stat.size,
            statusCode: 200,
            contentType: meta.contentType,
            source: 'fallback',
            originalFilename: meta.originalFilename,
          },
        };
      }
    } catch (fallbackErr: any) {
      console.error(`[Catalogue Fallback] Error reading local copy "${localPath}":`, fallbackErr?.message || fallbackErr);
    }
  }

  return {
    type: 'error',
    error: 'Failed to stream catalogue from S3 and local fallback is unavailable',
  };
}

