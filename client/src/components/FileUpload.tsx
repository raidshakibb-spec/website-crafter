import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept: 'image' | 'video' | 'both';
  testId?: string;
}

export function FileUpload({ label, value, onChange, accept, testId }: FileUploadProps) {
  const [mode, setMode] = useState<'upload' | 'url'>(value && value.startsWith('http') ? 'url' : 'upload');
  const [urlInput, setUrlInput] = useState(value && value.startsWith('http') ? value : '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const acceptTypes = accept === 'image' 
    ? 'image/jpeg,image/png,image/gif,image/webp'
    : accept === 'video'
    ? 'video/mp4,video/webm,video/quicktime'
    : 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime';

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      onChange(data.url);
      toast({ title: 'File uploaded successfully' });
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: 'destructive' });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isImage = value && (value.includes('.jpg') || value.includes('.jpeg') || value.includes('.png') || value.includes('.gif') || value.includes('.webp') || value.startsWith('data:image'));
  const isVideo = value && (value.includes('.mp4') || value.includes('.webm') || value.includes('.mov'));

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {value && (
        <div className="relative rounded-md border border-border overflow-hidden bg-muted/50">
          {isImage && (
            <img 
              src={value} 
              alt="Preview" 
              className="w-full h-32 object-cover"
            />
          )}
          {isVideo && (
            <video 
              src={value} 
              className="w-full h-32 object-cover"
              controls
            />
          )}
          {!isImage && !isVideo && value && (
            <div className="p-3 text-sm text-muted-foreground truncate">
              {value}
            </div>
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={handleClear}
            data-testid={`${testId}-clear`}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {!value && (
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'upload' | 'url')}>
          <TabsList className="w-full">
            <TabsTrigger value="upload" className="flex-1 gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url" className="flex-1 gap-2">
              <Link className="h-4 w-4" />
              URL
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-2">
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptTypes}
                onChange={handleFileChange}
                className="hidden"
                data-testid={`${testId}-file-input`}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
                data-testid={`${testId}-upload-button`}
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="url" className="mt-2">
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://..."
                data-testid={`${testId}-url-input`}
              />
              <Button
                type="button"
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim()}
                data-testid={`${testId}-url-submit`}
              >
                Add
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
