import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  Settings,
  Copy,
  Tag,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  Game,
  GamePlatformPrice,
  Testimonial,
  getPlatformsForGame,
  getStartingPrice,
} from "../config/supabase";
import {
  useAllGames,
  useSubscriptions,
  useTestimonials,
} from "../hooks/useSupabaseData";
import {
  gamesService,
  subscriptionsService,
  testimonialsService,
} from "../services/supabaseService";
import {
  settingsService,
  ShopSettings,
  ShopMode,
  PaymentSettings,
} from "../services/settingsService";
import { couponService, Coupon } from "../services/couponService";

type AdminTab =
  | "games"
  | "subscriptions"
  | "testimonials"
  | "settings"
  | "coupons";

interface GameFormState {
  title: string;
  image: string;
  description: string;
  type: string[];
  category: "game" | "subscription";
  show_in_bestsellers: boolean;
  is_recommended: boolean;
  edition?: "Standard" | "Premium" | "Ultimate" | "Deluxe";
  base_game_id?: string | null;
  edition_features: string[];
  platform_prices: GamePlatformPrice[];
}

const PLATFORM_OPTIONS = ["PS5", "PS4", "PSVR2", "Xbox", "PC", "Subscription"];

const emptyPlatformPrice = (platform = ""): GamePlatformPrice => ({
  platform,
  original_price: null,
  sale_price: null,
  rent_1_month: null,
  rent_3_months: null,
  rent_6_months: null,
  rent_12_months: null,
  permanent_offline_price: null,
  permanent_online_price: null,
});

const emptyGameForm = (
  category: "game" | "subscription" = "game"
): GameFormState => ({
  title: "",
  image: "",
  description: "",
  type:
    category === "subscription"
      ? ["Rent"]
      : ["Rent", "Permanent Offline", "Permanent Offline + Online"],
  category,
  show_in_bestsellers: false,
  is_recommended: false,
  edition: category === "game" ? "Standard" : undefined,
  base_game_id: null,
  edition_features: [],
  platform_prices: [emptyPlatformPrice("")]
});

