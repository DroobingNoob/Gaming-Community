import React from 'react';
import { Gamepad2, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const quickLinks = [
    { name: 'About Us', href: '#about' },
    { name: 'Contact', href: '#contact' },
    { name: 'Privacy Policy', href: '#privacy' },
    { name: 'Terms & Conditions', href: '#terms' },
    { name: 'Cancellation & Refund Policy', href: '#refund' },
    { name: 'Shipping & Delivery Policy', href: '#shipping' }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-cyan-400 to-orange-500 p-2 rounded-xl">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-orange-500 bg-clip-text text-transparent">
                GameStore
              </span>
            </div>
            <p className="text-gray-300 mb-6 text-lg leading-relaxed max-w-md">
              Your trusted destination for digital games. We provide instant delivery, 
              competitive prices, and excellent customer support for all your gaming needs.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="w-5 h-5 text-cyan-400" />
                <span>+91 92665 14434</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="w-5 h-5 text-cyan-400" />
                <span>support@gamestore.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <span>Available 24/7 Online</span>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/gamestore"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-gradient-to-r hover:from-cyan-400 hover:to-orange-500 p-3 rounded-xl transition-all duration-300 transform hover:scale-110"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="https://youtube.com/gamestore"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-gradient-to-r hover:from-cyan-400 hover:to-orange-500 p-3 rounded-xl transition-all duration-300 transform hover:scale-110"
              >
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white">Quick Links</h3>
            <div className="space-y-3">
              {quickLinks.slice(0, 3).map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-gray-300 hover:text-cyan-400 transition-colors duration-300 hover:translate-x-1 transform"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white">Policies</h3>
            <div className="space-y-3">
              {quickLinks.slice(3).map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-gray-300 hover:text-cyan-400 transition-colors duration-300 hover:translate-x-1 transform"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">24/7</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">24/7 Support</div>
                <div className="text-gray-400 text-sm">Always here to help</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">⚡</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">Instant Delivery</div>
                <div className="text-gray-400 text-sm">Get games immediately</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">💯</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">Best Prices</div>
                <div className="text-gray-400 text-sm">Guaranteed lowest rates</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 GameStore. All rights reserved.
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">Powered by</span>
              <span className="bg-gradient-to-r from-cyan-400 to-orange-500 bg-clip-text text-transparent font-semibold">
                Gaming Community
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;