import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/firestore-admin';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }
    const adminStatus = await isAdmin(email);
    return NextResponse.json({ isAdmin: adminStatus }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
