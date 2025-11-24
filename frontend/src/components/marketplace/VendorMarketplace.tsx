import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { 
  Star, 
  MapPin, 
  Mail, 
  Phone, 
  ShoppingCart, 
  CreditCard, 
  Filter, 
  Loader2, 
  Calendar,
  Award,
  Users,
  IndianRupee,
  Heart,
  MessageCircle,
  CheckCircle,
  User,
  DollarSign,
  FileText
} from "lucide-react";
import { secureApiService } from "../../services/secureApi";
import { toast } from "sonner";

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

const categories = ["All", "Photography", "Catering", "DJ", "Decoration", "Event Manager", "Makeup Artist", "Hair Stylist", "Transportation", "Florist", "Baker", "Videography", "Fashion Designer", "Gift Services", "Entertainment", "Lighting"];

const serviceDescriptions = {
  // Photography Services
  'Wedding Photography': 'Traditional wedding photography capturing all ceremonies and rituals\n• Full day coverage from mehendi to reception\n• High-resolution edited photos delivered within 15 days\n• Traditional poses and family group photos\n• Album design and printing services available',
  'Candid Photography': 'Natural and spontaneous moment capture\n• Unposed shots of emotions and reactions\n• Storytelling through candid moments\n• Creative angles and artistic compositions\n• Digital gallery with unlimited downloads',
  'Drone Photography': 'Aerial photography and videography services\n• Bird\'s eye view shots of venue and ceremonies\n• Cinematic aerial footage for videos\n• Licensed drone operator with safety protocols\n• Weather-dependent service availability',
  'Album / Book Design': 'Professional photo album and book design services\n• Custom layout design with selected photos\n• Premium quality printing and binding\n• Multiple size and cover options available\n• Digital proofs before final printing',
  'Photo Retouching & Enhancement': 'Professional photo editing and enhancement\n• Color correction and brightness adjustment\n• Skin retouching and blemish removal\n• Background enhancement and replacement\n• High-resolution output for printing',
  'Baby / Maternity Shoot': 'Specialized photography for expecting mothers and newborns\n• Safe and comfortable studio environment\n• Props and costumes for themed shoots\n• Gentle handling techniques for babies\n• Family portraits with newborn',
  'Corporate Photography': 'Professional business and corporate event photography\n• Conference and seminar coverage\n• Team photos and headshots\n• Product launch and company events\n• Professional editing for business use',
  'Product Photography': 'Commercial product photography for businesses\n• Studio setup with professional lighting\n• Multiple angles and detail shots\n• White background and lifestyle shots\n• E-commerce ready high-resolution images',
  'Fashion / Portfolio Photography': 'Fashion and modeling portfolio shoots\n• Studio and outdoor location options\n• Professional makeup and styling coordination\n• Multiple outfit changes and looks\n• Portfolio-ready edited images',
  
  // Catering Services
  'Vegetarian': 'Pure vegetarian menu with traditional and modern dishes\n• North Indian: Dal Makhani, Paneer Butter Masala, Biryani\n• South Indian: Sambar, Rasam, Coconut Rice, Payasam\n• Live counters: Dosa, Chaat, Pasta stations\n• Desserts: Gulab Jamun, Kulfi, Fresh Fruit',
  'Non-Vegetarian': 'Mixed menu with vegetarian and non-vegetarian options\n• Chicken: Butter Chicken, Biryani, Tandoori varieties\n• Mutton: Rogan Josh, Keema, Traditional curries\n• Seafood: Fish curry, Prawn preparations (coastal areas)\n• Separate cooking areas for veg and non-veg',
  'Buffet Service': 'Self-service buffet setup with variety of dishes\n• Hot food counters with chafing dishes\n• Salad bar with fresh vegetables and dressings\n• Dessert station with multiple sweet options\n• Beverage counter with juices and soft drinks',
  'Live Stalls': 'Interactive cooking stations with live preparation\n• Chaat counter with bhel puri, pani puri\n• Dosa and uttapam live preparation\n• Pasta and noodles made to order\n• Fresh juice and lassi counter',
  'Desserts & Sweets': 'Traditional and modern dessert options\n• Indian sweets: Gulab jamun, Rasgulla, Barfi\n• Ice cream counter with multiple flavors\n• Fresh fruit platter and fruit salad\n• Cake cutting ceremony arrangements',
  'Beverages & Bar': 'Complete beverage service including alcoholic options\n• Welcome drinks and mocktails\n• Full bar setup with premium liquors\n• Wine selection and beer options\n• Professional bartender service',
  'Plated Service': 'Formal sit-down dining with served courses\n• Multi-course meal service\n• Professional waitstaff and service\n• Elegant table setting and presentation\n• Customized menu for each course',
  'Themed Cuisine': 'Specialized cuisine based on themes\n• Regional Indian cuisines (Punjabi, Bengali, South Indian)\n• International themes (Italian, Chinese, Continental)\n• Traditional wedding feast menus\n• Fusion cuisine combinations',
  'International Menu': 'Global cuisine options for diverse tastes\n• Italian: Pasta, Pizza, Risotto varieties\n• Chinese: Manchurian, Fried rice, Noodles\n• Continental: Grilled items, Salads, Soups\n• Mexican and Thai food options',
  'BBQ & Grill': 'Outdoor grilling and barbecue services\n• Live grilling station with fresh preparations\n• Tandoori items: Chicken, Paneer, Naan\n• Kebabs and grilled vegetables\n• Outdoor setup with proper ventilation',
  
  // DJ Services
  'Club DJ': 'High-energy party music for dance floors\n• Latest Bollywood and international hits\n• Electronic dance music and remixes\n• Professional mixing and beat matching\n• LED lighting effects and fog machines',
  'Wedding DJ': 'Traditional and modern music for wedding ceremonies\n• Regional folk songs and classical music\n• Bollywood wedding songs and dance numbers\n• Announcement and ceremony coordination\n• Wireless microphones for speeches',
  'Corporate DJ': 'Professional music services for corporate events\n• Background music for networking sessions\n• Presentation and AV support\n• Award ceremony and conference music\n• Professional and sophisticated playlist',
  'Live Band': 'Live musical performances with professional musicians\n• Classical and folk music performances\n• Bollywood and regional song covers\n• Interactive performances with audience\n• Complete band setup with instruments',
  'Sound & Lighting Setup': 'Complete audio-visual equipment rental\n• Professional sound system with speakers\n• Stage lighting and decorative lights\n• Microphones and audio mixing console\n• Technical support throughout event',
  'Emcee & Host': 'Professional event hosting and anchoring\n• Bilingual hosting in local and English\n• Ceremony coordination and announcements\n• Interactive games and entertainment\n• Experienced in wedding and corporate events',
  'Karaoke Setup': 'Interactive karaoke entertainment system\n• Extensive song library in multiple languages\n• Professional karaoke equipment\n• Microphones and display screens\n• Assistance for participants',
  'DJ Night Party Setup': 'Complete party setup with DJ and entertainment\n• Dance floor setup with lighting\n• High-energy music and crowd interaction\n• Special effects and party atmosphere\n• Extended hours party packages',
  
  // Decoration Services
  'Stage & Mandap Decoration': 'Traditional mandap and stage setup\n• Floral decorations with roses and marigolds\n• Fabric draping in traditional colors\n• Lighting setup for photography\n• Seating arrangement for bride and groom',
  'Theme-based Decoration': 'Customized decoration based on chosen theme\n• Royal theme with gold and red colors\n• Modern minimalist with elegant designs\n• Vintage theme with antique props\n• Destination wedding tropical themes',
  'Floral Decoration': 'Fresh flower arrangements and designs\n• Entrance gates with flower arches\n• Table centerpieces with seasonal flowers\n• Car decoration with jasmine and roses\n• Flower jewelry for bride and family',
  'Balloon & Neon Decor': 'Modern balloon and neon lighting decorations\n• Balloon arches and ceiling installations\n• LED neon signs with custom messages\n• Colorful balloon bouquets and columns\n• Glow-in-dark and UV reactive decorations',
  'Drapery & Fabric Setup': 'Elegant fabric draping and textile decorations\n• Ceiling draping with flowing fabrics\n• Backdrop creation with premium materials\n• Color coordination with event theme\n• Professional installation and removal',
  'Entrance Gate Decoration': 'Grand entrance decorations for venues\n• Floral archways and welcome gates\n• Traditional torans and hanging decorations\n• Lighting integration for evening events\n• Photo opportunity setups',
  'Lighting Setup': 'Professional lighting design and installation\n• Ambient lighting for romantic atmosphere\n• Spotlights for stage and important areas\n• Fairy lights and string light decorations\n• Color-changing LED systems',
  'Backdrop Design': 'Custom backdrop creation for photography\n• Themed backdrops for different ceremonies\n• Floral and fabric combination designs\n• Photo booth backdrop setups\n• Personalized name and date displays',
  'Furniture Rental & Styling': 'Premium furniture rental and arrangement\n• Elegant seating arrangements\n• Decorative tables and centerpieces\n• Lounge areas with comfortable furniture\n• Coordination with overall decor theme',
  'Props & Installations': 'Creative props and artistic installations\n• Themed props for photography\n• Artistic installations and sculptures\n• Interactive decoration elements\n• Custom-made props for specific themes',
  'Table Centerpieces': 'Elegant table decoration and centerpieces\n• Floral arrangements for dining tables\n• Candle arrangements and ambient lighting\n• Themed centerpieces matching decor\n• Height variations for visual interest',
  'Selfie Corners': 'Instagram-worthy photo opportunity setups\n• Themed selfie stations with props\n• Hashtag displays and custom signage\n• Ring light and photography assistance\n• Social media friendly decorations',
  'Tent / Canopy Setup': 'Outdoor event covering and shelter\n• Weather-resistant tent installations\n• Decorative canopy with fabric draping\n• Proper ventilation and lighting\n• Flooring and carpet arrangements',
  'Greenery & Garden Decor': 'Natural and eco-friendly decorations\n• Potted plants and garden arrangements\n• Vertical gardens and green walls\n• Natural flower and leaf decorations\n• Outdoor garden party setups',
  
  // Event Manager Services
  'Wedding Management': 'Complete wedding planning and coordination\n• Pre-wedding ceremony planning\n• Vendor coordination and management\n• Timeline creation and execution\n• Guest management and hospitality',
  'Corporate Event': 'Professional corporate event planning\n• Conference and seminar organization\n• Product launch event management\n• Team building and company parties\n• Award ceremonies and annual functions',
  'Birthday/Private Party': 'Personal celebration event planning\n• Birthday party themes and decorations\n• Anniversary and milestone celebrations\n• Family gathering coordination\n• Entertainment and activity planning',
  
  // Transportation Services
  'Bridal / Groom Car Rental': 'Luxury car rental for wedding couple\n• Premium sedan and SUV options\n• Professional chauffeur service\n• Car decoration with flowers and ribbons\n• Multiple pickup and drop locations',
  'Vintage & Luxury Cars': 'Classic and luxury vehicle rental\n• Vintage cars for royal wedding themes\n• Luxury brands: BMW, Mercedes, Audi\n• Special occasion vehicle arrangements\n• Photography-friendly classic cars',
  'Horse / Elephant Procession': 'Traditional wedding procession arrangements\n• Decorated horses for groom entry\n• Elephant rides for grand celebrations\n• Traditional music and dhol players\n• Safety measures and trained handlers',
  'Decorated Wedding Vehicles': 'Vehicle decoration services for weddings\n• Floral decorations with fresh flowers\n• Ribbon and fabric decorations\n• Traditional kalash and torans\n• Custom decoration themes',
  'Guest Shuttle Bus': 'Group transportation for wedding guests\n• AC buses and tempo travelers\n• Multiple pickup points coordination\n• Comfortable seating arrangements\n• Professional drivers and assistants',
  'Airport Pickup / Drop': 'Airport transportation services\n• Timely pickup and drop services\n• Flight tracking for schedule changes\n• Luggage assistance and handling\n• Meet and greet services',
  'Artist & Vendor Transport': 'Transportation for event service providers\n• Equipment transportation for vendors\n• Artist and performer transportation\n• Timely coordination with event schedule\n• Multiple trip arrangements if needed',
  'Valet Parking': 'Professional parking management services\n• Trained valet parking attendants\n• Secure vehicle handling and storage\n• Guest convenience and time-saving\n• Insurance coverage for vehicles',
  'Luggage / Gift Transport': 'Specialized transportation for items\n• Safe handling of wedding gifts\n• Luggage transportation between venues\n• Secure packaging and loading\n• Timely delivery to destinations',
  'Car Rental': 'General car rental services\n• Self-drive and chauffeur options\n• Daily and hourly rental packages\n• Multiple car categories available\n• Flexible pickup and drop locations',
  'Bus/Tempo Traveller': 'Group transportation vehicles\n• AC buses for large groups\n• Tempo travelers for medium groups\n• Comfortable seating and amenities\n• Outstation travel arrangements',
  'Luxury Vehicles': 'Premium luxury car rental\n• High-end luxury car brands\n• Special occasion transportation\n• Professional chauffeur service\n• VIP treatment and hospitality',
  
  // Makeup Artist Services
  'Bridal Makeup': 'Complete bridal beauty package\n• HD makeup for photography and videography\n• Traditional and contemporary looks\n• Hair styling with buns and braids\n• Saree draping and jewelry setting',
  'Party Makeup': 'Elegant makeup for parties and functions\n• Evening makeup with bold colors\n• Smokey eyes and contouring\n• Long-lasting makeup for extended events\n• Touch-up services during the event',
  'Airbrush Makeup': 'Professional airbrush makeup technique\n• Flawless finish for HD photography\n• Long-lasting and sweat-proof\n• Even coverage without heavy feeling\n• Perfect for outdoor and summer events',
  'HD Makeup': 'High-definition makeup for photography\n• Camera-ready flawless finish\n• Professional makeup products\n• Perfect for video and photo shoots\n• Long-lasting throughout the event',
  'Groom Makeup': 'Grooming and makeup services for grooms\n• Natural and subtle makeup application\n• Skin preparation and grooming\n• Hair styling and beard trimming\n• Photography-ready appearance',
  
  // Hair Stylist Services
  'Bridal Hairstyle': 'Traditional and modern bridal hair styling\n• Elaborate buns with floral decorations\n• Braided styles with traditional elements\n• Hair accessories and jewelry integration\n• Long-lasting styles for entire ceremony',
  'Casual Hairstyle': 'Everyday and party hairstyles\n• Simple and elegant styling options\n• Quick styling for busy schedules\n• Trendy and fashionable looks\n• Suitable for various occasions',
  'Fashion / Runway': 'High-fashion and runway hairstyling\n• Creative and artistic hair designs\n• Fashion show and photoshoot styling\n• Avant-garde and experimental looks\n• Professional portfolio development',
  'Hair Extensions': 'Hair extension application and styling\n• Length and volume enhancement\n• Natural-looking extension integration\n• Temporary and semi-permanent options\n• Color matching and blending',
  'Hair Spa & Treatment': 'Hair care and treatment services\n• Deep conditioning and nourishment\n• Scalp massage and relaxation\n• Hair repair and strengthening\n• Pre-event hair preparation',
  
  // Videography Services
  'Traditional Videography': 'Classic wedding videography with traditional approach\n• Complete ceremony coverage from start to finish\n• Multiple camera angles for comprehensive coverage\n• Professional audio recording with clear sound\n• Standard editing with music and transitions',
  'Cinematic Videography': 'Movie-style wedding films with artistic storytelling\n• Cinematic shots with professional equipment\n• Creative storytelling through visual narrative\n• Color grading and advanced post-production\n• Emotional highlight reels with music',
  'Drone Videography': 'Aerial videography for stunning overhead shots\n• Bird\'s eye view of venue and ceremonies\n• Cinematic aerial footage for dramatic effect\n• Licensed drone operator with safety protocols\n• Weather-dependent service with backup plans',
  'Highlight Films': 'Short highlight videos capturing key moments\n• 3-5 minute condensed wedding story\n• Best moments compilation with music\n• Social media ready formats\n• Quick turnaround for immediate sharing',
  'Event Live Streaming': 'Real-time streaming for remote guests\n• HD quality live broadcast of ceremonies\n• Multiple camera setup for different angles\n• Stable internet connection and backup systems\n• Interactive features for remote participation',
  'Video Editing & Post-Production': 'Professional video editing and enhancement\n• Color correction and audio enhancement\n• Custom graphics and title sequences\n• Music synchronization and sound mixing\n• Multiple format delivery for different platforms',
  'Wedding Teaser & Trailer': 'Short promotional videos of the wedding\n• 30-60 second teaser videos\n• Cinematic trailer with dramatic music\n• Social media optimized formats\n• Quick delivery for immediate sharing',
  'Short Reels & Social Media Edits': 'Social media optimized short videos\n• Instagram and Facebook ready formats\n• Trending music and effects\n• Vertical and square format options\n• Hashtag and caption suggestions',
  
  // Baker Services
  'Wedding Cake': 'Custom wedding cakes for your special day\n• Multi-tier designs with elegant decorations\n• Flavor customization and tasting sessions\n• Fondant and buttercream finishing options\n• Delivery and setup at venue included',
  'Cupcakes': 'Individual cupcakes for guests and celebrations\n• Variety of flavors and decorative toppings\n• Custom designs matching wedding theme\n• Individual packaging for guest favors\n• Gluten-free and vegan options available',
  'Custom Desserts': 'Personalized desserts for special occasions\n• Themed desserts matching event decor\n• Specialty items like macarons and eclairs\n• Dietary restriction accommodations\n• Unique presentation and packaging',
  'Cookies & Pastries': 'Artisanal cookies and pastries for events\n• Decorated sugar cookies with custom designs\n• Fresh pastries and mini desserts\n• Corporate logo cookies for business events\n• Seasonal and holiday themed options',
  'Dessert Table Setup': 'Complete dessert station arrangement\n• Variety of desserts and sweet treats\n• Elegant display setup with decorations\n• Serving utensils and plates provided\n• Coordination with venue and catering team',
  
  // Lighting Services
  'Stage Lighting': 'Professional stage lighting for performances\n• Spotlights and wash lights for stage coverage\n• Color-changing LED systems\n• DMX control for synchronized lighting\n• Professional setup and operation',
  'Ambient Lighting': 'Atmospheric lighting for venue enhancement\n• Warm and romantic lighting setups\n• Uplighting and wall washing effects\n• Fairy lights and string light installations\n• Mood lighting for different event phases',
  'DJ Lighting': 'Dynamic lighting for dance floors and parties\n• Moving head lights and laser effects\n• Strobe lights and fog machines\n• Sound-reactive lighting systems\n• Party atmosphere enhancement',
  'Fairy & Decorative Lights': 'Decorative lighting for ambiance\n• String lights and fairy light curtains\n• Twinkle lights for romantic settings\n• Battery-powered and solar options\n• Indoor and outdoor installations',
  'Outdoor Flood Lighting': 'Powerful lighting for outdoor events\n• Weather-resistant flood lights\n• Large area coverage and illumination\n• Generator-powered options available\n• Safety and security lighting',
  
  // Fashion Designer Services
  'Bridal Wear': 'Custom bridal outfit design and creation\n• Traditional and contemporary bridal designs\n• Lehenga, saree, and gown options\n• Custom embroidery and embellishments\n• Multiple fittings and alterations included',
  'Party Wear': 'Elegant party outfits for special occasions\n• Cocktail dresses and formal wear\n• Indo-western fusion designs\n• Seasonal and trendy collections\n• Accessories and styling coordination',
  'Custom Designs': 'Personalized fashion designs from scratch\n• One-of-a-kind custom creations\n• Client consultation and design process\n• Premium fabrics and materials\n• Exclusive designs tailored to preferences',
  'Ethnic & Traditional Outfits': 'Traditional Indian wear and ethnic clothing\n• Regional traditional costumes\n• Festival and ceremony appropriate attire\n• Authentic craftsmanship and techniques\n• Cultural significance and styling advice',
  'Men\'s Designer Wear': 'Custom menswear and formal clothing\n• Suits, sherwanis, and formal wear\n• Wedding and party outfits for men\n• Tailored fits and premium materials\n• Accessories and complete styling',
  
  // Gift Services
  'Return Gifts': 'Thoughtful return gifts for wedding guests\n• Traditional and modern gift options\n• Personalized items with names and dates\n• Bulk ordering and packaging services\n• Budget-friendly to premium options',
  'Gift Hampers': 'Curated gift hampers for special occasions\n• Themed hampers for different celebrations\n• Gourmet food and luxury item collections\n• Custom packaging and presentation\n• Corporate and personal gift options',
  'Custom Gifts': 'Personalized gifts with custom designs\n• Engraved items and photo gifts\n• Handmade and artisanal products\n• Unique and memorable keepsakes\n• Special occasion commemorative items',
  'Gift Wrapping & Packaging': 'Professional gift presentation services\n• Elegant wrapping and packaging solutions\n• Themed packaging for different occasions\n• Ribbon work and decorative elements\n• Bulk wrapping services for events',
  'Corporate Gifts': 'Business gifts and promotional items\n• Branded merchandise and logo items\n• Employee appreciation and client gifts\n• Bulk corporate orders and customization\n• Professional packaging and delivery',
  
  // Florist Services
  'Wedding Flowers': 'Complete floral arrangements for weddings\n• Bridal bouquets and groom boutonnieres\n• Ceremony and reception decorations\n• Fresh flower garlands and arrangements\n• Seasonal and exotic flower options',
  'Bouquets': 'Beautiful bouquets for brides and occasions\n• Bridal and bridesmaid bouquet designs\n• Fresh and artificial flower options\n• Color coordination with wedding theme\n• Preservation services for keepsakes',
  'Stage Floral Decoration': 'Elaborate floral setups for ceremony stages\n• Mandap and altar floral decorations\n• Backdrop arrangements with fresh flowers\n• Seasonal flower combinations\n• Professional installation and maintenance',
  'Garlands & Floral Jewelry': 'Traditional floral accessories\n• Fresh flower garlands for ceremonies\n• Floral jewelry for bride and family\n• Marigold and rose garland combinations\n• Cultural and religious significance',
  'Floral Centerpieces': 'Table centerpieces and arrangements\n• Dining table floral decorations\n• Varied heights and design styles\n• Candle and flower combinations\n• Seasonal and theme-based designs'
};

