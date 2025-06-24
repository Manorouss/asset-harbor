import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// POST /api/login
// Body: { username: string, password: string }
// Returns: { id, username } if valid, error otherwise
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    const user = await prisma.user.findUnique({ where: { username } });

    if (user && bcrypt.compareSync(password, user.password)) {
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
      const { password: _password, ...userWithoutPassword } = user;
      return NextResponse.json(userWithoutPassword);
    } else {
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}

// GET /api/login?username=...
// Returns: { id, username } if found, error otherwise
export async function GET(request: NextRequest) {
    const username = request.nextUrl.searchParams.get('username');
    if (!username) {
        return NextResponse.json({ error: 'Missing username' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ id: user.id, username: user.username });
}

// GET /api/login/all
// Returns: [{ id, username }, ...] for all users
// (Moved to /api/login/all/route.ts for proper routing) 