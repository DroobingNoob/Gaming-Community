import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Upload, X, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAllGames, useSubscriptions, useTestimonials } from '../hooks/useSupabaseData';
import { gamesService, subscriptionsService, testimonialsService } from '../services/supabaseService';
import { Game, Testimonial } from '../config/supabase';

interface AdminPageProps {
  onBackToHome: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome }) => {
  const { allGames, loading: gamesLoading, refetch: refetchGames } = useAllGames();
  const { subscriptions, loading: subscriptionsLoading, refetch: refetchSubscriptions } = useSubscriptions();
  const { testimonials, loading: testimonialsLoading, refetch: refetchTestimonials } = useTestimonials();
  
  const [activeTab, setActiveTab] = useState<'games' | 'subscriptions' | 'testimonials'>('games');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Game | Testimonial | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // Form state for games/subscriptions
  const [formData, setFormData] = useState<Partial<Game>>({
    title: '',
    edition: 'Standard',
    base_game_id: '',
    edition_features: [],
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
    category: 'game',
    show_in_bestsellers: false
  });

  // Form state for testimonials
  const [testimonialData, setTestimonialData] = useState<Partial<Testimonial>>({
    image: ''
  });

  const cloudinaryUploadPreset = 'gaming_community';
  const cloudinaryCloudName = 'YOUR_CLOUD_NAME'; // Replace with your actual cloud name

  const handleImageUpload = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudinaryUploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await handleImageUpload(file);
      
      if (activeTab === 'testimonials') {
        setTestimonialData(prev => ({ ...prev, image: imageUrl }));
      } else {
        setFormData(prev => ({ ...prev, image: imageUrl }));
      }
      
      toast.success('Image uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload image. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      edition: 'Standard',
      base_game_id: '',
      edition_features: [],
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
      category: 'game',
      show_in_bestsellers: false
    });
    setTestimonialData({ image: '' });
    setEditingItem(null);
  };

  const openModal = (item?: Game | Testimonial) => {
    if (item) {
      setEditingItem(item);
      if ('title' in item) {
        setFormData(item);
      } else {
        setTestimonialData(item);
      }
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (activeTab === 'testimonials') {
        if (!testimonialData.image) {
          toast.error('Please provide an image');
          return;
        }

        if (editingItem && 'image' in editingItem) {
          await testimonialsService.update(editingItem.id!, testimonialData);
          toast.success('Screenshot updated successfully!');
        } else {
          await testimonialsService.add(testimonialData as Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>);
          toast.success('Screenshot added successfully!');
        }
        await refetchTestimonials();
      } else {
        // Validate required fields
        if (!formData.title || !formData.image || formData.platform.length === 0 || formData.type.length === 0) {
          toast.error('Please fill in all required fields');
          return;
        }

        const gameData = {
          ...formData,
          category: activeTab === 'games' ? 'game' as const : 'subscription' as const
        };

        if (editingItem && 'title' in editingItem) {
          if (activeTab === 'games') {
            await gamesService.update(editingItem.id!, gameData);
          } else {
            await subscriptionsService.update(editingItem.id!, gameData);
          }
          toast.success(`${activeTab === 'games' ? 'Game' : 'Subscription'} updated successfully!`);
        } else {
          if (activeTab === 'games') {
            await gamesService.add(gameData);
          } else {
            await subscriptionsService.add(gameData);
          }
          toast.success(`${activeTab === 'games' ? 'Game' : 'Subscription'} added successfully!`);
        }
        
        if (activeTab === 'games') {
          await refetchGames();
        } else {
          await refetchSubscriptions();
        }
      }
      
      closeModal();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save item. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      if (activeTab === 'testimonials') {
        await testimonialsService.delete(id);
        await refetchTestimonials();
        toast.success('Screenshot deleted successfully!');
      } else if (activeTab === 'games') {
        await gamesService.delete(id);
        await refetchGames();
        toast.success('Game deleted successfully!');
      } else {
        await subscriptionsService.delete(id);
        await refetchSubscriptions();
        toast.success('Subscription deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item. Please try again.');
    }
  };

  const handleArrayInput = (field: 'platform' | 'type' | 'edition_features', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  const isLoading = gamesLoading || subscriptionsLoading || testimonialsLoading;

  const getCurrentData = () => {
    switch (activeTab) {
      case 'games':
        return allGames;
      case 'subscriptions':
        return subscriptions;
      case 'testimonials':
        return testimonials;
      default:
        return [];
    }
  };

  const getAvailableBaseGames = () => {
    return allGames.filter(game => game.edition === 'Standard').map(game => ({
      id: game.id!,
      title: game.title
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={onBackToHome}
              className="flex items-center space-x-1 sm:space-x-2 text-cyan-600 hover:text-orange-500 transition-colors bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-lg text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Admin Panel</h1>
          </div>
          
          <button
            onClick={() => setShowPasswords(!showPasswords)}
            className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-full transition-colors shadow-lg text-sm sm:text-base"
          >
            {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showPasswords ? 'Hide' : 'Show'} Sensitive Data</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 py-4">
              {[
                { id: 'games', label: 'Games', count: allGames.length },
                { id: 'subscriptions', label: 'Subscriptions', count: subscriptions.length },
                { id: 'testimonials', label: 'Screenshots', count: testimonials.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-cyan-400 text-cyan-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Add Button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Manage {activeTab === 'games' ? 'Games' : activeTab === 'subscriptions' ? 'Subscriptions' : 'Customer Screenshots'}
              </h2>
              <button
                onClick={() => openModal()}
                className="flex items-center space-x-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add {activeTab === 'games' ? 'Game' : activeTab === 'subscriptions' ? 'Subscription' : 'Screenshot'}</span>
              </button>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            ) : (
              /* Data Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getCurrentData().map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <img
                      src={item.image}
                      alt={'title' in item ? item.title : 'Screenshot'}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      {'title' in item ? (
                        <>
                          <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{item.title}</h3>
                          {item.edition && item.edition !== 'Standard' && (
                            <span className="inline-block bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-1 rounded-full text-xs font-medium mb-2">
                              {item.edition} Edition
                            </span>
                          )}
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg font-bold text-orange-500">₹{item.sale_price}</span>
                            {item.original_price > item.sale_price && (
                              <span className="text-sm text-gray-500 line-through">₹{item.original_price}</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.platform.map((platform, index) => (
                              <span key={index} className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded text-xs">
                                {platform}
                              </span>
                            ))}
                          </div>
                          {item.show_in_bestsellers && (
                            <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                              Bestseller
                            </span>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-600 text-sm">Customer Screenshot</p>
                      )}
                      
                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={() => openModal(item)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id!)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
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
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingItem ? 'Edit' : 'Add'} {activeTab === 'games' ? 'Game' : activeTab === 'subscriptions' ? 'Subscription' : 'Screenshot'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {activeTab === 'testimonials' ? (
                  /* Testimonial Form */
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Screenshot Image *
                      </label>
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          disabled={isUploading}
                        />
                        <input
                          type="url"
                          placeholder="Or paste image URL"
                          value={testimonialData.image || ''}
                          onChange={(e) => setTestimonialData(prev => ({ ...prev, image: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          disabled={isUploading}
                        />
                        {isUploading && (
                          <div className="flex items-center space-x-2 text-blue-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span>Uploading...</span>
                          </div>
                        )}
                      </div>
                      {testimonialData.image && (
                        <img
                          src={testimonialData.image}
                          alt="Preview"
                          className="mt-2 w-32 h-32 object-cover rounded-lg border border-gray-300"
                        />
                      )}
                    </div>
                  </>
                ) : (
                  /* Game/Subscription Form */
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                        <input
                          type="text"
                          value={formData.title || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Edition</label>
                        <select
                          value={formData.edition || 'Standard'}
                          onChange={(e) => setFormData(prev => ({ ...prev, edition: e.target.value as 'Standard' | 'Premium' | 'Deluxe' }))}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        >
                          <option value="Standard">Standard</option>
                          <option value="Premium">Premium</option>
                          <option value="Deluxe">Deluxe</option>
                        </select>
                      </div>
                    </div>

                    {formData.edition !== 'Standard' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Base Game</label>
                          <select
                            value={formData.base_game_id || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, base_game_id: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          >
                            <option value="">Select base game...</option>
                            {getAvailableBaseGames().map((game) => (
                              <option key={game.id} value={game.id}>
                                {game.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Edition Features</label>
                          <input
                            type="text"
                            placeholder="Feature 1, Feature 2, Feature 3"
                            value={formData.edition_features?.join(', ') || ''}
                            onChange={(e) => handleArrayInput('edition_features', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                          <p className="text-xs text-gray-500 mt-1">Separate features with commas</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Image *</label>
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          disabled={isUploading}
                        />
                        <input
                          type="url"
                          placeholder="Or paste image URL"
                          value={formData.image || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          disabled={isUploading}
                          required
                        />
                        {isUploading && (
                          <div className="flex items-center space-x-2 text-blue-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span>Uploading...</span>
                          </div>
                        )}
                      </div>
                      {formData.image && (
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="mt-2 w-32 h-32 object-cover rounded-lg border border-gray-300"
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.original_price || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, original_price: parseFloat(e.target.value) || 0 }))}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Price *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.sale_price || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, sale_price: parseFloat(e.target.value) || 0 }))}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Discount %</label>
                        <input
                          type="number"
                          value={formData.discount || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, discount: parseInt(e.target.value) || 0 }))}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                      </div>
                    </div>

                    {activeTab === 'games' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">1 Month Rent</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.rent_1_month || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, rent_1_month: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">3 Months Rent</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.rent_3_months || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, rent_3_months: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">6 Months Rent</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.rent_6_months || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, rent_6_months: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === 'games' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Permanent Offline Price</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.permanent_offline_price || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, permanent_offline_price: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Permanent Online Price</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.permanent_online_price || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, permanent_online_price: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Platforms *</label>
                        <input
                          type="text"
                          placeholder="PS5, PS4, Xbox"
                          value={formData.platform?.join(', ') || ''}
                          onChange={(e) => handleArrayInput('platform', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Separate platforms with commas</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Types *</label>
                        <input
                          type="text"
                          placeholder="Rent, Permanent Offline, Permanent Offline + Online"
                          value={formData.type?.join(', ') || ''}
                          onChange={(e) => handleArrayInput('type', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Separate types with commas</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.show_in_bestsellers || false}
                          onChange={(e) => setFormData(prev => ({ ...prev, show_in_bestsellers: e.target.checked }))}
                          className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Show in Bestsellers</span>
                      </label>
                    </div>
                  </>
                )}

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingItem ? 'Update' : 'Add'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;