const getCombinedDescription = (category, serviceName, dbDescription) => {
  // First try to get specific service description
  let staticDesc = serviceDescriptions[serviceName];
  
  // If no specific service description, use category-based description
  if (!staticDesc) {
    const categoryDefaults = {
      'Photography': 'Professional photography services\n• High-quality equipment and editing\n• Experienced photographers\n• Timely delivery of photos\n• Multiple shooting styles available',
      'Catering': 'Food and beverage services\n• Fresh ingredients and hygienic preparation\n• Variety of cuisines available\n• Professional serving staff\n• Customizable menu options',
      'DJ': 'Music and entertainment services\n• Professional sound system\n• Wide music collection\n• Experienced DJ with crowd interaction\n• Lighting and effects available',
      'Decoration': 'Event decoration and styling\n• Creative designs and themes\n• Quality materials and flowers\n• Complete setup and breakdown\n• Customized decoration packages',
      'Event Manager': 'Complete event planning services\n• End-to-end event coordination\n• Vendor management and scheduling\n• Guest management services\n• Timeline planning and execution',
      'Makeup Artist': 'Professional makeup services\n• Premium quality products\n• Experienced makeup artists\n• Various makeup styles available\n• Trial sessions before events',
      'Videography': 'Professional videography services\n• High-quality video equipment and editing\n• Experienced videographers and editors\n• Timely delivery of edited videos\n• Multiple video formats and styles available',
      'Baker': 'Professional baking and dessert services\n• Fresh ingredients and custom recipes\n• Variety of cakes and dessert options\n• Custom designs and decorations\n• Delivery and setup services available',
      'Lighting': 'Professional lighting services\n• Stage and ambient lighting solutions\n• LED and traditional lighting systems\n• Professional setup and operation\n• Indoor and outdoor lighting options',
      'Fashion Designer': 'Custom fashion design services\n• Bridal and party wear creation\n• Traditional and contemporary designs\n• Premium fabrics and craftsmanship\n• Personal styling and consultation',
      'Gift Services': 'Complete gift and packaging solutions\n• Return gifts and corporate presents\n• Custom gift hampers and wrapping\n• Personalized and branded items\n• Bulk orders and event coordination',
      'Florist': 'Professional floral arrangement services\n• Wedding and event flower decorations\n• Fresh flower bouquets and garlands\n• Seasonal and exotic flower options\n• Complete floral design and setup'
    };
    staticDesc = categoryDefaults[category] || 'Professional service provider for your event needs.';
  }
  
  return staticDesc;
};


