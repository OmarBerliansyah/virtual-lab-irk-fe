import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhotoUploadProps {
  onPhotoChange: (photoUrl: string) => void;
  currentPhotoUrl?: string;
  disabled?: boolean;
}

export const PhotoUpload = ({ onPhotoChange, currentPhotoUrl, disabled }: PhotoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentPhotoUrl || '');
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUrlChange = (url: string) => {
    setPreviewUrl(url);
    onPhotoChange(url);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select an image smaller than 5MB",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create a data URL for immediate preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreviewUrl(dataUrl);
        onPhotoChange(dataUrl);
      };
      reader.readAsDataURL(file);

      toast({
        title: "Photo uploaded",
        description: "Photo has been uploaded successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const clearPhoto = () => {
    setPreviewUrl('');
    onPhotoChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Mode Toggle */}
      <div className="flex gap-2 mb-3">
        <Button
          type="button"
          variant={uploadMode === 'url' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUploadMode('url')}
          disabled={disabled}
        >
          URL
        </Button>
        <Button
          type="button"
          variant={uploadMode === 'file' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUploadMode('file')}
          disabled={disabled}
        >
          Upload File
        </Button>
      </div>

      {/* URL Input Mode */}
      {uploadMode === 'url' && (
        <div className="space-y-3">
          <Label htmlFor="photo-url">Photo URL</Label>
          <Input
            id="photo-url"
            type="url"
            value={previewUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            disabled={disabled}
            className="w-full"
          />
        </div>
      )}

      {/* File Upload Mode */}
      {uploadMode === 'file' && (
        <div className="space-y-3">
          <Label htmlFor="photo-file">Upload Photo</Label>
          <div className="w-full">
            <Input
              ref={fileInputRef}
              id="photo-file"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={disabled || isUploading}
              className="w-full cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
            />
            {isUploading && (
              <p className="text-sm text-muted-foreground mt-2">
                Uploading photo...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Photo Preview */}
      {previewUrl && (
        <div className="space-y-3">
          <Label>Preview</Label>
          <div className="relative w-full">
            {previewUrl.startsWith('data:') || previewUrl.startsWith('http') ? (
              <img
                src={previewUrl}
                alt="Photo preview"
                className="w-full max-w-sm h-48 object-cover rounded-lg border mx-auto block"
                onError={() => {
                  toast({
                    variant: "destructive",
                    title: "Invalid image",
                    description: "The provided URL does not contain a valid image",
                  });
                }}
              />
            ) : (
              <div className="w-full max-w-sm h-48 bg-muted rounded-lg border flex items-center justify-center mx-auto">
                <Image className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearPhoto}
              disabled={disabled}
              className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/90 hover:bg-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};