const AdminPage: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>("games");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Game | Testimonial | null>(
    null
  );

  const [gamesSearchQuery, setGamesSearchQuery] = useState("");
  const [subscriptionsSearchQuery, setSubscriptionsSearchQuery] = useState("");
  const [testimonialsSearchQuery, setTestimonialsSearchQuery] = useState("");

  const [gamesCurrentPage, setGamesCurrentPage] = useState(1);
  const [subscriptionsCurrentPage, setSubscriptionsCurrentPage] = useState(1);
  const [testimonialsCurrentPage, setTestimonialsCurrentPage] = useState(1);

  const [formData, setFormData] = useState<GameFormState>(
    emptyGameForm("game")
  );
  const [newEditionFeature, setNewEditionFeature] = useState("");

  const [testimonialImage, setTestimonialImage] = useState("");

  const [shopSettings, setShopSettings] = useState<ShopSettings>({
    id: "local-default",
    shop_mode: "force_open",
    working_hours_start: "09:00",
    working_hours_end: "21:00",
    closed_message: "Shop is currently closed",
    updated_at: new Date().toISOString(),
    updated_by: "admin",
  });

  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    id: "local-default",
    razorpay_enabled: false,
    upi_qr_image: "",
    upi_id: "9069043750@Yes",
  });

  const [isSavingPaymentSettings, setIsSavingPaymentSettings] = useState(false);
  const [isUploadingQr, setIsUploadingQr] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);

  const emptyCouponForm = {
    name: "",
    code: "",
    coupon_type: "fixed_amount" as "fixed_amount" | "percentage" | "message_only",
    value: 0,
    min_order_amount: 0,
    min_game_count: 0,
    message: "",
    is_active: true,
  };

  const [couponForm, setCouponForm] = useState(emptyCouponForm);

  const itemsPerPage = 9;

  const { allGames, loading: gamesLoading, refetch: refetchGames } =
    useAllGames();
  const {
    subscriptions,
    loading: subscriptionsLoading,
    refetch: refetchSubscriptions,
  } = useSubscriptions({ limit: 1000 });
  const {
    testimonials,
    loading: testimonialsLoading,
    refetch: refetchTestimonials,
  } = useTestimonials();

  const loadCoupons = async () => {
    setLoadingCoupons(true);
    const data = await couponService.getAllCoupons();
    setCoupons(data || []);
    setLoadingCoupons(false);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [shop, payment] = await Promise.all([
          settingsService.getShopSettings(),
          settingsService.getPaymentSettings(),
        ]);

        if (shop) {
          setShopSettings(shop);
        }

        if (payment) {
          setPaymentSettings({
            id: payment.id || "local-default",
            razorpay_enabled: payment.razorpay_enabled ?? false,
            upi_qr_image: payment.upi_qr_image || "",
            upi_id: payment.upi_id || "9069043750@Yes",
          });
        }
      } catch (error) {
        console.error("Failed to load admin settings:", error);
      } finally {
        setSettingsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  const currentSearchQuery =
    activeTab === "games"
      ? gamesSearchQuery
      : activeTab === "subscriptions"
        ? subscriptionsSearchQuery
        : testimonialsSearchQuery;

  const setCurrentSearchQuery = (value: string) => {
    if (activeTab === "games") {
      setGamesSearchQuery(value);
      setGamesCurrentPage(1);
    } else if (activeTab === "subscriptions") {
      setSubscriptionsSearchQuery(value);
      setSubscriptionsCurrentPage(1);
    } else if (activeTab === "testimonials") {
      setTestimonialsSearchQuery(value);
      setTestimonialsCurrentPage(1);
    }
  };

  const filteredItems = useMemo(() => {
    if (activeTab === "games") {
      return (allGames || []).filter((item) =>
        item.title.toLowerCase().includes(gamesSearchQuery.toLowerCase())
      );
    }

    if (activeTab === "subscriptions") {
      return (subscriptions || []).filter((item) =>
        item.title.toLowerCase().includes(subscriptionsSearchQuery.toLowerCase())
      );
    }

    if (activeTab === "testimonials") {
      return (testimonials || []).filter((item) =>
        item.image.toLowerCase().includes(testimonialsSearchQuery.toLowerCase())
      );
    }

    return [];
  }, [
    activeTab,
    allGames,
    subscriptions,
    testimonials,
    gamesSearchQuery,
    subscriptionsSearchQuery,
    testimonialsSearchQuery,
  ]);

  const currentPage =
    activeTab === "games"
      ? gamesCurrentPage
      : activeTab === "subscriptions"
        ? subscriptionsCurrentPage
        : testimonialsCurrentPage;

  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const setPage = (page: number) => {
    if (activeTab === "games") setGamesCurrentPage(page);
    else if (activeTab === "subscriptions") setSubscriptionsCurrentPage(page);
    else if (activeTab === "testimonials") setTestimonialsCurrentPage(page);
  };

  const resetGameForm = (category: "game" | "subscription" = "game") => {
    setFormData(emptyGameForm(category));
    setNewEditionFeature("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setTestimonialImage("");
    resetGameForm(activeTab === "subscriptions" ? "subscription" : "game");
  };

  const openNewItemModal = () => {
    setEditingItem(null);

    if (activeTab === "testimonials") {
      setTestimonialImage("");
    } else {
      resetGameForm(activeTab === "subscriptions" ? "subscription" : "game");
    }

    setIsModalOpen(true);
  };

  const handleEditGame = (item: Game) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      image: item.image,
      description: item.description || "",
      type: item.type || [],
      category: item.category,
      show_in_bestsellers: item.show_in_bestsellers || false,
      is_recommended: item.is_recommended || false,
      edition: item.edition,
      base_game_id: item.base_game_id || null,
      edition_features: item.edition_features || [],
      platform_prices:
        item.platform_prices?.length > 0
          ? item.platform_prices.map((p) => ({
              ...p,
              original_price: p.original_price ?? null,
              sale_price: p.sale_price ?? null,
              rent_1_month: p.rent_1_month ?? null,
              rent_3_months: p.rent_3_months ?? null,
              rent_6_months: p.rent_6_months ?? null,
              rent_12_months: p.rent_12_months ?? null,
              permanent_offline_price: p.permanent_offline_price ?? null,
              permanent_online_price: p.permanent_online_price ?? null,
            }))
          : [
            emptyPlatformPrice("")
              // emptyPlatformPrice(
              //   item.category === "subscription" ? "Subscription" : ""
              // ),
            ],
    });
    setIsModalOpen(true);
  };

  const handleEditTestimonial = (item: Testimonial) => {
    setEditingItem(item);
    setTestimonialImage(item.image);
    setIsModalOpen(true);
  };

  const updateFormField = <K extends keyof GameFormState>(
    field: K,
    value: GameFormState[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updatePlatformPrice = (
    index: number,
    field: keyof GamePlatformPrice,
    value: string | number | null
  ) => {
    setFormData((prev) => {
      const next = [...prev.platform_prices];
      next[index] = {
        ...next[index],
        [field]: value,
      };
      return { ...prev, platform_prices: next };
    });
  };

  const copyPlatformPrices = (targetIndex: number, sourceIndex: number) => {
    setFormData((prev) => {
      const next = [...prev.platform_prices];
      const source = next[sourceIndex];
      const target = next[targetIndex];

      if (!source || !target) return prev;

      next[targetIndex] = {
        ...target,
        original_price: source.original_price ?? null,
        sale_price: source.sale_price ?? null,
        rent_1_month: source.rent_1_month ?? null,
        rent_3_months: source.rent_3_months ?? null,
        rent_6_months: source.rent_6_months ?? null,
        rent_12_months: source.rent_12_months ?? null,
        permanent_offline_price: source.permanent_offline_price ?? null,
        permanent_online_price: source.permanent_online_price ?? null,
      };

      return { ...prev, platform_prices: next };
    });

    const sourcePlatform =
      formData.platform_prices[sourceIndex]?.platform || "selected platform";
    const targetPlatform =
      formData.platform_prices[targetIndex]?.platform || "current platform";

    toast.success(`Copied prices from ${sourcePlatform} to ${targetPlatform}`);
  };

  const addPlatformRow = () => {
    setFormData((prev) => ({
      ...prev,
      platform_prices: [
        ...prev.platform_prices,
        // emptyPlatformPrice(prev.category === "subscription" ? "Subscription" : ""),
        emptyPlatformPrice("")
      ],
    }));
  };

  const removePlatformRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      platform_prices: prev.platform_prices.filter((_, i) => i !== index),
    }));
  };

  const addEditionFeature = () => {
    if (!newEditionFeature.trim()) return;

    setFormData((prev) => ({
      ...prev,
      edition_features: [...prev.edition_features, newEditionFeature.trim()],
    }));
    setNewEditionFeature("");
  };

  const removeEditionFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      edition_features: prev.edition_features.filter((_, i) => i !== index),
    }));
  };

  const validateGameForm = () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return false;
    }

    if (!formData.image.trim()) {
      toast.error("Please provide an image");
      return false;
    }

    if (formData.category === "game" && (!formData.type || formData.type.length === 0)) {
      toast.error("Please select at least one type");
      return false;
    }

    if (!formData.platform_prices.length) {
      toast.error("Please add at least one platform pricing row");
      return false;
    }

    for (const row of formData.platform_prices) {
      if (!row.platform?.trim()) {
        toast.error("Each platform pricing row must have a platform");
        return false;
      }

      const hasAnyPrice =
        row.original_price ||
        row.sale_price ||
        row.rent_1_month ||
        row.rent_3_months ||
        row.rent_6_months ||
        row.rent_12_months ||
        row.permanent_offline_price ||
        row.permanent_online_price;

      if (!hasAnyPrice) {
        toast.error(`Please add at least one price for platform ${row.platform}`);
        return false;
      }
    }

    const platformNames = formData.platform_prices.map((p) => p.platform);
    const hasDuplicates = new Set(platformNames).size !== platformNames.length;

    if (hasDuplicates) {
      toast.error("Each platform can only be added once");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!validateGameForm()) return;

      const payload: Omit<Game, "id" | "created_at" | "updated_at"> = {
        title: formData.title,
        image: formData.image,
        description: formData.description,
        type:
          formData.category === "subscription" ? ["Rent"] : formData.type,
        category: formData.category,
        show_in_bestsellers: formData.show_in_bestsellers,
        is_recommended: formData.is_recommended,
        edition: formData.category === "game" ? formData.edition : undefined,
        base_game_id:
          formData.category === "game" ? formData.base_game_id || null : null,
        edition_features:
          formData.category === "game" ? formData.edition_features : [],
        platform_prices: formData.platform_prices.map((p) => ({
          platform: p.platform,
          original_price: p.original_price ?? null,
          sale_price: p.sale_price ?? null,
          rent_1_month: p.rent_1_month ?? null,
          rent_3_months: p.rent_3_months ?? null,
          rent_6_months: p.rent_6_months ?? null,
          rent_12_months: p.rent_12_months ?? null,
          permanent_offline_price: p.permanent_offline_price ?? null,
          permanent_online_price: p.permanent_online_price ?? null,
        })),
      };

      if (activeTab === "games") {
        if (editingItem) {
          await gamesService.update(editingItem.id!, payload);
          toast.success("Game updated successfully!");
        } else {
          await gamesService.add(payload);
          toast.success("Game created successfully!");
        }
        refetchGames();
      } else if (activeTab === "subscriptions") {
        const normalizedPayload = {
          ...payload,
          category: "subscription" as const,
          platform_prices:
            payload.platform_prices.length > 0
              ? payload.platform_prices.map((p) => ({
                  ...p,
                  platform: p.platform || "Subscription",
                }))
              : [emptyPlatformPrice("Subscription")],
        };

        if (editingItem) {
          await subscriptionsService.update(editingItem.id!, normalizedPayload);
          toast.success("Subscription updated successfully!");
        } else {
          await subscriptionsService.add(normalizedPayload);
          toast.success("Subscription created successfully!");
        }
        refetchSubscriptions();
      }

      closeModal();
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error("Failed to save item. Please try again.");
    }
  };

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!testimonialImage.trim()) {
        toast.error("Please provide a screenshot image");
        return;
      }

      if (editingItem) {
        toast.info(
          "Editing testimonials is not enabled yet. Delete and re-add instead."
        );
        return;
      }

      await testimonialsService.add({ image: testimonialImage });
      toast.success("Screenshot added successfully!");
      refetchTestimonials();
      closeModal();
    } catch (error) {
      console.error("Error saving testimonial:", error);
      toast.error("Failed to save screenshot. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      if (activeTab === "games") {
        await gamesService.delete(id);
        toast.success("Game deleted successfully!");
        refetchGames();
      } else if (activeTab === "subscriptions") {
        await subscriptionsService.delete(id);
        toast.success("Subscription deleted successfully!");
        refetchSubscriptions();
      } else if (activeTab === "testimonials") {
        await testimonialsService.delete(id);
        toast.success("Screenshot deleted successfully!");
        refetchTestimonials();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item. Please try again.");
    }
  };

  const loading =
    (activeTab === "games" && gamesLoading) ||
    (activeTab === "subscriptions" && subscriptionsLoading) ||
    (activeTab === "testimonials" && testimonialsLoading);

  const renderGameCard = (item: Game) => {
    const platforms = getPlatformsForGame(item);
    const startingPrice = getStartingPrice(item);

    return (
      <div
        key={item.id}
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden"
      >
        <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-gray-800 text-sm leading-snug">
              {item.title}
            </h3>
            {item.edition && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap">
                {item.edition}
              </span>
            )}
          </div>

          <p className="text-orange-500 font-bold mb-2">₹{startingPrice}</p>

          <div className="flex flex-wrap gap-1 mb-3">
            {platforms.map((platform) => (
              <span
                key={platform}
                className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded text-xs"
              >
                {platform}
              </span>
            ))}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => handleEditGame(item)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => handleDelete(item.id!)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTestimonialCard = (item: Testimonial) => (
    <div
      key={item.id}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden"
    >
      <img
        src={item.image}
        alt="Customer screenshot"
        className="w-full h-64 object-cover"
      />
      <div className="p-4">
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditTestimonial(item)}
            className="flex-1 bg-gray-400 text-white py-2 px-3 rounded-lg text-sm cursor-not-allowed"
            disabled
          >
            Edit Disabled
          </button>
          <button
            onClick={() => handleDelete(item.id!)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderPagination = () => {
    if (activeTab === "settings" || activeTab === "coupons" || totalPages <= 1) {
      return null;
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => setPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(
          (page) => (
            <button
              key={page}
              onClick={() => setPage(page)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === page
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white"
                  : "text-gray-600 bg-white border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          )
        )}

        {totalPages > 5 && (
          <>
            <span className="px-2 text-gray-500">...</span>
            <button
              onClick={() => setPage(totalPages)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === totalPages
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white"
                  : "text-gray-600 bg-white border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    );
  };

  const renderCoupons = () => {
    const reloadCoupons = async () => {
      setLoadingCoupons(true);
      const data = await couponService.getAllCoupons();
      setCoupons(data || []);
      setLoadingCoupons(false);
    };

    const handleSaveCoupon = async () => {
      if (!couponForm.name.trim()) {
        toast.error("Coupon name is required");
        return;
      }

      if (!couponForm.code.trim()) {
        toast.error("Coupon code is required");
        return;
      }

      if (
        couponForm.coupon_type !== "message_only" &&
        Number(couponForm.value) <= 0
      ) {
        toast.error("Coupon value must be greater than 0");
        return;
      }

      let result = null;

      if (editingCouponId) {
        result = await couponService.updateCoupon(editingCouponId, couponForm);
      } else {
        result = await couponService.createCoupon(couponForm);
      }

      if (!result) {
        toast.error("Failed to save coupon");
        return;
      }

      toast.success(editingCouponId ? "Coupon updated" : "Coupon created");
      setCouponForm(emptyCouponForm);
      setEditingCouponId(null);
      await reloadCoupons();
    };

    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
          <div className="flex items-center space-x-3 mb-6">
            <Tag className="w-8 h-8 text-orange-500" />
            <h3 className="text-2xl font-bold text-gray-800">
              Coupon Management
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Coupon Name
    </label>
    <input
      type="text"
      placeholder="e.g. Festival Offer"
      value={couponForm.name}
      onChange={(e) =>
        setCouponForm({ ...couponForm, name: e.target.value })
      }
      className="w-full px-4 py-3 border border-gray-300 rounded-xl"
    />
    <p className="text-xs text-gray-500 mt-1">
      Internal display name for admin use
    </p>
  </div>

  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Coupon Code
    </label>
    <input
      type="text"
      placeholder="e.g. FEST10"
      value={couponForm.code}
      onChange={(e) =>
        setCouponForm({
          ...couponForm,
          code: e.target.value.toUpperCase(),
        })
      }
      className="w-full px-4 py-3 border border-gray-300 rounded-xl"
    />
    <p className="text-xs text-gray-500 mt-1">
      Code customers will enter at checkout
    </p>
  </div>

  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Coupon Type
    </label>
    <select
      value={couponForm.coupon_type}
      onChange={(e) =>
        setCouponForm({
          ...couponForm,
          coupon_type: e.target.value as
            | "fixed_amount"
            | "percentage"
            | "message_only",
        })
      }
      className="w-full px-4 py-3 border border-gray-300 rounded-xl"
    >
      <option value="fixed_amount">Fixed Amount Off</option>
      <option value="percentage">Percentage Off</option>
      <option value="message_only">Message Only</option>
    </select>
    <p className="text-xs text-gray-500 mt-1">
      Select how this coupon should work
    </p>
  </div>

  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Discount Value
    </label>
    <input
      type="number"
      placeholder="e.g. 100 or 10"
      value={couponForm.value === 0 ? "" : couponForm.value}
onChange={(e) =>
  setCouponForm({
    ...couponForm,
    value: e.target.value === "" ? 0 : Number(e.target.value),
  })
}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl"
      disabled={couponForm.coupon_type === "message_only"}
    />
    <p className="text-xs text-gray-500 mt-1">
      Enter amount in ₹ or percentage value depending on coupon type
    </p>
  </div>

  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Minimum Order Amount
    </label>
    <input
      type="number"
      placeholder="e.g. 1000"
      value={couponForm.min_order_amount === 0 ? "" : couponForm.min_order_amount}
onChange={(e) =>
  setCouponForm({
    ...couponForm,
    min_order_amount: e.target.value === "" ? 0 : Number(e.target.value),
  })
}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl"
    />
    <p className="text-xs text-gray-500 mt-1">
      Minimum cart total required to apply this coupon
    </p>
  </div>

  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Minimum Number of Games
    </label>
    <input
      type="number"
      placeholder="e.g. 2"
    value={couponForm.min_game_count === 0 ? "" : couponForm.min_game_count}
onChange={(e) =>
  setCouponForm({
    ...couponForm,
    min_game_count: e.target.value === "" ? 0 : Number(e.target.value),
  })
}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl"
    />
    <p className="text-xs text-gray-500 mt-1">
      Minimum number of games required in cart
    </p>
  </div>

  <div className="md:col-span-2">
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Coupon Benefit Message
    </label>
    <textarea
      placeholder="e.g. Extra 10 days added for eligible rent games"
      value={couponForm.message}
      onChange={(e) =>
        setCouponForm({ ...couponForm, message: e.target.value })
      }
      className="w-full px-4 py-3 border border-gray-300 rounded-xl"
      rows={3}
    />
    <p className="text-xs text-gray-500 mt-1">
      Message shown to customer and included in WhatsApp order summary
    </p>
  </div>

  <div className="md:col-span-2">
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={couponForm.is_active}
        onChange={(e) =>
          setCouponForm({
            ...couponForm,
            is_active: e.target.checked,
          })
        }
      />
      <span className="text-sm font-semibold text-gray-700">Coupon Active</span>
    </label>
    <p className="text-xs text-gray-500 mt-1">
      Enable or disable this coupon
    </p>
  </div>
</div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSaveCoupon}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold"
            >
              {editingCouponId ? "Update Coupon" : "Create Coupon"}
            </button>

            <button
              onClick={() => {
                setCouponForm(emptyCouponForm);
                setEditingCouponId(null);
              }}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-bold"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
          <h4 className="text-xl font-bold text-gray-800 mb-6">Existing Coupons</h4>

          {loadingCoupons ? (
            <p className="text-gray-500">Loading coupons...</p>
          ) : coupons.length === 0 ? (
            <p className="text-gray-500">No coupons found</p>
          ) : (
            <div className="space-y-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="border border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div>
                    <div className="font-bold text-gray-800">
                      {coupon.name} ({coupon.code})
                    </div>
                    <div className="text-sm text-gray-600">
                      Type: {coupon.coupon_type}
                    </div>
                    <div className="text-sm text-gray-600">
                      Value: {coupon.value}
                    </div>
                    <div className="text-sm text-gray-600">
                      Min amount: ₹{coupon.min_order_amount} | Min games: {coupon.min_game_count}
                    </div>
                    {coupon.message && (
                      <div className="text-sm text-blue-600 mt-1">
                        Message: {coupon.message}
                      </div>
                    )}
                    <div className="text-sm mt-1">
                      Status:{" "}
                      <span className={coupon.is_active ? "text-green-600" : "text-red-600"}>
                        {coupon.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingCouponId(coupon.id);
                        setCouponForm({
                          name: coupon.name,
                          code: coupon.code,
                          coupon_type: coupon.coupon_type,
                          value: coupon.value,
                          min_order_amount: coupon.min_order_amount,
                          min_game_count: coupon.min_game_count,
                          message: coupon.message,
                          is_active: coupon.is_active,
                        });
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                    >
                      Edit
                    </button>

                    <button
                      onClick={async () => {
                        const ok = await couponService.deleteCoupon(coupon.id);
                        if (!ok) {
                          toast.error("Failed to delete coupon");
                          return;
                        }
                        toast.success("Coupon deleted");
                        await reloadCoupons();
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="w-8 h-8 text-blue-500" />
            <h3 className="text-2xl font-bold text-gray-800">
              Shop Availability Settings
            </h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Shop Mode
              </label>
              <div className="space-y-3">
                {[
                  {
                    id: "working_hours",
                    label: "Working Hours (10:00 AM - 10:00 PM)",
                  },
                  { id: "close_now", label: "Close Now (Temporarily Closed)" },
                  { id: "force_open", label: "Force Open (24/7)" },
                ].map(({ id, label }) => (
                  <div
                    key={id}
                    onClick={() =>
                      setShopSettings({ ...shopSettings, shop_mode: id as ShopMode })
                    }
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      shopSettings.shop_mode === id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span
                      className={`font-medium ${
                        shopSettings.shop_mode === id
                          ? "text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Closed Message
              </label>
              <textarea
                value={shopSettings.closed_message}
                onChange={(e) =>
                  setShopSettings({
                    ...shopSettings,
                    closed_message: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-500">
                {shopSettings.updated_at && (
                  <p>
                    Last updated: {new Date(shopSettings.updated_at).toLocaleString()}
                  </p>
                )}
                {shopSettings.updated_by && <p>By: {shopSettings.updated_by}</p>}
              </div>

              <button
                onClick={async () => {
                  setIsSavingSettings(true);
                  const success = await settingsService.updateShopSettings(
                    {
                      shop_mode: shopSettings.shop_mode,
                      closed_message: shopSettings.closed_message,
                    },
                    JSON.parse(localStorage.getItem("gc_admin_user") || "{}")?.email ||
                      "admin"
                  );
                  setIsSavingSettings(false);

                  if (success) {
                    toast.success("Shop settings updated successfully!");
                    const updatedSettings = await settingsService.getShopSettings();
                    if (updatedSettings) setShopSettings(updatedSettings);
                  } else {
                    toast.error("Failed to update settings");
                  }
                }}
                disabled={isSavingSettings}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {isSavingSettings ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="w-8 h-8 text-green-500" />
            <h3 className="text-2xl font-bold text-gray-800">
              Payment Settings
            </h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                UPI ID
              </label>
              <input
                type="text"
                value={paymentSettings?.upi_id || ""}
                onChange={(e) =>
                  setPaymentSettings((prev) =>
                    prev
                      ? { ...prev, upi_id: e.target.value }
                      : {
                          id: "",
                          razorpay_enabled: false,
                          upi_qr_image: "",
                          upi_id: e.target.value,
                        }
                  )
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Enter UPI ID"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                QR Image
              </label>

              {paymentSettings?.upi_qr_image && (
                <div className="mb-4">
                  <img
                    src={`${(import.meta.env.VITE_API_URL || "").replace(/\/$/, "")}${paymentSettings.upi_qr_image}`}
                    alt="Current UPI QR"
                    className="w-48 rounded-xl border border-gray-200 shadow"
                  />
                </div>
              )}

              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setIsUploadingQr(true);
                  const uploadedPath = await settingsService.uploadPaymentQrImage(file);
                  setIsUploadingQr(false);

                  if (!uploadedPath) {
                    toast.error("Failed to upload QR image");
                    return;
                  }

                  setPaymentSettings((prev) =>
                    prev
                      ? { ...prev, upi_qr_image: uploadedPath }
                      : {
                          id: "",
                          razorpay_enabled: false,
                          upi_qr_image: uploadedPath,
                          upi_id: "",
                        }
                  );

                  toast.success("QR image uploaded successfully!");
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white"
              />

              {isUploadingQr && (
                <p className="text-sm text-gray-500 mt-2">Uploading QR image...</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={async () => {
                  if (!paymentSettings) return;

                  setIsSavingPaymentSettings(true);
                  const success = await settingsService.updatePaymentSettings({
                    upi_id: paymentSettings.upi_id,
                    upi_qr_image: paymentSettings.upi_qr_image,
                    razorpay_enabled: paymentSettings.razorpay_enabled,
                  });
                  setIsSavingPaymentSettings(false);

                  if (success) {
                    toast.success("Payment settings updated successfully!");
                    const refreshed = await settingsService.getPaymentSettings();
                    if (refreshed) setPaymentSettings(refreshed);
                  } else {
                    toast.error("Failed to update payment settings");
                  }
                }}
                disabled={isSavingPaymentSettings}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {isSavingPaymentSettings ? "Saving..." : "Save Payment Settings"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGameModal = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateFormField("title", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image
        </label>
        <input
          type="text"
          value={formData.image}
          onChange={(e) => updateFormField("image", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
          placeholder="Paste image URL or base64 data"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateFormField("description", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
          rows={4}
        />
      </div>

      {activeTab === "games" && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Types
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {["Rent", "Permanent Offline", "Permanent Offline + Online"].map(
                (type) => (
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.type.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormField("type", [...formData.type, type]);
                        } else {
                          updateFormField(
                            "type",
                            formData.type.filter((t) => t !== type)
                          );
                        }
                      }}
                    />
                    <span className="text-sm">{type}</span>
                  </label>
                )
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Edition
            </label>
            <select
              value={formData.edition || "Standard"}
              onChange={(e) =>
                updateFormField(
                  "edition",
                  e.target.value as "Standard" | "Premium" | "Ultimate" | "Deluxe"
                )
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              {["Standard", "Premium", "Deluxe", "Ultimate"].map((edition) => (
                <option key={edition} value={edition}>
                  {edition}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Platform-specific Pricing
          </label>
          <button
            type="button"
            onClick={addPlatformRow}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Add Platform
          </button>
        </div>

        <div className="space-y-4">
          {formData.platform_prices.map((row, index) => {
            const copyableRows = formData.platform_prices.filter(
              (_, i) => i !== index && !!formData.platform_prices[i].platform
            );

            return (
              <div
                key={index}
                className="border border-gray-200 rounded-xl p-4 bg-gray-50"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
                  <select
                    value={row.platform}
                    onChange={(e) =>
                      updatePlatformPrice(index, "platform", e.target.value)
                    }
                    className="w-full max-w-xs p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    // disabled={activeTab === "subscriptions"}
                  >
                    <option value="">Select Platform</option>
                    {(activeTab === "subscriptions"
                      ? PLATFORM_OPTIONS
                      : PLATFORM_OPTIONS.filter((p) => p !== "Subscription")
                    ).map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>

                  <div className="flex flex-wrap gap-2">
                    {copyableRows.length > 0 && (
                      <div className="flex items-center gap-2">
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            if (!e.target.value) return;
                            copyPlatformPrices(index, Number(e.target.value));
                            e.currentTarget.value = "";
                          }}
                          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
                        >
                          <option value="">Copy prices from...</option>
                          {copyableRows.map((sourceRow) => {
                            const realIndex = formData.platform_prices.findIndex(
                              (p, i) => i !== index && p === sourceRow
                            );
                            return (
                              <option key={`${sourceRow.platform}-${realIndex}`} value={realIndex}>
                                {sourceRow.platform}
                              </option>
                            );
                          })}
                        </select>
                        <span className="inline-flex items-center text-gray-500 text-sm">
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </span>
                      </div>
                    )}

                    {formData.platform_prices.length > 1 &&
                      activeTab !== "subscriptions" && (
                        <button
                          type="button"
                          onClick={() => removePlatformRow(index)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
                        >
                          Remove
                        </button>
                      )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    ["original_price", "Original Price"],
                    ["sale_price", "Sale Price"],
                    ["rent_1_month", "Rent 1 Month"],
                    ["rent_3_months", "Rent 3 Months"],
                    ["rent_6_months", "Rent 6 Months"],
                    ["rent_12_months", "Rent 12 Months"],
                    ["permanent_offline_price", "Permanent Offline"],
                    ["permanent_online_price", "Permanent Offline + Online"],
                  ].map(([field, label]) => (
                    <div key={field}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {label}
                      </label>
                      <input
                        type="number"
                        value={(row as any)[field] ?? ""}
                        onChange={(e) =>
                          updatePlatformPrice(
                            index,
                            field as keyof GamePlatformPrice,
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        min="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeTab === "games" && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Edition Features
            </label>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newEditionFeature}
                onChange={(e) => setNewEditionFeature(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Add edition feature"
              />
              <button
                type="button"
                onClick={addEditionFeature}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 rounded-lg"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.edition_features.map((feature, index) => (
                <span
                  key={index}
                  className="bg-purple-100 text-purple-800 px-3 py-2 rounded-full text-sm flex items-center gap-2"
                >
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeEditionFeature(index)}
                    className="text-purple-800 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.show_in_bestsellers}
                onChange={(e) =>
                  updateFormField("show_in_bestsellers", e.target.checked)
                }
              />
              <span className="text-sm">Show in bestsellers</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_recommended}
                onChange={(e) =>
                  updateFormField("is_recommended", e.target.checked)
                }
              />
              <span className="text-sm">Recommended</span>
            </label>
          </div>
        </>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={closeModal}
          className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-bold"
        >
          {editingItem ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );

  const renderTestimonialModal = () => (
    <form onSubmit={handleTestimonialSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Screenshot Image
        </label>
        <input
          type="text"
          value={testimonialImage}
          onChange={(e) => setTestimonialImage(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
          placeholder="Paste image URL or base64 data"
          required
        />
      </div>

      {editingItem && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          Editing existing testimonials is not enabled yet because the backend
          update route is not implemented. Delete and re-add if needed.
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={closeModal}
          className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        {!editingItem && (
          <button
            type="submit"
            className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-bold"
          >
            Add Screenshot
          </button>
        )}
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 text-cyan-600 hover:text-orange-500 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Admin Panel
            </h1>
          </div>
        </div>

        <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-white/20 grid grid-cols-2 gap-2 md:flex md:space-x-1">
          {[
            { id: "games", label: "Games", count: allGames.length },
            { id: "subscriptions", label: "Subscriptions", count: subscriptions.length },
            { id: "testimonials", label: "Screenshots", count: testimonials.length },
            { id: "settings", label: "Shop Settings", count: null },
            { id: "coupons", label: "Coupons", count: null },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    activeTab === tab.id ? "bg-white/20" : "bg-gray-200"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab !== "settings" && activeTab !== "coupons" && (
          <>
            <div className="flex justify-end mb-6">
              <button
                onClick={openNewItemModal}
                className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>
                  Add{" "}
                  {activeTab === "games"
                    ? "Game"
                    : activeTab === "subscriptions"
                      ? "Subscription"
                      : "Screenshot"}
                </span>
              </button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={`Search ${
                    activeTab === "games"
                      ? "games"
                      : activeTab === "subscriptions"
                        ? "subscriptions"
                        : "screenshots"
                  }...`}
                  value={currentSearchQuery}
                  onChange={(e) => setCurrentSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600 text-sm">
                Showing{" "}
                {totalItems === 0
                  ? 0
                  : (currentPage - 1) * itemsPerPage + 1}
                -
                {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
                {activeTab}
              </p>
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          </>
        )}

        {activeTab === "settings" ? (
          renderSettings()
        ) : activeTab === "coupons" ? (
          renderCoupons()
        ) : loading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading {activeTab}...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activeTab === "testimonials"
                ? (paginatedItems as Testimonial[]).map(renderTestimonialCard)
                : (paginatedItems as Game[]).map(renderGameCard)}
            </div>

            {renderPagination()}
          </>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingItem ? "Edit" : "Add"}{" "}
                    {activeTab === "games"
                      ? "Game"
                      : activeTab === "subscriptions"
                        ? "Subscription"
                        : "Screenshot"}
                  </h2>

                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {activeTab === "testimonials"
                  ? renderTestimonialModal()
                  : renderGameModal()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;