const locations = ["All", "Mumbai", "Delhi", "Bangalore", "Pune", "Chennai", "Balasore", "Marathahalli"];
const priceRanges = [
  { label: "All Prices", value: "all" },
  { label: "Under ₹10,000", value: "0-10000" },
  { label: "₹10,000 - ₹25,000", value: "10000-25000" },
  { label: "₹25,000 - ₹50,000", value: "25000-50000" },
  { label: "Above ₹50,000", value: "50000-999999" }
];

const sortOptions = [
  { label: "Relevance", value: "relevance" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Rating: High to Low", value: "rating_desc" },
  { label: "Newest First", value: "newest" }
];

const VendorMarketplace = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [contactVendor, setContactVendor] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [eventData, setEventData] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(false);
  
  // Get price_range, category and eventId from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const priceRangeFromUrl = urlParams.get('price_range');
  const eventIdFromUrl = urlParams.get('eventId');
  const categoryFromUrl = urlParams.get('category');
  
  // Normalize category - remove "Services" suffix and trim
  const normalizedCategory = categoryFromUrl ? categoryFromUrl.replace(/\s+Services$/i, '').trim() : "All";
  
  const [filters, setFilters] = useState({
    category: normalizedCategory,
    location: "All",
    search: "",
    sortBy: "relevance",
    priceRange: priceRangeFromUrl || "all"
  });

  const [bookingForm, setBookingForm] = useState({
    eventDate: "",
    eventType: "",
    guestCount: "",
    budget: "",
    location: "",
    message: "",
    customerName: "",
    customerEmail: "",
    customerPhone: ""
  });

  const [contactForm, setContactForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    message: ""
  });

  useEffect(() => {
    fetchFilteredVendors();
    loadFavorites();
    loadCart();
    if (eventIdFromUrl) {
      fetchEventData();
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchFilteredVendors();
    }, 300); // Debounce search
    
    return () => clearTimeout(timeoutId);
  }, [filters]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await secureApiService.getVendors({ limit: 50 });
      const vendorsList = response.results || response.data || response;
      setVendors(Array.isArray(vendorsList) ? vendorsList : []);
    } catch (error: any) {
      console.error('Error fetching vendors:', error);
      toast.error(error?.message || 'Failed to load vendors');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredVendors = async () => {
    try {
      setLoading(true);
      const filterParams: any = {};
      
      if (filters.category !== "All") filterParams.category = filters.category;
      if (filters.location !== "All") filterParams.location = filters.location;
      if (filters.search) filterParams.search = filters.search;
      if (filters.priceRange !== "all") filterParams.price_range = filters.priceRange;
      filterParams.limit = 100;

      const response = await secureApiService.getVendors(filterParams);
      let vendorsList = response.results || response.data || response;
      vendorsList = Array.isArray(vendorsList) ? vendorsList : [];
        
      // Apply client-side filtering as fallback
      vendorsList = applyClientFilters(vendorsList);
      
      // Apply sorting
      vendorsList = sortVendors(vendorsList, filters.sortBy);
      setVendors(vendorsList);
    } catch (error: any) {
      console.error('Error fetching filtered vendors:', error);
      toast.error(error?.message || 'Failed to load vendors');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const applyClientFilters = (vendorsList) => {
    console.log('Applying client filters:', filters);
    console.log('Vendors before filtering:', vendorsList.length);
    
    return vendorsList.filter(vendor => {
      console.log('Checking vendor:', vendor.full_name, 'Business:', vendor.business, 'Services:', vendor.services?.length);
      
      // Skip vendors with no services
      if (!vendor.services || vendor.services.length === 0) {
        console.log('Filtered out - no services');
        return false;
      }
      
      // Category filter - case insensitive comparison
      if (filters.category !== "All" && vendor.business?.toLowerCase() !== filters.category.toLowerCase()) {
        console.log('Filtered out - category mismatch:', vendor.business, '!==', filters.category);
        return false;
      }
      
      // Location filter
      if (filters.location !== "All") {
        const vendorLocation = vendor.address || vendor.location || vendor.city || '';
        if (!vendorLocation.toLowerCase().includes(filters.location.toLowerCase())) {
          return false;
        }
      }
      
      // Search filter - NULL safe
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase().trim();
        const vendorName = (vendor.full_name || '').toLowerCase();
        const vendorBusiness = (vendor.business || '').toLowerCase();
        const vendorServices = (vendor.services || []).map(s => (s.service_name || s.name || '').toLowerCase()).join(' ');
        
        if (!vendorName.includes(searchTerm) && 
            !vendorBusiness.includes(searchTerm) && 
            !vendorServices.includes(searchTerm)) {
          return false;
        }
      }
      
      // Price range filter - apply client-side since backend expects different format
      if (filters.priceRange !== "all") {
        const totalPrice = calculateTotalPrice(vendor.services);
        if (totalPrice > 0) {
          try {
            const [minPrice, maxPrice] = filters.priceRange.split('-').map(Number);
            if (maxPrice && totalPrice > maxPrice) {
              return false;
            }
            if (minPrice && totalPrice < minPrice) {
              return false;
            }
          } catch (e) {
            // If price range format is just a number (max budget), treat as max limit
            const maxBudget = Number(filters.priceRange);
            if (!isNaN(maxBudget) && totalPrice > maxBudget) {
              return false;
            }
          }
        }
      }
      
      return true;
    });
  };

  const sortVendors = (vendorsList, sortBy) => {
    switch (sortBy) {
      case 'price_asc':
        return [...vendorsList].sort((a, b) => calculateTotalPrice(a.services) - calculateTotalPrice(b.services));
      case 'price_desc':
        return [...vendorsList].sort((a, b) => calculateTotalPrice(b.services) - calculateTotalPrice(a.services));
      case 'rating_desc':
        return [...vendorsList].sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
      case 'newest':
        return [...vendorsList].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      default:
        return vendorsList;
    }
  };

  const calculateTotalPrice = (services, isCatering = false) => {
    if (!services || !Array.isArray(services)) return 0;
    const total = services.reduce((sum, service) => {
      const price = Number(service?.service_price) || Number(service?.price) || 0;
      return sum + price;
    }, 0);
    // For catering, return per-person price, not total
    return isCatering ? total : total;
  };
  
  const formatPrice = (vendor) => {
    const total = calculateTotalPrice(vendor?.services);
    if (total === 0) return 'Contact for pricing';
    if (vendor?.business === 'Catering') {
      return `₹${total.toLocaleString()}/person (for all items)`;
    }
    return `₹${total.toLocaleString()}`;
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem('vendor_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  };

  const loadCart = () => {
    const saved = localStorage.getItem('vendor_cart');
    if (saved) setCart(JSON.parse(saved));
  };

  const fetchEventData = async () => {
    if (!eventIdFromUrl) return;
    
    try {
      setLoadingEvent(true);
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/events/${eventIdFromUrl}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const event = await response.json();
        setEventData(event);
        
        // Auto-fill booking form with event data
        setBookingForm({
          customerName: event.form_data?.clientName || '',
          customerEmail: event.form_data?.clientEmail || '',
          customerPhone: event.form_data?.clientPhone || '',
          eventDate: event.form_data?.dateTime?.split('T')[0] || '',
          eventType: event.event_name || '',
          guestCount: event.attendees?.toString() || '',
          location: event.form_data?.city && event.form_data?.state 
            ? `${event.form_data.city}, ${event.form_data.state}` 
            : '',
          message: ''
        });
      }
    } catch (error) {
      console.error('Error fetching event data:', error);
    } finally {
      setLoadingEvent(false);
    }
  };

  const toggleFavorite = (vendor) => {
    const newFavorites = favorites.includes(vendor.id) 
      ? favorites.filter(id => id !== vendor.id)
      : [...favorites, vendor.id];
    
    setFavorites(newFavorites);
    localStorage.setItem('vendor_favorites', JSON.stringify(newFavorites));
    toast.success(favorites.includes(vendor.id) ? 'Removed from favorites' : 'Added to favorites');
  };

  const addToCart = (service, vendor) => {
    const cartItem = {
      id: `${vendor.id}_${service.id}`,
      vendorId: vendor.id,
      vendorName: vendor.full_name,
      serviceId: service.id,
      serviceName: service.service_name,
      price: service.service_price,
      image: vendor.profile_image
    };

    const newCart = [...cart, cartItem];
    setCart(newCart);
    localStorage.setItem('vendor_cart', JSON.stringify(newCart));
    toast.success('Added to cart');
  };

  const handleViewProfile = (vendor) => {
    console.log('Selected vendor:', vendor);
    console.log('Vendor services:', vendor.services);
    setSelectedVendor(vendor);
    setShowProfileDialog(true);
  };

  const handleServiceDetails = (service, vendor) => {
    setSelectedService({ ...service, vendor });
    setShowServiceDialog(true);
  };

  const handleContactVendor = (vendor) => {
    setContactVendor(vendor);
    setShowContactDialog(true);
  };

  const submitContact = async () => {
    try {
      // Here you would call your contact API
      // const result = await apiService.contactVendor(contactForm, contactVendor.id);
      
      toast.success('Contacted successfully!');
      setShowContactDialog(false);
      setContactForm({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        message: ""
      });
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const submitBooking = async () => {
    if (!eventIdFromUrl) {
      toast.error('Event ID not found. Please navigate from budget allocation.');
      return;
    }

    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (!token) {
        toast.error('Please login to send quote requests');
        return;
      }

      // Send quote request to specific vendor using existing backend API
      const response = await fetch(`http://localhost:8000/api/events/${eventIdFromUrl}/send-quotes/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vendor_ids: [selectedVendor.id],
          additional_message: bookingForm.message
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Quote request sent to ${selectedVendor.full_name}!`);
        setShowBookingDialog(false);
        
        // Redirect to quote management page
        setTimeout(() => {
          window.location.href = `/dashboard?tab=quotes&eventId=${eventIdFromUrl}`;
        }, 1000);
      } else {
        toast.error(result.message || 'Failed to send quote request');
      }
    } catch (error) {
      console.error('Error sending quote request:', error);
      toast.error('Failed to send quote request. Please try again.');
    }
  };

  const renderStars = (rating) => {
    const numRating = Number(rating) || 4.5;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(numRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendor Marketplace</h1>
          <p className="text-gray-600">Browse, compare and book vendors directly</p>
          {(priceRangeFromUrl && priceRangeFromUrl !== 'all') || categoryFromUrl ? (
            <div className="mt-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-semibold flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Budget-Filtered Results
              </p>
              <div className="text-xs text-green-700 mt-2 ml-7 space-y-1">
                {categoryFromUrl && <p>Category: <span className="font-semibold">{categoryFromUrl}</span></p>}
                {priceRangeFromUrl && priceRangeFromUrl !== 'all' && (
                  <p>Max Budget: <span className="font-semibold">₹{Number(priceRangeFromUrl.split('-')[1]).toLocaleString()}</span></p>
                )}
                <p className="text-green-600">Showing {vendors.length} vendor{vendors.length !== 1 ? 's' : ''} within your budget</p>
              </div>
            </div>
          ) : null}
        </div>
        <Button onClick={() => window.history.back()} variant="outline">
          ← Back
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </div>
            {(filters.category !== "All" || filters.priceRange !== "all") && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                {filters.category !== "All" && `${filters.category} | `}
                {filters.priceRange !== "all" && `Budget: ₹${filters.priceRange.split('-')[1]}`}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search vendors..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Select value={filters.location} onValueChange={(value) => setFilters({...filters, location: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Price</label>
              <Select value={filters.priceRange} onValueChange={(value) => setFilters({...filters, priceRange: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map(range => (
                    <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={filters.sortBy} onValueChange={(value) => setFilters({...filters, sortBy: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading marketplace...</span>
        </div>
      ) : vendors.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm border-none shadow-lg">
          <CardContent className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your filters to find more vendors.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor, index) => (
            <Card key={vendor?.id || index} className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="relative overflow-hidden rounded-t-lg">
                <img 
                  src={vendor?.profile_image ? (vendor.profile_image.startsWith('http') ? vendor.profile_image : `http://localhost:8000${vendor.profile_image}`) : getDefaultImage(vendor?.business)} 
                  alt={vendor?.full_name || 'Vendor'}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3">
                  <Badge className="bg-primary text-white">
                    {vendor?.business || 'Service'}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{vendor?.full_name || 'Vendor'}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {renderStars(vendor?.rating || 4.5)}
                      </div>
                      <span className="text-sm font-medium">{vendor?.rating || 4.5}</span>
                      <span className="text-sm text-gray-500">({Math.floor(Math.random() * 100) + 50} reviews)</span>
                    </div>
                    {vendor?.is_verified && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{vendor?.location || vendor?.city || 'Location not specified'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-green-600" />
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(vendor)}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Services:</h4>
                    <div className="flex flex-wrap gap-1">
                      {(vendor?.services || []).map((service, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-xs"
                        >
                          {service?.service_name || service?.name || 'Service'}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => {
                        setSelectedVendor(vendor);
                        setShowBookingDialog(true);
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Request Quote
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        className="flex-1" 
                        size="sm"
                        onClick={() => handleViewProfile(vendor)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleContactVendor(vendor)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contact
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vendor Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Vendor Profile
            </DialogTitle>
          </DialogHeader>
          
          {selectedVendor && (
            <div className="space-y-6">
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
                      {renderStars(selectedVendor?.rating || 4.5)}
                    </div>
                    <span className="font-medium">{selectedVendor?.rating || 4.5}</span>
                    <span className="text-gray-500">({Math.floor(Math.random() * 100) + 50} reviews)</span>
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
                  Services Offered ({selectedVendor?.services?.length || 0})
                </h3>
                <div className="space-y-3">
                  {selectedVendor?.services && Array.isArray(selectedVendor.services) && selectedVendor.services.length > 0 ? (
                    <div className="grid gap-3">
                      {selectedVendor.services.map((service, index) => (
                        <div key={service?.id || index} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-base">
                                {service?.service_name || service?.name || 'Service'}
                              </h4>
                              <Badge variant="secondary" className="text-xs mt-1">
                                {service?.category || 'General'}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-green-600 font-bold">
                                {selectedVendor?.business === 'Catering' ? (
                                  <span>₹{service?.service_price || 0}/p</span>
                                ) : (
                                  <span>₹{service?.service_price || 0}</span>
                                )}
                              </div>
                              {(service?.minimum_people || service?.maximum_people) && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                  <Users className="w-3 h-3" />
                                  <span>{service.minimum_people || 0}-{service.maximum_people || 0} people</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">
                            {getCombinedDescription(service?.category, service?.service_name, service?.description)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <p>No services available</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-lg font-semibold pt-3 border-t">
                    <span className="text-gray-700">Total Package Price:</span>
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
                <Button className="flex-1" size="lg" onClick={() => {
                  setShowProfileDialog(false);
                  handleContactVendor(selectedVendor);
                }}>
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Vendor
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Service Details Dialog */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Service Details</DialogTitle>
          </DialogHeader>
          
          {selectedService && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedService.service_name}</h3>
                <p className="text-gray-600">{selectedService.vendor?.full_name}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">
                  ₹{Number(selectedService.service_price || 0).toLocaleString()}
                </span>
                <Badge variant="outline">{selectedService.category}</Badge>
              </div>
              
              {selectedService.description && (
                <p className="text-gray-600">{selectedService.description}</p>
              )}
              
              {selectedService.minimum_people && selectedService.maximum_people && (
                <p className="text-sm text-gray-500">
                  Capacity: {selectedService.minimum_people}-{selectedService.maximum_people} people
                </p>
              )}
              
              <div className="flex gap-3 pt-4">
                <Button 
                  className="flex-1"
                  onClick={() => addToCart(selectedService, selectedService.vendor)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleContactVendor(selectedService.vendor)}
                >
                  Contact
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Booking/Quote Request Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Request Quote from {selectedVendor?.full_name}</DialogTitle>
          </DialogHeader>
          
          {selectedVendor && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <img 
                  src={selectedVendor?.profile_image ? (selectedVendor.profile_image.startsWith('http') ? selectedVendor.profile_image : `http://localhost:8000${selectedVendor.profile_image}`) : getDefaultImage(selectedVendor?.business)} 
                  alt={selectedVendor?.full_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium">{selectedVendor?.full_name}</h3>
                  <p className="text-sm text-gray-600">{selectedVendor?.business}</p>
                  <p className="text-sm font-semibold text-green-600">{formatPrice(selectedVendor)}</p>
                </div>
              </div>
              
              {eventData && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm font-medium flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Event details auto-filled from your event
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Your Name</label>
                  <Input 
                    placeholder="Enter your name" 
                    className="mt-1 bg-gray-50"
                    value={bookingForm.customerName}
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="mt-1 bg-gray-50"
                    value={bookingForm.customerEmail}
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input 
                    type="tel" 
                    placeholder="Enter your phone" 
                    className="mt-1 bg-gray-50"
                    value={bookingForm.customerPhone}
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Event Date</label>
                  <Input 
                    type="date" 
                    className="mt-1 bg-gray-50"
                    value={bookingForm.eventDate}
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Event Type</label>
                  <Input 
                    placeholder="Wedding, Birthday, Corporate, etc." 
                    className="mt-1 bg-gray-50"
                    value={bookingForm.eventType}
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Guest Count</label>
                  <Input 
                    type="number" 
                    placeholder="Number of guests" 
                    className="mt-1 bg-gray-50"
                    value={bookingForm.guestCount}
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input 
                    placeholder="Event location" 
                    className="mt-1 bg-gray-50"
                    value={bookingForm.location}
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Additional Details (Optional)</label>
                  <Textarea 
                    placeholder="Any specific requirements or questions for the vendor..." 
                    className="mt-1 min-h-[100px] border-2 border-gray-300 focus:border-purple-500"
                    value={bookingForm.message}
                    onChange={(e) => setBookingForm({...bookingForm, message: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-1">This is the only field you can edit. All other details are from your event.</p>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
                  onClick={submitBooking}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Send Quote Request
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowBookingDialog(false)}
                  className="px-6 py-3 border-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Contact {contactVendor?.full_name}</DialogTitle>
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
                  <p className="text-sm text-gray-500">{contactVendor?.location || contactVendor?.city}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Your Name</label>
                  <Input 
                    placeholder="Enter your name" 
                    className="mt-1"
                    value={contactForm.customerName}
                    onChange={(e) => setContactForm({...contactForm, customerName: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Your Email</label>
                  <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="mt-1"
                    value={contactForm.customerEmail}
                    onChange={(e) => setContactForm({...contactForm, customerEmail: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Your Phone</label>
                  <Input 
                    type="tel" 
                    placeholder="Enter your phone" 
                    className="mt-1"
                    value={contactForm.customerPhone}
                    onChange={(e) => setContactForm({...contactForm, customerPhone: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea 
                    placeholder="Hi, I'm interested in your services..." 
                    className="mt-1 min-h-[100px]"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button className="flex-1" onClick={submitContact}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" onClick={() => setShowContactDialog(false)}>
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

export default VendorMarketplace;





