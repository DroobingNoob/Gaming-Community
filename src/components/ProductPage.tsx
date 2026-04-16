import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Shield,
  Clock,
  Headphones,
  Share2,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  Game,
  getPlatformsForGame,
  getStartingPrice,
} from "../config/supabase";
import { useGames, useSubscriptions } from "../hooks/useSupabaseData";
import CustomerScreenshots from "./CustomerScreenshots";

interface ProductPageProps {
  product: Game;
  onAddToCart: (
    product: Game,
    platform: string,
    type: string,
    price: number
  ) => void;
  onBuyNow: (
    product: Game,
    platform: string,
    type: string,
    price: number
  ) => void;
  onToggleWishlist: (productId: string) => void;
  isInWishlist: boolean;
  isLoggedIn: boolean;
  onBackToHome: () => void;
  onGameClick: (game: Game) => void;
}

type RentDuration = "1_month" | "3_months" | "6_months" | "12_months";

const ProductPage: React.FC<ProductPageProps> = ({
  product,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isInWishlist,
  isLoggedIn,
  onBackToHome,
  onGameClick,
}) => {
  const [activeAccordion, setActiveAccordion] = useState<string | null>("details");
  const [isImageSticky, setIsImageSticky] = useState(true);

  const availablePlatforms = useMemo(() => getPlatformsForGame(product), [product]);

  const [selectedPlatform, setSelectedPlatform] = useState<string>(
    availablePlatforms[0] || (product.category === "subscription" ? "Subscription" : "PS5")
  );

  const selectedPlatformPrice = useMemo(() => {
    return (
      product.platform_prices?.find((row) => row.platform === selectedPlatform) ||
      product.platform_prices?.[0] ||
      null
    );
  }, [product, selectedPlatform]);

  const availableTypes = useMemo(() => {
    if (product.category === "subscription") return ["Permanent"];

    const types = product.type || [];
    return types.filter((type) => {
      if (!selectedPlatformPrice) return false;

      if (type === "Rent") {
        return Boolean(
          selectedPlatformPrice.rent_1_month ||
            selectedPlatformPrice.rent_3_months ||
            selectedPlatformPrice.rent_6_months ||
            selectedPlatformPrice.rent_12_months
        );
      }

      if (type === "Permanent Offline") {
        return Boolean(selectedPlatformPrice.permanent_offline_price);
      }

      if (type === "Permanent Offline + Online") {
        return Boolean(selectedPlatformPrice.permanent_online_price);
      }

      return true;
    });
  }, [product, selectedPlatformPrice]);

  const defaultType = useMemo(() => {
    if (product.category === "subscription") return "Permanent";
    return availableTypes[0] || "Rent";
  }, [product.category, availableTypes]);

  const [selectedType, setSelectedType] = useState<string>(defaultType);
  const [selectedRentDuration, setSelectedRentDuration] =
    useState<RentDuration>("1_month");

  const { games = [] } = useGames({ limit: 8 });
  const { subscriptions = [] } = useSubscriptions({ limit: 8 });

  const relatedProducts =
    product.category === "game"
      ? games.filter((game) => game.id !== product.id).slice(0, 4)
      : subscriptions.filter((sub) => sub.id !== product.id).slice(0, 4);

  useEffect(() => {
    setSelectedPlatform(
      availablePlatforms[0] || (product.category === "subscription" ? "Subscription" : "PS5")
    );
  }, [product.id, product.category, availablePlatforms]);

  useEffect(() => {
    if (!availableTypes.includes(selectedType)) {
      setSelectedType(defaultType);
    }
  }, [availableTypes, selectedType, defaultType]);

  useEffect(() => {
    const handleScroll = () => {
      const screenshotsSection = document.getElementById("screenshots-section");
      if (screenshotsSection) {
        const rect = screenshotsSection.getBoundingClientRect();
        setIsImageSticky(rect.top > 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const faqs = [
    {
      question: "What is the difference between rental and permanent purchase?",
      answer:
        "Rental: You get access to the game for a limited period. You must return the account after the rental period ends.\n\nPermanent Purchase: You get long-term access to the game on your console/device, with warranty and reinstall support as applicable.",
    },
    {
      question: "How does the rental process work?",
      answer:
        "1. Choose a game and confirm availability.\n2. Make payment and receive login credentials.\n3. Download and play the game for the selected rental period.\n4. After the period ends, return the account as per our policy.",
    },
    {
      question: "Can I play games from my personal account?",
      answer:
        "Yes, for supported permanent options. This depends on the type you select for that platform.",
    },
    {
      question: "Are these accounts legal and safe?",
      answer:
        "We provide setup support, warranty coverage where applicable, and working access according to the selected plan.",
    },
    {
      question: "What if my game stops working or is locked?",
      answer:
        "You are covered under the applicable warranty/support period for the selected product. Contact support and we will assist.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "No. All sales are final once delivered. If something is not working properly, replacement/support will be provided as per policy.",
    },
    {
      question: "Can I use the game on multiple devices?",
      answer:
        "No. These are intended for single-device/single-console use unless explicitly stated otherwise.",
    },
  ];

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.title,
          text: `Check out this deal on ${product.title}!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!", {
          position: "top-right",
          autoClose: 2000,
        });
      }
    } catch {
      toast.error("Unable to share right now.");
    }
  };

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  const getRentDurationOptions = () => {
    if (!selectedPlatformPrice) return [];

    return [
      {
        key: "1_month" as RentDuration,
        label: "1 Month",
        price: selectedPlatformPrice.rent_1_month ?? null,
      },
      {
        key: "3_months" as RentDuration,
        label: "3 Months",
        price: selectedPlatformPrice.rent_3_months ?? null,
      },
      {
        key: "6_months" as RentDuration,
        label: "6 Months",
        price: selectedPlatformPrice.rent_6_months ?? null,
      },
      {
        key: "12_months" as RentDuration,
        label: "12 Months",
        price: selectedPlatformPrice.rent_12_months ?? null,
      },
    ].filter((item) => item.price !== null && item.price !== undefined);
  };

  const calculatePrice = () => {
    if (product.category === "subscription") {
      return getStartingPrice(product);
    }

    if (!selectedPlatformPrice) return 0;

    if (selectedType === "Rent") {
      const rentPrices: Record<RentDuration, number | null | undefined> = {
        "1_month": selectedPlatformPrice.rent_1_month,
        "3_months": selectedPlatformPrice.rent_3_months,
        "6_months": selectedPlatformPrice.rent_6_months,
        "12_months": selectedPlatformPrice.rent_12_months,
      };
      return rentPrices[selectedRentDuration] || 0;
    }

    if (selectedType === "Permanent Offline") {
      return selectedPlatformPrice.permanent_offline_price || 0;
    }

    if (selectedType === "Permanent Offline + Online") {
      return selectedPlatformPrice.permanent_online_price || 0;
    }

    return (
      selectedPlatformPrice.sale_price ||
      selectedPlatformPrice.original_price ||
      getStartingPrice(product)
    );
  };

  const originalSelectedPrice = () => {
    if (product.category === "subscription") {
      return (
        selectedPlatformPrice?.original_price ||
        selectedPlatformPrice?.sale_price ||
        getStartingPrice(product)
      );
    }

    if (!selectedPlatformPrice) return calculatePrice();

    if (selectedType === "Rent") {
      return selectedPlatformPrice.original_price || calculatePrice();
    }

    if (selectedType === "Permanent Offline") {
      return (
        selectedPlatformPrice.original_price ||
        selectedPlatformPrice.permanent_offline_price ||
        calculatePrice()
      );
    }

    if (selectedType === "Permanent Offline + Online") {
      return (
        selectedPlatformPrice.original_price ||
        selectedPlatformPrice.permanent_online_price ||
        calculatePrice()
      );
    }

    return selectedPlatformPrice.original_price || calculatePrice();
  };

  const currentDiscountPercentage = () => {
    const current = calculatePrice();
    const original = originalSelectedPrice();
    if (!original || original <= current) return 0;
    return Math.round(((original - current) / original) * 100);
  };

  const getTypeDescription = () => {
    if (selectedType === "Rent") {
      return `🎮 Rental Game Accounts:

✔️ We provide a legal account with your selected rental game.

✔️ Download and play with minimal setup.

✔️ Rental durations depend on what is available for the selected platform.

✔️ Online play may be available depending on the product.

✔️ After the rental period ends, the game/account must be returned as per policy.

✔️ Credentials cannot be changed. If changed, access may be lost and support/warranty may be void.`;
    }

    if (selectedType === "Permanent Offline") {
      return `Permanent Offline:

✔️ Designed for offline play.

✔️ Best suited for players who prefer single-player or offline gaming.

✔️ Follow the provided setup instructions carefully to avoid issues.`;
    }

    if (selectedType === "Permanent Offline + Online") {
      return `Permanent Offline + Online:

✔️ Game is provided on a purchased account.

✔️ You can typically play from your personal account once set up.

✔️ Online and offline play supported where applicable.

✔️ Warranty/support included as per store policy.

🚫 Credentials must not be changed unless explicitly allowed.`;
    }

    return "";
  };

  const handleAddToCart = () => {
    if (product.category === "subscription") {
      onAddToCart(product, "Subscription", "Permanent", calculatePrice());
      return;
    }

    const price = calculatePrice();
    const typeWithDuration =
      selectedType === "Rent"
        ? `${selectedType} (${selectedRentDuration.replace("_", " ")})`
        : selectedType;

    onAddToCart(product, selectedPlatform, typeWithDuration, price);
  };

  const handleBuyNow = () => {
    if (product.category === "subscription") {
      onBuyNow(product, "Subscription", "Permanent", calculatePrice());
      return;
    }

    const price = calculatePrice();
    const typeWithDuration =
      selectedType === "Rent"
        ? `${selectedType} (${selectedRentDuration.replace("_", " ")})`
        : selectedType;

    onBuyNow(product, selectedPlatform, typeWithDuration, price);
  };

  const renderPriceBlock = () => (
    <div className="flex items-center space-x-4 mb-8">
      <span className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
        ₹{calculatePrice()}
      </span>
      {currentDiscountPercentage() > 0 && (
        <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
          -{currentDiscountPercentage()}%
        </span>
      )}
    </div>
  );

  const renderPlatformSelection = () => {
    if (product.category !== "game") return null;

    return (
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Platform
        </label>
        <div className="flex flex-wrap gap-3">
          {availablePlatforms.map((platform) => (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                selectedPlatform === platform
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderTypeSelection = () => {
    if (product.category !== "game") return null;

    return (
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Type
        </label>
        <div className="space-y-3">
          {availableTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 text-left ${
                selectedType === type
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderRentDurationSelection = () => {
    if (product.category !== "game" || selectedType !== "Rent") return null;

    const durations = getRentDurationOptions();
    if (durations.length === 0) return null;

    return (
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Rental Duration
        </label>
        <div className="grid grid-cols-2 gap-3">
          {durations.map((duration) => (
            <button
              key={duration.key}
              onClick={() => setSelectedRentDuration(duration.key)}
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                selectedRentDuration === duration.key
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div className="text-sm">{duration.label}</div>
              <div className="text-xs opacity-75">₹{duration.price || 0}</div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderDesktopContent = () => (
    <div className="hidden lg:block">
      <div className="grid grid-cols-2 gap-12">
        <div className={`${isImageSticky ? "sticky top-8" : ""} h-fit`}>
          <div className="flex justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20 w-full max-w-2xl">
              <div className="relative w-full aspect-square overflow-hidden rounded-2xl">
                <img
                  src={product.image}
                  alt={product.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
              {product.title}
            </h1>

            <div className="flex items-center space-x-2 mb-6">
              {product.category === "game" && (
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  {availablePlatforms.join(", ")}
                </span>
              )}
            </div>

            {renderPlatformSelection()}
            {renderTypeSelection()}
            {renderRentDurationSelection()}

            {product.category === "game" && (
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-3">About This Option</h4>
                <p className="text-blue-700 text-sm leading-relaxed whitespace-pre-line">
                  {getTypeDescription()}
                </p>
              </div>
            )}

            {renderPriceBlock()}

            <div className="space-y-4 mb-8">
              <button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white py-4 rounded-xl font-bold text-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-6 h-6" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 rounded-xl font-bold text-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Buy Now
              </button>

              <div className="flex space-x-4">
                <button
                  onClick={handleShare}
                  className="w-full border-2 border-gray-400 text-gray-600 hover:bg-gradient-to-r hover:from-gray-400 hover:to-gray-500 hover:text-white py-4 rounded-xl font-bold text-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-8">
              {product.category === "game" && (
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <Shield className="w-8 h-8 text-green-500" />
                  <div>
                    <div className="font-bold text-gray-800">
                      Game Under Warranty
                    </div>
                    <div className="text-gray-600 text-sm">6 months coverage</div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <Clock className="w-8 h-8 text-blue-500" />
                <div>
                  <div className="font-bold text-gray-800">Instant Delivery</div>
                  <div className="text-gray-600 text-sm">Within 1 hour</div>
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

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm">
                <button
                  onClick={() => toggleAccordion("details")}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/30 transition-colors rounded-xl"
                >
                  <span className="font-bold text-gray-800 text-lg">
                    Product Details
                  </span>
                  {activeAccordion === "details" ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {activeAccordion === "details" && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm">
                <button
                  onClick={() => toggleAccordion("additional")}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/30 transition-colors rounded-xl"
                >
                  <span className="font-bold text-gray-800 text-lg">
                    Additional Information
                  </span>
                  {activeAccordion === "additional" ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {activeAccordion === "additional" && (
                  <div className="px-6 pb-6">
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                      <h4 className="font-bold text-orange-800 mb-3">
                        Important Notice
                      </h4>
                      <p className="text-orange-700 leading-relaxed">
                        Refunds are not available after purchase; however, a
                        replacement will be provided if the product does not
                        function properly.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div>
                        <h4 className="font-bold text-gray-800 mb-2">Platform</h4>
                        <p className="text-gray-600">
                          {product.category === "subscription"
                            ? "Subscription"
                            : selectedPlatform}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm">
                <button
                  onClick={() => toggleAccordion("faq")}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/30 transition-colors rounded-xl"
                >
                  <span className="font-bold text-gray-800 text-lg">FAQ</span>
                  {activeAccordion === "faq" ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {activeAccordion === "faq" && (
                  <div className="px-6 pb-6 space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index}>
                        <h5 className="font-semibold text-gray-800 mb-2">
                          {faq.question}
                        </h5>
                        <p className="text-gray-600 text-sm whitespace-pre-line">
                          {faq.answer}
                        </p>
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
  );

  const renderMobileContent = () => (
    <div className="lg:hidden">
      <div className="space-y-6 sm:space-y-8">
        <div className="flex justify-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/20 w-full max-w-md sm:max-w-lg">
            <div className="relative w-full aspect-square overflow-hidden rounded-xl sm:rounded-2xl">
              <img
                src={product.image}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/20">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
            {product.title}
          </h1>

          <div className="flex items-center space-x-2 mb-4">
            {product.category === "game" && (
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                {availablePlatforms.join(", ")}
              </span>
            )}
          </div>

          {renderPlatformSelection()}
          {renderTypeSelection()}
          {renderRentDurationSelection()}

          {product.category === "game" && (
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-3 text-sm">
                About This Option
              </h4>
              <p className="text-blue-700 text-xs leading-relaxed whitespace-pre-line">
                {getTypeDescription()}
              </p>
            </div>
          )}

          <div className="flex items-center space-x-3 sm:space-x-4 mb-6">
            <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              ₹{calculatePrice()}
            </span>
            {currentDiscountPercentage() > 0 && (
              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                -{currentDiscountPercentage()}%
              </span>
            )}
          </div>

          <div className="space-y-3 mb-6 sm:mb-8">
            <button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Buy Now
            </button>

            <div className="flex space-x-3">
              <button
                onClick={handleShare}
                className="w-full border-2 border-gray-400 text-gray-600 hover:bg-gradient-to-r hover:from-gray-400 hover:to-gray-500 hover:text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {product.category === "game" && (
              <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <Shield className="w-6 h-6 text-green-500" />
                <div>
                  <div className="font-bold text-gray-800 text-sm">
                    Game Under Warranty
                  </div>
                  <div className="text-gray-600 text-xs">6 months coverage</div>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <Clock className="w-6 h-6 text-blue-500" />
              <div>
                <div className="font-bold text-gray-800 text-sm">
                  Instant Delivery
                </div>
                <div className="text-gray-600 text-xs">Within 3 hours</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
              <Headphones className="w-6 h-6 text-purple-500" />
              <div>
                <div className="font-bold text-gray-800 text-sm">
                  Customer Support
                </div>
                <div className="text-gray-600 text-xs">24/7 Available</div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-4 sm:space-x-8">
              {["details", "additional", "faq"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveAccordion(tab)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeAccordion === tab
                      ? "border-cyan-400 text-cyan-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "details" && "Details"}
                  {tab === "additional" && "Info"}
                  {tab === "faq" && "FAQ"}
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
            {activeAccordion === "details" && (
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {product.description}
                </p>
              </div>
            )}

            {activeAccordion === "additional" && (
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <h4 className="font-bold text-orange-800 mb-3">
                    Important Notice
                  </h4>
                  <p className="text-orange-700 text-sm leading-relaxed">
                    Refunds are not available after purchase; however, a
                    replacement will be provided if the product does not function
                    properly.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Platform</h4>
                  <p className="text-gray-600 mb-4">
                    {product.category === "subscription"
                      ? "Subscription"
                      : selectedPlatform}
                  </p>
                </div>
              </div>
            )}

            {activeAccordion === "faq" && (
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index}>
                    <h5 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                      {faq.question}
                    </h5>
                    <p className="text-gray-600 text-sm mb-4 whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <button
          onClick={onBackToHome}
          className="flex items-center space-x-1 sm:space-x-2 text-cyan-600 hover:text-orange-500 transition-colors mb-6 sm:mb-8 bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-lg text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Back</span>
        </button>

        {renderDesktopContent()}
        {renderMobileContent()}

        <div id="screenshots-section" className="mb-8 sm:mb-12">
          <CustomerScreenshots />
        </div>

        {relatedProducts.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4 sm:mb-6">
              You May Also Like
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {relatedProducts.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 sm:hover:-translate-y-2"
                  onClick={() => onGameClick(item)}
                >
                  <div className="relative w-full aspect-square overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 sm:p-4">
                    <h4 className="font-bold text-gray-800 text-xs sm:text-sm mb-2 line-clamp-2">
                      {item.title}
                    </h4>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <span className="text-orange-500 font-bold text-sm sm:text-base">
                        ₹{getStartingPrice(item)}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {item.category === "subscription"
                        ? "Subscription"
                        : getPlatformsForGame(item).join(", ")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;