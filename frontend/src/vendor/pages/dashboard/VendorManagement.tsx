import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { 
  Edit, 
  Trash2, 
  Plus, 
  Upload, 
  Save, 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  IndianRupee,
  Camera,
  Users,
  Loader2
} from "lucide-react";
import { apiService } from "../../services/api";
import { toast } from "sonner";

const categories = ["Photography", "Catering", "DJ", "Decoration", "Event Manager", "Makeup Artist"];
const experienceLevels = ["Beginner", "Intermediate", "Expert"];

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingVendor, setEditingVendor] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showImageGallery, setShowImageGallery] = useState(false);

  const [vendorForm, setVendorForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    business: "",
    experience_level: "",
    location: "",
    city: "",
    state: "",
    pincode: ""
  });

  const [serviceForm, setServiceForm] = useState({
    service_name: "",
    category: "",
    service_price: "",
    minimum_people: "",
    maximum_people: "",
    description: ""
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      console.log('Fetching vendors...');
      const response = await apiService.getVendors({ limit: 100 });
      console.log('Vendors response:', response);
      
      if (response.success && response.data) {
        const vendorsList = response.data.results || response.data;
        console.log('Vendors list:', vendorsList);
        setVendors(Array.isArray(vendorsList) ? vendorsList : []);
      } else {
        console.log('No vendors found or error:', response.error);
        setVendors([]);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditVendor = (vendor) => {
    setEditingVendor(vendor);
    setVendorForm({
      full_name: vendor.full_name || "",
      email: vendor.email || "",
      mobile: vendor.mobile || "",
      business: vendor.business || "",
      experience_level: vendor.experience_level || "",
      location: vendor.location || vendor.address || "",
      city: vendor.city || "",
      state: vendor.state || "",
      pincode: vendor.pincode || ""
    });
    setShowEditDialog(true);
  };

  const handleUpdateVendor = async () => {
    try {
      const result = await apiService.updateVendor(editingVendor.id, vendorForm);
      if (result.data) {
        toast.success('Vendor updated successfully');
        setShowEditDialog(false);
        fetchVendors();
      } else {
        toast.error(result.error || 'Failed to update vendor');
      }
    } catch (error) {
      toast.error('Failed to update vendor');
    }
  };

  const handleDeleteVendor = async (vendorId) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        const result = await apiService.deleteVendor(vendorId);
        if (result.data !== undefined) {
          toast.success('Vendor deleted successfully');
          fetchVendors();
        } else {
          toast.error(result.error || 'Failed to delete vendor');
        }
      } catch (error) {
        toast.error('Failed to delete vendor');
      }
    }
  };

  const handleImageUpload = async (vendorId, file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('profile_image', file);
      
      const result = await apiService.updateProfile(formData);
      
      if (result.data) {
        const imageUrl = result.data.profile_image || URL.createObjectURL(file);
        setVendors(prev => prev.map(vendor => 
          vendor.id === vendorId 
            ? { ...vendor, profile_image: imageUrl }
            : vendor
        ));
        toast.success('Profile image updated');
      } else {
        console.error('Upload error:', result.error);
        toast.error('Upload failed');
      }
    } catch (error) {
      console.error('Upload exception:', error);
      toast.error('Upload failed');
    }
  };

  const handleEditService = (service, vendor) => {
    setEditingService(service);
    setSelectedVendor(vendor);
    setServiceForm({
      service_name: service.service_name || "",
      category: service.category || "",
      service_price: service.service_price || "",
      minimum_people: service.minimum_people || "",
      maximum_people: service.maximum_people || "",
      description: service.description || ""
    });
    setShowServiceDialog(true);
  };

  const handleAddService = (vendor) => {
    setEditingService(null);
    setSelectedVendor(vendor);
    setServiceForm({
      service_name: "",
      category: "",
      service_price: "",
      minimum_people: "",
      maximum_people: "",
      description: ""
    });
    setShowServiceDialog(true);
  };

  const handleSaveService = async () => {
    try {
      if (editingService) {
        const result = await apiService.updateService(editingService.id, serviceForm);
        if (result.data) {
          toast.success('Service updated successfully');
        } else {
          toast.error(result.error || 'Failed to update service');
        }
      } else {
        const result = await apiService.createService(serviceForm);
        if (result.data) {
          toast.success('Service created successfully');
        } else {
          toast.error(result.error || 'Failed to create service');
        }
      }
      setShowServiceDialog(false);
      fetchVendors();
    } catch (error) {
      toast.error('Failed to save service');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const result = await apiService.deleteService(serviceId);
        if (result.data !== undefined) {
          toast.success('Service deleted successfully');
          fetchVendors();
        } else {
          toast.error(result.error || 'Failed to delete service');
        }
      } catch (error) {
        toast.error('Failed to delete service');
      }
    }
  };

  const handleServiceImageUpload = async (serviceId, file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    try {
      console.log('Uploading service image for service ID:', serviceId);
      const result = await apiService.updateServiceImage(serviceId, file);
      
      if (result.data) {
        const imageUrl = result.data.image || URL.createObjectURL(file);
        setVendors(prev => prev.map(vendor => ({
          ...vendor,
          services: vendor.services?.map(service => 
            service.id === serviceId 
              ? { ...service, image: imageUrl }
              : service
          )
        })));
        toast.success('Service image updated');
      } else {
        console.error('Service upload error:', result.error);
        toast.error('Service upload failed');
      }
    } catch (error) {
      console.error('Service upload exception:', error);
      toast.error('Service upload failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{showImageGallery ? 'Image Gallery' : 'Vendor Management'}</h1>
          <p className="text-gray-600">
            {showImageGallery ? 'View all vendor and service images' : 'Manage all vendors and their services'} 
            ({vendors.length} vendors)
          </p>
        </div>
        <Button 
          onClick={() => setShowImageGallery(!showImageGallery)}
          variant={showImageGallery ? "outline" : "default"}
        >
          {showImageGallery ? 'Management View' : 'Image Gallery'}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading vendors...</span>
        </div>
      ) : showImageGallery ? (
        <div className="space-y-8">
          {vendors.map((vendor) => (
            <Card key={vendor.id} className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <img 
                    src={
                      vendor.profile_image 
                        ? (vendor.profile_image.startsWith('http') 
                            ? vendor.profile_image 
                            : `http://localhost:8000${vendor.profile_image}`)
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.full_name || 'User')}&background=6366f1&color=fff&size=64`
                    }
                    alt={vendor.full_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl">{vendor.full_name}</h3>
                    <Badge variant="outline">{vendor.business}</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium mb-4">Service Images ({vendor.services?.filter(s => s.image)?.length || 0})</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {vendor.services?.filter(service => service.image)?.map((service) => (
                    <div key={service.id} className="space-y-2">
                      <img 
                        src={service.image.startsWith('http') ? service.image : `http://localhost:8000${service.image}`}
                        alt={service.service_name}
                        className="w-full h-24 rounded object-cover border"
                      />
                      <p className="text-xs text-center font-medium truncate">{service.service_name}</p>
                      <p className="text-xs text-center text-gray-500">₹{service.service_price}</p>
                    </div>
                  ))}
                  {(!vendor.services?.filter(s => s.image)?.length) && (
                    <p className="text-gray-500 text-sm col-span-full">No service images uploaded</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : vendors.length === 0 ? (
        <Card className="bg-white shadow-lg">
          <CardContent className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No vendors found</h3>
            <p className="text-gray-600 mb-4">No vendors are registered in the system yet.</p>
            <Button onClick={fetchVendors}>
              Refresh
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <Card key={vendor.id} className="bg-white shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img 
                        src={
                          vendor.profile_image 
                            ? (vendor.profile_image.startsWith('http') 
                                ? vendor.profile_image 
                                : `http://localhost:8000${vendor.profile_image}`)
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.full_name || 'User')}&background=6366f1&color=fff&size=64`
                        }
                        alt={vendor.full_name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.full_name || 'User')}&background=6366f1&color=fff&size=64`;
                        }}
                      />
                      <label className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full cursor-pointer hover:bg-blue-600">
                        <Camera className="w-3 h-3" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden"
                          onChange={(e) => e.target.files[0] && handleImageUpload(vendor.id, e.target.files[0])}
                        />
                      </label>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{vendor.full_name}</CardTitle>
                      <Badge variant="outline">{vendor.business}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditVendor(vendor)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteVendor(vendor.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{vendor.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="truncate">{vendor.location || vendor.city}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Services ({vendor.services?.length || 0})</h4>
                    <Button size="sm" variant="outline" onClick={() => handleAddService(vendor)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {vendor.services?.map((service) => (
                      <div key={service.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded border">
                        <div className="w-12 h-12 rounded object-cover flex-shrink-0 bg-gray-200 flex items-center justify-center">
                          {service.image ? (
                            <img 
                              src={service.image.startsWith('http') ? service.image : `http://localhost:8000${service.image}`}
                              alt={service.service_name}
                              className="w-12 h-12 rounded object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-12 h-12 rounded bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold ${service.image ? 'hidden' : 'flex'}`}>
                            {(service.service_name || 'S').charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-gray-900">
                                {service.service_name || service.name || 'Unnamed Service'}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {service.category || 'General'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <IndianRupee className="w-3 h-3" />
                                <span className="font-medium">₹{service.service_price || 0}</span>
                              </div>
                              {(service.minimum_people || service.maximum_people) && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span>{service.minimum_people || 0}-{service.maximum_people || 0}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 ml-2">
                          <label className="cursor-pointer p-1 hover:bg-gray-200 rounded" title="Upload Image">
                            <Camera className="w-4 h-4 text-gray-500 hover:text-blue-500" />
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files[0]) {
                                  console.log('Uploading service image for service:', service.id);
                                  handleServiceImageUpload(service.id, e.target.files[0]);
                                }
                              }}
                            />
                          </label>
                          <Button size="sm" variant="ghost" className="p-1 h-6 w-6" onClick={() => handleEditService(service, vendor)} title="Edit Service">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="p-1 h-6 w-6" onClick={() => handleDeleteService(service.id)} title="Delete Service">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Vendor Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <Input 
                value={vendorForm.full_name}
                onChange={(e) => setVendorForm({...vendorForm, full_name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email"
                value={vendorForm.email}
                onChange={(e) => setVendorForm({...vendorForm, email: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Mobile</label>
              <Input 
                value={vendorForm.mobile}
                onChange={(e) => setVendorForm({...vendorForm, mobile: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Business Category</label>
              <Select value={vendorForm.business} onValueChange={(value) => setVendorForm({...vendorForm, business: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Experience Level</label>
              <Select value={vendorForm.experience_level} onValueChange={(value) => setVendorForm({...vendorForm, experience_level: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input 
                value={vendorForm.location}
                onChange={(e) => setVendorForm({...vendorForm, location: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">City</label>
                <Input 
                  value={vendorForm.city}
                  onChange={(e) => setVendorForm({...vendorForm, city: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Pincode</label>
                <Input 
                  value={vendorForm.pincode}
                  onChange={(e) => setVendorForm({...vendorForm, pincode: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button className="flex-1" onClick={handleUpdateVendor}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Dialog */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add Service'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Service Name</label>
              <Input 
                value={serviceForm.service_name}
                onChange={(e) => setServiceForm({...serviceForm, service_name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={serviceForm.category} onValueChange={(value) => setServiceForm({...serviceForm, category: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Price (₹)</label>
              <Input 
                type="number"
                value={serviceForm.service_price}
                onChange={(e) => setServiceForm({...serviceForm, service_price: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">Min People</label>
                <Input 
                  type="number"
                  value={serviceForm.minimum_people}
                  onChange={(e) => setServiceForm({...serviceForm, minimum_people: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Max People</label>
                <Input 
                  type="number"
                  value={serviceForm.maximum_people}
                  onChange={(e) => setServiceForm({...serviceForm, maximum_people: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={serviceForm.description}
                onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button className="flex-1" onClick={handleSaveService}>
                <Save className="w-4 h-4 mr-2" />
                {editingService ? 'Update' : 'Create'} Service
              </Button>
              <Button variant="outline" onClick={() => setShowServiceDialog(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorManagement;





