import React from 'react';
import { X, Clock, Phone } from 'lucide-react';

interface ShopClosedModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  workingHours?: {
    start: string;
    end: string;
  };
}

const ShopClosedModal: React.FC<ShopClosedModalProps> = ({
  isOpen,
  onClose,
  message,
  workingHours
}) => {
  if (!isOpen) return null;

  const handleWhatsAppContact = () => {
    const phoneNumber = '+919266514434';
    const whatsappMessage = 'Hi! I have a query about shop timings and orders.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-orange-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Shop Currently Closed
          </h2>

          <p className="text-gray-600 mb-6 leading-relaxed">
            {message}
          </p>

          {workingHours && (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Our Working Hours
              </p>
              <p className="text-lg font-bold text-blue-600">
                {workingHours.start} - {workingHours.end}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Orders accepted during these hours
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Got It
            </button>

            <button
              onClick={handleWhatsAppContact}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Contact Us on WhatsApp
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            You can still browse and add items to your cart
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShopClosedModal;
