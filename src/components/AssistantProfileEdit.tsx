import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { useAssistant, useMyAssistantProfile, useUpdateAssistant } from '@/hooks/useAssistants';
import { useToast } from '@/hooks/use-toast';
import { Edit, User, Loader2 } from 'lucide-react';

const DEFAULT_PROFILE_IMAGE = "https://media.istockphoto.com/id/1477583639/vector/user-profile-icon-vector-avatar-or-person-icon-profile-picture-portrait-symbol-vector.jpg?s=612x612&w=0&k=20&c=OWGIPPkZIWLPvnQS14ZSyHMoGtVTn1zS8cAgLy1Uh24=";

interface AssistantData {
  _id?: string;
  name: string;
  email: string;
  nim: string;
  angkatan: string;
  role: string;
  image?: string;
  isActive?: boolean;
}

interface AssistantProfileEditProps {
  assistantData?: AssistantData;
  assistantId?: string;
  onUpdateSuccess?: () => void;
}

const AssistantProfileEdit = ({ assistantData, assistantId, onUpdateSuccess }: AssistantProfileEditProps) => {
  const { data: assistantProfile, isLoading, error } = useMyAssistantProfile();
  const { data: fetchedAssistant, isLoading: isLoadingAssistant, error: fetchAssistantError } = useAssistant(assistantId || '');
  const updateAssistantMutation = useUpdateAssistant();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    email: '',
    nim: '',
    role: '',
    image: '',
  });

  // If assistantData is provided, we're in "edit any assistant" mode
  // Otherwise, we're in "edit own profile" mode
  const targetAssistant = assistantData || fetchedAssistant || assistantProfile;
  const isEditingOther = !!assistantData || !!assistantId;

  // Initialize form data when profile loads or assistantData changes
  useEffect(() => {
    if (targetAssistant) {
      setFormData({
        _id: targetAssistant._id || '',
        name: targetAssistant.name || '',
        email: targetAssistant.email || '',
        nim: targetAssistant.nim || '',
        role: targetAssistant.role || '',
        image: targetAssistant.image || '',
      });
    }
  }, [targetAssistant]);

  const initializeForm = () => {
    if (targetAssistant) {
      setFormData({
        _id: targetAssistant._id || '',
        name: targetAssistant.name || '',
        email: targetAssistant.email || '',
        nim: targetAssistant.nim || '',
        role: targetAssistant.role || '',
        image: targetAssistant.image || '',
      });
    }
  };

  const handleOpenDialog = () => {
    initializeForm();
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!targetAssistant) return;

    const normalizedImage = (formData.image ?? '').trim();

    if (isEditingOther) {
      const emailOk = !formData.email || /^\d{8}@std\.stei\.itb\.ac\.id$/.test(formData.email.trim());
      const nimOk = !formData.nim || /^(135|182)\d{5}$/.test(formData.nim.trim());
      if (!emailOk || !nimOk) {
        toast({
          title: "Invalid data",
          description: !emailOk ? "Email must be 8 digits followed by @std.stei.itb.ac.id" : "NIM must start with 135 or 182 and have 8 digits total",
          variant: "destructive",
        });
        return;
      }
    }

    try {
          const payload = {
            name: formData.name,
            role: formData.role,
            image: normalizedImage ? normalizedImage : null,
            ...(isEditingOther ? {
              email: formData.email?.trim() || undefined,
              nim: formData.nim?.trim() || undefined,
            } : {}),
          };

          await updateAssistantMutation.mutateAsync({
            id: targetAssistant._id,
            data: payload,
          });

      toast({
        title: "Profile updated",
        description: isEditingOther ? `${targetAssistant.name}'s profile has been updated successfully.` : "Your assistant profile has been updated successfully.",
      });

      setIsOpen(false);
      
      // Call callback if provided (for closing parent dialog)
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const roleOptions = [
    { value: 'ASSISTANT', label: 'Assistant' },
    { value: 'HEAD_ASSISTANT', label: 'Head Assistant' },
    { value: 'RESEARCH_ASSISTANT', label: 'Research Assistant' },
    { value: 'TEACHING_ASSISTANT', label: 'Teaching Assistant' },
    { value: 'LAB_ASSISTANT', label: 'Lab Assistant' },
  ];

  // If we're editing another assistant (assistantData provided), skip the loading/error checks
  if (!isEditingOther) {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading profile...</span>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-red-600">Failed to load assistant profile.</div>
          </CardContent>
        </Card>
      );
    }

    if (!assistantProfile) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">
              No assistant profile found. If you are an admin, open this form with a specific assistant selected.
            </div>
          </CardContent>
        </Card>
      );
    }
  }

  if (isEditingOther && assistantId) {
    if (isLoadingAssistant) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading assistant...</span>
            </div>
          </CardContent>
        </Card>
      );
    }
    if (fetchAssistantError) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-red-600">Failed to load assistant.</div>
          </CardContent>
        </Card>
      );
    }
  }

  // If we don't have target assistant data, return null
  if (!targetAssistant) {
    return null;
  }

  // Keep the raw fetched image for the input; use default only for display fallback.
  const normalizedFormImage = (formData.image ?? '').trim();
  const normalizedTargetImage = (targetAssistant.image ?? '').trim();
  const photoInputValue = formData.image === ''
    ? ''
    : (normalizedFormImage || normalizedTargetImage);
  const displayImage = formData.image === ''
    ? DEFAULT_PROFILE_IMAGE
    : (normalizedFormImage || normalizedTargetImage || DEFAULT_PROFILE_IMAGE);

  // If editing another assistant, render only the form (no card wrapper)
  if (isEditingOther) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter email address"
            type="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nim">NIM</Label>
          <Input
            id="nim"
            value={formData.nim}
            onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
            placeholder="Enter NIM"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Profile Picture</Label>
          <PhotoUpload
            currentPhotoUrl={photoInputValue}
            onPhotoChange={(photoUrl) => setFormData({ ...formData, image: photoUrl })}
            disabled={updateAssistantMutation.isPending}
          />
          {formData.image && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-red-500 h-8"
              onClick={() => setFormData({ ...formData, image: '' })}
            >
              Remove Photo
            </Button>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onUpdateSuccess && onUpdateSuccess()}
            disabled={updateAssistantMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateAssistantMutation.isPending}
          >
            {updateAssistantMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Assistant Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <img
              src={targetAssistant.image || DEFAULT_PROFILE_IMAGE}
              alt={targetAssistant.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_PROFILE_IMAGE;
              }}
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{targetAssistant.name}</h3>
            <p className="text-sm text-muted-foreground">{targetAssistant.role}</p>
            <p className="text-xs text-muted-foreground">{targetAssistant.angkatan} • {targetAssistant.nim}</p>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={handleOpenDialog} className="w-full">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Assistant Profile</DialogTitle>
              <DialogDescription>
                Update your name, role, and profile picture.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <PhotoUpload
                  onPhotoChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                  currentPhotoUrl={photoInputValue}
                  disabled={updateAssistantMutation.isPending}
                />
                {formData.image && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-500 h-8"
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                  >
                    Remove Photo
                  </Button>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={updateAssistantMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={updateAssistantMutation.isPending || !formData.name.trim()}
              >
                {updateAssistantMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="text-xs text-muted-foreground">
          <p>Email: {assistantProfile.email}</p>
          <p>Status: {assistantProfile.isActive ? 'Active' : 'Inactive'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssistantProfileEdit;