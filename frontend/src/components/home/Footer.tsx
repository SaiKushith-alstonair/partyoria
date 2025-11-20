
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  MapPin, 
  Phone, 
  Mail 
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white text-black border-t pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center mb-6">
              <img src="/videos/partyoria.gif" alt="Partyoria Logo" style={{ height: "40px" }} />
            </div>
            <p className="mb-6 text-black">
              India's premier all-in-one event management platform, connecting customers with top vendors for unforgettable celebrations.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-black hover:text-primary transition-colors duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-black hover:text-primary transition-colors duration-300">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-black hover:text-primary transition-colors duration-300">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-black hover:text-primary transition-colors duration-300">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 text-black">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-black hover:text-primary transition-colors duration-300">
                  Home
                </a>
              </li>
              <li>
                <a href="#services" className="text-black hover:text-primary transition-colors duration-300">
                  Services
                </a>
              </li>
              <li>
                <a href="#events" className="text-black hover:text-primary transition-colors duration-300">
                  Events
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-black hover:text-primary transition-colors duration-300">
                  Testimonials
                </a>
              </li>
              <li>
                <a href="#contact" className="text-black hover:text-primary transition-colors duration-300">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 text-black">Services</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-black hover:text-primary transition-colors duration-300">
                  Venues
                </a>
              </li>
              <li>
                <a href="#" className="text-black hover:text-primary transition-colors duration-300">
                  Catering
                </a>
              </li>
              <li>
                <a href="#" className="text-black hover:text-primary transition-colors duration-300">
                  Decoration
                </a>
              </li>
              <li>
                <a href="#" className="text-black hover:text-primary transition-colors duration-300">
                  Photography
                </a>
              </li>
              <li>
                <a href="#" className="text-black hover:text-primary transition-colors duration-300">
                  Entertainment
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 text-black">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mt-1 mr-3 text-primary flex-shrink-0" />
                <span className="text-black">REGISTERED OFFICE | #28 Third floor MCHS Layout KV Jayaram Road, Jakkur Bangalore 560064</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                <span className="text-black">+918068447416</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                <span className="text-black">info@alstonair.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 text-center text-black">
          <p>&copy; {new Date().getFullYear()} Partyoria. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
