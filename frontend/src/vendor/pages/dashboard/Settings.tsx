import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Camera, Save, User } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../services/api";

const Settings = () => {
  const navigate = useNavigate();
  const vendorData = JSON.parse(localStorage.getItem("vendorOnboarding") || "{}");
  const [formData, setFormData] = useState({
    fullName: vendorData.fullName || "",
    email: vendorData.email || "",
    mobile: vendorData.mobile || "",
    business: vendorData.business || "",
    level: vendorData.level || "",
    location: vendorData.location || "",
    bio: vendorData.bio || "",
    profilePhoto: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load current profile data from backend
    const loadProfile = async () => {
      try {
        const result = await apiService.getProfile();
        if (result.data) {
          const profile = result.data;
          setFormData({
            fullName: profile.full_name || "",
            email: profile.email || "",
            mobile: profile.mobile || "",
            business: profile.business || "",
            level: profile.experience_level || "",
            location: profile.location || "",
            bio: "",
            profilePhoto: profile.profile_image ? (profile.profile_image.startsWith('http') ? profile.profile_image : `http://localhost:8000${profile.profile_image}`) : ""
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    
    loadProfile();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        // Create FormData for file upload
        const formDataUpload = new FormData();
        formDataUpload.append('profile_image', file);
        
        // Upload to backend
        const result = await apiService.updateProfile(formDataUpload);
        
        if (result.data && !result.error) {
          // Update local state with uploaded image URL
          const imageUrl = result.data.profile_image;
          if (imageUrl) {
            const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `http://localhost:8000${imageUrl}`;
            setFormData(prev => ({ ...prev, profilePhoto: fullImageUrl }));
            localStorage.setItem('profile_image', fullImageUrl);
            toast.success('Profile image uploaded successfully!');
          }
        } else {
          toast.error('Failed to upload image');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Error uploading image');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const profileData = {
        full_name: formData.fullName,
        mobile: formData.mobile,
        business: formData.business,
        experience_level: formData.level,
        location: formData.location
      };
      
      const result = await apiService.updateProfile(profileData);
      
      if (result.data && !result.error) {
        const updatedVendorData = { ...vendorData, ...formData };
        localStorage.setItem("vendorOnboarding", JSON.stringify(updatedVendorData));
        
        // Reload profile to get fresh data
        const freshProfile = await apiService.getProfile();
        if (freshProfile.data) {
          const profile = freshProfile.data;
          setFormData({
            fullName: profile.full_name || "",
            email: profile.email || "",
            mobile: profile.mobile || "",
            business: profile.business || "",
            level: profile.experience_level || "",
            location: profile.location || "",
            bio: "",
            profilePhoto: profile.profile_image ? (profile.profile_image.startsWith('http') ? profile.profile_image : `http://localhost:8000${profile.profile_image}`) : ""
          });
        }
        
        toast.success("Profile updated successfully!");
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Photo */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden">
                {formData.profilePhoto ? (
                  <img 
                    src={formData.profilePhoto} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-white" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Click the camera icon to upload a new photo
            </p>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange("mobile", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="business">Profession</Label>
                <Input
                  id="business"
                  value={formData.business}
                  onChange={(e) => handleInputChange("business", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="level">Experience Level</Label>
                <Input
                  id="level"
                  value={formData.level}
                  onChange={(e) => handleInputChange("level", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself and your services..."
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                rows={4}
              />
            </div>

            <Button onClick={handleSave} className="w-full" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;





