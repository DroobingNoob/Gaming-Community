import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Upload, Save, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTestimonials, useAllGames } from '../hooks/useSupabaseData';
import { gamesService, subscriptionsService, testimonialsService } from '../services/supabaseService';
import { Game, Testimonial } from '../config/supabase';

interface AdminPageProps {
  onBackToHome: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome }) => {
  const [activeTab, setActiveTab] = useState<'games' | 'subscriptions' | 'screenshots'>('games');
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [isAddingSubscription, setIsAddingSubscription] = useState(false);
  const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState(false);
  const [isAddingScreenshot, setIsAddingScreenshot] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<Game | null>(null);
  const [editingScreenshot, setEditingScreenshot] = useState<Testimonial | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['PS5']);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch data using hooks
  const { allGames, loading: gamesLoading, error: gamesError, refetch: refetchGames } = useAllGames();
  const { testimonials, loading: testimonialsLoading, error: testimonialsError, refetch: refetchTestimonials } = useTestimonials();

  // Debug logging
  useEffect(() => {
    console.log('AdminPage - Testimonials data:', {
      testimonials,
      loading: testimonialsLoading,
      error: testimonialsError,
      count: testimonials?.length || 0
    });
  }, [testimonials, testimonialsLoading, testimonialsError]);

  // Form states
  const [gameForm, setGameForm] = useState<Partial<Game>>({
    title: '',
    image: '',
    original_price: 0,
    sale_price: 0,
    rent_1_month: 0,
    rent_3_months: 0,
    rent_6_months: 0,
    permanent_offline_price: 0,
    permanent_online_price: 0,
    platform: ['PS5'],
    description: '',
    type: ['Rent'],
    show_in_bestsellers: false,
    is_recommended: false,
    edition: 'Standard',
    edition_features: []
  });

  const [subscriptionForm, setSubscriptionForm] = useState<Partial<Game>>({
    title: '',
    image: '',
    rent_1_month: 0,
    rent_3_months: 0,
    rent_6_months: 0,
    rent_12_months: 0,
    discount: 0,
    description: '',
    type: ['Rent'],
    category: 'subscription'
  });

  const [screenshotForm, setScreenshotForm] = useState<Partial<Testimonial>>({
    image: ''
  });

  // Cloudinary upload function
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'gaming_community');

    const response = await fetch(
      'https://api.cloudinary.com/v1_1/dcodirzsc/image/upload',
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.secure_url;
  };

  // Handle image upload
  const handleImageUpload = async (file: File, formType: 'game' | 'subscription' | 'screenshot') => {
    try {
      setUploadingImage(true);
      const imageUrl = await uploadToCloudinary(file);
      
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
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Game CRUD operations
  const handleAddGame = async () => {
    try {
      if (!gameForm.title || !gameForm.image) {
        toast.error('Please fill in all required fields');
        return;
      }

      await gamesService.add(gameForm as Omit<Game, 'id' | 'created_at' | 'updated_at'>);
      toast.success('Game added successfully!');
      setGameForm({
        title: '',
        image: '',
        original_price: 0,
        sale_price: 0,
        rent_1_month: 0,
        rent_3_months: 0,
        rent_6_months: 0,
        permanent_offline_price: 0,
        permanent_online_price: 0,
        platform: ['PS5'],
        discount: 0,
        description: '',
        type: ['Rent'],
        category: 'game',
        show_in_bestsellers: false,
        edition: 'Standard',
        edition_features: []
      });
      setIsAddingGame(false);
      refetchGames();
    } catch (error) {
      console.error('Error adding game:', error);
      toast.error('Failed to add game');
    }
  };

  const handleUpdateGame = async () => {
    try {
      if (!editingGame?.id) return;

      await gamesService.update(editingGame.id, gameForm);
      toast.success('Game updated successfully!');
      setEditingGame(null);
      setGameForm({
        title: '',
        image: '',
        original_price: 0,
        sale_price: 0,
        rent_1_month: 0,
        rent_3_months: 0,
        rent_6_months: 0,
        permanent_offline_price: 0,
        permanent_online_price: 0,
        platform: ['PS5'],
        discount: 0,
        description: '',
        type: ['Rent'],
        category: 'game',
        show_in_bestsellers: false,
        edition: 'Standard',
        edition_features: []
      });
      refetchGames();
    } catch (error) {
      console.error('Error updating game:', error);
      toast.error('Failed to update game');
    }
  };

  const handleDeleteGame = async (id: string) => {
    if (!confirm('Are you sure you want to delete this game?')) return;

    try {
      await gamesService.delete(id);
      toast.success('Game deleted successfully!');
      refetchGames();
    } catch (error) {
      console.error('Error deleting game:', error);
      toast.error('Failed to delete game');
    }
  };

  // Subscription CRUD operations
  const handleAddSubscription = async () => {
    try {
      if (!subscriptionForm.title || !subscriptionForm.image) {
        toast.error('Please fill in all required fields');
        return;
      }

      await subscriptionsService.add(subscriptionForm as Omit<Game, 'id' | 'created_at' | 'updated_at'>);
      toast.success('Subscription added successfully!');
      setSubscriptionForm({
        title: '',
        image: '',
        rent_1_month: 0,
        rent_3_months: 0,
        rent_6_months: 0,
        rent_12_months: 0,
        discount: 0,
        description: '',
        type: ['Rent'],
        category: 'subscription'
      });
      setIsAddingSubscription(false);
      // Note: You might want to add a refetch for subscriptions here
    } catch (error) {
      console.error('Error adding subscription:', error);
      toast.error('Failed to add subscription');
    }
  };

  // Screenshot CRUD operations
  const handleAddScreenshot = async () => {
    try {
      if (!screenshotForm.image) {
        toast.error('Please upload an image');
        return;
      }

      console.log('Adding screenshot with data:', screenshotForm);
      await testimonialsService.add(screenshotForm as Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>);
      toast.success('Screenshot added successfully!');
      setScreenshotForm({ image: '' });
      setIsAddingScreenshot(false);
      refetchTestimonials(); // This should trigger a re-fetch
    } catch (error) {
      console.error('Error adding screenshot:', error);
      toast.error('Failed to add screenshot');
    }
  };

  const handleUpdateScreenshot = async () => {
    try {
      if (!editingScreenshot?.id) return;

      console.log('Updating screenshot:', editingScreenshot.id, screenshotForm);
      await testimonialsService.update(editingScreenshot.id, screenshotForm);
      toast.success('Screenshot updated successfully!');
      setEditingScreenshot(null);
      setScreenshotForm({ image: '' });
      refetchTestimonials(); // This should trigger a re-fetch
    } catch (error) {
      console.error('Error updating screenshot:', error);
      toast.error('Failed to update screenshot');
    }
  };

  const handleDeleteScreenshot = async (id: string) => {
    if (!confirm('Are you sure you want to delete this screenshot?')) return;

    try {
      console.log('Deleting screenshot:', id);
      await testimonialsService.delete(id);
      toast.success('Screenshot deleted successfully!');
      refetchTestimonials(); // This should trigger a re-fetch
    } catch (error) {
      console.error('Error deleting screenshot:', error);
      toast.error('Failed to delete screenshot');
    }
  };

  const startEditingGame = (game: Game) => {
    setEditingGame(game);
    setIsGameModalOpen(true);
    setGameForm(game);
  };

  const startEditingScreenshot = (screenshot: Testimonial) => {
    console.log('Starting to edit screenshot:', screenshot);
    setEditingScreenshot(screenshot);
    setScreenshotForm(screenshot);
  };

  const cancelEditing = () => {
    setEditingGame(null);
    setEditingSubscription(null);
    setEditingScreenshot(null);
    setGameForm({
      title: '',
      image: '',
      original_price: 0,
      sale_price: 0,
      rent_1_month: 0,
      rent_3_months: 0,
      rent_6_months: 0,
      permanent_offline_price: 0,
      permanent_online_price: 0,
      platform: ['PS5'],
      description: '',
      type: ['Rent'],
      show_in_bestsellers: false,
      is_recommended: false,
      edition: 'Standard',
      edition_features: []
    });
    setSelectedPlatforms(['PS5']);
    setSubscriptionForm({
      title: '',
      image: '',
      rent_1_month: 0,
      rent_3_months: 0,
      rent_6_months: 0,
      rent_12_months: 0,
      discount: 0,
      description: '',
      type: ['Rent'],
      category: 'subscription'
    });
    setScreenshotForm({ image: '' });
  };

  // Render screenshots section
  const renderScreenshotsSection = () => {
    console.log('Rendering screenshots section with data:', {
      testimonials,
      loading: testimonialsLoading,
      error: testimonialsError,
      count: testimonials?.length || 0
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Upload Screenshots</h3>
          <button
            onClick={() => setIsAddingScreenshot(true)}
            className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Screenshot</span>
          </button>
        </div>

        {/* Debug Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">Debug Information:</h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>Loading: {testimonialsLoading ? 'Yes' : 'No'}</p>
            <p>Error: {testimonialsError || 'None'}</p>
            <p>Testimonials Count: {testimonials?.length || 0}</p>
            <p>Testimonials Data: {JSON.stringify(testimonials?.slice(0, 2) || [], null, 2)}</p>
          </div>
        </div>

        {/* Loading State */}
        {testimonialsLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading screenshots...</p>
          </div>
        )}

        {/* Error State */}
        {testimonialsError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Error loading screenshots: {testimonialsError}</p>
            <button
              onClick={refetchTestimonials}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Screenshots Grid */}
        {!testimonialsLoading && !testimonialsError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials && testimonials.length > 0 ? (
              testimonials.map((screenshot) => (
                <div key={screenshot.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  <div className="aspect-[9/16] relative">
                    <img
                      src={screenshot.image}
                      alt="Customer screenshot"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {screenshot.created_at ? new Date(screenshot.created_at).toLocaleDateString() : 'No date'}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditingScreenshot(screenshot)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteScreenshot(screenshot.id!)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No screenshots found</p>
                <p className="text-sm text-gray-500 mt-2">Add your first customer screenshot to get started</p>
              </div>
            )}
          </div>
        )}

        {/* Add Screenshot Modal */}
        {isAddingScreenshot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Add New Screenshot</h3>
                <button
                  onClick={() => {
                    setIsAddingScreenshot(false);
                    setScreenshotForm({ image: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Screenshot Image <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {screenshotForm.image ? (
                      <div className="space-y-4">
                        <img
                          src={screenshotForm.image}
                          alt="Preview"
                          className="w-32 h-56 object-cover mx-auto rounded-lg"
                        />
                        <button
                          onClick={() => setScreenshotForm(prev => ({ ...prev, image: '' }))}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 mb-2">Upload screenshot image</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, 'screenshot');
                          }}
                          className="hidden"
                          id="screenshot-upload"
                          disabled={uploadingImage}
                        />
                        <label
                          htmlFor="screenshot-upload"
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer inline-flex items-center space-x-2 disabled:opacity-50"
                        >
                          {uploadingImage ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              <span>Choose File</span>
                            </>
                          )}
                        </label>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: Portrait orientation (9:16 aspect ratio) for phone screenshots
                  </p>
                </div>

                {/* Manual URL Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Or paste image URL
                  </label>
                  <input
                    type="url"
                    value={screenshotForm.image || ''}
                    onChange={(e) => setScreenshotForm(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setIsAddingScreenshot(false);
                      setScreenshotForm({ image: '' });
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddScreenshot}
                    disabled={!screenshotForm.image || uploadingImage}
                    className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Add Screenshot</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Screenshot Modal */}
        {editingScreenshot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Edit Screenshot</h3>
                <button
                  onClick={cancelEditing}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Current Image Preview */}
                {screenshotForm.image && (
                  <div className="text-center">
                    <img
                      src={screenshotForm.image}
                      alt="Current screenshot"
                      className="w-32 h-56 object-cover mx-auto rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Replace Screenshot Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-2">Upload new screenshot</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'screenshot');
                      }}
                      className="hidden"
                      id="edit-screenshot-upload"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="edit-screenshot-upload"
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer inline-flex items-center space-x-2"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Choose New File</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Manual URL Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Or paste new image URL
                  </label>
                  <input
                    type="url"
                    value={screenshotForm.image || ''}
                    onChange={(e) => setScreenshotForm(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={cancelEditing}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateScreenshot}
                    disabled={!screenshotForm.image || uploadingImage}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Update Screenshot</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Admin Panel
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'games', label: 'Games', count: allGames?.length || 0 },
              { id: 'subscriptions', label: 'Subscriptions', count: 0 },
              { id: 'screenshots', label: 'Screenshots', count: testimonials?.length || 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-cyan-600 border-b-2 border-cyan-400 bg-cyan-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'screenshots' && renderScreenshotsSection()}
            {activeTab === 'games' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">Manage Games</h3>
                  <button
                    onClick={() => setIsAddingGame(true)}
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Game</span>
                  </button>
                </div>

                {/* Loading State */}
                {gamesLoading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading games...</p>
                  </div>
                )}

                {/* Error State */}
                {gamesError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">Error loading games: {gamesError}</p>
                    <button
                      onClick={refetchGames}
                      className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Games Grid */}
                {!gamesLoading && !gamesError && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allGames && allGames.length > 0 ? (
                      allGames.map((game) => (
                        <div key={game.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                          <div className="aspect-square relative">
                            <img
                              src={game.image}
                              alt={game.title}
                              className="w-full h-full object-cover"
                            />
                            {game.discount > 0 && (
                              <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                -{game.discount}%
                              </div>
                            )}
                            <div className="absolute top-2 right-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                              {game.platform.join(', ')}
                            </div>
                          </div>
                          <div className="p-4">
                            <h4 className="font-bold text-gray-800 mb-2 line-clamp-2">{game.title}</h4>
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="text-orange-500 font-bold">₹{game.rent_1_month || game.sale_price}</span>
                              {game.original_price > (game.rent_1_month || game.sale_price) && (
                                <span className="text-gray-500 line-through text-sm">₹{game.original_price}</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                {game.created_at ? new Date(game.created_at).toLocaleDateString() : 'No date'}
                              </span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => startEditingGame(game)}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteGame(game.id!)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8">
                        <div className="w-12 h-12 text-gray-400 mx-auto mb-4">🎮</div>
                        <p className="text-gray-600">No games found</p>
                        <p className="text-sm text-gray-500 mt-2">Add your first game to get started</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Add Game Modal */}
                {isAddingGame && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800">Add New Game</h3>
                        <button
                          onClick={() => {
                            setIsAddingGame(false);
                            setGameForm({
                              title: '',
                              image: '',
                              original_price: 0,
                              sale_price: 0,
                              rent_1_month: 0,
                              rent_3_months: 0,
                              rent_6_months: 0,
                              permanent_offline_price: 0,
                              permanent_online_price: 0,
                              platform: ['PS5'],
                              discount: 0,
                              description: '',
                              type: ['Rent'],
                              category: 'game',
                              show_in_bestsellers: false,
                              edition: 'Standard',
                              edition_features: []
                            });
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Title <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={gameForm.title || ''}
                              onChange={(e) => setGameForm(prev => ({ ...prev, title: e.target.value }))}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                              placeholder="Game title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Platform
                            </label>
                            <select
                              value={gameForm.platform?.[0] || 'PS5'}
                              onChange={(e) => setGameForm(prev => ({ ...prev, platform: [e.target.value] }))}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            >
                              <option value="PS5">PlayStation 5</option>
                              <option value="PS4">PlayStation 4</option>
                              <option value="PSVR2">PlayStation VR 2</option>
                            </select>
                          </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Image <span className="text-red-500">*</span>
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            {gameForm.image ? (
                              <div className="space-y-4">
                                <img
                                  src={gameForm.image}
                                  alt="Preview"
                                  className="w-32 h-32 object-cover mx-auto rounded-lg"
                                />
                                <button
                                  onClick={() => setGameForm(prev => ({ ...prev, image: '' }))}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Remove Image
                                </button>
                              </div>
                            ) : (
                              <div>
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600 mb-2">Upload game image</p>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(file, 'game');
                                  }}
                                  className="hidden"
                                  id="game-upload"
                                  disabled={uploadingImage}
                                />
                                <label
                                  htmlFor="game-upload"
                                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer inline-flex items-center space-x-2"
                                >
                                  {uploadingImage ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      <span>Uploading...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-4 h-4" />
                                      <span>Choose File</span>
                                    </>
                                  )}
                                </label>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Pricing Options */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-4">Pricing Options</h4>
                          
                          {/* Original Price */}
                          <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Original Price (₹)
                            </label>
                            <input
                              type="number"
                              value={gameForm.original_price || ''}
                              onChange={(e) => setGameForm(prev => ({ ...prev, original_price: parseFloat(e.target.value) || 0 }))}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                              placeholder="0"
                              min="0"
                              step="0.01"
                            />
                          </div>

                          {/* Rental Prices */}
                          <div className="mb-6">
                            <h5 className="text-md font-semibold text-gray-700 mb-3">Rental Prices</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">1 Month (₹)</label>
                                <input
                                  type="number"
                                  value={gameForm.rent_1_month || ''}
                                  onChange={(e) => setGameForm(prev => ({ ...prev, rent_1_month: parseFloat(e.target.value) || 0 }))}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">3 Months (₹)</label>
                                <input
                                  type="number"
                                  value={gameForm.rent_3_months || ''}
                                  onChange={(e) => setGameForm(prev => ({ ...prev, rent_3_months: parseFloat(e.target.value) || 0 }))}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">6 Months (₹)</label>
                                <input
                                  type="number"
                                  value={gameForm.rent_6_months || ''}
                                  onChange={(e) => setGameForm(prev => ({ ...prev, rent_6_months: parseFloat(e.target.value) || 0 }))}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">12 Months (₹)</label>
                                <input
                                  type="number"
                                  value={gameForm.rent_12_months || ''}
                                  onChange={(e) => setGameForm(prev => ({ ...prev, rent_12_months: parseFloat(e.target.value) || 0 }))}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Permanent Prices */}
                          <div className="mb-6">
                            <h5 className="text-md font-semibold text-gray-700 mb-3">Permanent Prices</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Offline Only (₹)</label>
                                <input
                                  type="number"
                                  value={gameForm.permanent_offline_price || ''}
                                  onChange={(e) => setGameForm(prev => ({ ...prev, permanent_offline_price: parseFloat(e.target.value) || 0 }))}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Online + Offline (₹)</label>
                                <input
                                  type="number"
                                  value={gameForm.permanent_online_price || ''}
                                  onChange={(e) => setGameForm(prev => ({ ...prev, permanent_online_price: parseFloat(e.target.value) || 0 }))}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            value={gameForm.description || ''}
                            onChange={(e) => setGameForm(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            rows={4}
                            placeholder="Game description"
                          />
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Edition
                            </label>
                            <select
                              value={gameForm.edition || 'Standard'}
                              onChange={(e) => setGameForm(prev => ({ ...prev, edition: e.target.value as 'Standard' | 'Premium' }))}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            >
                              <option value="Standard">Standard</option>
                              <option value="Premium">Premium</option>
                            </select>
                          </div>
                          <div className="flex items-center space-x-4 pt-8">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={gameForm.show_in_bestsellers || false}
                                onChange={(e) => setGameForm(prev => ({ ...prev, show_in_bestsellers: e.target.checked }))}
                                className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-400"
                              />
                              <span className="text-sm font-medium text-gray-700">Show in Bestsellers</span>
                            </label>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3 pt-4">
                          <button
                            onClick={() => {
                              setIsAddingGame(false);
                              setGameForm({
                                title: '',
                                image: '',
                                original_price: 0,
                                sale_price: 0,
                                rent_1_month: 0,
                                rent_3_months: 0,
                                rent_6_months: 0,
                                permanent_offline_price: 0,
                                permanent_online_price: 0,
                                platform: ['PS5'],
                                discount: 0,
                                description: '',
                                type: ['Rent'],
                                category: 'game',
                                show_in_bestsellers: false,
                                edition: 'Standard',
                                edition_features: []
                              });
                            }}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddGame}
                            disabled={!gameForm.title || !gameForm.image || uploadingImage}
                            className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                          >
                            <Save className="w-4 h-4" />
                            <span>Add Game</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit Game Modal */}
                {editingGame && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800">Edit Game</h3>
                        <button
                          onClick={cancelEditing}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Title <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={gameForm.title || ''}
                              onChange={(e) => setGameForm(prev => ({ ...prev, title: e.target.value }))}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                              placeholder="Game title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Platform
                            </label>
                            <select
                              value={gameForm.platform?.[0] || 'PS5'}
                              onChange={(e) => setGameForm(prev => ({ ...prev, platform: [e.target.value] }))}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            >
                              <option value="PS5">PlayStation 5</option>
                              <option value="PS4">PlayStation 4</option>
                              <option value="PSVR2">PlayStation VR 2</option>
                            </select>
                          </div>
                        </div>

                        {/* Current Image Preview */}
                        {gameForm.image && (
                          <div className="text-center">
                            <img
                              src={gameForm.image}
                              alt="Current game image"
                              className="w-32 h-32 object-cover mx-auto rounded-lg border border-gray-200"
                            />
                          </div>
                        )}

                        {/* Image Upload */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Replace Game Image
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 mb-2">Upload new game image</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file, 'game');
                              }}
                              className="hidden"
                              id="edit-game-upload"
                              disabled={uploadingImage}
                            />
                            <label
                              htmlFor="edit-game-upload"
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer inline-flex items-center space-x-2"
                            >
                              {uploadingImage ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4" />
                                  <span>Choose New File</span>
                                </>
                              )}
                            </label>
                          </div>
                        </div>

                        {/* Pricing Options */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-4">Pricing Options</h4>
                          
                          {/* Original Price */}
                          <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Original Price (₹)
                            </label>
                            <input
                              type="number"
                              value={gameForm.original_price || ''}
                              onChange={(e) => setGameForm(prev => ({ ...prev, original_price: parseFloat(e.target.value) || 0 }))}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                              placeholder="0"
                              min="0"
                              step="0.01"
                            />
                          </div>

                          {/* Rental Prices */}
                          <div className="mb-6">
                            <h5 className="text-md font-semibold text-gray-700 mb-3">Rental Prices</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">1 Month (₹)</label>
                                <input
                                  type="number"
                                  value={gameForm.rent_1_month || ''}
                                  onChange={(e) => setGameForm(prev => ({ ...prev, rent_1_month: parseFloat(e.target.value) || 0 }))}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">3 Months (₹)</label>
                                <input
                                  type="number"
                                  value={gameForm.rent_3_months || ''}
                                  onChange={(e) => setGameForm(prev => ({ ...prev, rent_3_months: parseFloat(e.target.value) || 0 }))}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">6 Months (₹)</label>
                                <input
                                  type="number"
                                  value={gameForm.rent_6_months || ''}
                                  onChange={(e) => setGameForm(prev => ({ ...prev, rent_6_months: parseFloat(e.target.value) || 0 }))}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">12 Months (₹)</label>
                                <input
                                  type="number"
                                  value={gameForm.rent_12_months || ''}
                                  onChange={(e) => setGameForm(prev => ({ ...prev, rent_12_months: parseFloat(e.target.value) || 0 }))}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Permanent Prices */}
                          <div className="mb-6">
                            <h5 className="text-md font-semibold text-gray-700 mb-3">Permanent Prices</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Offline Only (₹)</label>
                                <input
                                  type="number"
                                  value={gameForm.permanent_offline_price || ''}
                                  onChange={(e) => setGameForm(prev => ({ ...prev, permanent_offline_price: parseFloat(e.target.value) || 0 }))}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Online + Offline (₹)</label>
                                <input
                                  type="number"
                                  value={gameForm.permanent_online_price || ''}
                                  onChange={(e) => setGameForm(prev => ({ ...prev, permanent_online_price: parseFloat(e.target.value) || 0 }))}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            value={gameForm.description || ''}
                            onChange={(e) => setGameForm(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            rows={4}
                            placeholder="Game description"
                          />
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Edition
                            </label>
                            <select
                              value={gameForm.edition || 'Standard'}
                              onChange={(e) => setGameForm(prev => ({ ...prev, edition: e.target.value as 'Standard' | 'Premium' }))}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            >
                              <option value="Standard">Standard</option>
                              <option value="Premium">Premium</option>
                            </select>
                          </div>
                          <div className="flex items-center space-x-4 pt-8">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={gameForm.show_in_bestsellers || false}
                                onChange={(e) => setGameForm(prev => ({ ...prev, show_in_bestsellers: e.target.checked }))}
                                className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-400"
                              />
                              <span className="text-sm font-medium text-gray-700">Show in Bestsellers</span>
                            </label>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3 pt-4">
                          <button
                            onClick={cancelEditing}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleUpdateGame}
                            disabled={!gameForm.title || !gameForm.image || uploadingImage}
                            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                          >
                            <Save className="w-4 h-4" />
                            <span>Update Game</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'subscriptions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">Manage Subscriptions</h3>
                  <button
                    onClick={() => setIsAddingSubscription(true)}
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Subscription</span>
                  </button>
                </div>

                {/* Add Subscription Modal */}
                {(isAddingSubscription || isSubscriptionModalOpen || editingSubscription) && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-8 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-gray-800">Add New Subscription</h3>
                          <button
                            onClick={() => {
                              setIsAddingSubscription(false);
                              setSubscriptionForm({
                                title: '',
                                image: '',
                                rent_1_month: 0,
                                rent_3_months: 0,
                                rent_6_months: 0,
                                rent_12_months: 0,
                                platform: ['Subscription'],
                                discount: 0,
                                description: '',
                                type: ['Rent'],
                                category: 'subscription'
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
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Title <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={subscriptionForm.title || ''}
                                onChange={(e) => setSubscriptionForm(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                placeholder="Subscription title"
                              />
                            </div>
                          </div>

                          {/* Image Upload */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Image <span className="text-red-500">*</span>
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              {subscriptionForm.image ? (
                                <div className="space-y-4">
                                  <img
                                    src={subscriptionForm.image}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover mx-auto rounded-lg"
                                  />
                                  <button
                                    onClick={() => setSubscriptionForm(prev => ({ ...prev, image: '' }))}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                  >
                                    Remove Image
                                  </button>
                                </div>
                              ) : (
                                <div>
                                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-gray-600 mb-2">Upload subscription image</p>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleImageUpload(file, 'subscription');
                                    }}
                                    className="hidden"
                                    id="subscription-upload"
                                    disabled={uploadingImage}
                                  />
                                  <label
                                    htmlFor="subscription-upload"
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer inline-flex items-center space-x-2"
                                  >
                                    {uploadingImage ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Uploading...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="w-4 h-4" />
                                        <span>Choose File</span>
                                      </>
                                    )}
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Pricing Options */}
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Rental Duration Pricing</h4>
                            <p className="text-sm text-gray-600 mb-4">Set prices for different subscription durations. Leave blank for durations you don't want to offer.</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">1 Month (₹)</label>
                                <input
                                  type="number"
                                  value={subscriptionForm.rent_1_month || ''}
                                  onChange={(e) => setSubscriptionForm(prev => ({ ...prev, rent_1_month: parseFloat(e.target.value) || 0 }))}
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">3 Months (₹)</label>
                                <input
                                  type="number"
                                  value={subscriptionForm.rent_3_months || ''}
                                  onChange={(e) => setSubscriptionForm(prev => ({ ...prev, rent_3_months: parseFloat(e.target.value) || 0 }))}
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">6 Months (₹)</label>
                                <input
                                  type="number"
                                  value={subscriptionForm.rent_6_months || ''}
                                  onChange={(e) => setSubscriptionForm(prev => ({ ...prev, rent_6_months: parseFloat(e.target.value) || 0 }))}
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">12 Months (₹)</label>
                                <input
                                  type="number"
                                  value={subscriptionForm.rent_12_months || ''}
                                  onChange={(e) => setSubscriptionForm(prev => ({ ...prev, rent_12_months: parseFloat(e.target.value) || 0 }))}
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Description
                            </label>
                            <textarea
                              value={subscriptionForm.description || ''}
                              onChange={(e) => setSubscriptionForm(prev => ({ ...prev, description: e.target.value }))}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                              rows={4}
                              placeholder="Subscription description"
                            />
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-3 pt-4">
                            <button
                              onClick={() => {
                                setIsAddingSubscription(false);
                                setSubscriptionForm({
                                  title: '',
                                  image: '',
                                  rent_1_month: 0,
                                  rent_3_months: 0,
                                  rent_6_months: 0,
                                  rent_12_months: 0,
                                  platform: ['Subscription'],
                                  discount: 0,
                                  description: '',
                                  type: ['Rent'],
                                  category: 'subscription'
                                });
                              }}
                              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleAddSubscription}
                              disabled={!subscriptionForm.title || !subscriptionForm.image || uploadingImage || 
                                (!subscriptionForm.rent_1_month && !subscriptionForm.rent_3_months && 
                                 !subscriptionForm.rent_6_months && !subscriptionForm.rent_12_months)}
                              className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                              <Save className="w-4 h-4" />
                              <span>Add Subscription</span>
                            </button>
                          </div>
                          
                          {(!subscriptionForm.rent_1_month && !subscriptionForm.rent_3_months && 
                            !subscriptionForm.rent_6_months && !subscriptionForm.rent_12_months) && (
                            <p className="text-red-600 text-sm text-center">
                              Please set at least one rental duration price
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;