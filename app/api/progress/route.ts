import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const KV_PREFIX = 'tf:progress:';

const FALLBACK_FILE = path.join(process.cwd(), '.kv_fallback_progress.json');

function readFallbackProgress(): Record<string, unknown> {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const data = fs.readFileSync(FALLBACK_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to read fallback progress:', e);
  }
  return {};
}

function writeFallbackProgress(store: Record<string, unknown>) {
  try {
    const dir = path.dirname(FALLBACK_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write fallback progress:', e);
  }
}

/* ─── KV client (lazy init, graceful fallback) ─────────── */
let kvClient: { get: (k: string) => Promise<unknown>; set: (k: string, v: unknown) => Promise<unknown> } | null = null;
const fallbackStore = readFallbackProgress();

function getKV() {
  if (kvClient) return kvClient;

  // Check if KV env vars are available
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      // Dynamic import to avoid build errors if @vercel/kv isn't installed
      const { kv } = require('@vercel/kv');
      kvClient = kv;
      console.log('[progress] Using Vercel KV');
      return kvClient!;
    } catch {
      console.log('[progress] @vercel/kv not available, using fallback store');
    }
  }

  // Fallback: file-based store (works for local dev, persists on restart)
  console.log('[progress] KV env vars missing, using file-based fallback store');
  kvClient = {
    get: async (key: string) => fallbackStore[key] ?? null,
    set: async (key: string, value: unknown) => {
      fallbackStore[key] = value;
      writeFallbackProgress(fallbackStore);
    },
  };
  return kvClient!;
}

// GET /api/progress?userId=u1
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  try {
    const store = getKV();
    const data = await store.get(`${KV_PREFIX}${userId}`);
    return NextResponse.json({ data: data || null });
  } catch (err) {
    console.error('KV GET error:', err);
    return NextResponse.json({ data: null });
  }
}

// PUT /api/progress
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, progress } = body;

    if (!userId || !progress) {
      return NextResponse.json({ error: 'userId and progress required' }, { status: 400 });
    }

    const store = getKV();
    await store.set(`${KV_PREFIX}${userId}`, progress);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('KV PUT error:', err);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
