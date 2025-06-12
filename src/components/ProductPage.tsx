import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Shield, Clock, Headphones, Share2, ChevronDown, ChevronUp } from 'lucide-react';

interface Product {
  id: number;
  title: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  rating: number;
  platform: string;
  discount: number;
  description: string;
  features: string[];
  systemRequirements: string[];
}

interface ProductPageProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onBackToHome: () => void;
  onGameClick: (game: Product) => void;
}

const ProductPage: React.FC<ProductPageProps> = ({ product, onAddToCart, onBackToHome, onGameClick }) => {
  const [activeAccordion, setActiveAccordion] = useState<string | null>('details');
  const [isImageSticky, setIsImageSticky] = useState(true);

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
      message: "Just downloaded this game! Works perfectly on PS5. Thanks GameStore! 🎮",
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
      rating: 4.9,
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
      rating: 4.8,
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
      alert('Link copied to clipboard!');
    }
  };

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={onBackToHome}
          className="flex items-center space-x-2 text-cyan-600 hover:text-orange-500 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Games</span>
        </button>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-2 gap-12">
            {/* Left Column - Product Image (Sticky) */}
            <div className={`${isImageSticky ? 'sticky top-8' : ''} h-fit`}>
              <div className="flex justify-center">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full max-w-md aspect-square object-cover rounded-2xl shadow-lg"
                />
              </div>
            </div>

            {/* Right Column - Product Details */}
            <div className="space-y-8">
              {/* Product Info */}
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-4">{product.title}</h1>
                
                {/* Rating */}
                <div className="flex items-center space-x-2 mb-6">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating)
                            ? 'fill-orange-400 text-orange-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">({product.rating})</span>
                  <span className="bg-cyan-400 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {product.platform}
                  </span>
                </div>

                {/* Pricing */}
                <div className="flex items-center space-x-4 mb-8">
                  <span className="text-5xl font-bold text-orange-500">
                    ${product.salePrice}
                  </span>
                  <span className="text-3xl text-gray-500 line-through">
                    ${product.originalPrice}
                  </span>
                  <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-lg font-semibold">
                    -{product.discount}%
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 mb-8">
                  <button
                    onClick={() => onAddToCart(product)}
                    className="w-full bg-cyan-400 hover:bg-cyan-500 text-white py-4 rounded-xl font-semibold text-xl transition-colors"
                  >
                    Add to Cart
                  </button>
                  <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-semibold text-xl transition-colors">
                    Buy Now
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-full border-2 border-cyan-400 text-cyan-600 hover:bg-cyan-400 hover:text-white py-4 rounded-xl font-semibold text-xl transition-colors flex items-center justify-center space-x-2"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                </div>

                {/* Trust Labels */}
                <div className="grid grid-cols-1 gap-4 mb-8">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <Shield className="w-8 h-8 text-cyan-400" />
                    <div>
                      <div className="font-semibold text-gray-800">Lifetime Warranty</div>
                      <div className="text-gray-600 text-sm">100% Guaranteed</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <Clock className="w-8 h-8 text-cyan-400" />
                    <div>
                      <div className="font-semibold text-gray-800">Instant Delivery</div>
                      <div className="text-gray-600 text-sm">Within 5 minutes</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <Headphones className="w-8 h-8 text-cyan-400" />
                    <div>
                      <div className="font-semibold text-gray-800">Customer Support</div>
                      <div className="text-gray-600 text-sm">24/7 Available</div>
                    </div>
                  </div>
                </div>

                {/* Accordions */}
                <div className="space-y-4">
                  {/* Product Details */}
                  <div className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleAccordion('details')}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-800 text-lg">Product Details</span>
                      {activeAccordion === 'details' ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {activeAccordion === 'details' && (
                      <div className="px-6 pb-6">
                        <p className="text-gray-600 leading-relaxed mb-4">{product.description}</p>
                        <h4 className="font-semibold text-gray-800 mb-3">Key Features</h4>
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
                  <div className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleAccordion('additional')}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-800 text-lg">Additional Information</span>
                      {activeAccordion === 'additional' ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {activeAccordion === 'additional' && (
                      <div className="px-6 pb-6">
                        <h4 className="font-semibold text-gray-800 mb-3">System Requirements</h4>
                        <ul className="space-y-2 mb-4">
                          {product.systemRequirements.map((req, index) => (
                            <li key={index} className="text-gray-600 text-sm">{req}</li>
                          ))}
                        </ul>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Platform</h4>
                            <p className="text-gray-600">{product.platform}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Language Support</h4>
                            <p className="text-gray-600">English, Spanish, French, German, Italian</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* FAQ */}
                  <div className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleAccordion('faq')}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-800 text-lg">FAQ</span>
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
                            <h5 className="font-medium text-gray-800 mb-2">{faq.question}</h5>
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
          <div className="space-y-8">
            {/* Product Image */}
            <div className="flex justify-center">
              <img
                src={product.image}
                alt={product.title}
                className="w-full max-w-sm aspect-square object-cover rounded-2xl shadow-lg"
              />
            </div>

            {/* Product Details */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.title}</h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-orange-400 text-orange-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">({product.rating})</span>
                <span className="bg-cyan-400 text-white px-2 py-1 rounded text-sm font-medium">
                  {product.platform}
                </span>
              </div>

              {/* Pricing */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-4xl font-bold text-orange-500">
                  ${product.salePrice}
                </span>
                <span className="text-2xl text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  -{product.discount}%
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-8">
                <button
                  onClick={() => onAddToCart(product)}
                  className="w-full bg-cyan-400 hover:bg-cyan-500 text-white py-4 rounded-xl font-semibold text-lg transition-colors"
                >
                  Add to Cart
                </button>
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-semibold text-lg transition-colors">
                  Buy Now
                </button>
                <button
                  onClick={handleShare}
                  className="w-full border-2 border-cyan-400 text-cyan-600 hover:bg-cyan-400 hover:text-white py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>

              {/* Trust Labels */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Shield className="w-6 h-6 text-cyan-400" />
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">Lifetime Warranty</div>
                    <div className="text-gray-600 text-xs">100% Guaranteed</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Clock className="w-6 h-6 text-cyan-400" />
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">Instant Delivery</div>
                    <div className="text-gray-600 text-xs">Within 5 minutes</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Headphones className="w-6 h-6 text-cyan-400" />
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">Customer Support</div>
                    <div className="text-gray-600 text-xs">24/7 Available</div>
                  </div>
                </div>
              </div>

              {/* Tabs for Mobile */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
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

              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                {activeAccordion === 'details' && (
                  <div className="space-y-4">
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                    <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-3">Key Features</h4>
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

                {activeAccordion === 'additional' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 mb-3">System Requirements</h4>
                    <ul className="space-y-2 mb-4">
                      {product.systemRequirements.map((req, index) => (
                        <li key={index} className="text-gray-600 text-sm">{req}</li>
                      ))}
                    </ul>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Platform</h4>
                      <p className="text-gray-600 mb-4">{product.platform}</p>
                      <h4 className="font-semibold text-gray-800 mb-2">Language Support</h4>
                      <p className="text-gray-600">English, Spanish, French, German, Italian</p>
                    </div>
                  </div>
                )}

                {activeAccordion === 'faq' && (
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index}>
                        <h5 className="font-medium text-gray-800 mb-2">{faq.question}</h5>
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
        <div id="testimonials-section" className="mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Customer Reviews</h3>
          <div className="space-y-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-800">{testimonial.name}</span>
                      <span className="text-gray-500 text-sm">{testimonial.time}</span>
                    </div>
                    <p className="text-gray-600">{testimonial.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* You May Also Like */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">You May Also Like</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedGames.map((game) => (
              <div 
                key={game.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onGameClick(game)}
              >
                <img
                  src={game.image}
                  alt={game.title}
                  className="w-full aspect-square object-cover"
                />
                <div className="p-4">
                  <h4 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2">
                    {game.title}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-500 font-bold">${game.salePrice}</span>
                    <span className="text-gray-500 line-through text-sm">${game.originalPrice}</span>
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