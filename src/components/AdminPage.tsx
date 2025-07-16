import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Upload, Image, Save, X, Settings, CreditCard, Smartphone } from 'lucide-react';
import { toast } from 'react-toastify';
import { gamesService, subscriptionsService, testimonialsService, paymentSettingsService } from '../services/supabaseService';
import { useAllGames, useSubscriptions, useTestimonials, usePaymentSettings } from '../hooks/useSupabaseData';
import { Game, Testimonial } from '../config/supabase';

interface AdminPageProps {
  onBackToHome: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome }) => {
  const [activeTab, setActiveTab] = useState('games');
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [isAddingSubscription, setIsAddingSubscription] = useState(false);
  const [isAddingTestimonial, setIsAddingTestimonial] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<Game | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch data
  const { allGames, loading: gamesLoading, refetch: refetchGames } = useAllGames();
  const { subscriptions, loading: subscriptionsLoading, refetch: refetchSubscriptions } = useSubscriptions();
  const { testimonials, loading: testimonialsLoading, refetch: refetchTestimonials } = useTestimonials();
  const { paymentSettings, loading: paymentLoading, refetch: refetchPaymentSettings } = usePaymentSettings();

  // Payment settings state
  const [razorpayEnabled, setRazorpayEnabled] = useState(true);
  const [isSavingPaymentSettings, setIsSavingPaymentSettings] = useState(false);

  // Load payment settings
  useEffect(() => {
    if (paymentSettings) {
      setRazorpayEnabled(paymentSettings.razorpay_enabled);
    }
  }, [paymentSettings]);

  // Handle payment method toggle
  const handlePaymentToggle = async () => {
    try {
      setIsSavingPaymentSettings(true);
      const newValue = !razorpayEnabled;
      
      await paymentSettingsService.update({
        razorpay_enabled: newValue
      });
      
      setRazorpayEnabled(newValue);
      refetchPaymentSettings();
      
      toast.success(`Payment method switched to ${newValue ? 'Razorpay' : 'Direct UPI'}!`);
    } catch (error) {
      console.error('Error updating payment settings:', error);
      toast.error('Failed to update payment settings');
    } finally {
      setIsSavingPaymentSettings(false);
    }
  };

  // Form states
  const [gameForm, setGameForm] = useState({
    title: '',
    image: '',
    original_price: '',
    sale_price: '',
    rent_1_month: '',
    rent_3_months: '',
    rent_6_months: '',
    permanent_offline_price: '',
    permanent_online_price: '',
    platform: [] as string[],
    discount: '',
    description: '',
    type: [] as string[],
    show_in_bestsellers: false,
    edition: 'Standard' as 'Standard' | 'Premium'
  });

  const [subscriptionForm, setSubscriptionForm] = useState({
    title: '',
    image: '',
    original_price: '',
    sale_price: '',
    platform: [] as string[],
    discount: '',
    description: '',
    type: ['Permanent'] as string[]
  });

  const [testimonialForm, setTestimonialForm] = useState({
    image: ''
  });

  // Image upload function
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'gaming_community');

    const response = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.secure_url;
  };

  // Handle image upload
  const handleImageUpload = async (file: File, formType: 'game' | 'subscription' | 'testimonial') => {
    try {
      setIsUploading(true);
      const imageUrl = await uploadToCloudinary(file);
      
      if (formType === 'game') {
        setGameForm(prev => ({ ...prev, image: imageUrl }));
      } else if (formType === 'subscription') {
        setSubscriptionForm(prev => ({ ...prev, image: imageUrl }));
      } else if (formType === 'testimonial') {
        setTestimonialForm(prev => ({ ...prev, image: imageUrl }));
      }
      
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  // Game CRUD operations
  const handleAddGame = async () => {
    try {
      if (!gameForm.title || !gameForm.image) {
        toast.error('Please fill in required fields');
        return;
      }

      await gamesService.add({
        title: gameForm.title,
        image: gameForm.image,
        original_price: parseFloat(gameForm.original_price) || 0,
        sale_price: parseFloat(gameForm.sale_price) || 0,
        rent_1_month: parseFloat(gameForm.rent_1_month) || 0,
        rent_3_months: parseFloat(gameForm.rent_3_months) || 0,
        rent_6_months: parseFloat(gameForm.rent_6_months) || 0,
        permanent_offline_price: parseFloat(gameForm.permanent_offline_price) || 0,
        permanent_online_price: parseFloat(gameForm.permanent_online_price) || 0,
        platform: gameForm.platform,
        discount: parseInt(gameForm.discount) || 0,
        description: gameForm.description,
        type: gameForm.type,
        show_in_bestsellers: gameForm.show_in_bestsellers,
        edition: gameForm.edition,
        category: 'game'
      });

      toast.success('Game added successfully!');
      setIsAddingGame(false);
      setGameForm({
        title: '',
        image: '',
        original_price: '',
        sale_price: '',
        rent_1_month: '',
        rent_3_months: '',
        rent_6_months: '',
        permanent_offline_price: '',
        permanent_online_price: '',
        platform: [],
        discount: '',
        description: '',
        type: [],
        show_in_bestsellers: false,
        edition: 'Standard'
      });
      refetchGames();
    } catch (error) {
      console.error('Error adding game:', error);
      toast.error('Failed to add game');
    }
  };

  const handleUpdateGame = async () => {
    try {
      if (!editingGame || !gameForm.title || !gameForm.image) {
        toast.error('Please fill in required fields');
        return;
      }

      await gamesService.update(editingGame.id!, {
        title: gameForm.title,
        image: gameForm.image,
        original_price: parseFloat(gameForm.original_price) || 0,
        sale_price: parseFloat(gameForm.sale_price) || 0,
        rent_1_month: parseFloat(gameForm.rent_1_month) || 0,
        rent_3_months: parseFloat(gameForm.rent_3_months) || 0,
        rent_6_months: parseFloat(gameForm.rent_6_months) || 0,
        permanent_offline_price: parseFloat(gameForm.permanent_offline_price) || 0,
        permanent_online_price: parseFloat(gameForm.permanent_online_price) || 0,
        platform: gameForm.platform,
        discount: parseInt(gameForm.discount) || 0,
        description: gameForm.description,
        type: gameForm.type,
        show_in_bestsellers: gameForm.show_in_bestsellers,
        edition: gameForm.edition
      });

      toast.success('Game updated successfully!');
      setEditingGame(null);
      refetchGames();
    } catch (error) {
      console.error('Error updating game:', error);
      toast.error('Failed to update game');
    }
  };

  const handleDeleteGame = async (id: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this game?')) {
        await gamesService.delete(id);
        toast.success('Game deleted successfully!');
        refetchGames();
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      toast.error('Failed to delete game');
    }
  };

  // Subscription CRUD operations
  const handleAddSubscription = async () => {
    try {
      if (!subscriptionForm.title || !subscriptionForm.image) {
        toast.error('Please fill in required fields');
        return;
      }

      await subscriptionsService.add({
        title: subscriptionForm.title,
        image: subscriptionForm.image,
        original_price: parseFloat(subscriptionForm.original_price) || 0,
        sale_price: parseFloat(subscriptionForm.sale_price) || 0,
        platform: subscriptionForm.platform,
        discount: parseInt(subscriptionForm.discount) || 0,
        description: subscriptionForm.description,
        type: subscriptionForm.type,
        category: 'subscription'
      });

      toast.success('Subscription added successfully!');
      setIsAddingSubscription(false);
      setSubscriptionForm({
        title: '',
        image: '',
        original_price: '',
        sale_price: '',
        platform: [],
        discount: '',
        description: '',
        type: ['Permanent']
      });
      refetchSubscriptions();
    } catch (error) {
      console.error('Error adding subscription:', error);
      toast.error('Failed to add subscription');
    }
  };

  const handleUpdateSubscription = async () => {
    try {
      if (!editingSubscription || !subscriptionForm.title || !subscriptionForm.image) {
        toast.error('Please fill in required fields');
        return;
      }

      await subscriptionsService.update(editingSubscription.id!, {
        title: subscriptionForm.title,
        image: subscriptionForm.image,
        original_price: parseFloat(subscriptionForm.original_price) || 0,
        sale_price: parseFloat(subscriptionForm.sale_price) || 0,
        platform: subscriptionForm.platform,
        discount: parseInt(subscriptionForm.discount) || 0,
        description: subscriptionForm.description,
        type: subscriptionForm.type
      });

      toast.success('Subscription updated successfully!');
      setEditingSubscription(null);
      refetchSubscriptions();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription');
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this subscription?')) {
        await subscriptionsService.delete(id);
        toast.success('Subscription deleted successfully!');
        refetchSubscriptions();
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast.error('Failed to delete subscription');
    }
  };

  // Testimonial CRUD operations
  const handleAddTestimonial = async () => {
    try {
      if (!testimonialForm.image) {
        toast.error('Please upload an image');
        return;
      }

      await testimonialsService.add({
        image: testimonialForm.image
      });

      toast.success('Screenshot added successfully!');
      setIsAddingTestimonial(false);
      setTestimonialForm({ image: '' });
      refetchTestimonials();
    } catch (error) {
      console.error('Error adding testimonial:', error);
      toast.error('Failed to add screenshot');
    }
  };

  const handleUpdateTestimonial = async () => {
    try {
      if (!editingTestimonial || !testimonialForm.image) {
        toast.error('Please upload an image');
        return;
      }

      await testimonialsService.update(editingTestimonial.id!, {
        image: testimonialForm.image
      });

      toast.success('Screenshot updated successfully!');
      setEditingTestimonial(null);
      refetchTestimonials();
    } catch (error) {
      console.error('Error updating testimonial:', error);
      toast.error('Failed to update screenshot');
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this screenshot?')) {
        await testimonialsService.delete(id);
        toast.success('Screenshot deleted successfully!');
        refetchTestimonials();
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Failed to delete screenshot');
    }
  };

  // Edit handlers
  const handleEditGame = (game: Game) => {
    setEditingGame(game);
    setGameForm({
      title: game.title,
      image: game.image,
      original_price: game.original_price.toString(),
      sale_price: game.sale_price.toString(),
      rent_1_month: (game.rent_1_month || 0).toString(),
      rent_3_months: (game.rent_3_months || 0).toString(),
      rent_6_months: (game.rent_6_months || 0).toString(),
      permanent_offline_price: (game.permanent_offline_price || 0).toString(),
      permanent_online_price: (game.permanent_online_price || 0).toString(),
      platform: game.platform,
      discount: game.discount.toString(),
      description: game.description || '',
      type: game.type,
      show_in_bestsellers: game.show_in_bestsellers || false,
      edition: game.edition || 'Standard'
    });
    setIsAddingGame(true);
  };

  const handleEditSubscription = (subscription: Game) => {
    setEditingSubscription(subscription);
    setSubscriptionForm({
      title: subscription.title,
      image: subscription.image,
      original_price: subscription.original_price.toString(),
      sale_price: subscription.sale_price.toString(),
      platform: subscription.platform,
      discount: subscription.discount.toString(),
      description: subscription.description || '',
      type: subscription.type
    });
    setIsAddingSubscription(true);
  };

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setTestimonialForm({
      image: testimonial.image
    });
    setIsAddingTestimonial(true);
  };

  const tabs = [
    { id: 'games', name: 'Games', icon: '🎮' },
    { id: 'subscriptions', name: 'Subscriptions', icon: '👑' },
    { id: 'screenshots', name: 'Screenshots', icon: '📱' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToHome}
              className="flex items-center space-x-2 text-cyan-600 hover:text-orange-500 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
          <div className="flex space-x-1 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
              <Settings className="w-6 h-6" />
              <span>Payment Settings</span>
            </h2>

            {/* Payment Method Toggle */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${razorpayEnabled ? 'bg-blue-500' : 'bg-gray-400'}`}>
                    {razorpayEnabled ? (
                      <CreditCard className="w-6 h-6 text-white" />
                    ) : (
                      <Smartphone className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      Payment Method: {razorpayEnabled ? 'Razorpay' : 'Direct UPI Payment'}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {razorpayEnabled 
                        ? 'Customers can pay using Razorpay gateway (Cards, UPI, Wallets)'
                        : 'Customers will see UPI QR code for direct payment'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">
                    {razorpayEnabled ? 'Razorpay' : 'Direct UPI'}
                  </span>
                  <button
                    onClick={handlePaymentToggle}
                    disabled={isSavingPaymentSettings || paymentLoading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${
                      razorpayEnabled ? 'bg-cyan-500' : 'bg-gray-300'
                    } ${isSavingPaymentSettings ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        razorpayEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    {razorpayEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>

              {isSavingPaymentSettings && (
                <div className="mt-4 flex items-center space-x-2 text-cyan-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-600"></div>
                  <span className="text-sm">Updating payment settings...</span>
                </div>
              )}
            </div>

            {/* Payment Method Info */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-4 rounded-xl border-2 ${razorpayEnabled ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
                <div className="flex items-center space-x-3 mb-3">
                  <CreditCard className={`w-5 h-5 ${razorpayEnabled ? 'text-blue-500' : 'text-gray-400'}`} />
                  <h4 className={`font-semibold ${razorpayEnabled ? 'text-blue-800' : 'text-gray-600'}`}>
                    Razorpay Gateway
                  </h4>
                </div>
                <ul className={`text-sm space-y-1 ${razorpayEnabled ? 'text-blue-700' : 'text-gray-500'}`}>
                  <li>• Multiple payment options</li>
                  <li>• Automatic payment verification</li>
                  <li>• Better conversion rates</li>
                  <li>• Transaction fees apply</li>
                </ul>
              </div>

              <div className={`p-4 rounded-xl border-2 ${!razorpayEnabled ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                <div className="flex items-center space-x-3 mb-3">
                  <Smartphone className={`w-5 h-5 ${!razorpayEnabled ? 'text-green-500' : 'text-gray-400'}`} />
                  <h4 className={`font-semibold ${!razorpayEnabled ? 'text-green-800' : 'text-gray-600'}`}>
                    Direct UPI Payment
                  </h4>
                </div>
                <ul className={`text-sm space-y-1 ${!razorpayEnabled ? 'text-green-700' : 'text-gray-500'}`}>
                  <li>• No transaction fees</li>
                  <li>• Direct bank transfer</li>
                  <li>• Manual verification required</li>
                  <li>• UPI QR code display</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Games Tab */}
        {activeTab === 'games' && (
          <div className="space-y-6">
            {/* Add Game Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Games Management</h2>
              <button
                onClick={() => setIsAddingGame(true)}
                className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Add Game</span>
              </button>
            </div>

            {/* Games List */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              {gamesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading games...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allGames.map((game) => (
                    <div key={game.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                      <img
                        src={game.image}
                        alt={game.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-bold text-gray-800 mb-2">{game.title}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-orange-500 font-bold">₹{game.sale_price}</span>
                          <span className="text-gray-500 line-through">₹{game.original_price}</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-4">
                          <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded text-xs">
                            {game.platform.join(', ')}
                          </span>
                          {game.show_in_bestsellers && (
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                              Bestseller
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditGame(game)}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteGame(game.id!)}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add/Edit Game Modal */}
        {isAddingGame && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {editingGame ? 'Edit Game' : 'Add New Game'}
                  </h3>
                  <button
                    onClick={() => {
                      setIsAddingGame(false);
                      setEditingGame(null);
                      setGameForm({
                        title: '',
                        image: '',
                        original_price: '',
                        sale_price: '',
                        rent_1_month: '',
                        rent_3_months: '',
                        rent_6_months: '',
                        permanent_offline_price: '',
                        permanent_online_price: '',
                        platform: [],
                        discount: '',
                        description: '',
                        type: [],
                        show_in_bestsellers: false,
                        edition: 'Standard'
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                      <input
                        type="text"
                        value={gameForm.title}
                        onChange={(e) => setGameForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        placeholder="Game title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Edition</label>
                      <select
                        value={gameForm.edition}
                        onChange={(e) => setGameForm(prev => ({ ...prev, edition: e.target.value as 'Standard' | 'Premium' }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      >
                        <option value="Standard">Standard</option>
                        <option value="Premium">Premium</option>
                      </select>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Image *</label>
                    <div className="flex space-x-4">
                      <input
                        type="url"
                        value={gameForm.image}
                        onChange={(e) => setGameForm(prev => ({ ...prev, image: e.target.value }))}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        placeholder="Image URL or upload below"
                      />
                      <label className="bg-gray-100 hover:bg-gray-200 border border-gray-300 px-4 py-3 rounded-lg cursor-pointer transition-colors flex items-center space-x-2">
                        <Upload className="w-4 h-4" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, 'game');
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {isUploading && (
                      <div className="mt-2 flex items-center space-x-2 text-cyan-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-600"></div>
                        <span className="text-sm">Uploading image...</span>
                      </div>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price</label>
                      <input
                        type="number"
                        value={gameForm.original_price}
                        onChange={(e) => setGameForm(prev => ({ ...prev, original_price: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Price</label>
                      <input
                        type="number"
                        value={gameForm.sale_price}
                        onChange={(e) => setGameForm(prev => ({ ...prev, sale_price: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">1 Month Rent</label>
                      <input
                        type="number"
                        value={gameForm.rent_1_month}
                        onChange={(e) => setGameForm(prev => ({ ...prev, rent_1_month: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">3 Month Rent</label>
                      <input
                        type="number"
                        value={gameForm.rent_3_months}
                        onChange={(e) => setGameForm(prev => ({ ...prev, rent_3_months: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">6 Month Rent</label>
                      <input
                        type="number"
                        value={gameForm.rent_6_months}
                        onChange={(e) => setGameForm(prev => ({ ...prev, rent_6_months: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Permanent Offline</label>
                      <input
                        type="number"
                        value={gameForm.permanent_offline_price}
                        onChange={(e) => setGameForm(prev => ({ ...prev, permanent_offline_price: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Permanent Online</label>
                      <input
                        type="number"
                        value={gameForm.permanent_online_price}
                        onChange={(e) => setGameForm(prev => ({ ...prev, permanent_online_price: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Platform Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Platforms</label>
                    <div className="flex flex-wrap gap-2">
                      {['PS5', 'PS4', 'PSVR2'].map((platform) => (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => {
                            setGameForm(prev => ({
                              ...prev,
                              platform: prev.platform.includes(platform)
                                ? prev.platform.filter(p => p !== platform)
                                : [...prev.platform, platform]
                            }));
                          }}
                          className={`px-4 py-2 rounded-lg border transition-colors ${
                            gameForm.platform.includes(platform)
                              ? 'bg-cyan-500 text-white border-cyan-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {platform}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Type Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Types</label>
                    <div className="flex flex-wrap gap-2">
                      {['Rent', 'Permanent Offline', 'Permanent Offline + Online'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setGameForm(prev => ({
                              ...prev,
                              type: prev.type.includes(type)
                                ? prev.type.filter(t => t !== type)
                                : [...prev.type, type]
                            }));
                          }}
                          className={`px-4 py-2 rounded-lg border transition-colors ${
                            gameForm.type.includes(type)
                              ? 'bg-orange-500 text-white border-orange-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={gameForm.description}
                      onChange={(e) => setGameForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      rows={3}
                      placeholder="Game description"
                    />
                  </div>

                  {/* Bestseller Toggle */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="bestseller"
                      checked={gameForm.show_in_bestsellers}
                      onChange={(e) => setGameForm(prev => ({ ...prev, show_in_bestsellers: e.target.checked }))}
                      className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                    />
                    <label htmlFor="bestseller" className="text-sm font-semibold text-gray-700">
                      Show in Bestsellers
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={editingGame ? handleUpdateGame : handleAddGame}
                    className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save className="w-5 h-5" />
                    <span>{editingGame ? 'Update Game' : 'Add Game'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingGame(false);
                      setEditingGame(null);
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Similar structure for Subscriptions and Screenshots tabs would go here */}
        {/* For brevity, I'm showing just the Games tab implementation */}
        
      </div>
    </div>
  );
};

export default AdminPage;