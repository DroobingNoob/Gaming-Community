import React from 'react';
import { Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

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
    <footer className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      <div className="container mx-auto px-4 py-16 relative">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src="/1000156095.jpg" 
                alt="Gaming Community" 
                className="w-12 h-12 object-contain bg-white/10 rounded-xl p-2"
              />
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-orange-500 bg-clip-text text-transparent">
                Gaming Community
              </span>
            </div>
            <p className="text-gray-300 mb-6 text-lg leading-relaxed max-w-md">
              Your trusted destination for digital games. We provide instant delivery, 
              competitive prices, and excellent customer support for all your gaming needs.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3 text-gray-300 hover:text-cyan-400 transition-colors">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 rounded-lg">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <span>+91 92665 14434</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300 hover:text-cyan-400 transition-colors">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 rounded-lg">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span>support@gamingcommunity.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300 hover:text-cyan-400 transition-colors">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 rounded-lg">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span>Available 24/7 Online</span>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/gamingcommunity"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-gray-800 to-gray-700 hover:from-cyan-400 hover:to-orange-500 p-3 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="https://youtube.com/gamingcommunity"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-gray-800 to-gray-700 hover:from-cyan-400 hover:to-orange-500 p-3 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
              >
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Quick Links</h3>
            <div className="space-y-3">
              {quickLinks.slice(0, 3).map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-gray-300 hover:text-cyan-400 transition-all duration-300 hover:translate-x-2 transform hover:bg-gray-800/30 p-2 rounded-lg"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Policies</h3>
            <div className="space-y-3">
              {quickLinks.slice(3).map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-gray-300 hover:text-orange-400 transition-all duration-300 hover:translate-x-2 transform hover:bg-gray-800/30 p-2 rounded-lg"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-gray-700/50 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center space-x-3 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/20">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">24/7</span>
              </div>
              <div className="text-left">
                <div className="font-bold text-white">24/7 Support</div>
                <div className="text-gray-400 text-sm">Always here to help</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/20">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">⚡</span>
              </div>
              <div className="text-left">
                <div className="font-bold text-white">Instant Delivery</div>
                <div className="text-gray-400 text-sm">Get games immediately</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/20">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">💯</span>
              </div>
              <div className="text-left">
                <div className="font-bold text-white">Best Prices</div>
                <div className="text-gray-400 text-sm">Guaranteed lowest rates</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 Gaming Community. All rights reserved.
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">Powered by</span>
              <span className="bg-gradient-to-r from-cyan-400 to-orange-500 bg-clip-text text-transparent font-bold">
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