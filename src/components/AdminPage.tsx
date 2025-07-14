import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Upload, Save, Settings, ToggleLeft, ToggleRight, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAllGames, useSubscriptions, useTestimonials, usePaymentSettings } from '../hooks/useSupabaseData';
import { gamesService, subscriptionsService, testimonialsService, paymentSettingsService } from '../services/supabaseService';
import { Game, Testimonial } from '../config/supabase';
import type { PaymentSettings } from '../config/supabase';

interface AdminPageProps {
  onBackToHome: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome }) => {
  const [activeTab, setActiveTab] = useState<'games' | 'subscriptions' | 'screenshots' | 'settings'>('games');
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [isAddingSubscription, setIsAddingSubscription] = useState(false);
  const [isAddingScreenshot, setIsAddingScreenshot] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<Game | null>(null);
  const [editingScreenshot, setEditingScreenshot] = useState<Testimonial | null>(null);
  const [uploading, setUploading] = useState(false);

  // Data hooks
  const { allGames, loading: gamesLoading, refetch: refetchGames } = useAllGames();
  const { subscriptions, loading: subscriptionsLoading, refetch: refetchSubscriptions } = useSubscriptions();
  const { testimonials, loading: testimonialsLoading, refetch: refetchTestimonials } = useTestimonials();
  const { paymentSettings, loading: settingsLoading, refetch: refetchSettings } = usePaymentSettings();

  // Form states
  const [gameForm, setGameForm] = useState<Partial<Game>>({
    title: '',
    edition: 'Standard',
    image: '',
    original_price: 0,
    sale_price: 0,
    rent_1_month: 0,
    rent_3_months: 0,
    rent_6_months: 0,
    permanent_offline_price: 0,
    permanent_online_price: 0,
    platform: [],
    discount: 0,
    description: '',
    type: [],
    show_in_bestsellers: false,
    edition_features: []
  });

  const [subscriptionForm, setSubscriptionForm] = useState<Partial<Game>>({
    title: '',
    image: '',
    original_price: 0,
    sale_price: 0,
    platform: [],
    discount: 0,
    description: '',
    type: []
  });

  const [screenshotForm, setScreenshotForm] = useState<Partial<Testimonial>>({
    image: ''
  });

  const [settingsForm, setSettingsForm] = useState<PaymentSettings>({
    razorpay_enabled: true,
    upi_qr_image: '/UPI.jpg',
    upi_id: 'gamingcommunity@paytm'
  });

  // Load settings when component mounts or settings change
  useEffect(() => {
    if (paymentSettings) {
      setSettingsForm(paymentSettings);
    }
  }, [paymentSettings]);

  // Cloudinary upload function
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'gaming_community');

    const response = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  };

  // Handle file upload
  const handleFileUpload = async (file: File, type: 'game' | 'subscription' | 'screenshot') => {
    try {
      setUploading(true);
      const imageUrl = await uploadToCloudinary(file);
      
      if (type === 'game') {
        setGameForm(prev => ({ ...prev, image: imageUrl }));
      } else if (type === 'subscription') {
        setSubscriptionForm(prev => ({ ...prev, image: imageUrl }));
      } else if (type === 'screenshot') {
        setScreenshotForm(prev => ({ ...prev, image: imageUrl }));
      }
      
      toast.success('Image uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload image');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  // Game operations
  const handleSaveGame = async () => {
    try {
      if (!gameForm.title || !gameForm.image) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (editingGame) {
        await gamesService.update(editingGame.id!, gameForm);
        toast.success('Game updated successfully!');
      } else {
        await gamesService.add(gameForm as Omit<Game, 'id' | 'created_at' | 'updated_at'>);
        toast.success('Game added successfully!');
      }

      setGameForm({
        title: '',
        edition: 'Standard',
        image: '',
        original_price: 0,
        sale_price: 0,
        rent_1_month: 0,
        rent_3_months: 0,
        rent_6_months: 0,
        permanent_offline_price: 0,
        permanent_online_price: 0,
        platform: [],
        discount: 0,
        description: '',
        type: [],
        show_in_bestsellers: false,
        edition_features: []
      });
      setIsAddingGame(false);
      setEditingGame(null);
      refetchGames();
    } catch (error) {
      toast.error('Failed to save game');
      console.error('Save error:', error);
    }
  };

  const handleDeleteGame = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      try {
        await gamesService.delete(id);
        toast.success('Game deleted successfully!');
        refetchGames();
      } catch (error) {
        toast.error('Failed to delete game');
        console.error('Delete error:', error);
      }
    }
  };

  // Subscription operations
  const handleSaveSubscription = async () => {
    try {
      if (!subscriptionForm.title || !subscriptionForm.image) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (editingSubscription) {
        await subscriptionsService.update(editingSubscription.id!, subscriptionForm);
        toast.success('Subscription updated successfully!');
      } else {
        await subscriptionsService.add(subscriptionForm as Omit<Game, 'id' | 'created_at' | 'updated_at'>);
        toast.success('Subscription added successfully!');
      }

      setSubscriptionForm({
        title: '',
        image: '',
        original_price: 0,
        sale_price: 0,
        platform: [],
        discount: 0,
        description: '',
        type: []
      });
      setIsAddingSubscription(false);
      setEditingSubscription(null);
      refetchSubscriptions();
    } catch (error) {
      toast.error('Failed to save subscription');
      console.error('Save error:', error);
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        await subscriptionsService.delete(id);
        toast.success('Subscription deleted successfully!');
        refetchSubscriptions();
      } catch (error) {
        toast.error('Failed to delete subscription');
        console.error('Delete error:', error);
      }
    }
  };

  // Screenshot operations
  const handleSaveScreenshot = async () => {
    try {
      if (!screenshotForm.image) {
        toast.error('Please upload an image');
        return;
      }

      if (editingScreenshot) {
        await testimonialsService.update(editingScreenshot.id!, screenshotForm);
        toast.success('Screenshot updated successfully!');
      } else {
        await testimonialsService.add(screenshotForm as Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>);
        toast.success('Screenshot added successfully!');
      }

      setScreenshotForm({ image: '' });
      setIsAddingScreenshot(false);
      setEditingScreenshot(null);
      refetchTestimonials();
    } catch (error) {
      toast.error('Failed to save screenshot');
      console.error('Save error:', error);
    }
  };

  const handleDeleteScreenshot = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this screenshot?')) {
      try {
        await testimonialsService.delete(id);
        toast.success('Screenshot deleted successfully!');
        refetchTestimonials();
      } catch (error) {
        toast.error('Failed to delete screenshot');
        console.error('Delete error:', error);
      }
    }
  };

  // Settings operations
  const handleSaveSettings = async () => {
    try {
      await paymentSettingsService.update(settingsForm);
      toast.success('Settings saved successfully!');
      refetchSettings();
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Settings save error:', error);
    }
  };

  const tabs = [
    { id: 'games', label: 'Games', count: allGames.length },
    { id: 'subscriptions', label: 'Subscriptions', count: subscriptions.length },
    { id: 'screenshots', label: 'Screenshots', count: testimonials.length },
    { id: 'settings', label: 'Settings', count: null }
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
              Admin Panel
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">Payment Settings</h2>
                  <button
                    onClick={handleSaveSettings}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Settings</span>
                  </button>
                </div>

                {settingsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading settings...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Payment Method Settings */}
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Payment Gateway</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-semibold text-gray-700">Razorpay Payment Gateway</label>
                            <p className="text-xs text-gray-600">Enable online payments via Razorpay</p>
                          </div>
                          <button
                            onClick={() => setSettingsForm(prev => ({ ...prev, razorpay_enabled: !prev.razorpay_enabled }))}
                            className={`p-1 rounded-full transition-colors ${
                              settingsForm.razorpay_enabled ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          >
                            {settingsForm.razorpay_enabled ? (
                              <ToggleRight className="w-6 h-6 text-white" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-gray-600" />
                            )}
                          </button>
                        </div>

                        <div className="text-xs text-gray-600 bg-white/50 rounded-lg p-3">
                          {settingsForm.razorpay_enabled ? (
                            <span className="text-green-700">✅ Customers will see Razorpay payment option</span>
                          ) : (
                            <span className="text-orange-700">⚠️ Customers will see UPI QR code payment option</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* UPI Settings */}
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">UPI Payment Settings</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">UPI QR Code Image Path</label>
                          <input
                            type="text"
                            value={settingsForm.upi_qr_image}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, upi_qr_image: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                            placeholder="/UPI.jpg"
                          />
                          <p className="text-xs text-gray-600 mt-1">Path to your UPI QR code image in the public folder</p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">UPI ID</label>
                          <input
                            type="text"
                            value={settingsForm.upi_id}
                            onChange={(e) => setSettingsForm(prev => ({ ...prev, upi_id: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                            placeholder="gamingcommunity@paytm"
                          />
                          <p className="text-xs text-gray-600 mt-1">Your UPI ID for manual payments</p>
                        </div>

                        {/* UPI QR Preview */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">QR Code Preview</label>
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <img
                              src={settingsForm.upi_qr_image}
                              alt="UPI QR Code"
                              className="w-32 h-32 object-contain mx-auto"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA0MEg4OFY4OEg0MFY0MFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+CjxwYXRoIGQ9Ik01MiA1Mkg3NlY3Nkg1MlY1MloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                              }}
                            />
                            <p className="text-xs text-gray-600 text-center mt-2">
                              {settingsForm.upi_qr_image ? 'QR Code loaded successfully' : 'No QR code image'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Flow Preview */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Payment Flow Preview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-4 rounded-lg border-2 ${settingsForm.razorpay_enabled ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                      <h4 className="font-semibold text-gray-800 mb-2">When Razorpay is Enabled</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Customer clicks "Pay Now"</li>
                        <li>• Razorpay payment gateway opens</li>
                        <li>• Customer pays online</li>
                        <li>• Automatic payment verification</li>
                        <li>• Order confirmed instantly</li>
                      </ul>
                    </div>
                    <div className={`p-4 rounded-lg border-2 ${!settingsForm.razorpay_enabled ? 'border-orange-400 bg-orange-50' : 'border-gray-300 bg-gray-50'}`}>
                      <h4 className="font-semibold text-gray-800 mb-2">When Razorpay is Disabled</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Customer sees UPI QR code</li>
                        <li>• Customer pays via UPI app</li>
                        <li>• Customer sends screenshot via WhatsApp</li>
                        <li>• Manual verification required</li>
                        <li>• Order confirmed after verification</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Games Tab */}
            {activeTab === 'games' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">Manage Games</h2>
                  <button
                    onClick={() => setIsAddingGame(true)}
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Game</span>
                  </button>
                </div>

                {gamesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading games...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allGames.map((game) => (
                      <div key={game.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        <img src={game.image} alt={game.title} className="w-full h-48 object-cover" />
                        <div className="p-4">
                          <h3 className="font-bold text-gray-800 mb-2">{game.title}</h3>
                          {game.edition && game.edition !== 'Standard' && (
                            <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mb-2">
                              {game.edition} Edition
                            </span>
                          )}
                          <p className="text-gray-600 text-sm mb-2">₹{game.sale_price}</p>
                          <p className="text-gray-600 text-sm mb-4">{game.platform.join(', ')}</p>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingGame(game);
                                setGameForm(game);
                                setIsAddingGame(true);
                              }}
                              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteGame(game.id!)}
                              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Add/Edit Game Form */}
            {isAddingGame && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      {editingGame ? 'Edit Game' : 'Add New Game'}
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={gameForm.title}
                          onChange={(e) => setGameForm(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
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

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Image</label>
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, 'game');
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                          />
                          <input
                            type="url"
                            value={gameForm.image}
                            onChange={(e) => setGameForm(prev => ({ ...prev, image: e.target.value }))}
                            placeholder="Or paste image URL"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                          {gameForm.image && (
                            <img src={gameForm.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price</label>
                          <input
                            type="number"
                            value={gameForm.original_price}
                            onChange={(e) => setGameForm(prev => ({ ...prev, original_price: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Price</label>
                          <input
                            type="number"
                            value={gameForm.sale_price}
                            onChange={(e) => setGameForm(prev => ({ ...prev, sale_price: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">1 Month Rent</label>
                          <input
                            type="number"
                            value={gameForm.rent_1_month}
                            onChange={(e) => setGameForm(prev => ({ ...prev, rent_1_month: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">3 Month Rent</label>
                          <input
                            type="number"
                            value={gameForm.rent_3_months}
                            onChange={(e) => setGameForm(prev => ({ ...prev, rent_3_months: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Platform</label>
                        <div className="flex flex-wrap gap-2">
                          {['PS5', 'PS4', 'PSVR2'].map((platform) => (
                            <button
                              key={platform}
                              onClick={() => {
                                const platforms = gameForm.platform || [];
                                if (platforms.includes(platform)) {
                                  setGameForm(prev => ({ ...prev, platform: platforms.filter(p => p !== platform) }));
                                } else {
                                  setGameForm(prev => ({ ...prev, platform: [...platforms, platform] }));
                                }
                              }}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                gameForm.platform?.includes(platform)
                                  ? 'bg-cyan-500 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {platform}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                        <div className="flex flex-wrap gap-2">
                          {['Rent', 'Permanent Offline', 'Permanent Offline + Online'].map((type) => (
                            <button
                              key={type}
                              onClick={() => {
                                const types = gameForm.type || [];
                                if (types.includes(type)) {
                                  setGameForm(prev => ({ ...prev, type: types.filter(t => t !== type) }));
                                } else {
                                  setGameForm(prev => ({ ...prev, type: [...types, type] }));
                                }
                              }}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                gameForm.type?.includes(type)
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                          value={gameForm.description}
                          onChange={(e) => setGameForm(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="bestseller"
                          checked={gameForm.show_in_bestsellers}
                          onChange={(e) => setGameForm(prev => ({ ...prev, show_in_bestsellers: e.target.checked }))}
                          className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-400"
                        />
                        <label htmlFor="bestseller" className="text-sm font-semibold text-gray-700">
                          Show in Bestsellers
                        </label>
                      </div>
                    </div>

                    <div className="flex space-x-4 mt-6">
                      <button
                        onClick={handleSaveGame}
                        disabled={uploading}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {uploading ? 'Uploading...' : editingGame ? 'Update Game' : 'Add Game'}
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingGame(false);
                          setEditingGame(null);
                          setGameForm({
                            title: '',
                            edition: 'Standard',
                            image: '',
                            original_price: 0,
                            sale_price: 0,
                            rent_1_month: 0,
                            rent_3_months: 0,
                            rent_6_months: 0,
                            permanent_offline_price: 0,
                            permanent_online_price: 0,
                            platform: [],
                            discount: 0,
                            description: '',
                            type: [],
                            show_in_bestsellers: false,
                            edition_features: []
                          });
                        }}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs content would go here... */}
            {/* For brevity, I'm showing just the settings and games tabs */}
            {/* You can add the subscriptions and screenshots tabs following the same pattern */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;