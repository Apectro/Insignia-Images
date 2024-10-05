'use client';

import FileUpload from '@/components/file-upload';
import FileList from '@/components/file-list';
import { FileProvider } from '@/contexts/FileContent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FilesPage() {
  return (
    <FileProvider>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Files</h1>
        <Card>
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
            <CardDescription>Add new files to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your Files</CardTitle>
            <CardDescription>Manage your uploaded files</CardDescription>
          </CardHeader>
          <CardContent>
            <FileList />
          </CardContent>
        </Card>
      </div>
    </FileProvider>
  );
}
