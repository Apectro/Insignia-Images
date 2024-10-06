import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';
import { unlink } from 'fs/promises';
import { join } from 'path';

async function checkAuthorization(req: NextRequest, file: any) {
  const client = await clientPromise;
  const db = client.db();
  const user = await db.collection('users').findOne({ email: file.userId });

  if (!user) {
    return { authorized: false, error: 'User not found' };
  }

  const clientIp = req.headers.get('x-forwarded-for') || req.ip;
  const authKey = req.headers.get('authorization');

  // Check if the client IP is allowed
  if (user.allowedIPs && user.allowedIPs.length > 0) {
    if (!user.allowedIPs.includes(clientIp)) {
      return { authorized: false, error: 'Unauthorized IP' };
    }
  }

  // Check if Authorization Key is required and valid
  if (user.enableAuthKey && user.authKey) {
    if (!authKey || authKey !== `Bearer ${user.authKey}`) {
      return { authorized: false, error: 'Invalid Authorization Key' };
    }
  }

  return { authorized: true };
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const file = await db.collection('files').findOne({
      _id: new ObjectId(params.id),
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const authResult = await checkAuthorization(req, file);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    return NextResponse.json(file);
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const file = await db.collection('files').findOne({
      _id: new ObjectId(params.id),
      userId: session.user.email,
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const filePath = join(process.cwd(), 'public', file.path);
    try {
      await unlink(filePath);
    } catch (unlinkError) {
      console.error('Error deleting file from filesystem:', unlinkError);
    }

    const result = await db.collection('files').deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'File not found in database' }, { status: 404 });
    }

    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { filename } = body;

    if (!filename || typeof filename !== 'string') {
      return NextResponse.json({ error: 'Valid filename is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const result = await db
      .collection('files')
      .findOneAndUpdate(
        { _id: new ObjectId(params.id), userId: session.user.email },
        { $set: { filename } },
        { returnDocument: 'after' }
      );

    if (!result || !result.value) {
      return NextResponse.json({ error: 'File not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({ message: 'File updated successfully', file: result.value });
  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
