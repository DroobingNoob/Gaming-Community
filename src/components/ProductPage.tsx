import React, { useState } from 'react';
import { X, Star, Shield, Clock, Headphones, Share2, ChevronDown, ChevronUp } from 'lucide-react';

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
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

const ProductPage: React.FC<ProductPageProps> = ({ product, isOpen, onClose, onAddToCart }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  if (!isOpen || !product) return null;

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
      image: "https://images.pexels.com/photos/1298601/pexels-photo-1298601.jpeg?auto=compress&cs=tinysrgb&w=300&h=533",
      salePrice: 49.99,
      originalPrice: 69.99
    },
    {
      id: 3,
      title: "Spider-Man 2",
      image: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=300&h=533",
      salePrice: 39.99,
      originalPrice: 69.99
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b z-10 px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800 truncate mx-4">
              {product.title}
            </h1>
            <button
              onClick={handleShare}
              className="text-gray-600 hover:text-cyan-600 transition-colors"
            >
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Product Info Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Product Image */}
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full aspect-[9/16] object-cover rounded-2xl shadow-lg"
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
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
                </div>

                {/* Trust Labels */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mb-12">
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {['details', 'additional', 'faq'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab
                        ? 'border-cyan-400 text-cyan-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'details' && 'Product Details'}
                    {tab === 'additional' && 'Additional Information'}
                    {tab === 'faq' && 'FAQ'}
                  </button>
                ))}
              </nav>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Game Description</h3>
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

              {activeTab === 'additional' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">System Requirements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Minimum Requirements</h4>
                      <ul className="space-y-2">
                        {product.systemRequirements.map((req, index) => (
                          <li key={index} className="text-gray-600 text-sm">{req}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Platform</h4>
                      <p className="text-gray-600">{product.platform}</p>
                      <h4 className="font-semibold text-gray-800 mb-3 mt-4">Language Support</h4>
                      <p className="text-gray-600">English, Spanish, French, German, Italian</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'faq' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Frequently Asked Questions</h3>
                  {faqs.map((faq, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-800">{faq.question}</span>
                        {expandedFAQ === index ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      {expandedFAQ === index && (
                        <div className="px-4 pb-4">
                          <p className="text-gray-600">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="mb-12">
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
                <div key={game.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img
                    src={game.image}
                    alt={game.title}
                    className="w-full aspect-[9/16] object-cover"
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
    </div>
  );
};

export default ProductPage;