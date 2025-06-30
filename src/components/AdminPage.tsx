import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Upload, X, Save, Eye, EyeOff, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import { Game, Testimonial } from '../config/supabase';
import { gamesService, subscriptionsService, testimonialsService } from '../services/supabaseService';
import { useAllGames, useSubscriptions, useTestimonials } from '../hooks/useSupabaseData';

interface AdminPageProps {
  onBackToHome: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome }) => {
  const { allGames, loading: gamesLoading, refetch: refetchGames } = useAllGames();
  const { subscriptions, loading: subscriptionsLoading, refetch: refetchSubscriptions } = useSubscriptions();
  const { testimonials, loading: testimonialsLoading, refetch: refetchTestimonials } = useTestimonials();

  const [activeTab, setActiveTab] = useState<'games' | 'subscriptions' | 'testimonials'>('games');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Game | Testimonial | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form states
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

  const [testimonialFormData, setTestimonialFormData] = useState<Partial<Testimonial>>({
    image: ''
  });

  const [newFeature, setNewFeature] = useState('');

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
    setNewFeature('');
  };

  const resetTestimonialForm = () => {
    setTestimonialFormData({
      image: ''
    });
  };

  const handleImageUpload = async (file: File, isTestimonial: boolean = false) => {
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'gaming_community');
      
      const response = await fetch('https://api.cloudinary.com/v1_1/dqhbkf8qg/image/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      if (isTestimonial) {
        setTestimonialFormData(prev => ({ ...prev, image: data.secure_url }));
      } else {
        setFormData(prev => ({ ...prev, image: data.secure_url }));
      }
      
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        edition_features: [...(prev.edition_features || []), newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      edition_features: prev.edition_features?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (activeTab === 'testimonials') {
        if (!testimonialFormData.image) {
          toast.error('Please upload an image');
          return;
        }

        if (editingItem) {
          await testimonialsService.update(editingItem.id!, testimonialFormData);
          toast.success('Testimonial updated successfully!');
        } else {
          await testimonialsService.add(testimonialFormData as Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>);
          toast.success('Testimonial added successfully!');
        }
        
        refetchTestimonials();
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        resetTestimonialForm();
      } else {
        // Validate required fields
        if (!formData.title || !formData.image || !formData.platform?.length || !formData.type?.length) {
          toast.error('Please fill in all required fields');
          return;
        }

        // For games with editions, set base_game_id if it's not Standard edition
        let gameData = { ...formData };
        if (activeTab === 'games' && formData.edition !== 'Standard') {
          // Find the Standard edition of the same game title
          const standardEdition = allGames.find(game => 
            game.title === formData.title && game.edition === 'Standard'
          );
          if (standardEdition) {
            gameData.base_game_id = standardEdition.id;
          }
        }

        if (editingItem) {
          if (activeTab === 'games') {
            await gamesService.update(editingItem.id!, gameData);
          } else {
            await subscriptionsService.update(editingItem.id!, gameData);
          }
          toast.success(`${activeTab === 'games' ? 'Game' : 'Subscription'} updated successfully!`);
        } else {
          if (activeTab === 'games') {
            await gamesService.add(gameData as Omit<Game, 'id' | 'created_at' | 'updated_at'>);
          } else {
            await subscriptionsService.add(gameData as Omit<Game, 'id' | 'created_at' | 'updated_at'>);
          }
          toast.success(`${activeTab === 'games' ? 'Game' : 'Subscription'} added successfully!`);
        }
        
        if (activeTab === 'games') {
          refetchGames();
        } else {
          refetchSubscriptions();
        }
        
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save item. Please try again.');
    }
  };

  const handleEdit = (item: Game | Testimonial) => {
    setEditingItem(item);
    
    if (activeTab === 'testimonials') {
      setTestimonialFormData(item as Testimonial);
    } else {
      setFormData(item as Game);
    }
    
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      if (activeTab === 'games') {
        await gamesService.delete(id);
        refetchGames();
      } else if (activeTab === 'subscriptions') {
        await subscriptionsService.delete(id);
        refetchSubscriptions();
      } else {
        await testimonialsService.delete(id);
        refetchTestimonials();
      }
      
      toast.success('Item deleted successfully!');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item. Please try again.');
    }
  };

  const currentData = activeTab === 'games' ? allGames : 
                     activeTab === 'subscriptions' ? subscriptions : 
                     testimonials;
  
  const isLoading = activeTab === 'games' ? gamesLoading : 
                   activeTab === 'subscriptions' ? subscriptionsLoading : 
                   testimonialsLoading;

  // Get unique game titles for base game selection
  const uniqueGameTitles = Array.from(new Set(allGames.map(game => game.title)));

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
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-3 sm:px-4 py-2 rounded-full hover:from-cyan-500 hover:to-blue-600 transition-colors shadow-lg text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Add {activeTab === 'games' ? 'Game' : activeTab === 'subscriptions' ? 'Subscription' : 'Screenshot'}</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 sm:space-x-2 mb-6 sm:mb-8 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg">
          {(['games', 'subscriptions', 'testimonials'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/20">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading {activeTab}...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {currentData.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={activeTab === 'testimonials' ? 'Customer screenshot' : (item as Game).title}
                      className="w-full h-48 object-cover"
                    />
                    {activeTab !== 'testimonials' && (
                      <>
                        {(item as Game).edition && (item as Game).edition !== 'Standard' && (
                          <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            {(item as Game).edition}
                          </div>
                        )}
                        {(item as Game).show_in_bestsellers && (
                          <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-1 rounded-full">
                            <Star className="w-4 h-4" />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="p-4">
                    {activeTab !== 'testimonials' && (
                      <>
                        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{(item as Game).title}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg font-bold text-orange-500">₹{(item as Game).sale_price}</span>
                          {(item as Game).original_price > (item as Game).sale_price && (
                            <span className="text-sm text-gray-500 line-through">₹{(item as Game).original_price}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {(item as Game).platform.map((platform) => (
                            <span key={platform} className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded text-xs">
                              {platform}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id!)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1"
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

        {/* Add/Edit Modal */}
        {(isAddModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {isEditModalOpen ? 'Edit' : 'Add'} {activeTab === 'games' ? 'Game' : activeTab === 'subscriptions' ? 'Subscription' : 'Screenshot'}
                  </h2>
                  <button
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setIsEditModalOpen(false);
                      resetForm();
                      resetTestimonialForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {activeTab === 'testimonials' ? (
                    // Testimonial form
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Screenshot *
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        {testimonialFormData.image ? (
                          <div className="space-y-4">
                            <img
                              src={testimonialFormData.image}
                              alt="Preview"
                              className="max-w-full h-48 object-cover mx-auto rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => setTestimonialFormData(prev => ({ ...prev, image: '' }))}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              Remove Image
                            </button>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">Upload phone screenshot</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file, true);
                              }}
                              className="hidden"
                              id="testimonial-upload"
                              disabled={uploading}
                            />
                            <label
                              htmlFor="testimonial-upload"
                              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors inline-block"
                            >
                              {uploading ? 'Uploading...' : 'Choose File'}
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Game/Subscription form
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            required
                          />
                        </div>

                        {activeTab === 'games' && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Edition</label>
                            <select
                              value={formData.edition}
                              onChange={(e) => setFormData(prev => ({ ...prev, edition: e.target.value as 'Standard' | 'Premium' | 'Deluxe' }))}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            >
                              <option value="Standard">Standard</option>
                              <option value="Premium">Premium</option>
                              <option value="Deluxe">Deluxe</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Edition Features - Only for Premium and Deluxe editions */}
                      {activeTab === 'games' && formData.edition !== 'Standard' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {formData.edition} Edition Features
                          </label>
                          <div className="space-y-2">
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                placeholder="Add a feature..."
                                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                              />
                              <button
                                type="button"
                                onClick={handleAddFeature}
                                className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors"
                              >
                                Add
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.edition_features?.map((feature, index) => (
                                <div key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                                  <span>{feature}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFeature(index)}
                                    className="text-purple-600 hover:text-purple-800"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Image Upload */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Image *</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          {formData.image ? (
                            <div className="space-y-4">
                              <img
                                src={formData.image}
                                alt="Preview"
                                className="max-w-full h-48 object-cover mx-auto rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                Remove Image
                              </button>
                            </div>
                          ) : (
                            <div>
                              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600 mb-4">Upload game image</p>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(file);
                                }}
                                className="hidden"
                                id="image-upload"
                                disabled={uploading}
                              />
                              <label
                                htmlFor="image-upload"
                                className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors inline-block"
                              >
                                {uploading ? 'Uploading...' : 'Choose File'}
                              </label>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price *</label>
                          <input
                            type="number"
                            value={formData.original_price}
                            onChange={(e) => setFormData(prev => ({ ...prev, original_price: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Price *</label>
                          <input
                            type="number"
                            value={formData.sale_price}
                            onChange={(e) => setFormData(prev => ({ ...prev, sale_price: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            required
                          />
                        </div>
                      </div>

                      {/* Rental Pricing - Only for games */}
                      {activeTab === 'games' && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-3">Rental Pricing</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">1 Month Rent</label>
                              <input
                                type="number"
                                value={formData.rent_1_month}
                                onChange={(e) => setFormData(prev => ({ ...prev, rent_1_month: parseFloat(e.target.value) || 0 }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">3 Months Rent</label>
                              <input
                                type="number"
                                value={formData.rent_3_months}
                                onChange={(e) => setFormData(prev => ({ ...prev, rent_3_months: parseFloat(e.target.value) || 0 }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">6 Months Rent</label>
                              <input
                                type="number"
                                value={formData.rent_6_months}
                                onChange={(e) => setFormData(prev => ({ ...prev, rent_6_months: parseFloat(e.target.value) || 0 }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Permanent Pricing - Only for games */}
                      {activeTab === 'games' && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-3">Permanent Pricing</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Permanent Offline Price</label>
                              <input
                                type="number"
                                value={formData.permanent_offline_price}
                                onChange={(e) => setFormData(prev => ({ ...prev, permanent_offline_price: parseFloat(e.target.value) || 0 }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Permanent Online Price</label>
                              <input
                                type="number"
                                value={formData.permanent_online_price}
                                onChange={(e) => setFormData(prev => ({ ...prev, permanent_online_price: parseFloat(e.target.value) || 0 }))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Platform */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Platform *</label>
                        <div className="flex flex-wrap gap-2">
                          {['PS4', 'PS5', 'Xbox', 'PC'].map((platform) => (
                            <label key={platform} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={formData.platform?.includes(platform)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData(prev => ({ ...prev, platform: [...(prev.platform || []), platform] }));
                                  } else {
                                    setFormData(prev => ({ ...prev, platform: prev.platform?.filter(p => p !== platform) || [] }));
                                  }
                                }}
                                className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                              />
                              <span className="text-sm text-gray-700">{platform}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Type */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Type *</label>
                        <div className="flex flex-wrap gap-2">
                          {activeTab === 'games' 
                            ? ['Rent', 'Permanent Offline', 'Permanent Offline + Online'].map((type) => (
                                <label key={type} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={formData.type?.includes(type)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setFormData(prev => ({ ...prev, type: [...(prev.type || []), type] }));
                                      } else {
                                        setFormData(prev => ({ ...prev, type: prev.type?.filter(t => t !== type) || [] }));
                                      }
                                    }}
                                    className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                  />
                                  <span className="text-sm text-gray-700">{type}</span>
                                </label>
                              ))
                            : ['Permanent'].map((type) => (
                                <label key={type} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={formData.type?.includes(type)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setFormData(prev => ({ ...prev, type: [...(prev.type || []), type] }));
                                      } else {
                                        setFormData(prev => ({ ...prev, type: prev.type?.filter(t => t !== type) || [] }));
                                      }
                                    }}
                                    className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                  />
                                  <span className="text-sm text-gray-700">{type}</span>
                                </label>
                              ))
                          }
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                      </div>

                      {/* Additional Options */}
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.show_in_bestsellers}
                            onChange={(e) => setFormData(prev => ({ ...prev, show_in_bestsellers: e.target.checked }))}
                            className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                          />
                          <span className="text-sm text-gray-700">Show in Bestsellers</span>
                        </label>
                      </div>
                    </>
                  )}

                  {/* Submit Button */}
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddModalOpen(false);
                        setIsEditModalOpen(false);
                        resetForm();
                        resetTestimonialForm();
                      }}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      <span>{uploading ? 'Uploading...' : isEditModalOpen ? 'Update' : 'Save'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;