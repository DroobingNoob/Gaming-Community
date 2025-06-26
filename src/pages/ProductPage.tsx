import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Clock, Headphones, Share2, ChevronDown, ChevronUp, ShoppingCart } from 'lucide-react';
import { toast } from 'react-toastify';
import { Game, getGameDisplayPrice, getGameDiscountPercentage } from '../config/supabase';
import { useGames, useSubscriptions } from '../hooks/useSupabaseData';
import CustomerScreenshots from '../components/CustomerScreenshots';
import Loader from '../components/Loader';

interface ProductPageProps {
  onAddToCart: (product: Game, platform: string, type: string, price: number) => void;
  onBuyNow: (product: Game, platform: string, type: string, price: number) => void;
}

const ProductPage: React.FC<ProductPageProps> = ({ onAddToCart, onBuyNow }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { games, loading: gamesLoading } = useGames();
  const { subscriptions, loading: subscriptionsLoading } = useSubscriptions();
  
  const [product, setProduct] = useState<Game | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Game[]>([]);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('details');
  const [isImageSticky, setIsImageSticky] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedRentDuration, setSelectedRentDuration] = useState<'1_month' | '2_months' | '3_months' | '6_months'>('1_month');

  const isLoading = gamesLoading || subscriptionsLoading;

  // Find the product by ID
  useEffect(() => {
    if (id && !isLoading) {
      const allProducts = [...games, ...subscriptions];
      const foundProduct = allProducts.find(p => p.id === id);
      
      if (foundProduct) {
        setProduct(foundProduct);
        setSelectedPlatform(foundProduct.platform[0] || '');
        setSelectedType(foundProduct.type[0] || '');
        
        // Set related products
        const related = foundProduct.category === 'game' 
          ? games.filter(game => game.id !== foundProduct.id).slice(0, 4)
          : subscriptions.filter(sub => sub.id !== foundProduct.id).slice(0, 4);
        setRelatedProducts(related);
      }
    }
  }, [id, games, subscriptions, isLoading]);

  useEffect(() => {
    const handleScroll = () => {
      const screenshotsSection = document.getElementById('screenshots-section');
      if (screenshotsSection) {
        const rect = screenshotsSection.getBoundingClientRect();
        setIsImageSticky(rect.top > 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show loader while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-1 sm:space-x-2 text-cyan-600 hover:text-orange-500 transition-colors mb-6 sm:mb-8 bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-lg text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back</span>
          </button>
          <Loader size="large" message="Loading product details..." fullScreen={false} />
        </div>
      </div>
    );
  }

  // Show loader if product not found yet (still searching)
  if (!product && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-1 sm:space-x-2 text-cyan-600 hover:text-orange-500 transition-colors mb-6 sm:mb-8 bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-lg text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back</span>
          </button>
          <Loader size="large" message="Searching for product..." fullScreen={false} />
        </div>
      </div>
    );
  }

  const faqs = [
    {
      question: "What is the difference between rental and permanent purchase?",
      answer: "Rental: You get access to the game for 30 days. You must return the account after the rental period ends.\n\nPermanent Purchase: You get permanent access to the game on your console (single device), with warranty and reinstallation support."
    },
    {
      question: "How does the rental process work?",
      answer: "1. Choose a game and confirm availability.\n2. Make payment and receive login credentials.\n3. Download and play the game for 30 days.\n4. After 30 days, return the account as per our policy."
    },
    {
      question: "Can I play games from my personal account?",
      answer: "Yes! All our permanent purchases are configured to work from your personal account, unless specifically stated otherwise."
    },
    {
      question: "Are these accounts legal and safe?",
      answer: "Absolutely. We provide full legal accounts with warranty. All games are safe, ban-free, and come with setup support."
    },
    {
      question: "What if my game stops working or is locked?",
      answer: "You are covered under our warranty period:\n\nRental Games: Support provided for 30 days.\nPermanent Games: Warranty available for 6 months.\n\nIn case of any issue, just contact us — we will assist or replace as needed."
    },
    {
      question: "Do you offer refunds?",
      answer: "No. All sales are final. Once the game/account is delivered, no refunds are allowed. However, early completion of rental can unlock discounts on your next purchase."
    },
    {
      question: "Can I use the game on multiple devices?",
      answer: "No. All accounts are meant for single-console use only. Using it on multiple devices or sharing may void the warranty."
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
    if (product.category === 'subscription') {
      return product.sale_price; // Subscriptions keep original logic
    }

    // For games, use the new pricing logic
    return getGameDisplayPrice(product, selectedType, selectedRentDuration);
  };

  const getDiscountPercentage = () => {
    if (product.category === 'subscription') {
      return product.discount; // Subscriptions keep original logic
    }

    // For games, calculate discount based on selected type
    return getGameDiscountPercentage(product, selectedType, selectedRentDuration);
  };

  const getTypeDescription = () => {
    if (selectedType === 'Rent') {
      return ` 🎮 Rental Game Accounts:

✔️ We provide a fully legal account with your desired rental game pre-purchased.

✔️ You just need to download and play – quick and hassle-free!

✔️ Games can be rented for the following durations:
• 1 Month
• 3 Months
• 6 Months

✔️ Online play is available.

✔️ Console must remain connected to the internet during the rental period.

✔️ After the selected rental period ends, the game must be returned as per the agreed process.

✔️ Continuing to use the game after your rental period may result in account restrictions or being blocked from future rentals.

✔️ Credentials cannot be changed. If changed, the game will be removed, and no refund or recovery will be provided.`;
    } else if (selectedType === 'Permanent Offline') {
      return `This version allows you to play the game permanently, but only in offline mode.

Once the game is installed, you must keep your console disconnected from the internet.

If your console connects to the internet, there is an 80% chance the game will get locked and become unplayable.

This option is best suited for single-player games or customers who prefer offline gaming.`;
    } else if (selectedType === 'Permanent Offline + Online') {
      return ` Permanent Game Details: 

✔️ We provide you with an account where the game is already purchased.

✔️ Simply log in, download the game, and play — no additional purchase required.

✔️ You can play the game from your own personal account.

✔️ Both online and offline play is supported.

✔️ The game will remain permanently accessible on your console.

✔️ 1-Year Warranty included on all permanent games.

🚫 Account credentials cannot be changed.

🚫 If you change the credentials, game access will be lost permanently and no refund or return will be provided.

`;
    }
    return '';
  };

  const handleAddToCart = () => {
    const price = calculatePrice();
    const typeWithDuration = selectedType === 'Rent' ? `${selectedType} (${selectedRentDuration.replace('_', ' ')})` : selectedType;
    onAddToCart(product, selectedPlatform, typeWithDuration, price);
  };

  const handleBuyNow = () => {
    const price = calculatePrice();
    const typeWithDuration = selectedType === 'Rent' ? `${selectedType} (${selectedRentDuration.replace('_', ' ')})` : selectedType;
    onBuyNow(product, selectedPlatform, typeWithDuration, price);
  };

  const handleRelatedProductClick = (relatedProduct: Game) => {
    if (relatedProduct.category === 'game') {
      navigate(`/games/${relatedProduct.id}`);
    } else {
      navigate(`/subscriptions/${relatedProduct.id}`);
    }
  };

  const currentPrice = calculatePrice();
  const discountPercentage = getDiscountPercentage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-1 sm:space-x-2 text-cyan-600 hover:text-orange-500 transition-colors mb-6 sm:mb-8 bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-lg text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Back</span>
        </button>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-12">
            {/* Left Column - Product Image (Sticky) */}
            <div className={`${isImageSticky ? 'sticky top-8' : ''} h-fit`}>
              <div className="flex justify-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20 w-full max-w-lg">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full aspect-square object-cover rounded-2xl"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Product Details */}
            <div className="space-y-6 xl:space-y-8">
              {/* Product Info */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 xl:p-8 shadow-2xl border border-white/20">
                <h1 className="text-2xl xl:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4 xl:mb-6">{product.title}</h1>
                
                <div className="flex items-center space-x-2 mb-4 xl:mb-6">
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-3 xl:px-4 py-1 xl:py-2 rounded-full text-xs xl:text-sm font-medium shadow-lg">
                    {product.platform.join(', ')}
                  </span>
                </div>

                {/* Platform Selection */}
                <div className="mb-4 xl:mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Platform</label>
                  <div className="flex flex-wrap gap-2 xl:gap-3">
                    {product.platform.map((platform) => (
                      <button
                        key={platform}
                        onClick={() => setSelectedPlatform(platform)}
                        className={`px-4 xl:px-6 py-2 xl:py-3 rounded-lg xl:rounded-xl font-medium transition-all duration-300 text-sm xl:text-base ${
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
                <div className="mb-4 xl:mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Type</label>
                  <div className="space-y-2 xl:space-y-3">
                    {product.type.map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`w-full px-4 xl:px-6 py-2 xl:py-3 rounded-lg xl:rounded-xl font-medium transition-all duration-300 text-left text-sm xl:text-base ${
                          selectedType === type
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rent Duration Selection - Only show if Rent is selected */}
                {selectedType === 'Rent' && (
                  <div className="mb-4 xl:mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Rental Duration</label>
                    <div className="grid grid-cols-2 gap-2 xl:gap-3">
                      {[
                        { key: '1_month', label: '1 Month', price: product.rent_1_month },
                        { key: '2_months', label: '2 Months', price: product.rent_2_months },
                        { key: '3_months', label: '3 Months', price: product.rent_3_months },
                        { key: '6_months', label: '6 Months', price: product.rent_6_months }
                      ].map((duration) => (
                        <button
                          key={duration.key}
                          onClick={() => setSelectedRentDuration(duration.key as any)}
                          className={`px-3 xl:px-4 py-2 xl:py-3 rounded-lg xl:rounded-xl font-medium transition-all duration-300 text-sm xl:text-base ${
                            selectedRentDuration === duration.key
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <div className="text-xs xl:text-sm">{duration.label}</div>
                          <div className="text-xs opacity-75">₹{duration.price || 0}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Type Description */}
                <div className="mb-4 xl:mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 xl:p-6 border border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-3 text-sm xl:text-base">About This Option</h4>
                  <p className="text-blue-700 text-xs xl:text-sm leading-relaxed whitespace-pre-line">
                    {getTypeDescription()}
                  </p>
                </div>

                {/* Pricing */}
                <div className="flex items-center space-x-3 xl:space-x-4 mb-6 xl:mb-8">
                  <span className="text-3xl xl:text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    ₹{currentPrice.toFixed(2)}
                  </span>
                  {discountPercentage > 0 && (
                    <>
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 xl:px-4 py-1 xl:py-2 rounded-full text-sm xl:text-lg font-bold shadow-lg">
                        -{discountPercentage}%
                      </span>
                      <span className="text-lg xl:text-2xl text-gray-500 line-through">
                        ₹{product.original_price}
                      </span>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 xl:space-y-4 mb-6 xl:mb-8">
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white py-3 xl:py-4 rounded-xl font-bold text-base xl:text-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="w-5 xl:w-6 h-5 xl:h-6" />
                    <span>Add to Cart</span>
                  </button>
                  <button 
                    onClick={handleBuyNow}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 xl:py-4 rounded-xl font-bold text-base xl:text-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-full border-2 border-gray-400 text-gray-600 hover:bg-gradient-to-r hover:from-gray-400 hover:to-gray-500 hover:text-white py-3 xl:py-4 rounded-xl font-bold text-base xl:text-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    <Share2 className="w-4 xl:w-5 h-4 xl:h-5" />
                    <span>Share</span>
                  </button>
                </div>

                {/* Trust Labels */}
                <div className="grid grid-cols-1 gap-3 xl:gap-4 mb-6 xl:mb-8">
                  <div className="flex items-center space-x-3 xl:space-x-4 p-3 xl:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <Shield className="w-6 xl:w-8 h-6 xl:h-8 text-green-500 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-gray-800 text-sm xl:text-base">Game Under Warranty</div>
                      <div className="text-gray-600 text-xs xl:text-sm">6 months coverage</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 xl:space-x-4 p-3 xl:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <Clock className="w-6 xl:w-8 h-6 xl:h-8 text-blue-500 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-gray-800 text-sm xl:text-base">Instant Delivery</div>
                      <div className="text-gray-600 text-xs xl:text-sm">Within 1 hour</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 xl:space-x-4 p-3 xl:p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                    <Headphones className="w-6 xl:w-8 h-6 xl:h-8 text-purple-500 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-gray-800 text-sm xl:text-base">Customer Support</div>
                      <div className="text-gray-600 text-xs xl:text-sm">24/7 Available</div>
                    </div>
                  </div>
                </div>

                {/* Accordions */}
                <div className="space-y-3 xl:space-y-4">
                  {/* Product Details */}
                  <div className="border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm">
                    <button
                      onClick={() => toggleAccordion('details')}
                      className="w-full flex items-center justify-between p-4 xl:p-6 text-left hover:bg-white/30 transition-colors rounded-xl"
                    >
                      <span className="font-bold text-gray-800 text-base xl:text-lg">Product Details</span>
                      {activeAccordion === 'details' ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    {activeAccordion === 'details' && (
                      <div className="px-4 xl:px-6 pb-4 xl:pb-6">
                        <p className="text-gray-600 leading-relaxed text-sm xl:text-base">{product.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Additional Information */}
                  <div className="border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm">
                    <button
                      onClick={() => toggleAccordion('additional')}
                      className="w-full flex items-center justify-between p-4 xl:p-6 text-left hover:bg-white/30 transition-colors rounded-xl"
                    >
                      <span className="font-bold text-gray-800 text-base xl:text-lg">Additional Information</span>
                      {activeAccordion === 'additional' ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    {activeAccordion === 'additional' && (
                      <div className="px-4 xl:px-6 pb-4 xl:pb-6">
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 xl:p-6">
                          <h4 className="font-bold text-orange-800 mb-3">Important Notice</h4>
                          <p className="text-orange-700 leading-relaxed text-sm xl:text-base">
                            Refunds are not available after purchase; however, a replacement will be provided if the product does not function properly.
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 xl:mt-6">
                          <div>
                            <h4 className="font-bold text-gray-800 mb-2 text-sm xl:text-base">Platform</h4>
                            <p className="text-gray-600 text-sm xl:text-base">{selectedPlatform}</p>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 mb-2 text-sm xl:text-base">Language Support</h4>
                            <p className="text-gray-600 text-sm xl:text-base">English, Spanish, French, German, Italian</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* FAQ */}
                  <div className="border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm">
                    <button
                      onClick={() => toggleAccordion('faq')}
                      className="w-full flex items-center justify-between p-4 xl:p-6 text-left hover:bg-white/30 transition-colors rounded-xl"
                    >
                      <span className="font-bold text-gray-800 text-base xl:text-lg">FAQ</span>
                      {activeAccordion === 'faq' ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    {activeAccordion === 'faq' && (
                      <div className="px-4 xl:px-6 pb-4 xl:pb-6 space-y-3 xl:space-y-4">
                        {faqs.map((faq, index) => (
                          <div key={index}>
                            <h5 className="font-semibold text-gray-800 mb-2 text-sm xl:text-base">{faq.question}</h5>
                            <p className="text-gray-600 text-xs xl:text-sm whitespace-pre-line leading-relaxed">{faq.answer}</p>
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
          <div className="space-y-4 sm:space-y-6">
            {/* Product Image */}
            <div className="flex justify-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/20 w-full max-w-sm">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full aspect-square object-cover rounded-xl"
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/20">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">{product.title}</h1>
              
              <div className="flex items-center space-x-2 mb-4">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow-lg">
                  {product.platform.join(', ')}
                </span>
              </div>

              {/* Platform Selection */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Platform</label>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {product.platform.map((platform) => (
                    <button
                      key={platform}
                      onClick={() => setSelectedPlatform(platform)}
                      className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm ${
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
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Type</label>
                <div className="space-y-2 sm:space-y-3">
                  {product.type.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`w-full px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-300 text-left text-sm ${
                        selectedType === type
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rent Duration Selection - Only show if Rent is selected */}
              {selectedType === 'Rent' && (
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Rental Duration</label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {[
                      { key: '1_month', label: '1 Month', price: product.rent_1_month },
                      { key: '2_months', label: '2 Months', price: product.rent_2_months },
                      { key: '3_months', label: '3 Months', price: product.rent_3_months },
                      { key: '6_months', label: '6 Months', price: product.rent_6_months }
                    ].map((duration) => (
                      <button
                        key={duration.key}
                        onClick={() => setSelectedRentDuration(duration.key as any)}
                        className={`px-2 sm:px-3 py-2 rounded-lg font-medium transition-all duration-300 text-xs sm:text-sm ${
                          selectedRentDuration === duration.key
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <div className="text-xs sm:text-sm">{duration.label}</div>
                        <div className="text-xs opacity-75">₹{duration.price || 0}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Type Description */}
              <div className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-3 sm:p-4 border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2 sm:mb-3 text-sm">About This Option</h4>
                <p className="text-blue-700 text-xs leading-relaxed whitespace-pre-line">
                  {getTypeDescription()}
                </p>
              </div>

              {/* Pricing */}
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  ₹{currentPrice.toFixed(2)}
                </span>
                {discountPercentage > 0 && (
                  <>
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                      -{discountPercentage}%
                    </span>
                    <span className="text-sm sm:text-lg text-gray-500 line-through">
                      ₹{product.original_price}
                    </span>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-4 sm:mb-6">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-4 sm:w-5 h-4 sm:h-5" />
                  <span>Add to Cart</span>
                </button>
                <button 
                  onClick={handleBuyNow}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Buy Now
                </button>
                <button
                  onClick={handleShare}
                  className="w-full border-2 border-gray-400 text-gray-600 hover:bg-gradient-to-r hover:from-gray-400 hover:to-gray-500 hover:text-white py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>

              {/* Trust Labels */}
              <div className="grid grid-cols-1 gap-3 mb-4 sm:mb-6">
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <Shield className="w-5 sm:w-6 h-5 sm:h-6 text-green-500 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-gray-800 text-xs sm:text-sm">Game Under Warranty</div>
                    <div className="text-gray-600 text-xs">6 months coverage</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <Clock className="w-5 sm:w-6 h-5 sm:h-6 text-blue-500 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-gray-800 text-xs sm:text-sm">Instant Delivery</div>
                    <div className="text-gray-600 text-xs">Within 1 hour</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                  <Headphones className="w-5 sm:w-6 h-5 sm:h-6 text-purple-500 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-gray-800 text-xs sm:text-sm">Customer Support</div>
                    <div className="text-gray-600 text-xs">24/7 Available</div>
                  </div>
                </div>
              </div>

              {/* Tabs for Mobile */}
              <div className="border-b border-gray-200 mb-4 sm:mb-6">
                <nav className="flex space-x-4 sm:space-x-8">
                  {['details', 'additional', 'faq'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveAccordion(tab)}
                      className={`py-3 sm:py-4 px-1 sm:px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors ${
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

              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                {activeAccordion === 'details' && (
                  <div className="space-y-3 sm:space-y-4">
                    <p className="text-gray-600 leading-relaxed text-xs sm:text-sm">{product.description}</p>
                  </div>
                )}

                {activeAccordion === 'additional' && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 sm:p-4">
                      <h4 className="font-bold text-orange-800 mb-2 sm:mb-3 text-sm">Important Notice</h4>
                      <p className="text-orange-700 text-xs sm:text-sm leading-relaxed">
                        Refunds are not available after purchase; however, a replacement will be provided if the product does not function properly.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-bold text-gray-800 mb-1 sm:mb-2 text-sm">Platform</h4>
                        <p className="text-gray-600 text-xs sm:text-sm">{selectedPlatform}</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 mb-1 sm:mb-2 text-sm">Language Support</h4>
                        <p className="text-gray-600 text-xs sm:text-sm">English, Spanish, French, German, Italian</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeAccordion === 'faq' && (
                  <div className="space-y-3 sm:space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index}>
                        <h5 className="font-semibold text-gray-800 mb-1 sm:mb-2 text-xs sm:text-sm">{faq.question}</h5>
                        <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-line mb-2 sm:mb-3">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Screenshots Section */}
        <div id="screenshots-section" className="mb-6 sm:mb-8 md:mb-12">
          <CustomerScreenshots />
        </div>

        {/* You May Also Like */}
        {relatedProducts.length > 0 && (
          <div className="mb-6 sm:mb-8 md:mb-12">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4 sm:mb-6">You May Also Like</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {relatedProducts.map((item) => {
                const itemDisplayPrice = item.category === 'game' 
                  ? getGameDisplayPrice(item, 'Rent', '1_month')
                  : item.sale_price;

                return (
                  <div 
                    key={item.id} 
                    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 sm:hover:-translate-y-2"
                    onClick={() => handleRelatedProductClick(item)}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="p-2 sm:p-3 md:p-4">
                      <h4 className="font-bold text-gray-800 text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-2">
                        {item.title}
                      </h4>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <span className="text-orange-500 font-bold text-xs sm:text-sm md:text-base">₹{itemDisplayPrice}</span>
                        {item.category === 'subscription' && item.original_price > item.sale_price && (
                          <span className="text-gray-500 line-through text-xs">₹{item.original_price}</span>
                        )}
                        {item.category === 'game' && getGameDiscountPercentage(item, 'Rent', '1_month') > 0 && (
                          <span className="text-gray-500 line-through text-xs">₹{item.original_price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;