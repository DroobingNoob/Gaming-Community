import React from 'react';
import { Gift, Mail, ArrowRight } from 'lucide-react';

interface NewsletterBannerProps {
  onSignupClick: () => void;
}

const NewsletterBanner: React.FC<NewsletterBannerProps> = ({ onSignupClick }) => {
  return (
    <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white py-3 sm:py-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-3 sm:px-4 relative">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2 sm:space-x-3 text-center sm:text-left">
            <div className="bg-white/20 p-1.5 sm:p-2 rounded-full">
              <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base">
                🎮 Login & Get 10% OFF Your First Order!
              </span>
              <span className="hidden sm:inline text-white/90 ml-2 text-sm">
                Join our newsletter for exclusive gaming deals
              </span>
            </div>
          </div>
          
          <button
            onClick={onSignupClick}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium text-xs sm:text-sm transition-all duration-300 flex items-center space-x-1 sm:space-x-2 border border-white/30 hover:border-white/50"
          >
            <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Sign Up Now</span>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsletterBanner;