import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Edit,
  Camera,
  Award,
  IndianRupee,
  Settings,
  Users,
  Clock,
  X,
} from "lucide-react";
import { apiService } from "../../services/api";

const Profile = () => {
  const navigate = useNavigate();
  const [vendorData, setVendorData] = useState({
    fullName: 'Professional Vendor',
    business: 'Photography',
    email: 'vendor@example.com',
    mobile: 'XXXXXXXXXX',
    city: 'Location',
    state: '',
    pincode: '',
    location: ''
  });
  const [loading, setLoading] = useState(true);
  const [profileStats, setProfileStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    completedEvents: 0,
    totalReviews: 0,
    averageRating: "4.8",
  });
  
  const [services, setServices] = useState<string[]>([]);
  const [animateProgress, setAnimateProgress] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  
  useEffect(() => {
    // Fetch vendor profile data from database
    const fetchVendorData = async () => {
      try {
        const result = await apiService.getProfile();
        if (result.data) {
          const firstName = result.data.first_name || '';
          const lastName = result.data.last_name || '';
          const fullName = `${firstName} ${lastName}`.trim() || result.data.full_name || 'Professional Vendor';
          
          setVendorData({
            fullName: fullName,
            business: result.data.business || 'Photography',
            email: result.data.email || 'vendor@example.com',
            mobile: result.data.mobile || 'XXXXXXXXXX',
            city: result.data.city || 'Location',
            state: result.data.state || '',
            pincode: result.data.pincode || '',
            location: result.data.location || ''
          });
        }
      } catch (error) {
        console.error('Error fetching vendor data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVendorData();
    
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setAnimateProgress(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Load profile image from backend or localStorage
    const loadProfileImage = async () => {
      try {
        const result = await apiService.getProfile();
        if (result.data && result.data.profile_image) {
          const imageUrl = result.data.profile_image;
          const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `http://localhost:8000${imageUrl}`;
          setProfileImage(fullImageUrl);
        } else {
          // Fallback to localStorage
          const savedImage = localStorage.getItem('profile_image');
          if (savedImage) {
            setProfileImage(savedImage);
          }
        }
      } catch (error) {
        console.error('Error loading profile image:', error);
        // Fallback to localStorage
        const savedImage = localStorage.getItem('profile_image');
        if (savedImage) {
          setProfileImage(savedImage);
        }
      }
    };
    
    loadProfileImage();
  }, []);

  useEffect(() => {
    // Category-specific statistics
    const statsByCategory = {
      Photography: {
        totalBookings: 42,
        totalRevenue: 28500,
        completedEvents: 30,
        totalReviews: 156,
        averageRating: "4.9",
      },
      Catering: {
        totalBookings: 35,
        totalRevenue: 45200,
        completedEvents: 22,
        totalReviews: 98,
        averageRating: "4.7",
      },
      DJ: {
        totalBookings: 28,
        totalRevenue: 18900,
        completedEvents: 5,
        totalReviews: 87,
        averageRating: "4.8",
      },
      Decoration: {
        totalBookings: 31,
        totalRevenue: 22400,
        completedEvents: 18,
        totalReviews: 112,
        averageRating: "4.6",
      },
      "Event Manager": {
        totalBookings: 18,
        totalRevenue: 52800,
        completedEvents: 16,
        totalReviews: 64,
        averageRating: "4.9",
      },
      Transportation: {
        totalBookings: 48,
        totalRevenue: 15600,
        completedEvents: 34,
        totalReviews: 132,
        averageRating: "4.5",
      },
      Florist: {
        totalBookings: 39,
        totalRevenue: 19800,
        completedEvents: 16,
        totalReviews: 145,
        averageRating: "4.8",
      },
      Baker: {
        totalBookings: 52,
        totalRevenue: 16200,
        completedEvents: 28,
        totalReviews: 178,
        averageRating: "4.7",
      },
      Videography: {
        totalBookings: 24,
        totalRevenue: 38400,
        completedEvents: 12,
        totalReviews: 89,
        averageRating: "4.9",
      },
      "Makeup Artist": {
        totalBookings: 67,
        totalRevenue: 24800,
        completedEvents: 32,
        totalReviews: 203,
        averageRating: "4.8",
      },
      "Hair Stylist": {
        totalBookings: 58,
        totalRevenue: 21600,
        completedEvents: 24,
        totalReviews: 167,
        averageRating: "4.6",
      },
      "Fashion Designer": {
        totalBookings: 15,
        totalRevenue: 48900,
        completedEvents: 10,
        totalReviews: 52,
        averageRating: "4.9",
      },
      "Gift Services": {
        totalBookings: 43,
        totalRevenue: 18700,
        completedEvents: 20,
        totalReviews: 124,
        averageRating: "4.7",
      },
      Entertainment: {
        totalBookings: 22,
        totalRevenue: 32200,
        completedEvents: 10,
        totalReviews: 76,
        averageRating: "4.8",
      },
      Lighting: {
        totalBookings: 26,
        totalRevenue: 28900,
        completedEvents: 14,
        totalReviews: 94,
        averageRating: "4.7",
      },
    };

    const vendorCategory = vendorData.business || "Photography";
    const categoryStats =
      statsByCategory[vendorCategory as keyof typeof statsByCategory] ||
      statsByCategory.Photography;

    setProfileStats(categoryStats);
  }, [vendorData.business]);
  
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const result = await apiService.getServices();
        if (result.data && !result.error) {
          const servicesArray = result.data?.results || result.data;
          if (Array.isArray(servicesArray)) {
            const serviceNames = servicesArray.map((service: any) => service.service_name);
            setServices(serviceNames);
          }
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    
    fetchServices();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "V";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('profile_image', file);
        
        // Upload to backend
        const result = await apiService.updateProfile(formData);
        
        if (result.data && !result.error) {
          // Update local state with uploaded image URL
          const imageUrl = result.data.profile_image;
          if (imageUrl) {
            const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `http://localhost:8000${imageUrl}`;
            setProfileImage(fullImageUrl);
            localStorage.setItem('profile_image', fullImageUrl);
          }
        } else {
          console.error('Image upload failed:', result.error);
          // Fallback to local preview
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageData = e.target?.result as string;
            setProfileImage(imageData);
          };
          reader.readAsDataURL(file);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        // Fallback to local preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target?.result as string;
          setProfileImage(imageData);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const statCards = [
    {
      title: "Total Bookings",
      value: profileStats.totalBookings,
      icon: Calendar,
      gradient: "from-blue-500 to-cyan-500",
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
      cardBg: "bg-gradient-to-br from-blue-50 to-cyan-50",
      textColor: "text-blue-700",
      change: "+12%",
    },
    {
      title: "Active Services",
      value: services.length,
      icon: Settings,
      gradient: "from-emerald-500 to-green-500",
      iconBg: "bg-gradient-to-br from-emerald-500 to-green-500",
      cardBg: "bg-gradient-to-br from-emerald-50 to-green-50",
      textColor: "text-emerald-700",
      change: "+3 new",
    },
    {
      title: "Completed Events",
      value: profileStats.completedEvents,
      icon: CheckCircle,
      gradient: "from-purple-500 to-pink-500",
      iconBg: "bg-gradient-to-br from-purple-500 to-pink-500",
      cardBg: "bg-gradient-to-br from-purple-50 to-pink-50",
      textColor: "text-purple-700",
      change: "+8 this month",
    },
    {
      title: "Total Reviews",
      value: profileStats.totalReviews,
      icon: Star,
      gradient: "from-amber-500 to-orange-500",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
      cardBg: "bg-gradient-to-br from-amber-50 to-orange-50",
      textColor: "text-amber-700",
      change: "+15 recent",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your vendor profile and view statistics
          </p>
        </div>
        <div className="flex gap-2">
          {!profileImage && (
            <Button onClick={handleCameraClick} variant="outline">
              <Camera className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
          )}
          <Button onClick={() => navigate('/vendor/dashboard/settings')}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-800 text-white shadow-2xl border-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <CardContent className="pt-6 relative z-10">
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 ring-4 ring-white/30 shadow-xl">
                <AvatarImage src={profileImage || "/placeholder-avatar.jpg"} />
                <AvatarFallback className="text-2xl bg-white/20 text-white backdrop-blur-sm">
                  {getInitials(vendorData.fullName)}
                </AvatarFallback>
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <Button
                size="sm"
                onClick={handleCameraClick}
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-white/20 hover:bg-white/30 border-2 border-white/50"
              >
                <Camera className="w-4 h-4 text-white" />
              </Button>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                  {vendorData.fullName}
                </h2>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-white/90 mb-3">
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>{vendorData.business}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{vendorData.city}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                  <span>
                    {profileStats.averageRating} ({profileStats.totalReviews}{" "}
                    reviews)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-white/80">
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{vendorData.mobile}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span>{vendorData.email}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className={`${stat.cardBg} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden relative group`}
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.gradient}`}></div>
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 mb-2">
                      {stat.title}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                      <span className="text-xs font-medium text-gray-600">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-4 rounded-2xl ${stat.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Business Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-white to-indigo-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1 w-full"></div>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-gray-800">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <label className="text-sm font-semibold text-indigo-700 mb-1 block">
                  Vendor Name
                </label>
                <p className="text-lg font-bold text-gray-800">
                  {vendorData.fullName}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <label className="text-sm font-semibold text-purple-700 mb-1 block">
                  Business Type
                </label>
                <p className="text-lg font-bold text-gray-800">
                  {vendorData.business}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <label className="text-sm font-semibold text-pink-700 mb-2 block">
                  Services Offered
                </label>
                <div className="flex flex-wrap gap-2">
                  {services.length > 0 ? (
                    services.map((serviceName, index) => (
                      <Badge
                        key={index}
                        className="bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 border border-pink-200 hover:from-pink-200 hover:to-rose-200 transition-all duration-200"
                      >
                        {serviceName}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500 italic">
                      No services listed
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <label className="text-sm font-semibold text-indigo-700 mb-1 block">
                  Location
                </label>
                <p className="text-lg font-bold text-gray-800">{vendorData.location || `${vendorData.city}, ${vendorData.state} - ${vendorData.pincode}`}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-indigo-50 border-slate-200 h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <div className="w-2 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pb-6">
            {/* Completion Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700">
                  Completion Rate
                </span>
                <span className="text-lg font-bold text-green-600">
                  {profileStats.totalBookings > 0
                    ? Math.round(
                        (profileStats.completedEvents /
                          profileStats.totalBookings) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full transition-all ease-smooth"
                  style={{
                    width: animateProgress ? `${
                      profileStats.totalBookings > 0
                        ? Math.round(
                            (profileStats.completedEvents /
                              profileStats.totalBookings) *
                              100
                          )
                        : 0
                    }%` : '0%',
                    transitionDuration: `${(profileStats.totalBookings > 0 ? Math.round((profileStats.completedEvents / profileStats.totalBookings) * 100) : 0) * 20}ms`
                  }}
                ></div>
              </div>
            </div>

            {/* Average Rating */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700">
                  Average Rating
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(parseFloat(profileStats.averageRating))
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-bold text-yellow-600">
                    {profileStats.averageRating}
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2.5 rounded-full transition-all ease-smooth"
                  style={{
                    width: animateProgress ? `${
                      (parseFloat(profileStats.averageRating) / 5) * 100
                    }%` : '0%',
                    transitionDuration: `${((parseFloat(profileStats.averageRating) / 5) * 100) * 20}ms`
                  }}
                ></div>
              </div>
            </div>

            {/* Response Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700">
                  Response Rate
                </span>
                <span className="text-lg font-bold text-blue-600">95%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full transition-all ease-smooth"
                  style={{ 
                    width: animateProgress ? "95%" : "0%",
                    transitionDuration: `${95 * 20}ms`
                  }}
                ></div>
              </div>
            </div>

            {/* Member Since */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700">
                  Member Since
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  <span className="text-lg font-bold text-slate-800">2024</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completed Events Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Recent Completed Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(() => {
              const eventsByCategory = {
                Photography: [
                  {
                    title: "Engagement Photoshoot",
                    client: "Priya & Arjun",
                    amount: "₹1,800",
                    rating: 5,
                    location: "Marine Drive, Mumbai",
                    date: "Sep 20, 2025",
                    gradient: "from-rose-500 to-pink-500",
                    image:
                      "https://www.baliweddingprices.com/wp-content/uploads/2022/03/pre-wedding-photo-unique.jpg",
                    guests: "2 people",
                  },
                  {
                    title: "Family Portrait Session",
                    client: "The Gupta Family",
                    amount: "₹1,200",
                    rating: 4,
                    location: "Lodhi Gardens, Delhi",
                    date: "Sep 12, 2025",
                    gradient: "from-blue-500 to-indigo-500",
                    image:
                      "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=200&fit=crop",
                    guests: "5 people",
                  },
                  {
                    title: "Maternity Photography",
                    client: "Kavya Sharma",
                    amount: "₹1,500",
                    rating: 5,
                    location: "Botanical Garden, Pune",
                    date: "Aug 28, 2025",
                    gradient: "from-purple-500 to-pink-500",
                    image:
                      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
                    guests: "3 people",
                  },
                  {
                    title: "Pre-Wedding Shoot",
                    client: "Rohit & Sneha",
                    amount: "₹2,200",
                    rating: 4,
                    location: "Fort Kochi, Kerala",
                    date: "Aug 15, 2025",
                    gradient: "from-orange-500 to-red-500",
                    image:
                      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=200&fit=crop",
                    guests: "2 people",
                  },
                  {
                    title: "Baby Photography",
                    client: "The Mehta Family",
                    amount: "₹900",
                    rating: 5,
                    location: "Home Studio, Bangalore",
                    date: "Jul 30, 2025",
                    gradient: "from-green-500 to-emerald-500",
                    image:
                      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=200&fit=crop",
                    guests: "4 people",
                  },
                  {
                    title: "Graduation Photography",
                    client: "Ananya College",
                    amount: "₹1,600",
                    rating: 4,
                    location: "University Campus, Chennai",
                    date: "Jul 18, 2025",
                    gradient: "from-teal-500 to-cyan-500",
                    image:
                      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=200&fit=crop",
                    guests: "50 people",
                  },
                ],
                Catering: [
                  {
                    title: " Ceremony Catering",
                    client: "Meera & Vikash",
                    amount: "₹7,800",
                    rating: 5,
                    location: "Banquet Hall, Jaipur",
                    date: "Sep 25, 2025",
                    gradient: "from-yellow-500 to-orange-500",
                    image:
                      "https://wallpapers.com/images/hd/traditional-thali-platter-indian-food-7ppdmw8bs4n1f36j.jpg",
                    guests: "80 people",
                  },
                  {
                    title: "Office Party Catering",
                    client: "Infosys Technologies",
                    amount: "₹1,80,00",
                    rating: 4,
                    location: "Corporate Campus, Hyderabad",
                    date: "Sep 10, 2025",
                    gradient: "from-blue-500 to-indigo-500",
                    image:
                      "https://images.squarespace-cdn.com/content/v1/6151e34be5ddf120847ee173/1657899557263-M4ZBQ3MUTUZIF11DRRQL/Rajala+Graze+Table.jpg",
                    guests: "120 people",
                  },
                  {
                    title: "Kitty Party Catering",
                    client: "Ladies Club Society",
                    amount: "₹1,200",
                    rating: 5,
                    location: "Community Hall, Kolkata",
                    date: "Aug 22, 2025",
                    gradient: "from-pink-500 to-rose-500",
                    image:
                      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=200&fit=crop",
                    guests: "25 people",
                  },
                  {
                    title: "Engagement Dinner",
                    client: "The Agarwal Family",
                    amount: "₹2,200",
                    rating: 4,
                    location: "Garden Restaurant, Lucknow",
                    date: "Aug 8, 2025",
                    gradient: "from-green-500 to-emerald-500",
                    image:
                      "https://img.freepik.com/premium-photo/top-view-lavish-middle-eastern-feast-with-traditional-foods_1187703-83436.jpg?w=996",
                    guests: "60 people",
                  },
                  {
                    title: "Festival Catering",
                    client: "Durga Puja Committee",
                    amount: "₹3,50,00",
                    rating: 5,
                    location: "Pandal Ground, Bhubaneswar",
                    date: "Jul 25, 2025",
                    gradient: "from-red-500 to-pink-500",
                    image:
                      "https://images.hindustantimes.com/img/2022/08/27/1600x900/onam_sadhya_1661591566375_1661591577981_1661591577981.jpg",
                    guests: "500 people",
                  },
                  {
                    title: "Retirement Party Catering",
                    client: "Government Office",
                    amount: "₹1,60,00",
                    rating: 4,
                    location: "Officer's Club, Chandigarh",
                    date: "Jul 12, 2025",
                    gradient: "from-purple-500 to-indigo-500",
                    image:
                      "https://images.lifestyleasia.com/wp-content/uploads/sites/6/2022/11/25125630/Parkroyal-Collection-Pickering-Festive-Buffet-Dinner-1200x900.jpg",
                    guests: "70 people",
                  },
                ],
                Decoration: [
                  {
                    title: " Gate Decoration",
                    client: "Amit & Priya Verma",
                    amount: "₹1,100",
                    rating: 4,
                    location: "New Residence, Ahmedabad",
                    date: "Aug 6, 2025",
                    gradient: "from-orange-500 to-red-500",
                    image:
                      "https://imageswedding.theweddingcompany.com/bh_prod_bucket/weddings/6a92a382-6af1-4e3a-af68-650642f508dd/gmap/dc5b46d3-9beb-403b-a6a0-d8db0b93ea45.JPG",
                    guests: "50 people",
                  },
                 
                  {
                    title: "Office Inauguration Decor",
                    client: "Startup Hub Pvt Ltd",
                    amount: "₹2,000",
                    rating: 4,
                    location: "Tech Park, Noida",
                    date: "Sep 5, 2025",
                    gradient: "from-blue-500 to-cyan-500",
                    image:
                      "https://rosettefreshflowers.com/wp-content/uploads/2022/12/Photo_1671070890202.jpg",
                    guests: "100 people",
                  },
                   {
                    title: "Stage Decoration",
                    client: "Riya & Karan",
                    amount: "₹1,400",
                    rating: 5,
                    location: "Farmhouse, Gurgaon",
                    date: "Sep 18, 2025",
                    gradient: "from-green-500 to-yellow-500",
                    image:
                      "https://i.pinimg.com/originals/08/f1/5d/08f15dea4cf9016b1d8406fb8295c9ae.jpg",
                    guests: "75 people",
                  },
                  {
                    title: "Naming Ceremony Decoration",
                    client: "The Joshi Family",
                    amount: "₹800",
                    rating: 5,
                    location: "Home Venue, Indore",
                    date: "Aug 20, 2025",
                    gradient: "from-pink-500 to-purple-500",
                    image:
                      "https://milanmantra.com/wp-content/uploads/2023/05/6.jpg",
                    guests: "30 people",
                  },
                  {
                    title: "Housewarming Decoration",
                    client: "Amit & Priya Verma",
                    amount: "₹1,100",
                    rating: 4,
                    location: "New Residence, Ahmedabad",
                    date: "Aug 6, 2025",
                    gradient: "from-orange-500 to-red-500",
                    image:
                      "https://www.coasterfurniture.com/wp-content/uploads/colorful-couches-and-pillows.jpeg",
                    guests: "40 people",
                  },
                  

                  {
                    title: "Farewell Party Decoration",
                    client: "St. Mary's School",
                    amount: "₹900",
                    rating: 4,
                    location: "School Auditorium, Kochi",
                    date: "Jul 8, 2025",
                    gradient: "from-teal-500 to-blue-500",
                    image:
                      "https://imageswedding.theweddingcompany.com/bh_prod_bucket/weddings/544ee174-a406-4e57-80fa-18d6b27cb91a/admin_uploads/4935e97d-6916-4cc0-8e02-6696e5acefee.webp",
                    guests: "120 people",
                  },
                ],
                DJ: [
                  {
                    title: "Sangeet Night DJ",
                    client: "Neha & Rajesh",
                    amount: "₹1,800",
                    rating: 5,
                    location: "Resort Venue, Udaipur",
                    date: "Sep 22, 2025",
                    gradient: "from-purple-500 to-pink-500",
                    image:
                      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop",
                  },
                  {
                    title: "New Year Party DJ",
                    client: "Club Infinity",
                    amount: "₹2,500",
                    rating: 4,
                    location: "Nightclub, Mumbai",
                    date: "Dec 31, 2024",
                    gradient: "from-gold-500 to-yellow-500",
                    image:
                      "https://images.unsplash.com/photo-1571266028243-d220c9c3b31f?w=400&h=200&fit=crop",
                  },
                  {
                    title: "College Fest DJ",
                    client: "IIT Delhi",
                    amount: "₹1,200",
                    rating: 5,
                    location: "Campus Ground, Delhi",
                    date: "Aug 25, 2025",
                    gradient: "from-blue-500 to-indigo-500",
                    image:
                      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Pool Party DJ",
                    client: "The Kapoor Family",
                    amount: "₹1,000",
                    rating: 4,
                    location: "Private Villa, Lonavala",
                    date: "Aug 12, 2025",
                    gradient: "from-cyan-500 to-blue-500",
                    image:
                      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Dandiya Night DJ",
                    client: "Cultural Association",
                    amount: "₹1,500",
                    rating: 5,
                    location: "Community Ground, Surat",
                    date: "Oct 15, 2024",
                    gradient: "from-orange-500 to-red-500",
                    image:
                      "https://hindi.cdn.zeenews.com/hindi/sites/default/files/2022/09/29/1344607-dandiya.jpg",
                  },
                  {
                    title: "Farewell Party DJ",
                    client: "Engineering College",
                    amount: "₹800",
                    rating: 4,
                    location: "College Auditorium, Pune",
                    date: "Jul 15, 2025",
                    gradient: "from-green-500 to-teal-500",
                    image:
                      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=200&fit=crop",
                  },
                ],
                "Event Manager": [
                  {
                    title: "Destination Wedding Planning",
                    client: "Kavita & Suresh",
                    amount: "₹5,500",
                    rating: 5,
                    location: "Palace Resort, Jodhpur",
                    date: "Sep 28, 2025",
                    gradient: "from-royal-500 to-purple-500",
                    image:
                      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Product Launch Event",
                    client: "Samsung India",
                    amount: "₹4,200",
                    rating: 4,
                    location: "Convention Center, Bangalore",
                    date: "Sep 14, 2025",
                    gradient: "from-blue-500 to-indigo-500",
                    image:
                      "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Award Ceremony Planning",
                    client: "Film Industry Guild",
                    amount: "₹3,800",
                    rating: 5,
                    location: "Grand Ballroom, Mumbai",
                    date: "Aug 30, 2025",
                    gradient: "from-gold-500 to-yellow-500",
                    image:
                      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Cultural Festival Planning",
                    client: "State Tourism Board",
                    amount: "₹4,800",
                    rating: 4,
                    location: "Heritage Site, Hampi",
                    date: "Aug 16, 2025",
                    gradient: "from-orange-500 to-red-500",
                    image:
                      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Corporate Retreat Planning",
                    client: "TCS Limited",
                    amount: "₹3,200",
                    rating: 5,
                    location: "Hill Station Resort, Ooty",
                    date: "Jul 28, 2025",
                    gradient: "from-green-500 to-emerald-500",
                    image:
                      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Fashion Show Planning",
                    client: "Designer Collective",
                    amount: "₹2,800",
                    rating: 4,
                    location: "Fashion Week Venue, Delhi",
                    date: "Jul 14, 2025",
                    gradient: "from-pink-500 to-rose-500",
                    image:
                      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=200&fit=crop",
                  },
                ],
                Transportation: [
                  {
                    title: "Baraat Transportation",
                    client: "Bride",
                    amount: "₹1,2000",
                    rating: 5,
                    location: "Wedding Route, Agra",
                    date: "Sep 26, 2025",
                    gradient: "from-red-500 to-orange-500",
                    image:
                      "https://img.freepik.com/premium-photo/beautiful-colorful-ribbon-flower-decorations-luxury-cars-bride-groom_449728-1382.jpg",
                    guests: "15 people",
                  },
                  {
                    title: "Corporate Shuttle Service",
                    client: "Wipro Technologies",
                    amount: "₹800",
                    rating: 4,
                    location: "IT Corridor, Chennai",
                    date: "Sep 11, 2025",
                    gradient: "from-blue-500 to-indigo-500",
                    image:
                      "https://busbooking.sg/wp-content/uploads/WhatsApp-Image-2025-07-08-at-13.19.51_5bdd2f9a.jpg",
                    guests: "45 people",
                  },
                  {
                    title: "Tourist Group Transport",
                    client: "Golden Triangle Tours",
                    amount: "₹1,500",
                    rating: 5,
                    location: "Delhi-Agra-Jaipur Circuit",
                    date: "Aug 24, 2025",
                    gradient: "from-yellow-500 to-orange-500",
                    image:
                      "https://etimg.etb2bimg.com/thumb/msid-115860861,imgsize-86540,width-1200,height=765,overlay-etauto/auto-technology/cameras-app-to-track-ticketless-travel-on-mumbais-best-buses.jpg",
                    guests: "35 people",
                  },
                  {
                    title: "School Trip Transport",
                    client: "Delhi Public School",
                    amount: "₹600",
                    rating: 4,
                    location: "Educational Tour, Rajasthan",
                    date: "Aug 10, 2025",
                    gradient: "from-green-500 to-teal-500",
                    image:
                      "https://tse3.mm.bing.net/th/id/OIP.Pt-MiuiXzleldAhsqN845AHaFj?pid=Api&P=0&h=220",
                    guests: "50 students",
                  },
                  {
                    title: "VIP Airport Transfer",
                    client: "Business Delegation",
                    amount: "₹400",
                    rating: 5,
                    location: "Airport-Hotel Route, Mumbai",
                    date: "Jul 26, 2025",
                    gradient: "from-purple-500 to-indigo-500",
                    image:
                      "https://www.murgencyairportassistance.com/images/blog/63e309fd729cb08befded483376383d5",
                    guests: "8 people",
                  },
                  {
                    title: "Wedding Guest Transport",
                    client: "The Malhotra Family",
                    amount: "₹1,000",
                    rating: 4,
                    location: "Hotel-Venue Route, Goa",
                    date: "Jul 12, 2025",
                    gradient: "from-cyan-500 to-blue-500",
                    image:
                      "https://tse1.mm.bing.net/th/id/OIP.kxkwrryoDQrH3IOJLl3EdQHaE8?pid=Api&P=0&h=220",
                    guests: "25 people",
                  },
                ],
                Florist: [
                  {
                    title: "Temple Flower Decoration",
                    client: "Shri Ganesh Temple",
                    amount: "₹1,800",
                    rating: 5,
                    location: "Temple Complex, Varanasi",
                    date: "Sep 24, 2025",
                    gradient: "from-green-500 to-blue-500",
                    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Hotel Lobby Arrangements",
                    client: "Taj Hotels",
                    amount: "₹1,200",
                    rating: 4,
                    location: "Five Star Hotel, Mumbai",
                    date: "Sep 9, 2025",
                    gradient: "from-pink-500 to-rose-500",
                    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Funeral Flower Arrangements",
                    client: "Peaceful Memories",
                    amount: "₹800",
                    rating: 5,
                    location: "Memorial Service, Delhi",
                    date: "Aug 21, 2025",
                    gradient: "from-green-500 to-blue-500",
                    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Valentine's Day Bouquets",
                    client: "Love Express Gifts",
                    amount: "₹600",
                    rating: 4,
                    location: "Flower Shop, Pune",
                    date: "Feb 14, 2025",
                    gradient: "from-red-500 to-pink-500",
                    image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Diwali Flower Decorations",
                    client: "Residential Society",
                    amount: "₹1,400",
                    rating: 5,
                    location: "Housing Complex, Ahmedabad",
                    date: "Nov 12, 2024",
                    gradient: "from-yellow-500 to-orange-500",
                    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Car Decoration for Wedding",
                    client: "Bride's Family",
                    amount: "₹500",
                    rating: 4,
                    location: "Wedding Venue, Jaipur",
                    date: "Jul 20, 2025",
                    gradient: "from-pink-500 to-purple-500",
                    image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&h=200&fit=crop",
                  },
                ],
                Baker: [
                  {
                    title: "Engagement Cake",
                    client: "Ravi & Pooja",
                    amount: "₹1,200",
                    rating: 5,
                    location: "Banquet Hall, Lucknow",
                    date: "Sep 21, 2025",
                    gradient: "from-pink-500 to-rose-500",
                    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Office Anniversary Cake",
                    client: "Microsoft India",
                    amount: "₹800",
                    rating: 4,
                    location: "Corporate Office, Hyderabad",
                    date: "Sep 7, 2025",
                    gradient: "from-blue-500 to-indigo-500",
                    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Kids Birthday Cake",
                    client: "The Sharma Family",
                    amount: "₹400",
                    rating: 5,
                    location: "Home Party, Noida",
                    date: "Aug 19, 2025",
                    gradient: "from-rainbow-500 to-pink-500",
                    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Festival Sweets",
                    client: "Ganesh Utsav Committee",
                    amount: "₹1,500",
                    rating: 4,
                    location: "Community Center, Pune",
                    date: "Aug 5, 2025",
                    gradient: "from-orange-500 to-yellow-500",
                    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Graduation Cake",
                    client: "Medical College",
                    amount: "₹600",
                    rating: 5,
                    location: "College Campus, Bangalore",
                    date: "Jul 24, 2025",
                    gradient: "from-green-500 to-emerald-500",
                    image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Retirement Cake",
                    client: "Government Department",
                    amount: "₹500",
                    rating: 4,
                    location: "Office Cafeteria, Chennai",
                    date: "Jul 10, 2025",
                    gradient: "from-purple-500 to-indigo-500",
                    image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400&h=200&fit=crop",
                  },
                ],
                Videography: [
                  {
                    title: "Pre-Wedding Film",
                    client: "Ankit & Shruti",
                    amount: "₹3,200",
                    rating: 5,
                    location: "Scenic Locations, Kashmir",
                    date: "Sep 19, 2025",
                    gradient: "from-blue-500 to-cyan-500",
                    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Corporate Documentary",
                    client: "Reliance Industries",
                    amount: "₹2,800",
                    rating: 4,
                    location: "Refinery Complex, Gujarat",
                    date: "Sep 6, 2025",
                    gradient: "from-green-500 to-teal-500",
                    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Cultural Event Coverage",
                    client: "Dance Academy",
                    amount: "₹1,800",
                    rating: 5,
                    location: "Cultural Center, Kolkata",
                    date: "Aug 18, 2025",
                    gradient: "from-purple-500 to-pink-500",
                    image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Product Advertisement",
                    client: "Fashion Brand",
                    amount: "₹2,200",
                    rating: 4,
                    location: "Studio Setup, Mumbai",
                    date: "Aug 4, 2025",
                    gradient: "from-gold-500 to-yellow-500",
                    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Educational Video",
                    client: "Online Learning Platform",
                    amount: "₹1,500",
                    rating: 5,
                    location: "Recording Studio, Bangalore",
                    date: "Jul 21, 2025",
                    gradient: "from-blue-500 to-indigo-500",
                    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Travel Documentary",
                    client: "Tourism Board",
                    amount: "₹2,500",
                    rating: 4,
                    location: "Heritage Sites, Rajasthan",
                    date: "Jul 7, 2025",
                    gradient: "from-orange-500 to-red-500",
                    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=200&fit=crop",
                  },
                ],
                "Makeup Artist": [
                  {
                    title: "Engagement Makeup",
                    client: "Deepika Patel",
                    amount: "₹600",
                    rating: 5,
                    location: "Bridal Suite, Surat",
                    date: "Sep 17, 2025",
                    gradient: "from-pink-500 to-rose-500",
                    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Fashion Show Makeup",
                    client: "Lakme Fashion Week",
                    amount: "₹1,200",
                    rating: 4,
                    location: "Runway Venue, Mumbai",
                    date: "Sep 3, 2025",
                    gradient: "from-purple-500 to-pink-500",
                    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Portfolio Shoot Makeup",
                    client: "Aspiring Model",
                    amount: "₹400",
                    rating: 5,
                    location: "Photography Studio, Delhi",
                    date: "Aug 17, 2025",
                    gradient: "from-blue-500 to-indigo-500",
                    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Festival Makeup",
                    client: "Dance Troupe",
                    amount: "₹800",
                    rating: 4,
                    location: "Cultural Event, Chennai",
                    date: "Aug 3, 2025",
                    gradient: "from-orange-500 to-yellow-500",
                    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=200&fit=crop",
                  },
                  {
                    title: "TV Commercial Makeup",
                    client: "Advertising Agency",
                    amount: "₹1,000",
                    rating: 5,
                    location: "Film Studio, Hyderabad",
                    date: "Jul 19, 2025",
                    gradient: "from-green-500 to-emerald-500",
                    image: "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Party Makeup",
                    client: "Celebrity Client",
                    amount: "₹1,500",
                    rating: 4,
                    location: "Five Star Hotel, Bangalore",
                    date: "Jul 5, 2025",
                    gradient: "from-gold-500 to-yellow-500",
                    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=200&fit=crop",
                  },
                ],
                "Hair Stylist": [
                  {
                    title: "Sangeet Hairstyling",
                    client: "Bride's Party",
                    amount: "₹800",
                    rating: 5,
                    location: "Destination Wedding, Udaipur",
                    date: "Sep 16, 2025",
                    gradient: "from-purple-500 to-pink-500",
                    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Corporate Headshot Styling",
                    client: "LinkedIn Professionals",
                    amount: "₹400",
                    rating: 4,
                    location: "Business Center, Gurgaon",
                    date: "Sep 2, 2025",
                    gradient: "from-blue-500 to-indigo-500",
                    image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Fashion Editorial Styling",
                    client: "Vogue Magazine",
                    amount: "₹1,200",
                    rating: 5,
                    location: "Photo Studio, Mumbai",
                    date: "Aug 16, 2025",
                    gradient: "from-pink-500 to-rose-500",
                    image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Cultural Performance Styling",
                    client: "Classical Dancers",
                    amount: "₹600",
                    rating: 4,
                    location: "Music Academy, Chennai",
                    date: "Aug 2, 2025",
                    gradient: "from-orange-500 to-red-500",
                    image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Bollywood Movie Styling",
                    client: "Film Production House",
                    amount: "₹1,500",
                    rating: 5,
                    location: "Film City, Mumbai",
                    date: "Jul 18, 2025",
                    gradient: "from-gold-500 to-yellow-500",
                    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Award Show Styling",
                    client: "Celebrity Stylist",
                    amount: "₹1,000",
                    rating: 4,
                    location: "Award Venue, Delhi",
                    date: "Jul 4, 2025",
                    gradient: "from-silver-500 to-gray-500",
                    image: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400&h=200&fit=crop",
                  },
                ],
                "Fashion Designer": [
                  {
                    title: "Lehenga Design",
                    client: "Bride-to-be",
                    amount: "₹3,500",
                    rating: 5,
                    location: "Designer Boutique, Delhi",
                    date: "Sep 15, 2025",
                    gradient: "from-red-500 to-pink-500",
                    guests: "1 person",
                  },
                  {
                    title: "Corporate Uniform Design",
                    client: "Airlines Company",
                    amount: "₹2,800",
                    rating: 4,
                    location: "Design Studio, Mumbai",
                    date: "Sep 1, 2025",
                    gradient: "from-blue-500 to-indigo-500",
                    guests: "200 staff",
                  },
                  {
                    title: "Festival Collection",
                    client: "Ethnic Wear Brand",
                    amount: "₹4,200",
                    rating: 5,
                    location: "Fashion House, Jaipur",
                    date: "Aug 15, 2025",
                    gradient: "from-orange-500 to-yellow-500",
                    guests: "50 pieces",
                  },
                  {
                    title: "Designer Saree",
                    client: "Fashion Enthusiast",
                    amount: "₹2,200",
                    rating: 4,
                    location: "Silk Weaving Center, Kanchipuram",
                    date: "Aug 1, 2025",
                    gradient: "from-purple-500 to-pink-500",
                    guests: "1 person",
                  },
                  {
                    title: "Men's Sherwani Design",
                    client: "Groom's Family",
                    amount: "₹1,800",
                    rating: 5,
                    location: "Tailoring Studio, Lucknow",
                    date: "Jul 17, 2025",
                    gradient: "from-gold-500 to-orange-500",
                    guests: "1 person",
                  },
                  {
                    title: "Kids Party Wear",
                    client: "Children's Boutique",
                    amount: "₹1,200",
                    rating: 4,
                    location: "Kids Fashion Store, Pune",
                    date: "Jul 3, 2025",
                    gradient: "from-rainbow-500 to-pink-500",
                    guests: "15 pieces",
                  },
                ],
                "Gift Services": [
                  {
                    title: "Customized Wedding Hampers",
                    client: "Wedding Planners",
                    amount: "₹1,500",
                    rating: 5,
                    location: "Gift Packaging Center, Mumbai",
                    date: "Sep 14, 2025",
                    gradient: "from-pink-500 to-rose-500",
                    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Employee Recognition Gifts",
                    client: "Tech Company",
                    amount: "₹1,200",
                    rating: 4,
                    location: "Corporate Office, Bangalore",
                    date: "Aug 31, 2025",
                    gradient: "from-blue-500 to-indigo-500",
                    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Festival Gift Boxes",
                    client: "Diwali Celebrations",
                    amount: "₹800",
                    rating: 5,
                    location: "Community Center, Delhi",
                    date: "Nov 10, 2024",
                    gradient: "from-yellow-500 to-orange-500",
                    image: "https://images.unsplash.com/photo-1607344645866-009c7d0435c9?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Baby Shower Gifts",
                    client: "Expecting Parents",
                    amount: "₹600",
                    rating: 4,
                    location: "Home Venue, Pune",
                    date: "Jul 30, 2025",
                    gradient: "from-pastel-500 to-pink-500",
                    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Corporate Diwali Gifts",
                    client: "Business Associates",
                    amount: "₹2,000",
                    rating: 5,
                    location: "Gift Center, Ahmedabad",
                    date: "Oct 20, 2024",
                    gradient: "from-gold-500 to-yellow-500",
                    image: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Retirement Memento",
                    client: "Government Office",
                    amount: "₹400",
                    rating: 4,
                    location: "Administrative Building, Chennai",
                    date: "Jul 16, 2025",
                    gradient: "from-silver-500 to-gray-500",
                    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=200&fit=crop",
                  },
                ],
                Entertainment: [
                  {
                    title: "Classical Music Concert",
                    client: "Cultural Society",
                    amount: "₹2,500",
                    rating: 5,
                    location: "Music Hall, Chennai",
                    date: "Sep 13, 2025",
                    gradient: "from-purple-500 to-indigo-500",
                    guests: "200 people",
                    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Stand-up Comedy Show",
                    client: "Corporate Event",
                    amount: "₹1,800",
                    rating: 4,
                    location: "Hotel Ballroom, Mumbai",
                    date: "Aug 30, 2025",
                    gradient: "from-yellow-500 to-orange-500",
                    guests: "150 people",
                    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Folk Dance Performance",
                    client: "Cultural Festival",
                    amount: "₹1,200",
                    rating: 5,
                    location: "Heritage Site, Rajasthan",
                    date: "Aug 14, 2025",
                    gradient: "from-red-500 to-orange-500",
                    guests: "300 people",
                    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Magic Show",
                    client: "Children's Birthday",
                    amount: "₹600",
                    rating: 4,
                    location: "Community Hall, Bangalore",
                    date: "Jul 29, 2025",
                    gradient: "from-rainbow-500 to-purple-500",
                    guests: "30 kids",
                    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Bollywood Dance Troupe",
                    client: "Wedding Celebration",
                    amount: "₹2,200",
                    rating: 5,
                    location: "Palace Venue, Udaipur",
                    date: "Jul 15, 2025",
                    gradient: "from-pink-500 to-rose-500",
                    guests: "250 people",
                    image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Acoustic Band Performance",
                    client: "Cafe Launch",
                    amount: "₹1,000",
                    rating: 4,
                    location: "Rooftop Cafe, Delhi",
                    date: "Jul 1, 2025",
                    gradient: "from-green-500 to-teal-500",
                    guests: "80 people",
                    image: "https://images.unsplash.com/photo-1571266028243-d220c9c3b31f?w=400&h=200&fit=crop",
                  },
                ],
                Lighting: [
                  {
                    title: "Diwali Light Decoration",
                    client: "Shopping Mall",
                    amount: "₹2,200",
                    rating: 5,
                    location: "Commercial Complex, Mumbai",
                    date: "Oct 25, 2024",
                    gradient: "from-yellow-500 to-orange-500",
                    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Concert Stage Lighting",
                    client: "Music Festival",
                    amount: "₹1,800",
                    rating: 4,
                    location: "Open Ground, Bangalore",
                    date: "Aug 28, 2025",
                    gradient: "from-purple-500 to-pink-500",
                    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Hotel Facade Lighting",
                    client: "Luxury Resort",
                    amount: "₹1,500",
                    rating: 5,
                    location: "Hill Station, Shimla",
                    date: "Aug 12, 2025",
                    gradient: "from-blue-500 to-cyan-500",
                    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Garden Party Lighting",
                    client: "Private Celebration",
                    amount: "₹800",
                    rating: 4,
                    location: "Farmhouse, Gurgaon",
                    date: "Jul 27, 2025",
                    gradient: "from-green-500 to-emerald-500",
                    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Temple Festival Lighting",
                    client: "Religious Committee",
                    amount: "₹1,200",
                    rating: 5,
                    location: "Ancient Temple, Varanasi",
                    date: "Jul 13, 2025",
                    gradient: "from-saffron-500 to-orange-500",
                    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
                  },
                  {
                    title: "Corporate Event Lighting",
                    client: "Product Launch",
                    amount: "₹1,000",
                    rating: 4,
                    location: "Convention Center, Delhi",
                    date: "Jun 30, 2025",
                    gradient: "from-silver-500 to-blue-500",
                    image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&h=200&fit=crop",
                  },
                ],
              };
              const vendorCategory = vendorData.business || "Photography";
              console.log("Vendor business:", vendorCategory);
              console.log(
                "Available categories:",
                Object.keys(eventsByCategory)
              );
              return (
                eventsByCategory[
                  vendorCategory as keyof typeof eventsByCategory
                ] || eventsByCategory.Photography
              );
            })().map((event, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-gray-200 hover:border-gray-300 overflow-hidden"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />

                </div>
                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg text-gray-800 group-hover:text-gray-900 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600 font-medium">
                      {event.client}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < event.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">
                      ({event.rating}.0)
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-semibold text-green-600">{event.amount}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-blue-600 font-medium">{event.guests || "Small gathering"}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEventDialog(true);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Event Details
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-6">
              {/* Event Image */}
              <div className="relative h-48 rounded-lg overflow-hidden">
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                </div>
              </div>

              {/* Event Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{selectedEvent.title}</h3>
                    <p className="text-gray-600 font-medium">{selectedEvent.client}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < selectedEvent.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">
                      {selectedEvent.rating}.0 Rating
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{selectedEvent.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{selectedEvent.date}</span>
                    </div>
                    {selectedEvent.guests && (
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{selectedEvent.guests}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-700">Total Amount</span>
                      <span className="text-2xl font-bold text-green-600">{selectedEvent.amount}</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">Event Status</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Booking Confirmed</span>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Service Delivered</span>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Payment Received</span>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                  </div>


                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;





