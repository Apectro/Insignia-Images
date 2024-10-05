import ImageGrid from '@/components/image-grid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ImagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">My Images</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Image Gallery</CardTitle>
          <CardDescription>View and manage your uploaded images.</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageGrid />
        </CardContent>
      </Card>
    </div>
  );
}
