import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Change the upload directory to a non-public location
    const uploadDir = join(process.cwd(), 'uploads', 'files');

    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directory:', error);
      return NextResponse.json({ error: 'Failed to create upload directory' }, { status: 500 });
    }

    const filePath = join(uploadDir, file.name);
    await writeFile(filePath, buffer);

    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('files').insertOne({
      userId: session.user.email,
      filename: file.name,
      // Update the path to reflect the new non-public location
      path: join('uploads', 'files', file.name),
      fileType: file.type,
      uploadedAt: new Date(),
    });

    return NextResponse.json(
      { message: 'File uploaded successfully', fileId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '7', 10);
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db();
    const filesCollection = db.collection('files');

    const files = await filesCollection
      .find({ userId: session.user.email })
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await filesCollection.countDocuments({ userId: session.user.email });

    return NextResponse.json({ files, total });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
