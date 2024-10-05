import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';
import { unlink, rename } from 'fs/promises';
import { join } from 'path';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const image = await db.collection('images').findOne({
      _id: new ObjectId(params.id),
      userId: session.user.id, // Changed from email to id for consistency
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    return NextResponse.json(image);
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newFileName } = await req.json();

    const client = await clientPromise;
    const db = client.db();
    const image = await db.collection('images').findOne({
      _id: new ObjectId(params.id),
      userId: session.user.id, // Changed from email to id for consistency
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const oldPath = join(process.cwd(), 'public', image.path);
    const newPath = join(process.cwd(), 'public', 'uploads', 'images', newFileName);

    await rename(oldPath, newPath);

    const newImagePath = `/uploads/images/${newFileName}`;
    await db
      .collection('images')
      .updateOne({ _id: new ObjectId(params.id) }, { $set: { filename: newFileName, path: newImagePath } });

    const updatedImage = {
      ...image,
      filename: newFileName,
      path: newImagePath,
    };

    return NextResponse.json({
      message: 'Image renamed successfully',
      image: updatedImage,
    });
  } catch (error) {
    console.error('Error renaming image:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const image = await db.collection('images').findOne({
      _id: new ObjectId(params.id),
      userId: session.user.id, // Changed from email to id for consistency
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Delete the file from the filesystem
    const filePath = join(process.cwd(), 'public', image.path);
    await unlink(filePath);

    // Delete the image record from the database
    await db.collection('images').deleteOne({ _id: new ObjectId(params.id) });

    return NextResponse.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
