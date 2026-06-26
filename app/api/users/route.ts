import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const KV_USERS_KEY = 'tf:users_list';

interface DBUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'designer' | 'pm' | 'devops' | 'qa';
  avatar: string;
  avatarColor: string;
  password?: string;
}

const INITIAL_USERS: DBUser[] = [
  { id: 'u1', name: 'administrator', email: 'admin@talentforge.in', role: 'admin', avatar: 'AK', avatarColor: 'av-orange', password: 'tf2025' },
  { id: 'u2', name: 'Rohan', email: 'dev@talentforge.in', role: 'developer', avatar: 'PS', avatarColor: 'av-teal', password: 'tf2025' },
  { id: 'u3', name: 'Karthikeyan', email: 'designer@talentforge.in', role: 'pm', avatar: 'RM', avatarColor: 'av-purple', password: 'tf2025' },
  { id: 'u4', name: 'sathya', email: 'pm@talentforge.in', role: 'pm', avatar: 'NS', avatarColor: 'av-amber', password: 'tf2025' },
  { id: 'u5', name: 'Ganesh', email: 'devops@talentforge.in', role: 'devops', avatar: 'GR', avatarColor: 'av-blue', password: 'tf2025' }
];

const FALLBACK_FILE = path.join(process.cwd(), '.next', 'kv_fallback_users.json');

function readFallbackUsers(): DBUser[] | null {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const data = fs.readFileSync(FALLBACK_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to read fallback users:', e);
  }
  return null;
}

function writeFallbackUsers(users: DBUser[]) {
  try {
    const dir = path.dirname(FALLBACK_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write fallback users:', e);
  }
}

/* ─── KV client (lazy init, graceful fallback) ─────────── */
let kvClient: { get: (k: string) => Promise<unknown>; set: (k: string, v: unknown) => Promise<unknown> } | null = null;
let memoryStore = readFallbackUsers() || [...INITIAL_USERS];

function getKV() {
  if (kvClient) return kvClient;

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const { kv } = require('@vercel/kv');
      kvClient = kv;
      console.log('[users] Using Vercel KV');
      return kvClient!;
    } catch {
      console.log('[users] @vercel/kv not available, using memory store');
    }
  }

  console.log('[users] KV env vars missing, using file-based fallback store');
  kvClient = {
    get: async (key: string) => memoryStore,
    set: async (key: string, value: unknown) => {
      if (Array.isArray(value)) {
        memoryStore = value as DBUser[];
        writeFallbackUsers(memoryStore);
      }
    },
  };
  return kvClient!;
}

// GET /api/users - returns all users
export async function GET() {
  try {
    const store = getKV();
    let data = await store.get(KV_USERS_KEY) as DBUser[] | null;
    
    // Seed if empty
    if (!data || !Array.isArray(data) || data.length === 0) {
      await store.set(KV_USERS_KEY, INITIAL_USERS);
      data = INITIAL_USERS;
    }
    
    return NextResponse.json({ users: data });
  } catch (err) {
    console.error('KV GET Users error:', err);
    return NextResponse.json({ users: INITIAL_USERS });
  }
}

// POST /api/users - creates a new user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, role, password } = body;

    if (!name || !email || !role || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const store = getKV();
    let data = await store.get(KV_USERS_KEY) as DBUser[] | null;
    if (!data || !Array.isArray(data)) {
      data = [...INITIAL_USERS];
    }

    // Check duplicate email
    if (data.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Generate avatar and color
    const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['av-orange', 'av-teal', 'av-purple', 'av-amber', 'av-blue'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newUser: DBUser = {
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      name,
      email: email.toLowerCase(),
      role,
      avatar: initials || 'U',
      avatarColor: randomColor,
      password
    };

    const updated = [...data, newUser];
    await store.set(KV_USERS_KEY, updated);

    return NextResponse.json({ ok: true, user: newUser });
  } catch (err) {
    console.error('KV POST Users error:', err);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// PUT /api/users - updates a user
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, email, role, password } = body;

    if (!id || !name || !email || !role) {
      return NextResponse.json({ error: 'Missing user fields' }, { status: 400 });
    }

    const store = getKV();
    let data = await store.get(KV_USERS_KEY) as DBUser[] | null;
    if (!data || !Array.isArray(data)) {
      data = [...INITIAL_USERS];
    }

    const index = data.findIndex(u => u.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check duplicate email for other users
    if (data.some(u => u.id !== id && u.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json({ error: 'Email is already taken' }, { status: 400 });
    }

    const current = data[index];
    const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    const updatedUser: DBUser = {
      ...current,
      name,
      email: email.toLowerCase(),
      role,
      avatar: initials || current.avatar,
      password: password || current.password
    };

    const updated = [...data];
    updated[index] = updatedUser;
    await store.set(KV_USERS_KEY, updated);

    return NextResponse.json({ ok: true, user: updatedUser });
  } catch (err) {
    console.error('KV PUT Users error:', err);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/users?id=userId - deletes a user
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Protect administrator u1 from deletion
    if (id === 'u1') {
      return NextResponse.json({ error: 'Cannot delete default administrator' }, { status: 400 });
    }

    const store = getKV();
    let data = await store.get(KV_USERS_KEY) as DBUser[] | null;
    if (!data || !Array.isArray(data)) {
      data = [...INITIAL_USERS];
    }

    const updated = data.filter(u => u.id !== id);
    await store.set(KV_USERS_KEY, updated);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('KV DELETE Users error:', err);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
