import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Upload, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfilePictureUploadProps {
  currentImage?: string;
  userName: string;
  onImageUpdate?: (imageUrl: string) => void;
}

const ProfilePictureUpload = ({ 
  currentImage, 
  userName, 
  onImageUpdate 
}: ProfilePictureUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PNG, JPG, or WEBP image.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setPreviewImage(imageUrl);
        
        // For now, we'll just use the local preview
        // In a real app, you would upload to a cloud service
        onImageUpdate?.(imageUrl);
        
        toast({
          title: "Profile picture updated",
          description: "Your profile picture has been updated successfully.",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const displayImage = previewImage || currentImage;
  const initials = userName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="text-center">
        <div className="relative mb-4 inline-block">
          <Avatar className="w-24 h-24 border-4 border-primary/20">
            <AvatarImage src={displayImage} alt={userName} />
            <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-2">
            <Camera className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
        
        <h3 className="font-semibold text-lg mb-2">Profile Picture</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Update your profile picture for a personalized experience
        </p>
        
        <div className="space-y-2">
          <input
            type="file"
            id="profile-picture-upload"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
          
          <Button 
            variant="outline" 
            size="sm"
            className="w-full"
            disabled={isUploading}
            onClick={() => document.getElementById('profile-picture-upload')?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Choose Image'}
          </Button>
          
          <p className="text-xs text-muted-foreground">
            PNG, JPG, WEBP up to 10MB
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ProfilePictureUpload;