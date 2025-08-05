import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Upload, Search, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAllGames, useSubscriptions, useTestimonials } from '../hooks/useSupabaseData';
import { gamesService, subscriptionsService, testimonialsService } from '../services/supabaseService';
import { Game, Testimonial } from '../config/supabase';

interface AdminPageProps {
  onBackToHome: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome }) => {
  const [activeTab, setActiveTab] = useState<'games' | 'subscriptions' | 'screenshots'>('games');
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [isAddingSubscription, setIsAddingSubscription] = useState(false);
  const [isAddingScreenshot, setIsAddingScreenshot] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<Game | null>(null);
  const [editingScreenshot, setEditingScreenshot] = useState<Testimonial | null>(null);
  const [gameSearchQuery, setGameSearchQuery] = useState('');
  const [subscriptionSearchQuery, setSubscriptionSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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
    edition: 'Standard' as 'Standard' | 'Premium',
    base_game_id: '',
    edition_features: [] as string[],
    is_recommended: false
  });

  const [subscriptionForm, setSubscriptionForm] = useState({
    title: '',
    image: '',
    original_price: '',
    sale_price: '',
    platform: [] as string[],
    discount: '',
    description: '',
    type: [] as string[]
  });

  const [screenshotForm, setScreenshotForm] = useState({
    image: ''
  });

  // Fetch data
  const { allGames, loading: gamesLoading, refetch: refetchGames } = useAllGames();
  const { subscriptions, loading: subscriptionsLoading, refetch: refetchSubscriptions } = useSubscriptions();
  const { testimonials, loading: testimonialsLoading, refetch: refetchTestimonials } = useTestimonials();

  // Filter games and subscriptions based on search
  const filteredGames = allGames.filter(game =>
    game.title.toLowerCase().includes(gameSearchQuery.toLowerCase())
  );

  const filteredSubscriptions = subscriptions.filter(subscription =>
    subscription.title.toLowerCase().includes(subscriptionSearchQuery.toLowerCase())
  );

  // Reset forms
  const resetGameForm = () => {
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
      edition: 'Standard',
      base_game_id: '',
      edition_features: [],
      is_recommended: false
    });
  };

  const resetSubscriptionForm = () => {
    setSubscriptionForm({
      title: '',
      image: '',
      original_price: '',
      sale_price: '',
      platform: [],
      discount: '',
      description: '',
      type: []
    });
  };

  const resetScreenshotForm = () => {
    setScreenshotForm({
      image: ''
    });
  };

  // Handle image upload to Cloudinary
  const handleImageUpload = async (file: File, formType: 'game' | 'subscription' | 'screenshot') => {
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'gaming_community');
      
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dcodirzsc/image/upload',
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const imageUrl = data.secure_url;

      // Update the appropriate form
      if (formType === 'game') {
        setGameForm(prev => ({ ...prev, image: imageUrl }));
      } else if (formType === 'subscription') {
        setSubscriptionForm(prev => ({ ...prev, image: imageUrl }));
      } else if (formType === 'screenshot') {
        setScreenshotForm(prev => ({ ...prev, image: imageUrl }));
      }

      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle game operations
  const handleSaveGame = async () => {
    try {
      if (!gameForm.title || !gameForm.image) {
        toast.error('Please fill in all required fields');
        return;
      }

      const gameData = {
        ...gameForm,
        original_price: parseFloat(gameForm.original_price) || 0,
        sale_price: parseFloat(gameForm.sale_price) || 0,
        rent_1_month: parseFloat(gameForm.rent_1_month) || null,
        rent_3_months: parseFloat(gameForm.rent_3_months) || null,
        rent_6_months: parseFloat(gameForm.rent_6_months) || null,
        permanent_offline_price: parseFloat(gameForm.permanent_offline_price) || null,
        permanent_online_price: parseFloat(gameForm.permanent_online_price) || null,
        discount: parseInt(gameForm.discount) || 0,
        edition_features: gameForm.edition_features.filter(f => f.trim() !== '')
      };

      if (editingGame) {
        await gamesService.update(editingGame.id!, gameData);
        toast.success('Game updated successfully!');
        setEditingGame(null);
      } else {
        await gamesService.add(gameData);
        toast.success('Game added successfully!');
        setIsAddingGame(false);
      }

      resetGameForm();
      refetchGames();
    } catch (error) {
      console.error('Error saving game:', error);
      toast.error('Failed to save game. Please try again.');
    }
  };

  const handleDeleteGame = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      try {
        await gamesService.delete(id);
        toast.success('Game deleted successfully!');
        refetchGames();
      } catch (error) {
        console.error('Error deleting game:', error);
        toast.error('Failed to delete game. Please try again.');
      }
    }
  };

  const handleEditGame = (game: Game) => {
    setGameForm({
      title: game.title,
      image: game.image,
      original_price: game.original_price.toString(),
      sale_price: game.sale_price.toString(),
      rent_1_month: game.rent_1_month?.toString() || '',
      rent_3_months: game.rent_3_months?.toString() || '',
      rent_6_months: game.rent_6_months?.toString() || '',
      permanent_offline_price: game.permanent_offline_price?.toString() || '',
      permanent_online_price: game.permanent_online_price?.toString() || '',
      platform: game.platform,
      discount: game.discount.toString(),
      description: game.description || '',
      type: game.type,
      show_in_bestsellers: game.show_in_bestsellers || false,
      edition: game.edition || 'Standard',
      base_game_id: game.base_game_id || '',
      edition_features: game.edition_features || [],
      is_recommended: game.is_recommended || false
    });
    setEditingGame(game);
  };

  // Handle subscription operations
  const handleSaveSubscription = async () => {
    try {
      if (!subscriptionForm.title || !subscriptionForm.image) {
        toast.error('Please fill in all required fields');
        return;
      }

      const subscriptionData = {
        ...subscriptionForm,
        original_price: parseFloat(subscriptionForm.original_price) || 0,
        sale_price: parseFloat(subscriptionForm.sale_price) || 0,
        discount: parseInt(subscriptionForm.discount) || 0
      };

      if (editingSubscription) {
        await subscriptionsService.update(editingSubscription.id!, subscriptionData);
        toast.success('Subscription updated successfully!');
        setEditingSubscription(null);
      } else {
        await subscriptionsService.add(subscriptionData);
        toast.success('Subscription added successfully!');
        setIsAddingSubscription(false);
      }

      resetSubscriptionForm();
      refetchSubscriptions();
    } catch (error) {
      console.error('Error saving subscription:', error);
      toast.error('Failed to save subscription. Please try again.');
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        await subscriptionsService.delete(id);
        toast.success('Subscription deleted successfully!');
        refetchSubscriptions();
      } catch (error) {
        console.error('Error deleting subscription:', error);
        toast.error('Failed to delete subscription. Please try again.');
      }
    }
  };

  const handleEditSubscription = (subscription: Game) => {
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
    setEditingSubscription(subscription);
  };

  // Handle screenshot operations
  const handleSaveScreenshot = async () => {
    try {
      if (!screenshotForm.image) {
        toast.error('Please upload an image');
        return;
      }

      const screenshotData = {
        image: screenshotForm.image
      };

      if (editingScreenshot) {
        await testimonialsService.update(editingScreenshot.id!, screenshotData);
        toast.success('Screenshot updated successfully!');
        setEditingScreenshot(null);
      } else {
        await testimonialsService.add(screenshotData);
        toast.success('Screenshot added successfully!');
        setIsAddingScreenshot(false);
      }

      resetScreenshotForm();
      refetchTestimonials();
    } catch (error) {
      console.error('Error saving screenshot:', error);
      toast.error('Failed to save screenshot. Please try again.');
    }
  };

  const handleDeleteScreenshot = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this screenshot?')) {
      try {
        await testimonialsService.delete(id);
        toast.success('Screenshot deleted successfully!');
        refetchTestimonials();
      } catch (error) {
        console.error('Error deleting screenshot:', error);
        toast.error('Failed to delete screenshot. Please try again.');
      }
    }
  };

  const handleEditScreenshot = (screenshot: Testimonial) => {
    setScreenshotForm({
      image: screenshot.image
    });
    setEditingScreenshot(screenshot);
  };

  // Handle array inputs
  const handleArrayInput = (value: string, field: string, formType: 'game' | 'subscription') => {
    const items = value.split(',').map(item => item.trim()).filter(item => item !== '');
    
    if (formType === 'game') {
      setGameForm(prev => ({ ...prev, [field]: items }));
    } else {
      setSubscriptionForm(prev => ({ ...prev, [field]: items }));
    }
  };

  const handleEditionFeaturesInput = (value: string) => {
    const features = value.split(',').map(feature => feature.trim()).filter(feature => feature !== '');
    setGameForm(prev => ({ ...prev, edition_features: features }));
  };

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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Admin Panel</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('games')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'games'
                  ? 'text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Games ({allGames.length})
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'subscriptions'
                  ? 'text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Subscriptions ({subscriptions.length})
            </button>
            <button
              onClick={() => setActiveTab('screenshots')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'screenshots'
                  ? 'text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Screenshots ({testimonials.length})
            </button>
          </div>
        </div>

        {/* Games Tab */}
        {activeTab === 'games' && (
          <div className="space-y-6">
            {/* Games Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-gray-800">Games Management</h2>
                <button
                  onClick={() => setIsAddingGame(true)}
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Game</span>
                </button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search games..."
                  value={gameSearchQuery}
                  onChange={(e) => setGameSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Games List */}
            {gamesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading games...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGames.map((game) => (
                  <div key={game.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                    <img
                      src={game.image}
                      alt={game.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-2">{game.title}</h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm bg-cyan-100 text-cyan-800 px-2 py-1 rounded">
                          {game.platform.join(', ')}
                        </span>
                        {game.edition && game.edition !== 'Standard' && (
                          <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {game.edition}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{game.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-orange-500">₹{game.sale_price}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditGame(game)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGame(game.id!)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add/Edit Game Form */}
            {(isAddingGame || editingGame) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-800">
                        {editingGame ? 'Edit Game' : 'Add New Game'}
                      </h3>
                      <button
                        onClick={() => {
                          setIsAddingGame(false);
                          setEditingGame(null);
                          resetGameForm();
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Basic Info */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                          <input
                            type="text"
                            value={gameForm.title}
                            onChange={(e) => setGameForm(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            placeholder="Enter game title"
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
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Image *</label>
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file, 'game');
                              }}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            />
                            <input
                              type="url"
                              value={gameForm.image}
                              onChange={(e) => setGameForm(prev => ({ ...prev, image: e.target.value }))}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                              placeholder="Or enter image URL"
                            />
                            {gameForm.image && (
                              <img src={gameForm.image} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                          <textarea
                            value={gameForm.description}
                            onChange={(e) => setGameForm(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            rows={3}
                            placeholder="Enter game description"
                          />
                        </div>
                      </div>

                      {/* Pricing & Details */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price *</label>
                            <input
                              type="number"
                              value={gameForm.original_price}
                              onChange={(e) => setGameForm(prev => ({ ...prev, original_price: e.target.value }))}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Price *</label>
                            <input
                              type="number"
                              value={gameForm.sale_price}
                              onChange={(e) => setGameForm(prev => ({ ...prev, sale_price: e.target.value }))}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
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
                            <label className="block text-sm font-semibold text-gray-700 mb-2">3 Months Rent</label>
                            <input
                              type="number"
                              value={gameForm.rent_3_months}
                              onChange={(e) => setGameForm(prev => ({ ...prev, rent_3_months: e.target.value }))}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">6 Months Rent</label>
                            <input
                              type="number"
                              value={gameForm.rent_6_months}
                              onChange={(e) => setGameForm(prev => ({ ...prev, rent_6_months: e.target.value }))}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Platform (comma-separated)</label>
                          <input
                            type="text"
                            value={gameForm.platform.join(', ')}
                            onChange={(e) => handleArrayInput(e.target.value, 'platform', 'game')}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            placeholder="PS5, PS4, PSVR2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Type (comma-separated)</label>
                          <input
                            type="text"
                            value={gameForm.type.join(', ')}
                            onChange={(e) => handleArrayInput(e.target.value, 'type', 'game')}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            placeholder="Rent, Permanent Offline, Permanent Offline + Online"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Edition Features (comma-separated)</label>
                          <input
                            type="text"
                            value={gameForm.edition_features.join(', ')}
                            onChange={(e) => handleEditionFeaturesInput(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            placeholder="Extra content, Season pass, DLC included"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Discount %</label>
                            <input
                              type="number"
                              value={gameForm.discount}
                              onChange={(e) => setGameForm(prev => ({ ...prev, discount: e.target.value }))}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                              placeholder="0"
                            />
                          </div>
                          <div className="flex items-center">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={gameForm.show_in_bestsellers}
                                onChange={(e) => setGameForm(prev => ({ ...prev, show_in_bestsellers: e.target.checked }))}
                                className="rounded"
                              />
                              <span className="text-sm font-semibold text-gray-700">Bestseller</span>
                            </label>
                          </div>
                          <div className="flex items-center">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={gameForm.is_recommended}
                                onChange={(e) => setGameForm(prev => ({ ...prev, is_recommended: e.target.checked }))}
                                className="rounded"
                              />
                              <span className="text-sm font-semibold text-gray-700">Recommended</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 mt-6">
                      <button
                        onClick={() => {
                          setIsAddingGame(false);
                          setEditingGame(null);
                          resetGameForm();
                        }}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveGame}
                        disabled={isUploading}
                        className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        {isUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save Game</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            {/* Subscriptions Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-gray-800">Subscriptions Management</h2>
                <button
                  onClick={() => setIsAddingSubscription(true)}
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Subscription</span>
                </button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search subscriptions..."
                  value={subscriptionSearchQuery}
                  onChange={(e) => setSubscriptionSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Subscriptions List */}
            {subscriptionsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading subscriptions...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubscriptions.map((subscription) => (
                  <div key={subscription.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                    <img
                      src={subscription.image}
                      alt={subscription.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-2">{subscription.title}</h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm bg-cyan-100 text-cyan-800 px-2 py-1 rounded">
                          {subscription.platform.join(', ')}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{subscription.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-orange-500">₹{subscription.sale_price}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditSubscription(subscription)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubscription(subscription.id!)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add/Edit Subscription Form */}
            {(isAddingSubscription || editingSubscription) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-800">
                        {editingSubscription ? 'Edit Subscription' : 'Add New Subscription'}
                      </h3>
                      <button
                        onClick={() => {
                          setIsAddingSubscription(false);
                          setEditingSubscription(null);
                          resetSubscriptionForm();
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                        <input
                          type="text"
                          value={subscriptionForm.title}
                          onChange={(e) => setSubscriptionForm(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          placeholder="Enter subscription title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Image *</label>
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file, 'subscription');
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                          <input
                            type="url"
                            value={subscriptionForm.image}
                            onChange={(e) => setSubscriptionForm(prev => ({ ...prev, image: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            placeholder="Or enter image URL"
                          />
                          {subscriptionForm.image && (
                            <img src={subscriptionForm.image} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price *</label>
                          <input
                            type="number"
                            value={subscriptionForm.original_price}
                            onChange={(e) => setSubscriptionForm(prev => ({ ...prev, original_price: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Price *</label>
                          <input
                            type="number"
                            value={subscriptionForm.sale_price}
                            onChange={(e) => setSubscriptionForm(prev => ({ ...prev, sale_price: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Platform (comma-separated)</label>
                        <input
                          type="text"
                          value={subscriptionForm.platform.join(', ')}
                          onChange={(e) => handleArrayInput(e.target.value, 'platform', 'subscription')}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          placeholder="PS5, PS4, Xbox"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Type (comma-separated)</label>
                        <input
                          type="text"
                          value={subscriptionForm.type.join(', ')}
                          onChange={(e) => handleArrayInput(e.target.value, 'type', 'subscription')}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          placeholder="Permanent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                          value={subscriptionForm.description}
                          onChange={(e) => setSubscriptionForm(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          rows={3}
                          placeholder="Enter subscription description"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Discount %</label>
                        <input
                          type="number"
                          value={subscriptionForm.discount}
                          onChange={(e) => setSubscriptionForm(prev => ({ ...prev, discount: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 mt-6">
                      <button
                        onClick={() => {
                          setIsAddingSubscription(false);
                          setEditingSubscription(null);
                          resetSubscriptionForm();
                        }}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveSubscription}
                        disabled={isUploading}
                        className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        {isUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save Subscription</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Screenshots Tab */}
        {activeTab === 'screenshots' && (
          <div className="space-y-6">
            {/* Screenshots Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-gray-800">Screenshots Management</h2>
                <button
                  onClick={() => setIsAddingScreenshot(true)}
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Screenshot</span>
                </button>
              </div>
            </div>

            {/* Screenshots List */}
            {testimonialsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading screenshots...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {testimonials.map((screenshot) => (
                  <div key={screenshot.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden group">
                    <div className="relative">
                      <img
                        src={screenshot.image}
                        alt="Customer screenshot"
                        className="w-full aspect-[9/16] object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                          <button
                            onClick={() => handleEditScreenshot(screenshot)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteScreenshot(screenshot.id!)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add/Edit Screenshot Form */}
            {(isAddingScreenshot || editingScreenshot) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-md w-full">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-800">
                        {editingScreenshot ? 'Edit Screenshot' : 'Add New Screenshot'}
                      </h3>
                      <button
                        onClick={() => {
                          setIsAddingScreenshot(false);
                          setEditingScreenshot(null);
                          resetScreenshotForm();
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Screenshot Image *</label>
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file, 'screenshot');
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                          <input
                            type="url"
                            value={screenshotForm.image}
                            onChange={(e) => setScreenshotForm(prev => ({ ...prev, image: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            placeholder="Or enter image URL"
                          />
                          {screenshotForm.image && (
                            <img src={screenshotForm.image} alt="Preview" className="w-full aspect-[9/16] object-cover rounded-lg" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 mt-6">
                      <button
                        onClick={() => {
                          setIsAddingScreenshot(false);
                          setEditingScreenshot(null);
                          resetScreenshotForm();
                        }}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveScreenshot}
                        disabled={isUploading}
                        className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        {isUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save Screenshot</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;