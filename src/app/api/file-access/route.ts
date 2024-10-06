import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileIdentifier = searchParams.get('fileIdentifier');
    const encodedClientIp = searchParams.get('clientIp');
    const authKey = searchParams.get('authKey');

    if (!fileIdentifier) {
      return NextResponse.json({ error: 'File identifier is required' }, { status: 400 });
    }

    if (!encodedClientIp) {
      return NextResponse.json({ error: 'Client IP is required' }, { status: 400 });
    }

    // Decode the client IP
    const clientIp = decodeURIComponent(encodedClientIp);

    const client = await clientPromise;
    const db = client.db();

    // Prepare the query
    let query: { $or: Array<{ _id?: ObjectId; filename?: string }> } = { $or: [] };

    if (ObjectId.isValid(fileIdentifier)) {
      query.$or.push({ _id: new ObjectId(fileIdentifier) });
    }
    query.$or.push({ filename: fileIdentifier });

    // Find the file
    const file = await db.collection('files').findOne(query);

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const user = await db.collection('users').findOne({ email: file.userId });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Simple IP check
    if (user.allowedIPs && user.allowedIPs.length > 0) {
      if (!user.allowedIPs.includes(clientIp)) {
        return NextResponse.json({ error: 'Unauthorized IP' }, { status: 403 });
      }
    }

    // Check if Authorization Key is required and valid
    if (user.enableAuthKey && user.authKey) {
      if (!authKey || authKey !== `Bearer ${user.authKey}`) {
        return NextResponse.json({ error: 'Invalid Authorization Key' }, { status: 401 });
      }
    }

    // If all checks pass, allow access to the file
    return NextResponse.json({ message: 'Access granted' }, { status: 200 });
  } catch (error) {
    console.error('Error in file access check:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
