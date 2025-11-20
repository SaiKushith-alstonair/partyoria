import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Star, Calendar, Users, Award, ArrowRight, Heart } from "lucide-react";
import Footer from "./Footer";
import RegistrationTypeModal from "../RegistrationTypeModal";
import { MobileNavigation, MobileNavLink, MobileNavButton } from "../ui/MobileNavigation";
import "../../styles/design-system.css";

interface HomeProps {
  onStartEventCreation: () => void;
}

export default function Home({ onStartEventCreation }: HomeProps) {
  const {} = useAuth();
  const navigate = useNavigate();
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userType, setUserType] = useState("customer");
  const [hoveredFeature, setHoveredFeature] = useState(0);
  const [hoveredStep, setHoveredStep] = useState(0);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const checkAuth = () => {
      const userStr = sessionStorage.getItem('partyoria_user') || localStorage.getItem('partyoria_user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUserLoggedIn(true);
        setUserType(userData.user_type === 'vendor' ? "vendor" : "customer");
      } else {
        setUserLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('partyoria_user');
    localStorage.removeItem('partyoria_user');
    localStorage.removeItem('vendor_profile');
    localStorage.removeItem('vendorOnboarding');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth-storage');
    setUserLoggedIn(false);
    navigate('/login');
  };

  const handleDashboard = () => {
    if (userType === "vendor") {
      window.location.replace('/vendor/dashboard');
    } else {
      window.location.replace('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/videos/partyoria.gif" alt="Partyoria" className="h-8 md:h-10" />
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#home" className="text-gray-700 hover:text-primary-600 transition-colors font-medium text-sm">Home</a>
            <a href="#services" className="text-gray-700 hover:text-primary-600 transition-colors font-medium text-sm">Services</a>
            <a href="#how-it-works" className="text-gray-700 hover:text-primary-600 transition-colors font-medium text-sm">How It Works</a>
            <a href="#contact" className="text-gray-700 hover:text-primary-600 transition-colors font-medium text-sm">Contact</a>
          </nav>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex gap-3">
            {userLoggedIn ? (
              <>
                <Button onClick={handleDashboard} className="btn-primary">
                  Dashboard
                </Button>
                <Button onClick={handleLogout} className="btn-outline">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => navigate('/login')} className="btn-outline">
                  Login
                </Button>
                <Button onClick={() => setShowRegistrationModal(true)} className="btn-primary">
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <MobileNavigation
            isOpen={isMobileMenuOpen}
            onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            <MobileNavLink href="#home" onClick={() => setIsMobileMenuOpen(false)}>Home</MobileNavLink>
            <MobileNavLink href="#services" onClick={() => setIsMobileMenuOpen(false)}>Services</MobileNavLink>
            <MobileNavLink href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)}>How It Works</MobileNavLink>
            <MobileNavLink href="#contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</MobileNavLink>
            
            <div className="pt-4 border-t space-y-3">
              {userLoggedIn ? (
                <>
                  <MobileNavButton onClick={() => { handleDashboard(); setIsMobileMenuOpen(false); }}>Dashboard</MobileNavButton>
                  <MobileNavButton onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} variant="outline">Logout</MobileNavButton>
                </>
              ) : (
                <>
                  <MobileNavButton onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} variant="outline">Login</MobileNavButton>
                  <MobileNavButton onClick={() => { setShowRegistrationModal(true); setIsMobileMenuOpen(false); }}>Sign Up</MobileNavButton>
                </>
              )}
            </div>
          </MobileNavigation>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative py-32 overflow-hidden min-h-screen">
        <video 
          autoPlay 
          muted 
          loop 
          preload="none"
          className="absolute inset-0 w-full h-full object-cover"
          poster="/images/hero-poster.jpg"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="space-y-6 md:space-y-8">

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight text-white">
                Create <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Magical</span> Events
              </h1>
              <p className="text-lg md:text-xl text-white leading-relaxed max-w-3xl mx-auto">
                From intimate gatherings to grand celebrations, we connect you with India's finest vendors to make your dreams come true.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {userLoggedIn ? (
                  <>
                    <Button 
                      className="btn-primary touch-target-lg px-6 md:px-8 py-3 md:py-4 text-base md:text-lg w-full sm:w-auto"
                      onClick={handleDashboard}
                    >
                      Go to Dashboard <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                    <Button 
                      className="touch-target-lg px-6 md:px-8 py-3 md:py-4 text-base md:text-lg border-white text-white bg-black/30 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:border-transparent w-full sm:w-auto" 
                      onClick={onStartEventCreation}
                    >
                      Create New Event
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      className="btn-primary touch-target-lg px-6 md:px-8 py-3 md:py-4 text-base md:text-lg w-full sm:w-auto"
                      onClick={onStartEventCreation}
                    >
                      Start Planning <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                    <Button className="touch-target-lg px-6 md:px-8 py-3 md:py-4 text-base md:text-lg border-white text-white bg-black/30 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:border-transparent w-full sm:w-auto" onClick={onStartEventCreation}>
                      Explore Events
                    </Button>
                  </>
                )}
              </div>
              <div className="flex items-center justify-center gap-4 md:gap-8 pt-4">
                <div className="text-center">
                  <div className="text-xl md:text-3xl font-bold text-white">50K+</div>
                  <div className="text-xs md:text-sm text-gray-200">Events Created</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-3xl font-bold text-white">10K+</div>
                  <div className="text-xs md:text-sm text-gray-200">Trusted Vendors</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-3xl font-bold text-white">4.9★</div>
                  <div className="text-xs md:text-sm text-gray-200">Customer Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-white text-purple-700 px-4 py-2 mb-4 border border-purple-200">Our Services</Badge>
            <h2 className="text-4xl font-bold mb-4">Perfect Events, <span className="text-purple-600">Every Time</span></h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">We handle every detail so you can focus on what matters most - celebrating life's precious moments.</p>
          </div>
          
          <div className="overflow-hidden">
            <div className="flex animate-[scroll_20s_linear_infinite] hover:[animation-play-state:paused] gap-8">
              {[...Array(2)].map((_, duplicateIndex) => (
                <div key={duplicateIndex} className="flex gap-8 flex-shrink-0">
                  {[
                    { icon: Heart, title: "Weddings", desc: "Dream weddings with perfect vendors", color: "from-red-500 to-pink-500" },
                    { icon: Users, title: "Corporate Events", desc: "Professional events that impress", color: "from-purple-500 to-pink-500" },
                    { icon: Calendar, title: "Birthday Parties", desc: "Memorable celebrations for all ages", color: "from-green-500 to-teal-500" },
                    { icon: Heart, title: "Engagements", desc: "Romantic engagement celebrations", color: "from-pink-500 to-rose-500" },
                    { icon: Award, title: "Anniversaries", desc: "Milestone anniversary celebrations", color: "from-purple-500 to-indigo-500" },
                    { icon: Users, title: "Baby Showers", desc: "Adorable baby shower parties", color: "from-yellow-500 to-orange-500" }
                  ].map((service, index) => (
                    <Card key={`${duplicateIndex}-${index}`} className="group hover:shadow-xl hover:bg-purple-200 transition-all duration-200 border-0 bg-white cursor-pointer w-80 flex-shrink-0" onClick={onStartEventCreation}>
                      <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <service.icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 group-hover:text-purple-600 transition-colors">{service.title}</h3>
                        <p className="text-gray-600 mb-4">{service.desc}</p>
                        <Button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                          Explore {service.title}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-white text-purple-700 px-4 py-2 mb-4 border border-purple-200 hover:bg-white hover:text-purple-700 hover:border-purple-200">How It Works</Badge>
            <h2 className="text-4xl font-bold mb-4">Simple <span className="text-purple-600">3-Step Process</span></h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Planning your perfect event has never been easier</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div 
                className="flex items-center gap-6 p-6 rounded-xl bg-white shadow-sm hover:shadow-xl hover:bg-purple-200 transition-all duration-300 cursor-pointer group"
                onMouseEnter={() => setHoveredStep(0)}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-lg font-bold group-hover:scale-110 group-hover:bg-purple-100 transition-all">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors">Choose Your Event</h3>
                  <p className="text-gray-600">Select from weddings, corporate events, birthdays, and more</p>
                </div>
              </div>
              
              <div 
                className="flex items-center gap-6 p-6 rounded-xl bg-white shadow-sm hover:shadow-xl hover:bg-purple-200 transition-all duration-300 cursor-pointer group"
                onMouseEnter={() => setHoveredStep(1)}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-lg font-bold group-hover:scale-110 group-hover:bg-purple-100 transition-all">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors">Get Matched</h3>
                  <p className="text-gray-600">We connect you with verified vendors in your area</p>
                </div>
              </div>
              
              <div 
                className="flex items-center gap-6 p-6 rounded-xl bg-white shadow-sm hover:shadow-xl hover:bg-purple-200 transition-all duration-300 cursor-pointer group"
                onMouseEnter={() => setHoveredStep(2)}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-lg font-bold group-hover:scale-110 group-hover:bg-purple-100 transition-all">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors">Celebrate</h3>
                  <p className="text-gray-600">Enjoy your perfectly planned event with peace of mind</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl blur-3xl opacity-20"></div>
              <img 
src={hoveredStep === 0 ? "https://images.unsplash.com/photo-1464207687429-7505649dae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" : hoveredStep === 1 ? "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" : "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"}
                alt="How it works" 
                className="relative rounded-3xl shadow-2xl w-full h-96 object-cover transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-white text-purple-700 px-4 py-2 mb-4 border border-purple-200 hover:bg-white hover:text-purple-700 hover:border-purple-200">Features</Badge>
            <h2 className="text-4xl font-bold mb-4">Why Choose <span className="text-purple-600">Partyoria</span></h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Discover what makes us the best event planning platform</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div 
                className="flex items-center gap-6 p-6 rounded-xl bg-gray-50 hover:bg-purple-200 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onMouseEnter={() => setHoveredFeature(0)}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-lg font-bold group-hover:scale-110 transition-all">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors">Verified Vendors</h3>
                  <p className="text-gray-600">All vendors are thoroughly verified and rated by real customers</p>
                </div>
              </div>
              
              <div 
                className="flex items-center gap-6 p-6 rounded-xl bg-gray-50 hover:bg-purple-200 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onMouseEnter={() => setHoveredFeature(1)}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-lg font-bold group-hover:scale-110 transition-all">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors">Best Prices</h3>
                  <p className="text-gray-600">Compare prices and get the best deals for your budget</p>
                </div>
              </div>
              
              <div 
                className="flex items-center gap-6 p-6 rounded-xl bg-gray-50 hover:bg-purple-200 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onMouseEnter={() => setHoveredFeature(2)}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-lg font-bold group-hover:scale-110 transition-all">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors">24/7 Support</h3>
                  <p className="text-gray-600">Round-the-clock customer support for all your needs</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl blur-3xl opacity-20"></div>
              <img 
                src={hoveredFeature === 0 ? "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" : hoveredFeature === 1 ? "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"}
                alt="Features" 
                className="relative rounded-3xl shadow-2xl w-full h-96 object-cover transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-white text-purple-700 px-4 py-2 mb-4 border border-purple-200">Featured Events</Badge>
            <h2 className="text-4xl font-bold mb-4">Explore Amazing <span className="text-purple-600">Events</span></h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Discover the variety of events we've successfully organized</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Royal Wedding Ceremony",
                type: "Wedding",
                guests: "500+ Guests",
                location: "Mumbai",
                duration: "3 Days",
                date: "Dec 15-17, 2024",
                description: "Luxury wedding with traditional ceremonies, premium decor, live music, and gourmet catering",
                features: ["Photography", "Catering", "Decoration", "Music"],
                image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
                price: "₹15,00,000"
              },
              {
                title: "Tech Conference 2024",
                type: "Corporate",
                guests: "1000+ Guests",
                location: "Bangalore",
                duration: "2 Days",
                date: "Jan 20-21, 2025",
                description: "Professional tech conference with keynote speakers, networking sessions, and exhibition booths",
                features: ["AV Equipment", "Catering", "Registration", "Networking"],
                image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
                price: "₹25,00,000"
              },
              {
                title: "Sweet 16 Birthday Bash",
                type: "Birthday",
                guests: "100+ Guests",
                location: "Delhi",
                duration: "1 Day",
                date: "Feb 14, 2025",
                description: "Themed birthday party with DJ, dance floor, custom cake, and party games",
                features: ["DJ & Music", "Themed Decor", "Custom Cake", "Games"],
                image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
                price: "₹3,50,000"
              },
              {
                title: "Romantic Engagement Party",
                type: "Engagement",
                guests: "80+ Guests",
                location: "Jaipur",
                duration: "1 Evening",
                date: "Jan 28, 2025",
                description: "Intimate engagement celebration with romantic decor, live music, and elegant dining",
                features: ["Romantic Decor", "Live Music", "Photography", "Catering"],
                image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
                price: "₹5,50,000"
              },
              {
                title: "Golden Anniversary Celebration",
                type: "Anniversary",
                guests: "120+ Guests",
                location: "Pune",
                duration: "1 Day",
                date: "Mar 10, 2025",
                description: "50th anniversary celebration with family gathering, memory lane setup, and traditional feast",
                features: ["Memory Display", "Traditional Catering", "Photography", "Music"],
                image: "https://th.bing.com/th/id/OIP.JQg5xAb72JK7L6FMB-XjwgHaDt?w=316&h=174&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                price: "₹4,00,000"
              },
              {
                title: "Baby Shower Celebration",
                type: "Baby Shower",
                guests: "60+ Guests",
                location: "Hyderabad",
                duration: "1 Day",
                date: "Feb 25, 2025",
                description: "Adorable baby shower with pastel decorations, games, and delicious treats",
                features: ["Themed Decor", "Games", "Catering", "Photography"],
                image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
                price: "₹2,50,000"
              }
            ].map((event, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white overflow-hidden">
                <div className="relative">
                  <img src={event.image} alt={event.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-purple-700 font-semibold">{event.type}</Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-purple-600 text-white font-semibold">{event.price}</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{event.guests}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>⏰</span>
                      <span>{event.duration}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {event.features.map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white" onClick={onStartEventCreation}>
                    Plan Similar Event
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our <span className="text-purple-600">Clients Say</span></h2>
            <p className="text-xl text-gray-600">Real feedback from our satisfied customers</p>
          </div>
          
          <div className="overflow-hidden">
            <div className="flex animate-[scroll_15s_linear_infinite] hover:[animation-play-state:paused] gap-8">
              {[...Array(2)].map((_, duplicateIndex) => (
                <div key={duplicateIndex} className="flex gap-8 flex-shrink-0">
                  {[
                    { name: "Priya Sharma", event: "Wedding", rating: 5, text: "Made our dream wedding come true! Every detail was perfect.", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face" },
                    { name: "Rajesh Kumar", event: "Corporate Event", rating: 5, text: "Professional service and amazing vendors. Highly recommended!", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
                    { name: "Anita Patel", event: "Birthday Party", rating: 5, text: "The best platform for event planning. Made everything so easy!", image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face" }
                  ].map((testimonial, index) => (
                    <Card key={`${duplicateIndex}-${index}`} className="border-0 shadow-lg hover:shadow-xl transition-shadow flex-shrink-0 w-80">
                      <CardContent className="p-8">
                        <div className="flex items-center mb-4">
                          <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                          <div>
                            <div className="font-semibold">{testimonial.name}</div>
                            <div className="text-sm text-purple-600">{testimonial.event}</div>
                          </div>
                        </div>
                        <div className="flex mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <p className="text-gray-600 italic">"{testimonial.text}"</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-white text-purple-700 px-4 py-2 mb-4 border border-purple-200">About Us</Badge>
            <h2 className="text-4xl font-bold mb-8">About <span className="text-purple-600">Our Platform</span></h2>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              We have revolutionized event planning in India. We connect event organizers with verified, professional vendors across the country, making dream events accessible to everyone.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
                <div className="text-gray-600">Cities Covered</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">1M+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Plan Your Event?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">Join thousands of satisfied customers who trust us with their special moments</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              onClick={onStartEventCreation}
            >
              Start Planning Now
            </Button>
            {!userLoggedIn && (
              <Button 
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg font-semibold"
                onClick={() => setShowRegistrationModal(true)}
              >
                Sign Up Free
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="bg-white text-purple-700 px-4 py-2 mb-4 border border-purple-200">Contact Us</Badge>
              <h2 className="text-4xl font-bold mb-4">Get In <span className="text-purple-600">Touch</span></h2>
              <p className="text-xl text-gray-600">Have questions? We'd love to hear from you.</p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <Card className="border-0 shadow-xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-center">Send us a Message</h3>
                  <form className="space-y-6" onSubmit={(e) => {
                    e.preventDefault();
                    alert('Thank you for your message! We\'ll get back to you soon.');
                    (e.target as HTMLFormElement).reset();
                  }}>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name</label>
                        <input type="text" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name</label>
                        <input type="text" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input type="email" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Subject</label>
                      <input type="text" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Message</label>
                      <textarea required rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"></textarea>
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      
      <RegistrationTypeModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSelectCustomer={() => {
          setShowRegistrationModal(false);
          navigate('/signup');
        }}
        onSelectVendor={() => {
          setShowRegistrationModal(false);
          navigate('/signup?type=vendor');
        }}
      />
    </div>
  );
}