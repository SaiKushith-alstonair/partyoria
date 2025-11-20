import { Search, Award, MapPin } from "lucide-react";
import { ScrollAnimateWrapper } from "@/components/ScrollAnimateWrapper";

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <ScrollAnimateWrapper>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">
              Why Choose <span className="text-[#FF5A5F]">Partyoria</span>?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience seamless event planning with our comprehensive platform designed to make your celebrations perfect.
            </p>
          </div>
        </ScrollAnimateWrapper>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ScrollAnimateWrapper delay={100}>
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition duration-300 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#FF5A5F]/10 flex items-center justify-center mb-4">
                <Search className="text-[#FF5A5F] h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 font-heading">All-in-One Platform</h3>
              <p className="text-gray-600">
                Find venues, caterers, decorators, photographers, and more in one convenient place.
              </p>
            </div>
          </ScrollAnimateWrapper>

          <ScrollAnimateWrapper delay={200}>
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition duration-300 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#673AB7]/10 flex items-center justify-center mb-4">
                <Award className="text-[#673AB7] h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 font-heading">Verified Vendors</h3>
              <p className="text-gray-600">
                We thoroughly vet all our vendors to ensure quality service for your special occasions.
              </p>
            </div>
          </ScrollAnimateWrapper>

          <ScrollAnimateWrapper delay={300}>
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition duration-300 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#FFD700]/10 flex items-center justify-center mb-4">
                <MapPin className="text-[#FFD700] h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 font-heading">Pan-India Coverage</h3>
              <p className="text-gray-600">
                Access top-notch event planning services across all major cities in India.
              </p>
            </div>
          </ScrollAnimateWrapper>
        </div>
      </div>
    </section>
  );
}
