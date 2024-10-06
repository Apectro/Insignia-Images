import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import clientPromise from '@/lib/db';
import path from 'path';
import fs from 'fs/promises';

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  const token = await getToken({ req: request });
  const filename = params.filename;

  try {
    const client = await clientPromise;
    const db = client.db();

    // Find the file in the database
    const file = await db.collection('files').findOne({ filename: filename });

    if (!file) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Check if the user is authenticated
    if (!token) {
      // If not authenticated, check IP and auth key
      const clientIp = request.ip || request.headers.get('x-forwarded-for') || '';
      const authKey = request.headers.get('authorization');

      const user = await db.collection('users').findOne({ email: file.userId });

      if (!user) {
        return new NextResponse('User not found', { status: 404 });
      }

      // Check if the client IP is allowed
      if (user.allowedIPs && user.allowedIPs.length > 0) {
        if (!user.allowedIPs.includes(clientIp)) {
          return new NextResponse('Unauthorized IP', { status: 403 });
        }
      }

      // Check if Authorization Key is required and valid
      if (user.enableAuthKey && user.authKey) {
        if (!authKey || authKey !== `Bearer ${user.authKey}`) {
          return new NextResponse('Invalid Authorization Key', { status: 401 });
        }
      }
    }

    // If we've made it this far, the user is either authenticated or has passed the IP/auth key checks

    // Serve the file
    const filePath = path.join(process.cwd(), 'uploads', 'files', filename);
    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': file.fileType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
