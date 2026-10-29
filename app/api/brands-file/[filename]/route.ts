import { NextRequest, NextResponse } from 'next/server';
import {
  fetchCatalogueStream,
  getCatalogueMeta,
  isAllowedCatalogue,
} from '@/lib/catalogues-storage';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const rawFilename = params?.filename;
    if (!rawFilename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    if (!isAllowedCatalogue(rawFilename)) {
      return NextResponse.json({ error: 'Catalogue not found' }, { status: 404 });
    }

    const rangeHeader = req.headers.get('range');
    const result = await fetchCatalogueStream(rawFilename, rangeHeader);

    if (result.type === 'not_found') {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    if (result.type === 'invalid_range') {
      return new Response(null, {
        status: 416,
        headers: {
          'Content-Range': result.contentRange,
          'Accept-Ranges': 'bytes',
          'Content-Type': 'application/pdf',
        },
      });
    }

    if (result.type === 'error') {
      return NextResponse.json({ error: 'Failed to serve brand file' }, { status: 500 });
    }

    const { data } = result;
    const headers = new Headers();
    headers.set('Content-Type', data.contentType);
    headers.set('Content-Length', data.contentLength.toString());
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(data.originalFilename)}"`);
    headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200');
    headers.set('X-Content-Source', data.source);

    if (data.contentRange) {
      headers.set('Content-Range', data.contentRange);
    }

    return new Response(data.stream as any, {
      status: data.statusCode,
      headers,
    });
  } catch (error: any) {
    console.error('Error serving brand catalogue file:', error?.message || error);
    return NextResponse.json({ error: 'Failed to serve brand file' }, { status: 500 });
  }
}

export async function HEAD(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const rawFilename = params?.filename;
    if (!rawFilename) {
      return new Response(null, { status: 400 });
    }

    const meta = getCatalogueMeta(rawFilename);
    if (!meta) {
      return new Response(null, { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', meta.contentType);
    headers.set('Content-Length', meta.expectedBytes.toString());
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(meta.originalFilename)}"`);
    headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200');

    return new Response(null, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Error handling HEAD for brand catalogue file:', error?.message || error);
    return new Response(null, { status: 500 });
  }
}

