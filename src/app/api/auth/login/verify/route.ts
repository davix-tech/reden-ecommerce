import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateToken } from '@/lib/auth';
import { setAuthCookie } from '@/lib/session';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const storedOtp = cookieStore.get('login_otp')?.value;
    const storedEmail = cookieStore.get('login_email')?.value;

    if (!storedOtp || storedOtp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    if (storedEmail !== email) {
      return NextResponse.json({ error: 'Email mismatch' }, { status: 400 });
    }

    const user = db.users.getByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const token = await generateToken(user);
    await setAuthCookie(token);

    cookieStore.delete('login_otp');
    cookieStore.delete('login_email');

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
  } catch (error) {
    return NextResponse.json({ error: 'Login verification failed' }, { status: 500 });
  }
}
