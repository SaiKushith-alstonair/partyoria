import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Textarea } from "../../../components/ui/textarea";
import { Star, MapPin, Mail, Phone, IndianRupee, Filter, Loader2, Calendar, Award, Users, Send } from "lucide-react";
import { apiService } from "../../services/api";

const getDefaultImage = (category: string) => {
  const categoryImages = {
    'Catering': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&h=200&fit=crop',
    'Photography': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300&h=200&fit=crop',
    'Decoration': 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=300&h=200&fit=crop',
    'DJ': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop',
    'Makeup Artist': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop',
    'Event Manager': 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=300&h=200&fit=crop'
  };
  return categoryImages[category] || 'https://images.unsplash.com/photo-1554048612-b6a482b224b8?w=300&h=200&fit=crop';
};

const categories = ["All", "Photography", "Catering", "DJ", "Decoration", "Event Manager"];
const locations = ["All", "Mumbai", "Delhi", "Bangalore", "Pune", "Chennai", "Balasore", "Marathahalli"];
const priceRanges = [
  { label: "All", value: "All" },
  { label: "Under ₹10,000", value: "0-10000" },
  { label: "₹10,000 - ₹25,000", value: "10000-25000" },
  { label: "₹25,000 - ₹50,000", value: "25000-50000" },
  { label: "₹50,000 - ₹1,00,000", value: "50000-100000" },
  { label: "Above ₹1,00,000", value: "100000-999999" }
];

