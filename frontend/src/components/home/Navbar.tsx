import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";


import { useToast } from "@/hooks/use-toast";
import { Menu, X } from "lucide-react";

import AuthButtons from "./AuthButtons";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  useToast();


  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "#services" },
    { name: "Events", href: "#events" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" onClick={() => { window.scrollTo(0, 0); window.history.pushState({}, '', '/'); }}>
            <div className="flex items-center cursor-pointer">
              <img src="/videos/partyoria.gif" alt="Partyoria Logo" style={{ height: "40px" }} />
            </div>
          </Link>
        </div>

        {/* Desktop Navigation - only show on home page */}
        {window.location.pathname === '/' && (
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="font-medium hover:text-primary transition duration-200"
                onClick={(e) => {
                  if (link.href.startsWith('#')) {
                    e.preventDefault();
                    const element = document.querySelector(link.href);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
              >
                {link.name}
              </a>
            ))}
          </div>
        )}

        <div className="flex items-center space-x-4">
          <AuthButtons className="hidden md:flex" />

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu - only show nav links on home page */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white px-4 py-2 shadow-lg absolute w-full">
          <div className="flex flex-col space-y-3 pb-3">
            {window.location.pathname === '/' && navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="font-medium py-2 px-2 hover:bg-gray-100 rounded"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (link.href.startsWith('#')) {
                    e.preventDefault();
                    const element = document.querySelector(link.href);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
              >
                {link.name}
              </a>
            ))}
            <div className="flex space-x-2 pt-2">
              <AuthButtons />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
