'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useFileContext } from '@/contexts/FileContent';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const { triggerRefresh } = useFileContext();
  const { data: session } = useSession();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !session) return;

    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('File upload response:', data);
        toast({
          title: 'Success',
          description: data.message || 'File uploaded successfully',
        });
        setFile(null);
        triggerRefresh();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  if (!session) {
    return <div>Please sign in to upload files.</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">Upload a File</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file" className="text-sm font-medium">
              Choose a file
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept="*"
                disabled={uploading}
                className="flex-grow"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => document.getElementById('file')?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {file && (
            <div className="text-sm text-muted-foreground break-all">
              Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">Uploading... {uploadProgress.toFixed(0)}%</p>
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={!file || uploading} className="w-full">
          {uploading ? 'Uploading...' : 'Upload File'}
          {uploading ? (
            <AlertCircle className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="ml-2 h-4 w-4" />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
