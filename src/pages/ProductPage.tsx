import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Clock,
  Headphones,
  Share2,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Star,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  Game,
  getGameDisplayPrice,
  getGameDiscountPercentage,
  getPlatformsForGame,
  getPlatformPricing,
  getStartingPrice,
  findAllEditionsByGameId,
} from "../config/supabase";
import { useAllGames, useSubscriptions } from "../hooks/useSupabaseData";
import CustomerScreenshots from "../components/CustomerScreenshots";
import Loader from "../components/Loader";

interface ProductPageProps {
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
  onAnimateToCart?: () => Promise<void> | void;
}

type RentDuration = "1_month" | "3_months" | "6_months" | "12_months";

const ProductPage: React.FC<ProductPageProps> = ({
  onAddToCart,
  onBuyNow,
  onAnimateToCart,

}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { allGames, loading: gamesLoading } = useAllGames();
  const { subscriptions, loading: subscriptionsLoading } = useSubscriptions();

  const [product, setProduct] = useState<Game | null>(null);
  const [availableEditions, setAvailableEditions] = useState<Game[]>([]);
  const [selectedEdition, setSelectedEdition] = useState<Game | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Game[]>([]);
  const [activeAccordion, setActiveAccordion] = useState<string | null>("details");
  const [isImageSticky, setIsImageSticky] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedRentDuration, setSelectedRentDuration] =
    useState<RentDuration>("1_month");

  const isLoading = gamesLoading || subscriptionsLoading;
  const currentProduct = selectedEdition || product;

  const location = useLocation();

  useEffect(() => {
    if (id && !isLoading) {
      const allProducts = [...allGames, ...subscriptions];
      const foundProduct = allProducts.find((p) => p.id === id);

      if (!foundProduct) return;

      setProduct(foundProduct);

      const availablePlatforms = getPlatformsForGame(foundProduct);
      setSelectedPlatform(availablePlatforms[0] || "");
      setSelectedType(foundProduct.type?.[0] || "");

      if (foundProduct.category === "game") {
        const editions = findAllEditionsByGameId(allGames, foundProduct.id!);
        setAvailableEditions(editions);
        setSelectedEdition(foundProduct);

        const uniqueGameTitles = [...new Set(allGames.map((game) => game.title))];
        const related = uniqueGameTitles
          .filter((title) => title !== foundProduct.title)
          .map((title) => {
            const gameEditions = allGames.filter((game) => game.title === title);
            return (
              gameEditions.find((game) => game.edition === "Standard") ||
              gameEditions[0]
            );
          })
          .filter(Boolean)
          .slice(0, 4) as Game[];

        setRelatedProducts(related);
      } else {
        setAvailableEditions([foundProduct]);
        setSelectedEdition(foundProduct);
        const related = subscriptions
          .filter((sub) => sub.id !== foundProduct.id)
          .slice(0, 4);
        setRelatedProducts(related);
      }
    }
  }, [id, allGames, subscriptions, isLoading]);

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

  const selectedPlatformPricing = useMemo(() => {
    if (!currentProduct || !selectedPlatform) return undefined;
    return getPlatformPricing(currentProduct, selectedPlatform);
  }, [currentProduct, selectedPlatform]);

  const hasRentOptions = !!(
    selectedPlatformPricing?.rent_1_month ||
    selectedPlatformPricing?.rent_3_months ||
    selectedPlatformPricing?.rent_6_months ||
    selectedPlatformPricing?.rent_12_months
  );

  const hasPermanentOffline = !!selectedPlatformPricing?.permanent_offline_price;
  const hasPermanentOnline = !!selectedPlatformPricing?.permanent_online_price;

  const availableTypesForCurrentPlatform = useMemo(() => {
    if (!currentProduct) return [];

    if (currentProduct.category === "subscription") {
      return ["Rent"];
    }

    const types: string[] = [];

    if (hasRentOptions) types.push("Rent");
    if (hasPermanentOffline) types.push("Permanent Offline");
    if (hasPermanentOnline) types.push("Permanent Offline + Online");

    if (types.length === 0) {
      return currentProduct.type || [];
    }

    return types;
  }, [currentProduct, hasRentOptions, hasPermanentOffline, hasPermanentOnline]);

  useEffect(() => {
    if (!currentProduct) return;

    const availablePlatforms = getPlatformsForGame(currentProduct);
    if (!availablePlatforms.includes(selectedPlatform)) {
      setSelectedPlatform(availablePlatforms[0] || "");
    }
  }, [currentProduct, selectedPlatform]);

  useEffect(() => {
    if (availableTypesForCurrentPlatform.length === 0) return;
    if (!availableTypesForCurrentPlatform.includes(selectedType)) {
      setSelectedType(availableTypesForCurrentPlatform[0]);
    }
  }, [availableTypesForCurrentPlatform, selectedType]);

  useEffect(() => {
    if (!selectedPlatformPricing || selectedType !== "Rent") return;

    const validDurations: RentDuration[] = [];
    if (selectedPlatformPricing.rent_1_month) validDurations.push("1_month");
    if (selectedPlatformPricing.rent_3_months) validDurations.push("3_months");
    if (selectedPlatformPricing.rent_6_months) validDurations.push("6_months");
    if (selectedPlatformPricing.rent_12_months) validDurations.push("12_months");

    if (!validDurations.includes(selectedRentDuration) && validDurations.length > 0) {
      setSelectedRentDuration(validDurations[0]);
    }
  }, [selectedPlatformPricing, selectedType, selectedRentDuration]);

  const faqs = [
    {
      question: "What is the difference between rental and permanent purchase?",
      answer:
        "Rental: You get access to the game for the selected duration. You must return the account after the rental period ends.\n\nPermanent Purchase: You get permanent access to the game on your console or device, with warranty and reinstallation support based on the selected option.",
    },
    {
      question: "How does the rental process work?",
      answer:
        "1. Choose a game and confirm availability.\n2. Make payment and receive login credentials.\n3. Download and play the game for your selected duration.\n4. After the rental period ends, return the account as per our policy.",
    },
    {
      question: "Can I play games from my personal account?",
      answer:
        "Yes. Permanent purchase options are generally configured for personal account play unless specifically stated otherwise.",
    },
    {
      question: "Are these accounts legal and safe?",
      answer:
        "Yes. We provide safe and supported game access with setup help and warranty according to the selected product type.",
    },
    {
      question: "What if my game stops working or is locked?",
      answer:
        "You are covered under the applicable warranty period. In case of any issue, contact us and we will assist or replace as needed.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "No. All sales are final once delivery is completed. However, support and replacement are provided where applicable.",
    },
    {
      question: "Can I use the game on multiple devices?",
      answer:
        "No. These accounts are meant for single-device or single-console use unless clearly stated otherwise.",
    },
  ];

  const handleShare = () => {
    if (!currentProduct) return;

    if (navigator.share) {
      navigator.share({
        title: currentProduct.title,
        text: `Check out this amazing deal on ${currentProduct.title}!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  const calculatePrice = () => {
    if (!currentProduct) return 0;

    return getGameDisplayPrice(
      currentProduct,
      selectedPlatform,
      selectedType,
      selectedRentDuration
    );
  };

  const getDiscountPercentage = () => {
    if (!currentProduct) return 0;

    return getGameDiscountPercentage(
      currentProduct,
      selectedPlatform,
      selectedType,
      selectedRentDuration
    );
  };

  const getTypeDescription = () => {

    if (currentProduct?.category === "subscription") {
    return `📺 Subscription Access:

✔ We provide access for your selected subscription duration.
✔ Access will be shared after payment confirmation.
✔ Features (like offline download, streaming quality, or online access) depend on the selected service.
✔ Subscription will remain active for the chosen period only.
✔ Account credentials must not be changed.
✔ Any misuse or violation of terms may lead to access removal without notice.`;
  }

    if (selectedType === "Rent") {
      return `🎮 Rental Game Access:

✔ Games are playable on the account provided by us
✔ Simple QR code login process (steps shared on WhatsApp after payment)
✔ Game delivery within 30 minutes to 4 hours

✔ Access is valid for your selected rental duration
✔ Internet connection required – to play the games smoothly 

⚠️ Important:
• Ensure stable internet connection for smooth gameplay
• Do not change account details
• Follow shared steps carefully for smooth gameplay

🚀 Best option to enjoy latest games at lowest cost without full purchase`;
    }

    if (selectedType === "Permanent Offline") {
      return `📴 Permanent Offline Access (PC & Console):

✔ Play the game permanently in offline mode only
✔ Single device access (PC/Console)
✔ Internet required only for initial setup

⚠️ Important:
Keep the system offline after setup. Going online may lock the game

❌ No Refund / No Replacement if instructions are not followed

✔ Best for story mode / offline gaming`;
    }

    if (selectedType === "Permanent Offline + Online") {
      return `About This Option

🎮 Permanent Access (Offline + Online):

✔ Enjoy complete freedom to play online or offline anytime
✔ Works on single device/console
✔ Playable on Personal Account (mostly supported)
✔ In case of any exception, our team will confirm before purchase

🔐 Flexibility & Usage:

✔ Play the game as per your preference – online or offline
✔ You can delete and re-download 
✔ Smooth and reliable experience with no usage restrictions

🛡️ 12 Months Warranty Included:

✔ Full 12 months support & coverage
✔ If any issue occurs, replacement or refund will be provided
✔ Dedicated assistance for setup and troubleshooting

🚀 Why Choose This Option?

✔ Best alternative 
✔ No limitations like one-time play
✔ Ideal for users who want complete access + long-term value

✨ Note:
Please confirm with our team before purchase regarding personal account compatibility for your selected game.`;
    }

    return "Choose the option that best fits your usage.";
  };

  const handleAddToCart = async () => {
  if (!currentProduct) return;

  const price = calculatePrice();
  const typeWithDuration =
    selectedType === "Rent"
      ? `${selectedType} (${selectedRentDuration.replace("_", " ")})`
      : selectedType;

  if (onAnimateToCart) {
    await onAnimateToCart();
  }

  onAddToCart(currentProduct, selectedPlatform, typeWithDuration, price);
};
  const handleBuyNow = () => {
    if (!currentProduct) return;

    const price = calculatePrice();
    const typeWithDuration =
      selectedType === "Rent"
        ? `${selectedType} (${selectedRentDuration.replace("_", " ")})`
        : selectedType;

    onBuyNow(currentProduct, selectedPlatform, typeWithDuration, price);
  };

  const handleRelatedProductClick = (relatedProduct: Game) => {
    if (relatedProduct.category === "game") {
      navigate(`/games/${relatedProduct.id}`);
    } else {
      navigate(`/subscriptions/${relatedProduct.id}`);
    }
  };

  const handleEditionChange = (edition: Game) => {
    setSelectedEdition(edition);
    const newPlatforms = getPlatformsForGame(edition);
    setSelectedPlatform(newPlatforms[0] || "");
    setSelectedType(edition.type?.[0] || "");

    const newUrl =
      edition.category === "game"
        ? `/games/${edition.id}`
        : `/subscriptions/${edition.id}`;

    window.history.replaceState(null, "", newUrl);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          <button
            onClick={() => {
  if (location.state) {
    const { page, search, platform, sort, view } = location.state as any;

    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (platform && platform !== "all") params.set("platform", platform);
    if (sort && sort !== "name-asc") params.set("sort", sort);
    if (page && page > 1) params.set("page", String(page));
    if (view && view !== "grid") params.set("view", view);

    navigate(`/games?${params.toString()}`);
  } else {
    navigate("/games");
  }
}}
            className="flex items-center space-x-1 sm:space-x-2 text-cyan-600 hover:text-orange-500 transition-colors mb-6 sm:mb-8 bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-lg text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back</span>
          </button>
          <Loader
            size="large"
            message="Loading product details..."
            fullScreen={false}
          />
        </div>
      </div>
    );
  }

  if (!product && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          <button
            onClick={() => {
  if (location.state) {
    const { page, search, platform, sort, view } = location.state as any;

    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (platform && platform !== "all") params.set("platform", platform);
    if (sort && sort !== "name-asc") params.set("sort", sort);
    if (page && page > 1) params.set("page", String(page));
    if (view && view !== "grid") params.set("view", view);

    navigate(`/games?${params.toString()}`);
  } else {
    navigate("/games");
  }
}}
            className="flex items-center space-x-1 sm:space-x-2 text-cyan-600 hover:text-orange-500 transition-colors mb-6 sm:mb-8 bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-lg text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back</span>
          </button>
          <Loader
            size="large"
            message="Searching for product..."
            fullScreen={false}
          />
        </div>
      </div>
    );
  }

  if (!currentProduct) return null;

  const currentPrice = calculatePrice();
  const discountPercentage = getDiscountPercentage();
  const platformList = getPlatformsForGame(currentProduct);

  const durationOptions = [
    {
      key: "1_month" as RentDuration,
      label: "1 Month",
      price: selectedPlatformPricing?.rent_1_month,
    },
    {
      key: "3_months" as RentDuration,
      label: "3 Months",
      price: selectedPlatformPricing?.rent_3_months,
    },
    {
      key: "6_months" as RentDuration,
      label: "6 Months",
      price: selectedPlatformPricing?.rent_6_months,
    },
    {
      key: "12_months" as RentDuration,
      label: "12 Months",
      price: selectedPlatformPricing?.rent_12_months,
    },
  ].filter((duration) => duration.price && duration.price > 0);

  const renderTypeButtons = () => (
    <div className="mb-4 xl:mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Type
      </label>
      <div className="space-y-2 xl:space-y-3">
        {availableTypesForCurrentPlatform.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`w-full px-4 xl:px-6 py-2 xl:py-3 rounded-lg xl:rounded-xl font-medium transition-all duration-300 text-left text-sm xl:text-base ${selectedType === type
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

  const renderDurationButtons = () =>
    selectedType === "Rent" &&
    durationOptions.length > 0 && (
      <div className="mb-4 xl:mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Rental Duration
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 xl:gap-3">
          {durationOptions.map((duration) => (
            <button
              key={duration.key}
              onClick={() => setSelectedRentDuration(duration.key)}
              className={`px-3 xl:px-4 py-2 xl:py-3 rounded-lg xl:rounded-xl font-medium transition-all duration-300 text-sm xl:text-base ${selectedRentDuration === duration.key
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              <div className="text-xs xl:text-sm">{duration.label}</div>
              <div className="text-xs opacity-75">₹{duration.price || 0}</div>
            </button>
          ))}
        </div>
      </div>
    );

  const renderProductDetails = () => (
    <>
      <h1 className="text-2xl xl:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4 xl:mb-6">
        {currentProduct.title}
      </h1>

      <div className="flex flex-wrap items-center gap-2 mb-4 xl:mb-6">
        {platformList.length > 0 && (
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-3 xl:px-4 py-1 xl:py-2 rounded-full text-xs xl:text-sm font-medium shadow-lg">
            {platformList.join(", ")}
          </span>
        )}
        {currentProduct.edition && currentProduct.edition !== "Standard" && (
          <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 xl:px-4 py-1 xl:py-2 rounded-full text-xs xl:text-sm font-medium shadow-lg">
            {currentProduct.edition} Edition
          </span>
        )}
      </div>

      {availableEditions.length > 1 && (
        <div className="mb-4 xl:mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Choose Edition ({availableEditions.length} available)
          </label>
          <div className="grid grid-cols-1 gap-3">
            {availableEditions.map((edition) => (
              <button
                key={edition.id}
                onClick={() => handleEditionChange(edition)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${selectedEdition?.id === edition.id
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 bg-white hover:border-purple-300"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-800">
                      {edition.edition} Edition
                    </h4>
                    <p className="text-sm text-gray-600">
                      Starting from ₹{getStartingPrice(edition)}
                    </p>
                  </div>
                  {selectedEdition?.id === edition.id && (
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                {edition.edition_features && edition.edition_features.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {edition.edition_features.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                    {edition.edition_features.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{edition.edition_features.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {platformList.length > 0 && (
        <div className="mb-4 xl:mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Platform
          </label>
          <div className="flex flex-wrap gap-2 xl:gap-3">
            {platformList.map((platform) => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-4 xl:px-6 py-2 xl:py-3 rounded-lg xl:rounded-xl font-medium transition-all duration-300 text-sm xl:text-base ${selectedPlatform === platform
                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>
      )}

      {renderTypeButtons()}
      {renderDurationButtons()}

      {currentProduct.edition_features &&
        currentProduct.edition_features.length > 0 && (
          <div className="mb-4 xl:mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 xl:p-6 border border-purple-200">
            <h4 className="font-bold text-purple-800 mb-3 text-sm xl:text-base">
              {currentProduct.edition} Edition Features
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentProduct.edition_features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span className="text-purple-700 text-xs xl:text-sm">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      <div className="mb-4 xl:mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 xl:p-6 border border-blue-200">
        <h4 className="font-bold text-blue-800 mb-3 text-sm xl:text-base">
          About This Option
        </h4>
        <p className="text-blue-700 text-xs xl:text-sm leading-relaxed whitespace-pre-line">
          {getTypeDescription()}
        </p>
      </div>

      <div className="flex items-center space-x-3 xl:space-x-4 mb-6 xl:mb-8">
        <span className="text-3xl xl:text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          ₹{currentPrice}
        </span>

        {discountPercentage > 0 && (
          <>
            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 xl:px-4 py-1 xl:py-2 rounded-full text-sm xl:text-lg font-bold shadow-lg">
              -{discountPercentage}%
            </span>
            {selectedPlatformPricing?.original_price ? (
              <span className="text-lg xl:text-2xl text-gray-500 line-through">
                ₹{selectedPlatformPricing.original_price}
              </span>
            ) : null}
          </>
        )}
      </div>

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 xl:gap-4 mb-6 xl:mb-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <Shield className="w-6 h-6 mx-auto mb-2 text-green-600" />
          <h4 className="font-bold text-green-800 text-sm xl:text-base">
            Warranty
          </h4>
          <p className="text-green-700 text-xs xl:text-sm">
            Safe and supported access
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
          <h4 className="font-bold text-blue-800 text-sm xl:text-base">
            Fast Delivery
          </h4>
          <p className="text-blue-700 text-xs xl:text-sm">
            Quick account access
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
          <Headphones className="w-6 h-6 mx-auto mb-2 text-orange-600" />
          <h4 className="font-bold text-orange-800 text-sm xl:text-base">
            Support
          </h4>
          <p className="text-orange-700 text-xs xl:text-sm">
            Setup help available
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm">
          <button
            onClick={() => toggleAccordion("details")}
            className="w-full flex items-center justify-between p-4 xl:p-6 text-left hover:bg-white/30 transition-colors rounded-xl"
          >
            <span className="font-bold text-gray-800 text-base xl:text-lg">
              Product Details
            </span>
            {activeAccordion === "details" ? (
              <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
            )}
          </button>
          {activeAccordion === "details" && (
            <div className="px-4 xl:px-6 pb-4 xl:pb-6">
              <p className="text-gray-600 leading-relaxed text-sm xl:text-base">
                {currentProduct.description}
              </p>
            </div>
          )}
        </div>

        <div className="border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm">
          <button
            onClick={() => toggleAccordion("additional")}
            className="w-full flex items-center justify-between p-4 xl:p-6 text-left hover:bg-white/30 transition-colors rounded-xl"
          >
            <span className="font-bold text-gray-800 text-base xl:text-lg">
              Additional Information
            </span>
            {activeAccordion === "additional" ? (
              <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
            )}
          </button>
          {activeAccordion === "additional" && (
            <div className="px-4 xl:px-6 pb-4 xl:pb-6">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 xl:p-6">
                <h4 className="font-bold text-orange-800 mb-3">
                  Important Notice
                </h4>
                <p className="text-orange-700 leading-relaxed text-sm xl:text-base">
                  Refunds are not available after purchase; however, support or
                  replacement will be provided if the product does not function
                  properly according to our policy.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 xl:mt-6">
                <div>
                  <h4 className="font-bold text-gray-800 mb-2 text-sm xl:text-base">
                    Platform
                  </h4>
                  <p className="text-gray-600 text-sm xl:text-base">
                    {selectedPlatform}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2 text-sm xl:text-base">
                    Edition
                  </h4>
                  <p className="text-gray-600 text-sm xl:text-base">
                    {currentProduct.edition || "Standard"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm">
          <button
            onClick={() => toggleAccordion("faq")}
            className="w-full flex items-center justify-between p-4 xl:p-6 text-left hover:bg-white/30 transition-colors rounded-xl"
          >
            <span className="font-bold text-gray-800 text-base xl:text-lg">
              FAQ
            </span>
            {activeAccordion === "faq" ? (
              <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
            )}
          </button>
          {activeAccordion === "faq" && (
            <div className="px-4 xl:px-6 pb-4 xl:pb-6 space-y-3 xl:space-y-4">
              {faqs.map((faq, index) => (
                <div key={index}>
                  <h5 className="font-semibold text-gray-800 mb-2 text-sm xl:text-base">
                    {faq.question}
                  </h5>
                  <p className="text-gray-600 text-xs xl:text-sm whitespace-pre-line leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <button
          onClick={() => {
  if (location.state) {
    const { page, search, platform, sort, view } = location.state as any;

    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (platform && platform !== "all") params.set("platform", platform);
    if (sort && sort !== "name-asc") params.set("sort", sort);
    if (page && page > 1) params.set("page", String(page));
    if (view && view !== "grid") params.set("view", view);

    navigate(`/games?${params.toString()}`);
  } else {
    navigate("/games");
  }
}}
          className="flex items-center space-x-1 sm:space-x-2 text-cyan-600 hover:text-orange-500 transition-colors mb-6 sm:mb-8 bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-lg text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Back</span>
        </button>

        <div className="hidden lg:block">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-12">
            <div className={`${isImageSticky ? "sticky top-8" : ""} h-fit`}>
              <div className="flex justify-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20 w-full max-w-lg">
                  <img
                  id="product-main-image"
                    src={currentProduct.image}
                    alt={currentProduct.title}
                    className="w-full aspect-square object-cover rounded-2xl"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 xl:space-y-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 xl:p-8 shadow-2xl border border-white/20">
                {renderProductDetails()}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex justify-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/20 w-full max-w-sm">
                <img
                id="product-main-image"
                  src={currentProduct.image}
                  alt={currentProduct.title}
                  className="w-full aspect-square object-cover rounded-xl"
                />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/20">
              {renderProductDetails()}
            </div>
          </div>
        </div>

        <div id="screenshots-section" className="mt-8 sm:mt-12">
          <CustomerScreenshots />
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-10 sm:mt-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((related) => (
                <div
                  key={related.id}
                  onClick={() => handleRelatedProductClick(related)}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                >
                  <img
                    src={related.image}
                    alt={related.title}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base line-clamp-2 mb-2">
                      {related.title}
                    </h3>
                    <p className="text-orange-600 font-bold">
                      Starting from ₹{getStartingPrice(related)}
                    </p>
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