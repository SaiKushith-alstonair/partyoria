import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './button';

interface MobileNavigationProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: React.ReactNode;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onToggle,
  onClose,
  children
}) => {
  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden touch-target"
        onClick={onToggle}
        aria-label="Toggle navigation menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="touch-target"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <div className="p-4 space-y-2">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface MobileNavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const MobileNavLink: React.FC<MobileNavLinkProps> = ({ 
  href, 
  children, 
  onClick 
}) => {
  return (
    <a
      href={href}
      onClick={onClick}
      className="block w-full text-left p-3 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors touch-target"
    >
      {children}
    </a>
  );
};

interface MobileNavButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
}

export const MobileNavButton: React.FC<MobileNavButtonProps> = ({ 
  onClick, 
  variant = 'primary',
  children 
}) => {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      className="w-full justify-center touch-target text-base"
    >
      {children}
    </Button>
  );
};