import ImageUpload from '@/components/image-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Upload Image</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upload a New Image</CardTitle>
          <CardDescription>Choose an image file to upload to your gallery.</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload />
        </CardContent>
      </Card>
    </div>
  );
}
