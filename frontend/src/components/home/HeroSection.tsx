import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useContext } from "react";
import { UserTypeContext } from "@/main";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ScrollAnimateWrapper } from "@/components/ScrollAnimateWrapper";

export default function HeroSection() {
  const { isAuthenticated } = useAuth();
  const { setIsVendor } = useContext(UserTypeContext);
  const { toast } = useToast();

  const handlePlanEvent = () => {
    if (!isAuthenticated) {
      window.location.href = "/signup";
    } else {
      // Navigate to dashboard
      window.location.href = '/dashboard';
    }
  };

  const handleJoinAsVendor = async () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
    } else {
      try {
        await apiRequest("/api/users/vendor", { method: "POST" });
        setIsVendor(true);
        toast({
          title: "Success!",
          description: "You are now registered as a vendor.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to register as vendor. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <section className="relative overflow-hidden min-h-screen bg-black">
      <video 
        autoPlay 
        muted 
        loop
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-r from-[#6B3FA0]/60 to-[#E47B7B]/60"></div>
      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <ScrollAnimateWrapper>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-heading">
              Create Unforgettable <span className="text-[#FFD700] font-['Dancing_Script']">Celebrations</span>
            </h1>
            <p className="text-xl text-white/90 mb-8">
              India's premier all-in-one event management platform. From weddings to corporate events, we connect you with the best vendors across the country.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="py-6 px-8 bg-white text-brand-purple rounded-lg font-semibold text-lg h-auto"
                onClick={handlePlanEvent}
              >
                Plan Your Event
              </Button>
              <Button 
                className="py-6 px-8 bg-brand-gradient text-white rounded-lg font-semibold text-lg h-auto"
                onClick={handleJoinAsVendor}
              >
                Join as Vendor
              </Button>
            </div>
          </div>
        </ScrollAnimateWrapper>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
}
