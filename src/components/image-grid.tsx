'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ImageData {
  _id: string;
  filename: string;
  path: string;
  uploadedAt: string;
}

export default function ImageGrid() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const response = await fetch('/api/images');
    if (response.ok) {
      const data = await response.json();
      setImages(data);
    }
  };

  const handleRename = async (id: string) => {
    try {
      const extension = selectedImage?.filename.split('.').pop();
      const fullNewFileName = `${newFileName}.${extension}`;
      const response = await fetch(`/api/images/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newFileName: fullNewFileName }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedImage = data.image;
        setImages(images.map((img) => (img._id === id ? updatedImage : img)));
        setSelectedImage(updatedImage);
        toast({
          title: 'Success',
          description: 'Image renamed successfully',
        });
      } else {
        throw new Error('Rename failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to rename image',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/images/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setImages(images.filter((img) => img._id !== id));
        setSelectedImage(null);
        toast({
          title: 'Success',
          description: 'Image deleted successfully',
        });
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete image',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <Card key={image._id} className="flex flex-col">
          <CardContent className="p-2 flex-grow">
            <Image
              src={image.path}
              alt={image.filename}
              width={300}
              height={300}
              className="w-full h-48 object-cover rounded"
            />
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-2">
            <p className="text-sm text-gray-600 truncate w-full">{image.filename}</p>
            <div className="flex gap-2 w-full">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-grow"
                    onClick={() => {
                      setSelectedImage(image);
                      setNewFileName(image.filename.split('.').slice(0, -1).join('.'));
                    }}
                  >
                    View
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>{selectedImage?.filename}</DialogTitle>
                  </DialogHeader>
                  {selectedImage && (
                    <ScrollArea className="flex-grow">
                      <div className="flex flex-col items-center gap-4 p-4">
                        <div className="relative w-full h-[60vh]">
                          <Image
                            src={selectedImage.path}
                            alt={selectedImage.filename}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <Input
                          value={`${window.location.origin}${selectedImage.path}`}
                          readOnly
                          onClick={(e) => e.currentTarget.select()}
                          className="w-full"
                        />
                        <div className="flex gap-2 w-full">
                          <Input
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            placeholder="New file name (without extension)"
                            className="flex-grow"
                          />
                          <Button onClick={() => handleRename(selectedImage._id)}>Rename</Button>
                        </div>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(selectedImage._id)}
                          className="w-full"
                        >
                          Delete
                        </Button>
                      </div>
                    </ScrollArea>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
