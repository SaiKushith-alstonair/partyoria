import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { Textarea } from "../../../components/ui/textarea";
import {
  Plus,
  Trash2,
  Edit,
  X,
  Camera,
  UtensilsCrossed,
  Sparkles,
  Music,
  Mic,
  Car,
  Flower2,
  Cake,
  Video,
  Palette,
  Scissors,
  Shirt,
  Gift,
  Users,
  Zap,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { apiService } from "../../services/api";

const professionIcons: { [key: string]: any } = {
  Photography: Camera,
  Catering: UtensilsCrossed,
  Decoration: Sparkles,
  DJ: Music,
  "Event Manager": Mic,
  Transportation: Car,
  Florist: Flower2,
  Baker: Cake,
  Videography: Video,
  "Makeup Artist": Palette,
  "Hair Stylist": Scissors,
  "Fashion Designer": Shirt,
  "Gift Services": Gift,
  Entertainment: Users,
  Lighting: Zap,
};

const serviceColors = [
  {
    bg: "from-blue-500/20 to-cyan-500/20",
    border: "border-l-blue-500",
    icon: "from-blue-500/30 to-cyan-500/30",
    text: "text-blue-600",
  },
  {
    bg: "from-purple-500/20 to-pink-500/20",
    border: "border-l-purple-500",
    icon: "from-purple-500/30 to-pink-500/30",
    text: "text-purple-600",
  },
  {
    bg: "from-green-500/20 to-emerald-500/20",
    border: "border-l-green-500",
    icon: "from-green-500/30 to-emerald-500/30",
    text: "text-green-600",
  },
  {
    bg: "from-orange-500/20 to-red-500/20",
    border: "border-l-orange-500",
    icon: "from-orange-500/30 to-red-500/30",
    text: "text-orange-600",
  },
  {
    bg: "from-indigo-500/20 to-blue-500/20",
    border: "border-l-indigo-500",
    icon: "from-indigo-500/30 to-blue-500/30",
    text: "text-indigo-600",
  },
  {
    bg: "from-rose-500/20 to-pink-500/20",
    border: "border-l-rose-500",
    icon: "from-rose-500/30 to-pink-500/30",
    text: "text-rose-600",
  },
  {
    bg: "from-teal-500/20 to-green-500/20",
    border: "border-l-teal-500",
    icon: "from-teal-500/30 to-green-500/30",
    text: "text-teal-600",
  },
  {
    bg: "from-amber-500/20 to-yellow-500/20",
    border: "border-l-amber-500",
    icon: "from-amber-500/30 to-yellow-500/30",
    text: "text-amber-600",
  },
];

const Services = () => {
  let vendorData = {};
  let vendorProfession = "Photography";
  let selectedServices: string[] = [];
  
  try {
    const storedData = localStorage.getItem("vendor_profile") || localStorage.getItem("vendorOnboarding");
    vendorData = storedData ? JSON.parse(storedData) : {};
    vendorProfession = vendorData?.business || "Photography";
    
    if (Array.isArray(vendorData?.services)) {
      selectedServices = vendorData.services;
    } else if (typeof vendorData?.services === 'string') {
      selectedServices = vendorData.services.split(',').map((s: string) => s?.trim()).filter(Boolean);
    } else {
      selectedServices = [];
    }
  } catch (error) {
    console.error('Error parsing vendor data:', error);
    vendorData = {};
    vendorProfession = "Photography";
    selectedServices = [];
  }
  
  const ProfessionIcon = professionIcons[vendorProfession] || Camera;

  interface ServiceType {
    id: number | null;
    name: string;
    price: number | null;
    minimum_people?: number | null;
    maximum_people?: number | null;
    description: string | null;
    icon: any;
    image?: string;
  }
  
  const [services, setServices] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingService, setIsAddingService] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    price: "",
    minimum_people: "",
    maximum_people: "",
    description: "",
  });
  const [editDialog, setEditDialog] = useState({ open: false, serviceIndex: -1, price: "", minimum_people: "", maximum_people: "", description: "" });
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  const handlePhotoUpload = (serviceIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!Array.isArray(services) || serviceIndex < 0 || serviceIndex >= services.length) {
        toast.error('Invalid service selection');
        return;
      }

      const file = event.target.files?.[0];
      if (!file) {
        toast.error('No file selected');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imageUrl = e.target?.result as string;
          if (!imageUrl) {
            toast.error('Failed to read image file');
            return;
          }

          const updatedServices = [...services];
          if (updatedServices[serviceIndex]) {
            updatedServices[serviceIndex] = {
              ...updatedServices[serviceIndex],
              image: imageUrl
            };
            setServices(updatedServices);
            
            // Save to localStorage with category prefix for better organization
            try {
              const serviceKey = `service_image_${vendorProfession || 'default'}_${updatedServices[serviceIndex]?.name || 'unknown'}`;
              localStorage.setItem(serviceKey, imageUrl);
            } catch (storageError) {
              console.warn('Failed to save image to localStorage:', storageError);
            }
            
            toast.success('Photo uploaded successfully!');
          }
        } catch (error) {
          console.error('Error processing image:', error);
          toast.error('Failed to process image');
        }
      };
      
      reader.onerror = () => {
        toast.error('Failed to read image file');
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error in handlePhotoUpload:', error);
      toast.error('An unexpected error occurred');
    }
  };

  // Load images from localStorage on component mount
  useEffect(() => {
    const loadImagesFromStorage = () => {
      try {
        if (!Array.isArray(services) || services.length === 0) return;
        
        const updatedServices = services.map(service => {
          try {
            const serviceKey = `service_image_${vendorProfession || 'default'}_${service?.name || 'unknown'}`;
            const savedImage = localStorage.getItem(serviceKey);
            return savedImage ? { ...service, image: savedImage } : service;
          } catch (serviceError) {
            console.warn('Error loading image for service:', service, serviceError);
            return service;
          }
        });
        
        if (JSON.stringify(updatedServices) !== JSON.stringify(services)) {
          setServices(updatedServices);
        }
      } catch (error) {
        console.error('Error loading images from storage:', error);
      }
    };
    
    if (Array.isArray(services) && services.length > 0) {
      loadImagesFromStorage();
    }
  }, [services.length]);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setIsLoading(true);
        
        // Check both localStorage locations for token
        let token = localStorage.getItem('access_token');
        
        // Also check Zustand auth-storage
        if (!token) {
          const authStorage = localStorage.getItem('auth-storage');
          if (authStorage) {
            try {
              const parsed = JSON.parse(authStorage);
              token = parsed?.state?.tokens?.access;
            } catch (e) {
              console.error('Failed to parse auth-storage:', e);
            }
          }
        }
        
        console.log('Loading services... Token exists:', !!token);
        
        if (!token) {
          console.log('No token, setting empty services');
          setServices([]);
          setIsLoading(false);
          return;
        }
        
        const result = await apiService.getServices();
        console.log('Services API result:', result);
        
        if (result?.error) {
          console.log('API returned error:', result.error);
          if (Array.isArray(selectedServices) && selectedServices.length > 0) {
            const servicesToCreate = selectedServices.map((serviceName: string) => ({
              id: null,
              name: serviceName?.trim() || 'Unknown Service',
              price: null,
              description: null,
              icon: ProfessionIcon,
            }));
            setServices(servicesToCreate);
          } else {
            setServices([]);
          }
          return;
        }
        
        // Backend returns array directly, not wrapped in results
        const servicesArray = Array.isArray(result?.data) ? result.data : (result?.data?.results || []);
        console.log('Services array:', servicesArray);
        
        if (Array.isArray(servicesArray) && servicesArray.length > 0) {
          const backendServices = servicesArray.map((service: any) => {
            try {
              return {
                id: service?.id || null,
                name: service?.service_name || 'Unknown Service',
                price: service?.service_price || null,
                minimum_people: service?.minimum_people || null,
                maximum_people: service?.maximum_people || null,
                description: service?.description || null,
                icon: ProfessionIcon,
              };
            } catch (serviceError) {
              console.warn('Error processing service:', service, serviceError);
              return {
                id: null,
                name: 'Unknown Service',
                price: null,
                minimum_people: null,
                maximum_people: null,
                description: null,
                icon: ProfessionIcon,
              };
            }
          });
          
          // Sort services: complete services first, then incomplete ones
          const sortedServices = backendServices.sort((a, b) => {
            try {
              const aComplete = a?.price && a?.description;
              const bComplete = b?.price && b?.description;
              if (aComplete && !bComplete) return -1;
              if (!aComplete && bComplete) return 1;
              return (a?.id || 0) - (b?.id || 0); // Maintain original order for same completion status
            } catch (sortError) {
              console.warn('Error sorting services:', sortError);
              return 0;
            }
          });
          
          setServices(sortedServices);
        } else {
          if (Array.isArray(selectedServices) && selectedServices.length > 0) {
            const servicesToShow = selectedServices.map((serviceName: string) => ({
              id: null,
              name: serviceName?.trim() || 'Unknown Service',
              price: null,
              description: null,
              icon: ProfessionIcon,
            }));
            setServices(servicesToShow);
          } else {
            setServices([]);
          }
        }
      } catch (error) {
        console.error('Error loading services:', error);
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
    
    // Check if this is first time visiting services page
    try {
      const hasVisitedServices = localStorage.getItem('hasVisitedServices');
      
      if (!hasVisitedServices) {
        setShowWelcomePopup(true);
        localStorage.setItem('hasVisitedServices', 'true');
      }
    } catch (storageError) {
      console.warn('Error accessing localStorage:', storageError);
    }
  }, []);

  const validateServiceData = (name: string, price: string) => {
    if (!name || name.trim().length < 2) {
      toast.error('Service name must be at least 2 characters long');
      return false;
    }
    if (name.trim().length > 100) {
      toast.error('Service name cannot exceed 100 characters');
      return false;
    }
    if (price && isNaN(parseFloat(price.replace('₹', '').replace(',', '')))) {
      toast.error('Please enter a valid price');
      return false;
    }
    return true;
  };

  const handleAddService = async () => {
    try {
      if (!validateServiceData(newService.name, newService.price)) {
        return;
      }

      const servicePrice = newService.price ? parseFloat(newService.price.replace('₹', '').replace(',', '')) : null;
      const minPeople = newService.minimum_people ? parseInt(newService.minimum_people) : null;
      const maxPeople = newService.maximum_people ? parseInt(newService.maximum_people) : null;
      
      // Validate people values
      if (minPeople && minPeople < 1) {
        toast.error('Minimum people must be at least 1');
        return;
      }
      if (maxPeople && maxPeople < 1) {
        toast.error('Maximum people must be at least 1');
        return;
      }
      if (minPeople && maxPeople && minPeople > maxPeople) {
        toast.error('Minimum people cannot be greater than maximum people');
        return;
      }
      
      const result = await apiService.createService({
        service_name: newService.name.trim(),
        category: vendorProfession || 'Photography',
        service_price: servicePrice,
        minimum_people: minPeople,
        maximum_people: maxPeople,
        description: newService.description?.trim() || null,
      });
      
      if (result?.data) {
        const newServiceObj = {
          id: result.data.id || null,
          name: result.data.service_name || newService.name.trim(),
          price: result.data.service_price || servicePrice,
          minimum_people: result.data.minimum_people || minPeople,
          maximum_people: result.data.maximum_people || maxPeople,
          description: result.data.description || newService.description?.trim(),
          icon: ProfessionIcon,
        };
        setServices(prev => Array.isArray(prev) ? [...prev, newServiceObj] : [newServiceObj]);
        setNewService({ name: "", price: "", minimum_people: "", maximum_people: "", description: "" });
        setIsAddingService(false);
        toast.success("Service added successfully!");
      } else {
        const errorMsg = result?.error || 'Failed to add service';
        if (errorMsg.includes('already exists') || errorMsg.includes('duplicate key')) {
          toast.error('Service already exists. Please choose a different name.');
        } else {
          toast.error(errorMsg);
        }
      }
    } catch (error: any) {
      console.error('Error adding service:', error);
      const errorMsg = error?.message || 'Failed to add service';
      if (errorMsg.includes('already exists') || errorMsg.includes('duplicate key')) {
        toast.error('Service already exists. Please choose a different name.');
      } else {
        toast.error('Network error. Please try again.');
      }
    }
  }; 

  const handleDeleteService = async (serviceIndex: number) => {
    try {
      if (!Array.isArray(services) || serviceIndex < 0 || serviceIndex >= services.length) {
        toast.error('Invalid service selection');
        return;
      }

      const service = services[serviceIndex];
      if (!service) {
        toast.error('Service not found');
        return;
      }
      
      if (service.id && typeof service.id === 'number') {
        try {
          const result = await apiService.deleteService(service.id);
          if (!result?.error) {
            // Remove from state immediately
            const updatedServices = services.filter((_, i) => i !== serviceIndex);
            setServices(updatedServices);
            
            // Clean up localStorage image if exists
            try {
              const serviceKey = `service_image_${vendorProfession || 'default'}_${service.name || 'unknown'}`;
              localStorage.removeItem(serviceKey);
            } catch (storageError) {
              console.warn('Failed to remove image from localStorage:', storageError);
            }
            
            toast.success("Service deleted successfully!");
          } else {
            toast.error(result?.error || 'Failed to delete service');
          }
        } catch (apiError) {
          console.error('API error deleting service:', apiError);
          toast.error('Failed to delete service from server');
        }
      } else {
        // Remove from state immediately
        const updatedServices = services.filter((_, i) => i !== serviceIndex);
        setServices(updatedServices);
        
        // Clean up localStorage image if exists
        try {
          const serviceKey = `service_image_${vendorProfession || 'default'}_${service.name || 'unknown'}`;
          localStorage.removeItem(serviceKey);
        } catch (storageError) {
          console.warn('Failed to remove image from localStorage:', storageError);
        }
        
        toast.success("Service removed successfully!");
      }
    } catch (error) {
      console.error('Error in handleDeleteService:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const calculateTotalValue = () => {
    try {
      if (!Array.isArray(services)) return 0;
      return services.reduce((total, service) => {
        try {
          if (!service?.price || service.price <= 0) return total;
          const priceValue = typeof service.price === 'string' 
            ? parseFloat(service.price.replace('₹', '').replace(',', '').split('/')[0]) || 0
            : parseFloat(service.price) || 0;
          return total + (isNaN(priceValue) ? 0 : priceValue);
        } catch (error) {
          console.warn('Error calculating price for service:', service, error);
          return total;
        }
      }, 0);
    } catch (error) {
      console.error('Error calculating total value:', error);
      return 0;
    }
  };

  const handleEditService = async () => {
    try {
      // Validation: All fields are required (people fields only for Catering)
      const isCatering = vendorProfession === 'Catering';
      
      if (!editDialog.price || !editDialog.description) {
        toast.error('Please provide price and description');
        return;
      }
      
      if (isCatering && (!editDialog.minimum_people || !editDialog.maximum_people)) {
        toast.error('Please provide minimum and maximum people');
        return;
      }
      
      // Validate price
      const editPrice = parseFloat(editDialog.price);
      if (isNaN(editPrice) || editPrice <= 0) {
        toast.error('Please enter a valid price greater than 0');
        return;
      }
      
      // Validate description length
      if (!editDialog.description?.trim() || editDialog.description.trim().length < 5) {
        toast.error('Description must be at least 5 characters long');
        return;
      }
      
      if (editDialog.description.trim().length > 500) {
        toast.error('Description cannot exceed 500 characters');
        return;
      }
      
      // Validate people values for catering category only
      if (isCatering) {
        const minPeople = parseInt(editDialog.minimum_people);
        const maxPeople = parseInt(editDialog.maximum_people);
        
        if (isNaN(minPeople) || minPeople < 1) {
          toast.error('Minimum people must be at least 1');
          return;
        }
        
        if (isNaN(maxPeople) || maxPeople < 1) {
          toast.error('Maximum people must be at least 1');
          return;
        }
        
        if (minPeople > maxPeople) {
          toast.error('Minimum people cannot be greater than maximum people');
          return;
        }
      }
      
      if (!Array.isArray(services) || editDialog.serviceIndex < 0 || editDialog.serviceIndex >= services.length) {
        toast.error('Invalid service selection');
        setEditDialog({ open: false, serviceIndex: -1, price: "", minimum_people: "", maximum_people: "", description: "" });
        return;
      }

      const service = services[editDialog.serviceIndex];
      if (!service) {
        toast.error('Service not found');
        setEditDialog({ open: false, serviceIndex: -1, price: "", minimum_people: "", maximum_people: "", description: "" });
        return;
      }
      
      const finalPrice = parseFloat(editDialog.price);
      const minPeopleValue = isCatering ? parseInt(editDialog.minimum_people) : null;
      const maxPeopleValue = isCatering ? parseInt(editDialog.maximum_people) : null;
      const description = editDialog.description.trim();
      
      const allServices = await apiService.getServices();
      
      if (allServices?.error) {
        toast.error('Error getting services: ' + (allServices.error || 'Unknown error'));
        setEditDialog({ open: false, serviceIndex: -1, price: "", minimum_people: "", maximum_people: "", description: "" });
        return;
      }
      
      const servicesArray = allServices?.data?.results || allServices?.data;
      const existingService = Array.isArray(servicesArray) 
        ? servicesArray.find((s: any) => s?.service_name?.trim() === service?.name?.trim())
        : null;
      
      if (existingService) {
        const updateData: any = {
          service_price: finalPrice,
          description: description
        };
        
        if (isCatering) {
          updateData.minimum_people = minPeopleValue;
          updateData.maximum_people = maxPeopleValue;
        } else {
          updateData.minimum_people = null;
          updateData.maximum_people = null;
        }
        
        const result = await apiService.updateService(existingService.id, updateData);
        
        if (result?.data) {
          // Update local state in place to maintain position
          setServices(prevServices => {
            if (!Array.isArray(prevServices) || editDialog.serviceIndex < 0 || editDialog.serviceIndex >= prevServices.length) {
              toast.error('Invalid service index');
              return prevServices || [];
            }
            
            const updatedServices = [...prevServices];
            updatedServices[editDialog.serviceIndex] = {
              ...updatedServices[editDialog.serviceIndex],
              id: result.data.id || updatedServices[editDialog.serviceIndex]?.id,
              price: finalPrice,
              minimum_people: minPeopleValue,
              maximum_people: maxPeopleValue,
              description: description
            };
            return updatedServices;
          });
          toast.success('Service updated successfully!');
        } else {
          toast.error(result?.error || 'Failed to update service');
        }
      } else {
        toast.error('Service not found in database. Please refresh and try again.');
      }
    } catch (error) {
      console.error('Error in handleEditService:', error);
      toast.error('Failed to update service');
    }
    
    setEditDialog({ open: false, serviceIndex: -1, price: "", minimum_people: "", maximum_people: "", description: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ✨ Services
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Manage your {vendorProfession.toLowerCase()} services
            </p>
          </div>
          <Button 
            onClick={() => setIsAddingService(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-xl px-6 py-3"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>

        {services.length > 0 && services.some(s => s.price && s.price > 0) && (
          <Card className="bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-600 border-0 shadow-2xl rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    💰 Total Service Value
                  </h3>
                  <p className="text-purple-100">
                    Combined value of all your services
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-white drop-shadow-lg">
                    ₹{calculateTotalValue().toLocaleString()}
                  </div>
                  <p className="text-purple-100">
                    {services.filter(s => s.price && s.price > 0).length} priced service{services.filter(s => s.price && s.price > 0).length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isAddingService && (
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl">
              <CardTitle className="text-xl">✨ Add New Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <Input
                placeholder="Service name"
                value={newService.name}
                onChange={(e) =>
                  setNewService({ ...newService, name: e.target.value })
                }
                className="h-12 text-lg rounded-xl"
              />
              <Input
                placeholder="Price (e.g., ₹500 or ₹25/person)"
                value={newService.price}
                onChange={(e) => {
                  let value = e.target.value;
                  if (value && /^\d+$/.test(value)) {
                    value = `₹${value}`;
                  }
                  setNewService({ ...newService, price: value });
                }}
                className="h-12 text-lg rounded-xl"
              />
              <Input
                placeholder="Description"
                value={newService.description}
                onChange={(e) =>
                  setNewService({ ...newService, description: e.target.value })
                }
                className="h-12 text-lg rounded-xl"
              />
              <div className="flex gap-3">
                <Button 
                  onClick={handleAddService}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all rounded-xl"
                >
                  Add Service
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddingService(false)}
                  className="border-2 hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(services) && services.map((service, index) => {
            try {
              if (!service) return null;
              const colorScheme = serviceColors[index % serviceColors.length] || serviceColors[0];
              return (
                <Card
                  key={`service-${index}-${service?.name || 'unknown'}`}
                  className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-gray-200 hover:border-gray-300 overflow-hidden"
                >
                <div className={`relative h-32 overflow-hidden bg-gradient-to-br ${colorScheme.bg.replace('/20', '/100')}`}>
                  {!service.image && (
                    <div className="absolute top-2 left-2 z-10">
                      <label className="cursor-pointer">
                        <span className="text-sm font-semibold text-white bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg shadow-lg hover:bg-black/80 transition-all">
                          Upload Photo
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(index, e)}
                        />
                      </label>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {service.image ? (
                      <img 
                        src={service.image} 
                        alt={service.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <service.icon className={`w-16 h-16 ${colorScheme.text} drop-shadow-lg`} />
                    )}
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    {(service.price && service.description && service.description !== '') && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditDialog({ open: true, serviceIndex: index, price: service.price?.toString() || "", minimum_people: service.minimum_people?.toString() || "", maximum_people: service.maximum_people?.toString() || "", description: service.description || "" })}
                        className="hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-110 p-2 backdrop-blur-sm"
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteService(index)}
                      className="hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-110 p-2 backdrop-blur-sm"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg text-gray-800 group-hover:text-gray-900 transition-colors">
                      {service.name}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {service.price && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-bold text-green-600 text-lg">💰 ₹{service.price}</span>
                      </div>
                    )}
                    {(service.minimum_people || service.maximum_people) && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-blue-600">👥 {service.minimum_people || 0}-{service.maximum_people || '∞'} people</span>
                      </div>
                    )}
                    {service.description && (
                      <div className="text-sm text-gray-600">
                        <span className="truncate">{service.description}</span>
                      </div>
                    )}
                  </div>

                  {(!service.price || !service.description || service.price === null || service.description === null || service.description === '') && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditDialog({ open: true, serviceIndex: index, price: service.price?.toString() || "", minimum_people: service.minimum_people?.toString() || "", maximum_people: service.maximum_people?.toString() || "", description: service.description || "" });
                        }}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-xl py-2"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        ✨ Add Price & Description
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
            } catch (error) {
              console.error('Error rendering service card:', service, error);
              return (
                <Card key={`error-${index}`} className="border-2 border-red-200 bg-red-50">
                  <CardContent className="p-4 text-center">
                    <p className="text-red-600">Error loading service</p>
                  </CardContent>
                </Card>
              );
            }
          })}
        </div>

        {/* Welcome Popup - Top Right Corner */}
        {showWelcomePopup && (
          <div className="fixed top-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-sm animate-in slide-in-from-right duration-300">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-800">🎉 Welcome!</h3>
              <button 
                onClick={() => setShowWelcomePopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Add prices and descriptions to your services to get 3x more bookings!
            </p>
            <Button 
              onClick={() => setShowWelcomePopup(false)}
              size="sm"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl"
            >
              Got it!
            </Button>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editDialog.open} onOpenChange={(open) => !open && setEditDialog({ open: false, serviceIndex: -1, price: "", minimum_people: "", maximum_people: "", description: "" })}>
          <DialogContent className="rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">{editDialog.serviceIndex >= 0 ? services[editDialog.serviceIndex]?.name : 'Service'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {vendorProfession === 'Decoration' ? (
                <Input
                  placeholder="Price"
                  value={editDialog.price}
                  onChange={(e) => setEditDialog(prev => ({ ...prev, price: e.target.value }))}
                  type="number"
                  autoFocus
                  className="h-12 text-lg rounded-xl"
                />
              ) : vendorProfession === 'Catering' ? (
                <div className="space-y-3">
                  <Input
                    placeholder="Price per plate"
                    value={editDialog.price}
                    onChange={(e) => setEditDialog(prev => ({ ...prev, price: e.target.value }))}
                    type="number"
                    autoFocus
                    className="h-12 text-lg rounded-xl"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Min People"
                      value={editDialog.minimum_people}
                      onChange={(e) => setEditDialog(prev => ({ ...prev, minimum_people: e.target.value }))}
                      type="number"
                      className="h-10 text-sm rounded-xl"
                    />
                    <Input
                      placeholder="Max People"
                      value={editDialog.maximum_people}
                      onChange={(e) => setEditDialog(prev => ({ ...prev, maximum_people: e.target.value }))}
                      type="number"
                      className="h-10 text-sm rounded-xl"
                    />
                  </div>
                </div>
              ) : (
                <Input
                  placeholder="Price"
                  value={editDialog.price}
                  onChange={(e) => setEditDialog(prev => ({ ...prev, price: e.target.value }))}
                  type="number"
                  autoFocus
                  className="h-12 text-lg rounded-xl"
                />
              )}

              <Textarea
                placeholder={vendorProfession === 'Catering' ? "Enter description of foods..." : "Enter service description..."}
                value={editDialog.description}
                onChange={(e) => setEditDialog(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="text-sm rounded-xl"
              />
              <div className="flex gap-3">
                <Button onClick={handleEditService} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all rounded-xl">
                  💾 Save
                </Button>
                <Button variant="outline" onClick={() => setEditDialog({ open: false, serviceIndex: -1, price: "", minimum_people: "", maximum_people: "", description: "" })} className="rounded-xl">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading services...</span>
          </div>
        ) : services.length === 0 && (
          <Card className="text-center py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 border-0 shadow-2xl rounded-3xl">
            <CardContent>
              <div className="text-slate-600">
                <div className="p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-fit mx-auto mb-6 shadow-lg">
                  <ProfessionIcon className="w-16 h-16 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-800">
                  🚀 No services configured yet
                </h3>
                <p className="mb-8 text-lg text-slate-600">
                  Add services to showcase your amazing {vendorProfession.toLowerCase()}{" "}
                  offerings
                </p>
                <Button
                  onClick={() => setIsAddingService(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg rounded-2xl"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  ✨ Add Your First Service
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Services;





