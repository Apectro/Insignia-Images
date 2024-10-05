import { Suspense } from 'react';
import ImageUpload from '@/components/image-upload';
import ImageGrid from '@/components/image-grid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import clientPromise from '@/lib/db';

interface ImageData {
  _id: string;
  filename: string;
  path: string;
  uploadedAt: string;
}

async function getImages(userId: string): Promise<ImageData[]> {
  const client = await clientPromise;
  const db = client.db();
  const imagesCollection = await db.collection('images').find({ userId }).toArray();
  return imagesCollection.map((doc) => ({
    _id: doc._id.toString(),
    filename: doc.filename as string,
    path: doc.path as string,
    uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt).toISOString() : new Date().toISOString(),
  }));
}

export default async function MyImagesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  const images = await getImages(session.user.id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl">My Images</CardTitle>
          <CardDescription>Upload and manage your images</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload />
        </CardContent>
      </Card>
      <Suspense fallback={<div className="text-center p-4">Loading images...</div>}>
        <ImageGrid initialImages={images} />
      </Suspense>
    </div>
  );
}