const VendorMatching = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactVendor, setContactVendor] = useState(null);
  const [filters, setFilters] = useState({
    category: "All",
    location: "All",
    search: "",
    priceRange: "All"
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    fetchFilteredVendors();
  }, [filters]);

  const fetchVendors = async () => {
    try {
      console.log('🔄 fetchVendors: Starting to fetch vendors...');
      setLoading(true);
      setError(null);
      // Fetch vendors from database with limit of 20
      const response = await apiService.getVendors({ limit: 20 });
      console.log('📦 fetchVendors: API response:', response);
      if (response.success && response.data) {
        console.log('✅ fetchVendors: Setting vendors data:', response.data);
        const vendorsList = response.data.results || response.data;
        setVendors(Array.isArray(vendorsList) ? vendorsList : []);
      } else {
        console.log('❌ fetchVendors: No data or failed, setting empty array');
        setVendors([]);
      }
    } catch (error) {
      console.error('💥 fetchVendors: Error fetching vendors:', error);
      setError(error.message);
      setVendors([]);
    } finally {
      console.log('🏁 fetchVendors: Setting loading to false');
      setLoading(false);
    }
  };

  const calculateTotalPrice = (services) => {
    if (!services || !Array.isArray(services)) return 0;
    return services.reduce((total, service) => {
      const price = Number(service?.service_price) || Number(service?.price) || 0;
      return total + price;
    }, 0);
  };

  const fetchFilteredVendors = async () => {
    try {
      console.log('🔍 fetchFilteredVendors: Starting with filters:', filters);
      setSearchLoading(true);
      setError(null);
      
      // Check if any filters are applied
      const hasFilters = filters.category !== "All" || filters.location !== "All" || filters.search || filters.priceRange !== "All";
      
      // Build filter parameters for API
      const filterParams = {};
      
      if (filters.category !== "All") {
        filterParams.category = filters.category;
      }
      
      if (filters.location !== "All") {
        filterParams.location = filters.location;
      }
      
      if (filters.search) {
        filterParams.search = filters.search;
      }
      
      if (filters.priceRange !== "All") {
        const [minPrice, maxPrice] = filters.priceRange.split('-');
        filterParams.min_price = minPrice;
        filterParams.max_price = maxPrice;
        console.log('💰 Price filter applied:', { minPrice, maxPrice, priceRange: filters.priceRange });
      }
      
      // Always get all results when searching or filtering
      // Only limit to 20 on initial load with no filters
      if (!hasFilters) {
        filterParams.limit = 20;
      }
      // When searching or filtering, don't set limit to get all results
      
      console.log('📋 fetchFilteredVendors: Filter params:', filterParams);
      
      // Fetch filtered vendors from database
      const response = await apiService.getVendors(filterParams);
      console.log('📦 fetchFilteredVendors: API response:', response);
      
      if (response.success && response.data) {
        console.log('✅ fetchFilteredVendors: Setting vendors data:', response.data);
        const vendorsList = response.data.results || response.data;
        setVendors(Array.isArray(vendorsList) ? vendorsList : []);
      } else {
        console.log('❌ fetchFilteredVendors: No data or failed, setting empty array');
        setVendors([]);
      }
    } catch (error) {
      console.error('💥 fetchFilteredVendors: Error fetching filtered vendors:', error);
      setError(error.message);
      setVendors([]);
    } finally {
      console.log('🏁 fetchFilteredVendors: Setting search loading to false');
      setSearchLoading(false);
    }
  };

  const filteredVendors = (vendors || []).filter(vendor => {
    try {
      // Client-side price filtering as fallback
      if (filters.priceRange !== "All") {
        const [minPrice, maxPrice] = filters.priceRange.split('-').map(Number);
        const vendorPrice = calculateTotalPrice(vendor?.services);
        
        if (vendorPrice > 0) {
          if (vendorPrice < minPrice || vendorPrice > maxPrice) {
            return false;
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error filtering vendor:', vendor, error);
      return true; // Include vendor if filtering fails
    }
  });
  
  console.log('🎯 Current state - vendors:', vendors, 'filtered:', filteredVendors, 'loading:', loading, 'searchLoading:', searchLoading);

  const handleViewProfile = (vendor) => {
    console.log('Selected vendor data:', vendor);
    console.log('Vendor services:', vendor?.services);
    setSelectedVendor(vendor);
    setShowProfile(true);
  };

  const handleContactVendor = (vendor) => {
    setContactVendor(vendor);
    setShowContactForm(true);
  };

  const renderStars = (rating) => {
    // Generate random rating between 3-5 if no rating exists
    const numRating = Number(rating) || (3 + Math.floor(Math.random() * 3));
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(numRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <Card className="bg-white/80 backdrop-blur-sm border-none shadow-lg">
          <CardContent className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2 text-red-600">Error Loading Vendors</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => { setError(null); fetchVendors(); }}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vendor Matching</h1>
        <Badge variant="secondary" className="px-3 py-1">
          {loading ? 'Loading...' : `${filteredVendors?.length || 0} vendors found`}
        </Badge>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-none shadow-xl">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Filter className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ✨ Find Perfect Vendors
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                Search Vendors
              </label>
              <div className="relative">
                <Input
                  placeholder="Search vendors..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="h-10"
                />
                {searchLoading && (
                  <Loader2 className="absolute right-3 top-2.5 w-5 h-5 animate-spin text-blue-500" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Service Category
              </label>
              <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl z-50">
                  {categories.map(category => (
                    <SelectItem key={category} value={category} className="rounded-lg">{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                Location
              </label>
              <Select value={filters.location} onValueChange={(value) => setFilters({...filters, location: value})}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent className="rounded-xl z-50">
                  {locations.map(location => (
                    <SelectItem key={location} value={location} className="rounded-lg">{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                Price Range
              </label>
              <Select value={filters.priceRange} onValueChange={(value) => setFilters({...filters, priceRange: value})}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent className="rounded-xl z-50">
                  {priceRanges.map(range => (
                    <SelectItem key={range.value} value={range.value} className="rounded-lg">{range.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading vendors...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(filteredVendors || []).map((vendor, index) => (
          <Card 
            key={vendor?.id || `vendor-${index}`} 
            className="bg-white/90 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
          >
            <div className="relative overflow-hidden rounded-t-lg">
              <img 
                src={vendor?.profile_image ? (vendor.profile_image.startsWith('http') ? vendor.profile_image : `http://localhost:8000${vendor.profile_image}`) : getDefaultImage(vendor?.business)} 
                alt={vendor?.full_name || 'Vendor'}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3">
                <Badge className="bg-primary text-white">
                  {vendor?.category || vendor?.business || 'Service'}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">{vendor?.business_name || vendor?.full_name || vendor?.name || 'Vendor'}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {renderStars(vendor?.rating || vendor?.average_rating)}
                    </div>
                    <span className="text-sm font-medium">{vendor?.average_rating || vendor?.rating || (3 + Math.floor(Math.random() * 3))}</span>
                    <span className="text-sm text-gray-500">({vendor?.total_reviews || vendor?.reviews || (15 + Math.floor(Math.random() * 85))} reviews)</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Services:</h4>
                  <div className="flex flex-wrap gap-1">
                    {(vendor?.services || []).slice(0, 3).map((service, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {typeof service === 'string' ? service : service?.name || 'Service'}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <IndianRupee className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-600">
                    {calculateTotalPrice(vendor?.services) > 0 
                      ? `₹${calculateTotalPrice(vendor?.services).toLocaleString()}` 
                      : 'Contact for pricing'
                    }
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{vendor?.address || vendor?.location || vendor?.city || 'Location not specified'}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{vendor?.email || 'Email not available'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{vendor?.phone_number || vendor?.mobile || vendor?.phone || 'Phone not available'}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" size="sm" onClick={() => handleViewProfile(vendor)}>
                    View Profile
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleContactVendor(vendor)}>
                    Contact
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {!loading && (!filteredVendors || filteredVendors.length === 0) && (
        <Card className="bg-white/80 backdrop-blur-sm border-none shadow-lg">
          <CardContent className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No vendors found</h3>
            <p className="text-gray-600">Try adjusting your filters to find more vendors.</p>
          </CardContent>
        </Card>
      )}

      {/* Vendor Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Vendor Profile
            </DialogTitle>
          </DialogHeader>
          
          {selectedVendor && (
            <div className="space-y-6">
              {console.log('Rendering popup for vendor:', selectedVendor)}
              {/* Header Section */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <img 
                    src={selectedVendor?.profile_image ? (selectedVendor.profile_image.startsWith('http') ? selectedVendor.profile_image : `http://localhost:8000${selectedVendor.profile_image}`) : getDefaultImage(selectedVendor?.business)} 
                    alt={selectedVendor?.full_name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gradient-to-r from-blue-500 to-purple-500"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{selectedVendor?.full_name}</h2>
                  <Badge className="mb-3">{selectedVendor?.business}</Badge>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {renderStars(4.5)}
                    </div>
                    <span className="font-medium">4.5</span>
                    <span className="text-gray-500">(128 reviews)</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      <span>{selectedVendor?.is_verified ? 'Verified Vendor' : 'Pending Verification'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Services Offered
                </h3>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {selectedVendor?.services && Array.isArray(selectedVendor.services) && selectedVendor.services.length > 0 ? (
                      selectedVendor.services.slice(0, 3).map((service, index) => (
                        <Badge key={service?.id || index} variant="outline" className="text-xs">
                          {service?.name || service?.service_name || service?.title || (typeof service === 'string' ? service : 'Service')}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {selectedVendor?.business}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <span className="text-green-600">
                      {(() => {
                        const totalPrice = calculateTotalPrice(selectedVendor?.services);
                        return totalPrice > 0 ? `₹${totalPrice.toLocaleString()}` : 'Contact for pricing';
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-gray-600">{selectedVendor?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-gray-600">{selectedVendor?.mobile}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                    <MapPin className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-gray-600">
                        {selectedVendor?.address || selectedVendor?.location || selectedVendor?.city || 'Location not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1" size="lg">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Vendor
                </Button>
                <Button variant="outline" className="flex-1" size="lg">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Contact Form Dialog */}
      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Contact {contactVendor?.full_name}
            </DialogTitle>
          </DialogHeader>
          
          {contactVendor && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <img 
                  src={contactVendor?.profile_image ? (contactVendor.profile_image.startsWith('http') ? contactVendor.profile_image : `http://localhost:8000${contactVendor.profile_image}`) : getDefaultImage(contactVendor?.business)} 
                  alt={contactVendor?.full_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium">{contactVendor?.full_name}</h3>
                  <p className="text-sm text-gray-600">{contactVendor?.business}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Your Name</label>
                  <Input placeholder="Enter your name" className="mt-1" />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Your Email</label>
                  <Input type="email" placeholder="Enter your email" className="mt-1" />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Your Phone</label>
                  <Input type="tel" placeholder="Enter your phone" className="mt-1" />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea 
                    placeholder="Hi, I'm interested in your services for my event..." 
                    className="mt-1 min-h-[100px]"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button className="flex-1" onClick={() => setShowContactForm(false)}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" onClick={() => setShowContactForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorMatching;





