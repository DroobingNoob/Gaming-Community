import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Clock, Headphones, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';

interface Product {
  id: number;
  title: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  platform: string;
  discount: number;
  description: string;
  features: string[];
  systemRequirements: string[];
}

interface ProductPageProps {
  product: Product;
  onAddToCart: (product: Product, platform: string, type: string, price: number) => void;
  onBackToHome: () => void;
  onGameClick: (game: Product) => void;
}

const ProductPage: React.FC<ProductPageProps> = ({ product, onAddToCart, onBackToHome, onGameClick }) => {
  const [activeAccordion, setActiveAccordion] = useState<string | null>('details');
  const [isImageSticky, setIsImageSticky] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('PS5');
  const [selectedType, setSelectedType] = useState('Permanent');

  useEffect(() => {
    const handleScroll = () => {
      const testimonialsSection = document.getElementById('testimonials-section');
      if (testimonialsSection) {
        const rect = testimonialsSection.getBoundingClientRect();
        setIsImageSticky(rect.top > 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const testimonials = [
    {
      name: "GameMaster_Pro",
      time: "2 hours ago",
      message: "Just downloaded this game! Works perfectly on PS5. Thanks Gaming Community! 🎮",
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150"
    },
    {
      name: "StreamQueen",
      time: "1 day ago", 
      message: "Amazing price! Got it instantly after payment. Will definitely buy more games here! ⭐⭐⭐⭐⭐",
      avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150"
    }
  ];

  const relatedGames = [
    {
      id: 2,
      title: "Black Myth: Wukong",
      image: "https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg?auto=compress&cs=tinysrgb&w=400&h=400",
      salePrice: 49.99,
      originalPrice: 69.99,
      platform: "PS5",
      discount: 29,
      description: "Embark on an epic journey as the legendary Monkey King in this action RPG inspired by the classic Chinese novel Journey to the West.",
      features: ["Epic single-player adventure", "Stunning next-gen graphics", "Challenging boss battles"],
      systemRequirements: ["PlayStation 5 console required", "45 GB available storage space"]
    },
    {
      id: 5,
      title: "Spider-Man 2",
      image: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=400",
      salePrice: 39.99,
      originalPrice: 69.99,
      platform: "PS5",
      discount: 43,
      description: "Swing through New York City as both Peter Parker and Miles Morales in this spectacular superhero adventure.",
      features: ["Play as both Spider-Men", "Enhanced web-swinging", "New York City open world"],
      systemRequirements: ["PlayStation 5 console required", "48 GB available storage space"]
    }
  ];

  const faqs = [
    {
      question: "How do I download the game after purchase?",
      answer: "After successful payment, you'll receive an email with download instructions and your game key within 5 minutes."
    },
    {
      question: "Is this a legitimate game key?",
      answer: "Yes, all our game keys are 100% legitimate and sourced directly from authorized distributors."
    },
    {
      question: "What if the game key doesn't work?",
      answer: "We offer instant replacement for any non-working keys. Contact our 24/7 support team for immediate assistance."
    }
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Check out this amazing deal on ${product.title}!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!', {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  const calculatePrice = () => {
    let basePrice = product.salePrice;
    if (selectedType === 'Rent') {
      basePrice = basePrice * 0.3; // 30% of full price for rent
    }
    return basePrice;
  };

  const handleAddToCart = () => {
    const price = calculatePrice();
    onAddToCart(product, selectedPlatform, selectedType, price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Back Button */}
        <button
          onClick={onBackToHome}
          className="flex items-center space-x-1 sm:space-x-2 text-cyan-600 hover:text-orange-500 transition-colors mb-6 sm:mb-8 bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-lg text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Back</span>
        </button>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-2 gap-12">
            {/* Left Column - Product Image (Sticky) */}
            <div className={`${isImageSticky ? 'sticky top-8' : ''} h-fit`}>
              <div className="flex justify-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full max-w-md aspect-square object-cover rounded-2xl"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Product Details */}
            <div className="space-y-8">
              {/* Product Info */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">{product.title}</h1>
                
                <div className="flex items-center space-x-2 mb-6">
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    {product.platform}
                  </span>
                </div>

                {/* Platform Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Platform</label>
                  <div className="flex space-x-3">
                    {['PS4', 'PS5'].map((platform) => (
                      <button
                        key={platform}
                        onClick={() => setSelectedPlatform(platform)}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                          selectedPlatform === platform
                            ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Type</label>
                  <div className="flex space-x-3">
                    {['Permanent', 'Rent (30 Days)'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type.includes('Rent') ? 'Rent' : 'Permanent')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                          selectedType === (type.includes('Rent') ? 'Rent' : 'Permanent')
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex items-center space-x-4 mb-8">
                  <span className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    ${calculatePrice().toFixed(2)}
                  </span>
                  {selectedType === 'Rent' && (
                    <span className="text-2xl text-gray-500 line-through">
                      ${product.salePrice}
                    </span>
                  )}
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                    -{product.discount}%
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 mb-8">
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white py-4 rounded-xl font-bold text-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Add to Cart
                  </button>
                  <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 rounded-xl font-bold text-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                    Buy Now
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-full border-2 border-cyan-400 text-cyan-600 hover:bg-gradient-to-r hover:from-cyan-400 hover:to-blue-500 hover:text-white py-4 rounded-xl font-bold text-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                </div>

                {/* Trust Labels */}
                <div className="grid grid-cols-1 gap-4 mb-8">
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <Shield className="w-8 h-8 text-green-500" />
                    <div>
                      <div className="font-bold text-gray-800">Lifetime Warranty</div>
                      <div className="text-gray-600 text-sm">100% Guaranteed</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <Clock className="w-8 h-8 text-blue-500" />
                    <div>
                      <div className="font-bold text-gray-800">Instant Delivery</div>
                      <div className="text-gray-600 text-sm">Within 5 minutes</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                    <Headphones className="w-8 h-8 text-purple-500" />
                    <div>
                      <div className="font-bold text-gray-800">Customer Support</div>
                      <div className="text-gray-600 text-sm">24/7 Available</div>
                    </div>
                  </div>
                </div>

                {/* Accordions */}
                <div className="space-y-4">
                  {/* Product Details */}
                  <div className="border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm">
                    <button
                      onClick={() => toggleAccordion('details')}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-white/30 transition-colors rounded-xl"
                    >
                      <span className="font-bold text-gray-800 text-lg">Product Details</span>
                      {activeAccordion === 'details' ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {activeAccordion === 'details' && (
                      <div className="px-6 pb-6">
                        <p className="text-gray-600 leading-relaxed mb-4">{product.description}</p>
                        <h4 className="font-bold text-gray-800 mb-3">Key Features</h4>
                        <ul className="space-y-2">
                          {product.features.map((feature, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-cyan-400 mt-1">•</span>
                              <span className="text-gray-600">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Additional Information */}
                  <div className="border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm">
                    <button
                      onClick={() => toggleAccordion('additional')}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-white/30 transition-colors rounded-xl"
                    >
                      <span className="font-bold text-gray-800 text-lg">Additional Information</span>
                      {activeAccordion === 'additional' ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {activeAccordion === 'additional' && (
                      <div className="px-6 pb-6">
                        <h4 className="font-bold text-gray-800 mb-3">System Requirements</h4>
                        <ul className="space-y-2 mb-4">
                          {product.systemRequirements.map((req, index) => (
                            <li key={index} className="text-gray-600 text-sm">{req}</li>
                          ))}
                        </ul>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-bold text-gray-800 mb-2">Platform</h4>
                            <p className="text-gray-600">{selectedPlatform}</p>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 mb-2">Language Support</h4>
                            <p className="text-gray-600">English, Spanish, French, German, Italian</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* FAQ */}
                  <div className="border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm">
                    <button
                      onClick={() => toggleAccordion('faq')}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-white/30 transition-colors rounded-xl"
                    >
                      <span className="font-bold text-gray-800 text-lg">FAQ</span>
                      {activeAccordion === 'faq' ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {activeAccordion === 'faq' && (
                      <div className="px-6 pb-6 space-y-4">
                        {faqs.map((faq, index) => (
                          <div key={index}>
                            <h5 className="font-semibold text-gray-800 mb-2">{faq.question}</h5>
                            <p className="text-gray-600 text-sm">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden">
          <div className="space-y-6 sm:space-y-8">
            {/* Product Image */}
            <div className="flex justify-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/20">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full max-w-xs sm:max-w-sm aspect-square object-cover rounded-xl sm:rounded-2xl"
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/20">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">{product.title}</h1>
              
              <div className="flex items-center space-x-2 mb-4">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                  {product.platform}
                </span>
              </div>

              {/* Platform Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Platform</label>
                <div className="flex space-x-3">
                  {['PS4', 'PS5'].map((platform) => (
                    <button
                      key={platform}
                      onClick={() => setSelectedPlatform(platform)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        selectedPlatform === platform
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Type</label>
                <div className="flex space-x-3">
                  {['Permanent', 'Rent (30 Days)'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type.includes('Rent') ? 'Rent' : 'Permanent')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        selectedType === (type.includes('Rent') ? 'Rent' : 'Permanent')
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="flex items-center space-x-3 sm:space-x-4 mb-6">
                <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  ${calculatePrice().toFixed(2)}
                </span>
                {selectedType === 'Rent' && (
                  <span className="text-xl sm:text-2xl text-gray-500 line-through">
                    ${product.salePrice}
                  </span>
                )}
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  -{product.discount}%
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6 sm:mb-8">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Add to Cart
                </button>
                <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                  Buy Now
                </button>
                <button
                  onClick={handleShare}
                  className="w-full border-2 border-cyan-400 text-cyan-600 hover:bg-gradient-to-r hover:from-cyan-400 hover:to-blue-500 hover:text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>

              {/* Trust Labels */}
              <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <Shield className="w-6 h-6 text-green-500" />
                  <div>
                    <div className="font-bold text-gray-800 text-sm">Lifetime Warranty</div>
                    <div className="text-gray-600 text-xs">100% Guaranteed</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <Clock className="w-6 h-6 text-blue-500" />
                  <div>
                    <div className="font-bold text-gray-800 text-sm">Instant Delivery</div>
                    <div className="text-gray-600 text-xs">Within 5 minutes</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                  <Headphones className="w-6 h-6 text-purple-500" />
                  <div>
                    <div className="font-bold text-gray-800 text-sm">Customer Support</div>
                    <div className="text-gray-600 text-xs">24/7 Available</div>
                  </div>
                </div>
              </div>

              {/* Tabs for Mobile */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-4 sm:space-x-8">
                  {['details', 'additional', 'faq'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveAccordion(tab)}
                      className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                        activeAccordion === tab
                          ? 'border-cyan-400 text-cyan-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab === 'details' && 'Details'}
                      {tab === 'additional' && 'Info'}
                      {tab === 'faq' && 'FAQ'}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                {activeAccordion === 'details' && (
                  <div className="space-y-4">
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{product.description}</p>
                    <h4 className="text-base sm:text-lg font-bold text-gray-800 mt-6 mb-3">Key Features</h4>
                    <ul className="space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-cyan-400 mt-1">•</span>
                          <span className="text-gray-600 text-sm sm:text-base">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeAccordion === 'additional' && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-800 mb-3">System Requirements</h4>
                    <ul className="space-y-2 mb-4">
                      {product.systemRequirements.map((req, index) => (
                        <li key={index} className="text-gray-600 text-sm">{req}</li>
                      ))}
                    </ul>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Platform</h4>
                      <p className="text-gray-600 mb-4">{selectedPlatform}</p>
                      <h4 className="font-bold text-gray-800 mb-2">Language Support</h4>
                      <p className="text-gray-600">English, Spanish, French, German, Italian</p>
                    </div>
                  </div>
                )}

                {activeAccordion === 'faq' && (
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index}>
                        <h5 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">{faq.question}</h5>
                        <p className="text-gray-600 text-sm mb-4">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div id="testimonials-section" className="mb-8 sm:mb-12">
          <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4 sm:mb-6">Customer Reviews</h3>
          <div className="space-y-3 sm:space-y-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-bold text-gray-800 text-sm sm:text-base">{testimonial.name}</span>
                      <span className="text-gray-500 text-xs sm:text-sm">{testimonial.time}</span>
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base">{testimonial.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* You May Also Like */}
        <div className="mb-8 sm:mb-12">
          <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4 sm:mb-6">You May Also Like</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {relatedGames.map((game) => (
              <div 
                key={game.id} 
                className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 sm:hover:-translate-y-2"
                onClick={() => onGameClick(game)}
              >
                <img
                  src={game.image}
                  alt={game.title}
                  className="w-full aspect-square object-cover"
                />
                <div className="p-3 sm:p-4">
                  <h4 className="font-bold text-gray-800 text-xs sm:text-sm mb-2 line-clamp-2">
                    {game.title}
                  </h4>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="text-orange-500 font-bold text-sm sm:text-base">${game.salePrice}</span>
                    <span className="text-gray-500 line-through text-xs sm:text-sm">${game.originalPrice}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;