import React, { useState } from 'react';
import { X, Mail, Phone, Gift, Check, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../config/supabase';

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignup: (mobile: string) => void;
  userEmail?: string;
}

const NewsletterModal: React.FC<NewsletterModalProps> = ({ 
  isOpen, 
  onClose, 
  onSignup,
  userEmail 
}) => {
  const [mobile, setMobile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits and limit to 10 characters
    const numericValue = value.replace(/\D/g, '').slice(0, 10);
    setMobile(numericValue);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mobile.trim()) {
      setError('Please enter your mobile number');
      return;
    }
    
    // Validate mobile number (basic validation)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile.trim())) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // Update user metadata with newsletter signup and mobile
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          newsletter_subscribed: true,
          mobile_number: mobile,
          newsletter_signup_date: new Date().toISOString(),
          first_order_discount_available: true
        }
      });

      if (updateError) {
        throw updateError;
      }

      toast.success('🎉 Newsletter signup successful! You now have a 10% discount on your first order!');
      onSignup(mobile);
      onClose();
    } catch (error) {
      console.error('Newsletter signup error:', error);
      setError('Failed to sign up for newsletter. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl max-w-md w-full shadow-2xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Get 10% OFF!</h2>
            <p className="text-white/90">Join our newsletter for exclusive gaming deals</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 mb-4">
              <div className="flex items-center justify-center space-x-2 text-green-800 mb-2">
                <Check className="w-5 h-5" />
                <span className="font-semibold">Special First Order Discount</span>
              </div>
              <p className="text-green-700 text-sm">
                Get 10% off your first order when you sign up for our newsletter!
              </p>
            </div>

            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Exclusive gaming deals and discounts</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Early access to new game releases</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Gaming tips and community updates</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Display */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={userEmail || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
                  placeholder="Your email address"
                />
              </div>
            </div>

            {/* Mobile Number Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  value={mobile}
                  onChange={handleMobileChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  required
                  autoComplete="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
              {error && (
                <div className="flex items-center space-x-2 text-red-600 text-sm mt-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !mobile.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing Up...</span>
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4" />
                  <span>Get My 10% Discount</span>
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
            By signing up, you agree to receive promotional emails and SMS. 
            You can unsubscribe at any time. The 10% discount is valid for your first order only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsletterModal;