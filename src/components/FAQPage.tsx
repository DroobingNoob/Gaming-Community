import React, { useState } from 'react';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, MessageCircle, Users, Gamepad2, Shield, Clock, RefreshCw } from 'lucide-react';

interface FAQPageProps {
  onBackToHome: () => void;
}

const FAQPage: React.FC<FAQPageProps> = ({ onBackToHome }) => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0); // First FAQ open by default

  const faqs = [
    {
      id: 1,
      question: "What services do you offer?",
      answer: "We offer digital game rentals and permanent purchases for PS4, PS5, PC, and Xbox. We also provide subscriptions like PS Plus Extra and Deluxe plans.",
      icon: <Gamepad2 className="w-5 h-5" />,
      category: "Services"
    },
    {
      id: 2,
      question: "What is the difference between rental and permanent purchase?",
      answer: "Rental: You get access to the game for 30 days. You must return the account after the rental period ends.\n\nPermanent Purchase: You get permanent access to the game on your console (single device), with warranty and reinstallation support.",
      icon: <Clock className="w-5 h-5" />,
      category: "Purchase Types"
    },
    {
      id: 3,
      question: "How does the rental process work?",
      answer: "1. Choose a game and confirm availability.\n2. Make payment and receive login credentials.\n3. Download and play the game for 30 days.\n4. After 30 days, return the account as per our policy.",
      icon: <RefreshCw className="w-5 h-5" />,
      category: "Process"
    },
    {
      id: 4,
      question: "Can I play games from my personal account?",
      answer: "Yes! All our permanent purchases are configured to work from your personal account, unless specifically stated otherwise.",
      icon: <Users className="w-5 h-5" />,
      category: "Account"
    },
    {
      id: 5,
      question: "Are these accounts legal and safe?",
      answer: "Absolutely. We provide full legal accounts with warranty. All games are safe, ban-free, and come with setup support.",
      icon: <Shield className="w-5 h-5" />,
      category: "Safety"
    },
    {
      id: 6,
      question: "What if my game stops working or is locked?",
      answer: "You are covered under our warranty period:\n\nRental Games: Support provided for 30 days.\nPermanent Games: Warranty available for 6 months.\n\nIn case of any issue, just contact us — we will assist or replace as needed.",
      icon: <Shield className="w-5 h-5" />,
      category: "Support"
    },
    {
      id: 7,
      question: "Do you offer refunds?",
      answer: "No. All sales are final. Once the game/account is delivered, no refunds are allowed. However, early completion of rental can unlock discounts on your next purchase.",
      icon: <RefreshCw className="w-5 h-5" />,
      category: "Refunds"
    },
    {
      id: 8,
      question: "Can I use the game on multiple devices?",
      answer: "No. All accounts are meant for single-console use only. Using it on multiple devices or sharing may void the warranty.",
      icon: <Gamepad2 className="w-5 h-5" />,
      category: "Usage"
    },
    {
      id: 9,
      question: "Do you provide PS Plus subscriptions?",
      answer: "Yes! We offer PS Plus Extra and Deluxe plans for 1 month, 3 months, and 12 months. Slots are limited, so please DM to check availability.",
      icon: <Users className="w-5 h-5" />,
      category: "Subscriptions"
    },
    {
      id: 10,
      question: "How do I contact you or place an order?",
      answer: "You can DM us on WhatsApp at +91 9266514434\nor\nJoin our Gaming Community Group: https://chat.whatsapp.com/KRtaioVG3RjHnKa290mJAO",
      icon: <MessageCircle className="w-5 h-5" />,
      category: "Contact"
    }
  ];

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  const handleWhatsAppContact = () => {
    const phoneNumber = '+91 9266514434';
    const message = 'Hi! I have a question about your gaming services.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleJoinGroup = () => {
    const groupUrl = 'https://chat.whatsapp.com/KRtaioVG3RjHnKa290mJAO';
    window.open(groupUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Back Button */}
        <button
          onClick={onBackToHome}
          className="flex items-center space-x-1 sm:space-x-2 text-cyan-600 hover:text-orange-500 transition-colors mb-6 sm:mb-8 bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-lg text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Back to Home</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 sm:p-3 rounded-full">
              <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h1>
          </div>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto px-4">
            Find answers to common questions about our gaming services, rentals, and purchases
          </p>
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
            Can't find what you're looking for? Contact us directly!
          </div>
        </div>

        {/* FAQ Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl border border-white/20 space-y-4 sm:space-y-6">
          
          {/* FAQ Items */}
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="border border-gray-200 rounded-xl sm:rounded-2xl bg-white/50 backdrop-blur-sm overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-white/30 transition-colors"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                    <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 sm:p-2.5 rounded-lg flex-shrink-0">
                      <div className="text-white">
                        {faq.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs sm:text-sm text-cyan-600 font-medium bg-cyan-50 px-2 py-1 rounded-full">
                          {faq.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-800 text-sm sm:text-base md:text-lg leading-tight">
                        {faq.question}
                      </h3>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-2 sm:ml-4">
                    {openFAQ === faq.id ? (
                      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    )}
                  </div>
                </button>
                
                {openFAQ === faq.id && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <div className="ml-0 sm:ml-12 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-gray-100">
                      <div className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </div>
                      
                      {/* Special handling for contact FAQ */}
                      {faq.id === 10 && (
                        <div className="mt-4 sm:mt-6 space-y-3">
                          <button
                            onClick={handleWhatsAppContact}
                            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                          >
                            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Contact via WhatsApp</span>
                          </button>
                          <button
                            onClick={handleJoinGroup}
                            className="w-full sm:w-auto bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                          >
                            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Join Gaming Community</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-8 sm:mt-12 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-4 sm:p-6 md:p-8 border border-cyan-200">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Still Have Questions?</h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                Our gaming experts are available 24/7 to help you with any questions or concerns.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto">
                <button
                  onClick={handleWhatsAppContact}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={handleJoinGroup}
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                >
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Join Group</span>
                </button>
              </div>
              
              <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-600">
                <p className="mb-2">
                  <strong>WhatsApp:</strong> +91 92665 14434
                </p>
                <p>
                  <strong>Response Time:</strong> Usually within 30 minutes
                </p>
              </div>
            </div>
          </div>

          {/* Gaming Tips */}
          <div className="mt-6 sm:mt-8 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 sm:p-6 md:p-8 border border-orange-200">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
                <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Pro Gaming Tips</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left">
                <div className="bg-white/50 rounded-lg p-3 sm:p-4">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">For Rentals</h4>
                  <p className="text-gray-600 text-xs sm:text-sm">Complete games quickly to get discounts on your next rental!</p>
                </div>
                <div className="bg-white/50 rounded-lg p-3 sm:p-4">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">For Purchases</h4>
                  <p className="text-gray-600 text-xs sm:text-sm">Keep your account safe to maintain your 6-month warranty coverage.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;