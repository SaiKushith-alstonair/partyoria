import { useState } from "react";
// Mobile input validation fix
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Camera,
  UtensilsCrossed,
  Sparkles,
  Music,
  Mic,
  ArrowRight,
  ArrowLeft,
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
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { apiService } from "../services/api";
import { toast } from "sonner";
import {
  sanitizeInput,
  sanitizeEmail,
  sanitizeMobile,
  sanitizeName,
} from "../utils/sanitize";

type OnboardingStep = 1 | 2 | 3 | 4 | 5;

interface OnboardingData {
  email: string;
  password: string;
  fullName: string;
  mobile: string;
  business: string;
  category: string;
  services: string[];
  city: string;
  state: string;
  pincode: string;
  location: string;
}

const professions = [
  {
    id: "photography",
    label: "Photography",
    emoji: "📸",
    services: [
      { id: "traditional", label: "Wedding Photography " },
      { id: "candid", label: "Candid Photography" },
      { id: "drone", label: "Drone Photography" },
      { id: "album-design", label: " Album / Book Design" },
      { id: "retouching", label: "Photo Retouching & Enhancement" },
      { id: "baby-shoot", label: "Baby / Maternity Shoot" },
      { id: "corporate", label: "Corporate Photography" },
      { id: "product", label: "Product Photography" },
      { id: "fashion", label: "Fashion / Portfolio Photography" },
    ],
  },
  {
    id: "catering",
    label: "Catering",
    emoji: "🍽️",
    services: [
      { id: "veg", label: "Vegetarian" },
      { id: "non-veg", label: "Non-Vegetarian" },
      { id: "buffet", label: "Buffet Service" },
      { id: "live-stall", label: "Live Stalls" },
      { id: "desserts", label: "Desserts & Sweets" },
      { id: "beverages", label: "Beverages & Bar" },
      { id: "plated", label: "Plated Service" },
      { id: "themed", label: "Themed Cuisine" },
      { id: "international", label: "International Menu" },
      { id: "bbq", label: "BBQ & Grill" },
    ],
  },
  {
    id: "decoration",
    label: "Decoration",
    emoji: "✨",
    services: [
      { id: "stage-mandap", label: "Stage & Mandap Decoration" },
      { id: "theme-based", label: "Theme-based Decoration" },
      { id: "floral", label: "Floral Decoration" },
      { id: "balloon-neon", label: "Balloon & Neon Decor" },
      { id: "drapery", label: "Drapery & Fabric Setup" },
      { id: "entrance", label: "Entrance Gate Decoration" },
      { id: "lighting", label: "Lighting Setup" },
      { id: "backdrop", label: "Backdrop Design" },
      { id: "furniture", label: "Furniture Rental & Styling" },
      { id: "props", label: "Props & Installations" },
      { id: "centerpieces", label: "Table Centerpieces" },
      { id: "photo-booth", label: "Selfie Corners" },
      { id: "tent-canopy", label: "Tent / Canopy Setup" },
      { id: "greenery", label: "Greenery & Garden Decor" },
    ],
  },
  {
    id: "dj",
    label: "DJ",
    emoji: "🎧",
    services: [
      { id: "club", label: "Club DJ" },
      { id: "wedding", label: "Wedding DJ" },
      { id: "corporate", label: "Corporate DJ" },
      { id: "live-band", label: "Live Band" },
      { id: "sound-system", label: "Sound & Lighting Setup" },
           { id: "emcee", label: "Emcee & Host" },
      { id: "karaoke", label: "Karaoke Setup" },
      { id: "dj-night", label: "DJ Night Party Setup" },
    ],
  },
  {
    id: "event-manager",
    label: "Event Manager",
    emoji: "🎤",
    services: [
      { id: "wedding", label: "Wedding Management" },
      { id: "corporate", label: "Corporate Event" },
      { id: "birthday", label: "Birthday/Private Party" },
    ],
  },
  {
    id: "transportation",
    label: "Transportation",
    emoji: "🚗",
    services: [
      { id: "bridal-car", label: "Bridal / Groom Car Rental" },
      { id: "luxury", label: "Vintage & Luxury Cars" },
      { id: "procession", label: "Horse / Elephant Procession" },
      { id: "decorated-vehicle", label: "Decorated Wedding Vehicles" },
      { id: "shuttle", label: "Guest Shuttle Bus" },
      { id: "airport", label: "Airport Pickup / Drop" },
      { id: "vendor-transport", label: "Artist & Vendor Transport" },
      { id: "valet", label: "Valet Parking" },
      { id: "logistics", label: "Luggage / Gift Transport" },
      { id: "car-rental", label: "Car Rental" },
      { id: "bus", label: "Bus/Tempo Traveller" },
      { id: "luxury", label: "Luxury Vehicles" },
    ],
  },
  {
    id: "florist",
    label: "Florist",
    emoji: "🌸",
    services: [
      { id: "wedding-flowers", label: "Wedding Flowers" },
      { id: "bouquet", label: "Bouquets" },
      { id: "stage-floral", label: "Stage Floral Decoration" },
      { id: "garlands", label: "Garlands & Floral Jewelry" },
      { id: "centerpieces", label: "Floral Centerpieces" },
    ],
  },
  {
    id: "baker",
    label: "Baker",
    emoji: "🎂",
    services: [
      { id: "wedding-cake", label: "Wedding Cake" },
      { id: "cupcakes", label: "Cupcakes" },
      { id: "custom", label: "Custom Desserts" },
       { id: "cookies", label: "Cookies & Pastries" },
      { id: "dessert-table", label: "Dessert Table Setup" },
    ],
  },
  {
    id: "videography",
    label: "Videography",
    emoji: "🎥",
    services: [
      { id: "traditional", label: "Traditional Videography" },
      { id: "cinematic", label: "Cinematic Videography" },
      { id: "drone", label: "Drone Videography" },
      { id: "highlight", label: "Highlight Films" },
      { id: "livestream", label: "Event Live Streaming" },
      { id: "editing", label: "Video Editing & Post-Production" },
         { id: "teaser", label: "Wedding Teaser & Trailer" },
      { id: "reel", label: "Short Reels & Social Media Edits" },
    ],
  },
  {
    id: "makeup-artist",
    label: "Makeup Artist",
    emoji: "💄",
    services: [
      { id: "bridal", label: "Bridal Makeup" },
      { id: "party", label: "Party Makeup" },
      { id: "airbrush", label: "Airbrush Makeup" },
      { id: "hd", label: "HD Makeup" },
      { id: "groom", label: "Groom Makeup" },
    ],
  },
  {
    id: "hair-stylist",
    label: "Hair Stylist",
    emoji: "✂️",
    services: [
      { id: "bridal", label: "Bridal Hairstyle" },
      { id: "casual", label: "Casual Hairstyle" },
      { id: "fashion", label: "Fashion / Runway" },
      { id: "hair-extension", label: "Hair Extensions" },
      { id: "spa", label: "Hair Spa & Treatment" },
    ],
  },
  {
    id: "fashion-designer",
    label: "Fashion Designer",
    emoji: "👗",
    services: [
      { id: "bridal", label: "Bridal Wear" },
      { id: "party", label: "Party Wear" },
      { id: "custom", label: "Custom Designs" },
       { id: "ethnic", label: "Ethnic & Traditional Outfits" },
      { id: "menswear", label: "Men's Designer Wear" },
      
    ],
  },
  {
    id: "gift-services",
    label: "Gift Services",
    emoji: "🎁",
    services: [
      { id: "return-gifts", label: "Return Gifts" },
      { id: "hampers", label: "Gift Hampers" },
      { id: "custom", label: "Custom Gifts" },
      { id: "packaging", label: "Gift Wrapping & Packaging" },
      { id: "corporate", label: "Corporate Gifts" },
    ],
  },
  {
    id: "entertainment",
    label: "Entertainment",
    emoji: "🎉",
    services: [
      { id: "live-band", label: "Live Band" },
      { id: "dance", label: "Dance Troupe" },
      { id: "standup", label: "Stand-up Comedy" },
      { id: "folk", label: "Folk & Cultural Performances" },
      { id: "instrumentalist", label: "Instrumentalists" },
      { id: "anchors-mc", label: "Anchors  " },
    ],
  },
  {
    id: "lighting",
    label: "Lighting",
    emoji: "💡",
    services: [
      { id: "stage", label: "Stage Lighting" },
      { id: "ambient", label: "Ambient Lighting" },
      { id: "dj", label: "DJ Lighting" },
       { id: "fairy", label: "Fairy & Decorative Lights" },
      { id: "outdoor", label: "Outdoor Flood Lighting" },
    ],
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(2);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isCompleting, setIsCompleting] = useState(false);
  const [isStepValid, setIsStepValid] = useState(false);
  const [showNextButton, setShowNextButton] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    email: "",
    password: "",
    fullName: "",
    mobile: "",
    business: "",
    category: "",
    services: [],
    city: "",
    state: "",
    pincode: "",
    location: "",
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobile = (mobile: string) => {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile.replace(/[^0-9]/g, ""));
  };

  const validateName = (name: string) => {
    return name.trim().length >= 2;
  };

  const validatePincode = (pincode: string) => {
    const pincodeRegex = /^[0-9]{6}$/;
    return pincodeRegex.test(pincode);
  };

  const validateCity = (city: string) => {
    return city.trim().length >= 2;
  };

  const validateState = (state: string) => {
    return state.trim().length >= 2;
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return validateEmail(formData.email) && formData.password.length >= 6;
      case 2:
        return (
          validateName(formData.fullName) && validateMobile(formData.mobile)
        );
      case 3:
        return formData.business !== "";
      case 4:
        return formData.services.length > 0;
      case 5:
        return (
          validateCity(formData.city) &&
          validateState(formData.state) &&
          validatePincode(formData.pincode)
        );
      default:
        return false;
    }
  };

  const handleBack = () => {
    if (currentStep > 2) {
      setCurrentStep((prev) => (prev - 1) as OnboardingStep);
      setErrors({});
    }
  };

  const handleNext = async (value: string, field: keyof OnboardingData) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);

    if (currentStep === 2 && field === "fullName") {
      updatedFormData.mobile = formData.mobile;
    }

    if (currentStep === 5) {
      setIsCompleting(true);

      const vendorData = {
        full_name: updatedFormData.fullName,
        mobile: updatedFormData.mobile,
        business: updatedFormData.business,
        experience_level: "Intermediate",
        location: `${updatedFormData.city}, ${updatedFormData.state} - ${updatedFormData.pincode}`,
        city: updatedFormData.city,
        state: updatedFormData.state,
        pincode: updatedFormData.pincode,
        services: updatedFormData.services.join(","),
      };

      try {
        console.log('Updating vendor profile:', vendorData);
        const result = await apiService.updateProfile(vendorData);
        console.log('Profile update result:', result);

        if (result.data || !result.error) {
          const vendorInfo = result.data.vendor || result.data;
          
          // Mark onboarding as completed in backend
          try {
            await apiService.completeOnboarding();
            console.log('Onboarding marked as completed in backend');
          } catch (err) {
            console.error('Failed to mark onboarding complete:', err);
          }
          
          // Store user data
          const userData = {
            id: vendorInfo.id,
            email: updatedFormData.email,
            full_name: updatedFormData.fullName,
            mobile: updatedFormData.mobile,
            business: updatedFormData.business,
            location: updatedFormData.location,
            city: updatedFormData.city,
            state: updatedFormData.state,
            pincode: updatedFormData.pincode,
            user_type: 'vendor',
            is_verified: false,
            onboarding_completed: true
          };
          
          sessionStorage.setItem('partyoria_user', JSON.stringify(userData));
          localStorage.setItem('partyoria_user', JSON.stringify(userData));
          
          // Store vendor profile
          localStorage.setItem('vendor_profile', JSON.stringify(vendorInfo));
          
          // Store onboarding data for dashboard compatibility
          const vendorOnboarding = {
            email: updatedFormData.email,
            fullName: updatedFormData.fullName,
            mobile: updatedFormData.mobile,
            business: updatedFormData.business,
            level: "Intermediate",
            services: updatedFormData.services,
            city: updatedFormData.city,
            state: updatedFormData.state,
            pincode: updatedFormData.pincode,
            location: updatedFormData.location,
            is_verified: false,
            onboarding_completed: true
          };
          localStorage.setItem('vendorOnboarding', JSON.stringify(vendorOnboarding));

          toast.success("Profile setup completed!");
          navigate('/vendor/dashboard', { replace: true });
        } else {
          toast.error(
            "Profile update failed: " + (result.error || "Unknown error")
          );
        }
      } catch (error) {
        console.error('Profile update error:', error);
        toast.error(`Profile update failed: ${error.message || 'Network error'}`);
      } finally {
        setIsCompleting(false);
      }
    } else {
      setTimeout(() => {
        setCurrentStep((prev) => (prev + 1) as OnboardingStep);
      }, 100);
    }
  };

  const slideVariants = {
    enter: { x: 100, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center bg-gradient-primary px-4 py-8 rounded-lg">
      {currentStep > 2 && (
        <button
          onClick={handleBack}
          className="fixed top-8 left-8 p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full hover:bg-white/20 transition-all text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 flex gap-2">
        {[2, 3, 4, 5].map((step, index) => (
          <div
            key={step}
            className={`h-2 rounded-full transition-all duration-300 ${
              step === currentStep
                ? "w-8 bg-white"
                : step < currentStep
                ? "w-2 bg-white/80"
                : "w-2 bg-white/30"
            }`}
          />
        ))}
      </div>

      <div
        className={`w-full mx-auto ${
          currentStep === 3 || currentStep === 4 ? "max-w-6xl" : "max-w-md"
        }`}
      >
        <AnimatePresence mode="wait">


          {currentStep === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="text-center mx-auto max-w-xl"
            >
              <h1 className="text-5xl font-bold text-white mb-4">
                What's your name?
              </h1>
              <p className="text-xl text-white/80 mb-12">
                This will appear on your vendor profile
              </p>
              <div className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className={`h-16 text-xl bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm ${
                      errors.fullName ? "border-red-400" : ""
                    }`}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData((prev) => ({ ...prev, fullName: name }));
                      setErrors((prev) => ({ ...prev, fullName: "" }));
                      const isValid =
                        validateName(name) && validateMobile(formData.mobile);
                      setIsStepValid(isValid);
                      setShowNextButton(true);
                    }}
                    onBlur={(e) => {
                      const name = e.target.value;
                      if (name && !validateName(name)) {
                        setErrors((prev) => ({
                          ...prev,
                          fullName: "Name must be at least 2 characters",
                        }));
                      }
                    }}
                    autoFocus
                  />
                  {errors.fullName && (
                    <p className="text-red-300 text-sm mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <Input
                      type="tel"
                      placeholder="Enter your mobile number"
                      autoComplete="tel"
                      className={`h-16 text-xl bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm ${
                        errors.mobile ? "border-red-400" : ""
                      }`}
                      value={formData.mobile}
                      onChange={(e) => {
                        const mobile = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                        setFormData((prev) => ({ ...prev, mobile }));
                        setErrors((prev) => ({ ...prev, mobile: "" }));
                        const isValid =
                          validateName(formData.fullName) &&
                          validateMobile(mobile);
                        setIsStepValid(isValid);
                        setShowNextButton(true);
                      }}
                      maxLength={10}
                      onBlur={(e) => {
                        const mobile = e.target.value;
                        if (mobile && !validateMobile(mobile)) {
                          setErrors((prev) => ({
                            ...prev,
                            mobile:
                              "Please enter a valid 10-digit mobile number",
                          }));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          validateName(formData.fullName) &&
                          validateMobile(e.currentTarget.value)
                        ) {
                          handleNext(formData.fullName, "fullName");
                        }
                      }}
                    />
                    {errors.mobile && (
                      <p className="text-red-300 text-sm mt-1">
                        {errors.mobile}
                      </p>
                    )}
                  </div>
                  <Button
                    size="lg"
                    className="h-16 px-8 bg-white text-primary hover:bg-white/90 flex items-center gap-2"
                    onClick={() => {
                      const nameValid = validateName(formData.fullName);
                      const mobileValid = validateMobile(formData.mobile);

                      if (!nameValid) {
                        setErrors((prev) => ({
                          ...prev,
                          fullName: "Name must be at least 2 characters",
                        }));
                        return;
                      }
                      if (!mobileValid) {
                        setErrors((prev) => ({
                          ...prev,
                          mobile: "Please enter a valid 10-digit mobile number",
                        }));
                        return;
                      }

                      if (nameValid && mobileValid) {
                        handleNext(formData.fullName, "fullName");
                      }
                    }}
                  >
                    Next <ArrowRight className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="text-center pt-12"
            >
              <h1 className="text-5xl font-bold text-white mb-4">
                What's your profession?
              </h1>
              <p className="text-xl text-white/80 mb-12">
                Choose the service you provide
              </p>
              <div className="w-[70vw] max-w-6xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-0 gap-y-5 justify-items-center">
                  {professions.map((profession) => {
                    return (
                      <button
                        key={profession.id}
                        onClick={() => {
                          handleNext(profession.label, "business");
                          setIsStepValid(true);
                        }}
                        className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl hover:bg-white/20 transition-all hover:scale-105 group h-[140px] w-[140px] flex flex-col items-center justify-center shadow-lg hover:shadow-xl"
                      >
                        <div className="text-[55px] mb-1 group-hover:scale-110 transition-transform">
                          {profession.emoji}
                        </div>
                        <p className="text-white font-semibold text-base text-center leading-tight">
                          {profession.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="text-center pt-24 pb-8"
            >
              <h1 className="text-4xl font-bold text-white mb-2">
                Select Your Services
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Choose the services you provide in {formData.business}
              </p>
              <div className="w-full max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {professions
                    .find((p) => p.label === formData.business)
                    ?.services.map((service) => {
                      const isSelected = formData.services.includes(
                        service.label
                      );
                      return (
                        <button
                          key={service.id}
                          onClick={() => {
                            const newServices = isSelected
                              ? formData.services.filter(
                                  (s) => s !== service.label
                                )
                              : [...formData.services, service.label];
                            setFormData((prev) => ({
                              ...prev,
                              services: newServices,
                            }));
                            setIsStepValid(newServices.length > 0);
                          }}
                          className={`p-6 backdrop-blur-sm border rounded-2xl transition-all hover:scale-105 h-[100px] w-full flex items-center justify-center shadow-lg ${
                            isSelected
                              ? "bg-white/30 border-white/60 text-white shadow-white/20"
                              : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                          }`}
                        >
                          <p className="text-white font-medium text-base text-center">
                            {service.label}
                          </p>
                        </button>
                      );
                    })}
                </div>
              </div>
              <Button
                className="mt-8 h-14 px-8 bg-white text-primary hover:bg-white/90 flex items-center gap-2 mx-auto"
                onClick={() => {
                  if (formData.services.length === 0) {
                    toast.error("Please select at least one service");
                    return;
                  }
                  handleNext(formData.services.join(","), "category");
                }}
              >
                Continue <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {currentStep === 5 && (
            <motion.div
              key="step5"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold text-white mb-4">
                Almost done! 🎉
              </h1>
              <p className="text-xl text-white/80 mb-8">Where are you based?</p>
              <div className="space-y-4 max-w-lg mx-auto">
                <div>
                  <Input
                    type="text"
                    placeholder="Enter your city"
                    autoComplete="address-level2"
                    className={`h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm ${
                      errors.city ? "border-red-400" : ""
                    }`}
                    onChange={(e) => {
                      const city = e.target.value;
                      setFormData((prev) => ({ ...prev, city }));
                      setErrors((prev) => ({ ...prev, city: "" }));
                      const isValid =
                        validateCity(city) &&
                        validateState(formData.state) &&
                        validatePincode(formData.pincode);
                      setIsStepValid(isValid);
                      setShowNextButton(true);
                    }}
                    onBlur={(e) => {
                      const city = e.target.value;
                      if (city && !validateCity(city)) {
                        setErrors((prev) => ({
                          ...prev,
                          city: "City must be at least 2 characters",
                        }));
                      }
                    }}
                    autoFocus
                  />
                  {errors.city && (
                    <p className="text-red-300 text-sm mt-1">{errors.city}</p>
                  )}
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Enter your state"
                    autoComplete="address-level1"
                    className={`h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm ${
                      errors.state ? "border-red-400" : ""
                    }`}
                    onChange={(e) => {
                      const state = e.target.value;
                      setFormData((prev) => ({ ...prev, state }));
                      setErrors((prev) => ({ ...prev, state: "" }));
                      const isValid =
                        validateCity(formData.city) &&
                        validateState(state) &&
                        validatePincode(formData.pincode);
                      setIsStepValid(isValid);
                      setShowNextButton(true);
                    }}
                    onBlur={(e) => {
                      const state = e.target.value;
                      if (state && !validateState(state)) {
                        setErrors((prev) => ({
                          ...prev,
                          state: "State must be at least 2 characters",
                        }));
                      }
                    }}
                  />
                  {errors.state && (
                    <p className="text-red-300 text-sm mt-1">{errors.state}</p>
                  )}
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Enter your pincode"
                    autoComplete="postal-code"
                    className={`h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm ${
                      errors.pincode ? "border-red-400" : ""
                    }`}
                    onChange={(e) => {
                      const pincode = e.target.value;
                      setFormData((prev) => ({ ...prev, pincode }));
                      setErrors((prev) => ({ ...prev, pincode: "" }));
                      const isValid =
                        validateCity(formData.city) &&
                        validateState(formData.state) &&
                        validatePincode(pincode);
                      setIsStepValid(isValid);
                      setShowNextButton(true);
                    }}
                    onBlur={(e) => {
                      const pincode = e.target.value;
                      if (pincode && !validatePincode(pincode)) {
                        setErrors((prev) => ({
                          ...prev,
                          pincode: "Pincode must be 6 digits",
                        }));
                      }
                    }}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        validateCity(formData.city) &&
                        validateState(formData.state) &&
                        validatePincode(e.currentTarget.value)
                      ) {
                        const location = `${formData.city}, ${formData.state} - ${e.currentTarget.value}`;
                        handleNext(location, "location");
                      }
                    }}
                  />
                  {errors.pincode && (
                    <p className="text-red-300 text-sm mt-1">
                      {errors.pincode}
                    </p>
                  )}
                </div>
                <Button
                  className="w-full h-14 text-lg bg-white text-primary hover:bg-white/90 flex items-center justify-center gap-2"
                  onClick={() => {
                    const cityValid = validateCity(formData.city);
                    const stateValid = validateState(formData.state);
                    const pincodeValid = validatePincode(formData.pincode);

                    if (!cityValid) {
                      setErrors((prev) => ({
                        ...prev,
                        city: "City must be at least 2 characters",
                      }));
                      return;
                    }
                    if (!stateValid) {
                      setErrors((prev) => ({
                        ...prev,
                        state: "State must be at least 2 characters",
                      }));
                      return;
                    }
                    if (!pincodeValid) {
                      setErrors((prev) => ({
                        ...prev,
                        pincode: "Pincode must be 6 digits",
                      }));
                      return;
                    }

                    if (cityValid && stateValid && pincodeValid) {
                      const location = `${formData.city}, ${formData.state} - ${formData.pincode}`;
                      handleNext(location, "location");
                    }
                  }}
                  disabled={isCompleting}
                >
                  {isCompleting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      Setting up your account...
                    </>
                  ) : (
                    <>
                      Complete Setup <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;





