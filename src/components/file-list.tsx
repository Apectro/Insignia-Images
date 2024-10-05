'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Trash2, ChevronLeft, ChevronRight, Download, Link } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFileContext } from '@/contexts/FileContent';
import { useSession } from 'next-auth/react';

interface File {
  _id: string;
  filename: string;
  path: string;
  fileType: string;
  uploadedAt: string;
}

export default function FileList() {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { refreshTrigger } = useFileContext();
  const { data: session, status } = useSession();

  const filesPerPage = 7;

  const fetchFiles = useCallback(async () => {
    if (!session) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/files?page=${currentPage}&limit=${filesPerPage}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched files data:', data);

      if (!Array.isArray(data.files)) {
        throw new Error('Fetched data is not in the expected format');
      }

      setFiles(data.files);
      setTotalFiles(data.total);
      setTotalPages(Math.max(1, Math.ceil(data.total / filesPerPage)));
    } catch (error) {
      console.error('Error fetching files:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast({
        title: 'Error',
        description: 'Failed to fetch files. Please try again.',
        variant: 'destructive',
      });
      setFiles([]);
      setTotalPages(1);
      setTotalFiles(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filesPerPage, toast, session]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, refreshTrigger]);

  const handleDownload = (path: string, filename: string) => {
    const link = document.createElement('a');
    link.href = path;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = (path: string) => {
    const fullUrl = `${window.location.origin}${path}`;

    const copyToClipboard = (text: string) => {
      if (navigator.clipboard && window.isSecureContext) {
        // Navigator Clipboard API method
        return navigator.clipboard.writeText(text);
      } else {
        // Fallback method using a temporary textarea element
        let textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        return new Promise<void>((resolve, reject) => {
          document.execCommand('copy') ? resolve() : reject();
          textArea.remove();
        });
      }
    };

    copyToClipboard(fullUrl)
      .then(() => {
        toast({
          title: 'Success',
          description: 'File link copied to clipboard',
        });
      })
      .catch((err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: 'Error',
          description: 'Failed to copy file link',
          variant: 'destructive',
        });
      });
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/files/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setFiles(files.filter((file) => file._id !== id));
      setTotalFiles((prev) => prev - 1);
      toast({
        title: 'Success',
        description: 'File deleted successfully',
      });

      if (files.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchFiles();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setFileToDelete(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div>Please sign in to view your files.</div>;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uploaded Files ({totalFiles})</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-red-500 mb-4">Error: {error}</div>
        ) : (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Uploaded At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.length > 0 ? (
                  files.map((file) => (
                    <TableRow key={file._id}>
                      <TableCell className="font-medium">{file.filename}</TableCell>
                      <TableCell>{file.fileType}</TableCell>
                      <TableCell>{new Date(file.uploadedAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleDownload(file.path, file.filename)}
                            size="sm"
                            variant="outline"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button onClick={() => handleCopyLink(file.path)} size="sm" variant="outline">
                            <Link className="h-4 w-4 mr-2" />
                            Copy Link
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                onClick={() => setFileToDelete(file._id)}
                                size="sm"
                                variant="destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Are you sure you want to delete this file?</DialogTitle>
                                <DialogDescription>
                                  This action cannot be undone. This will permanently delete the file.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button onClick={() => setFileToDelete(null)} variant="outline">
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => fileToDelete && handleDelete(fileToDelete)}
                                  variant="destructive"
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No files found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
