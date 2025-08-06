import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Upload, X, Save, Eye, EyeOff } from 'lucide-react';
import { useAllGames, useSubscriptions, useTestimonials } from '../hooks/useSupabaseData';
import { gamesService, subscriptionsService, testimonialsService } from '../services/supabaseService';
import { Game, Testimonial } from '../config/supabase';
import { toast } from 'react-toastify';

interface AdminPageProps {
  onBackToHome: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome }) => {
  const [activeTab, setActiveTab] = useState<'games' | 'subscriptions' | 'testimonials'>('games');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Game | Testimonial | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch data
  const { allGames, loading: gamesLoading, error: gamesError, refetch: refetchGames } = useAllGames();
  const { subscriptions, loading: subscriptionsLoading, error: subscriptionsError, refetch: refetchSubscriptions } = useSubscriptions();
  const { testimonials, loading: testimonialsLoading, error: testimonialsError, refetch: refetchTestimonials } = useTestimonials();

  // Form state for games/subscriptions
  const [formData, setFormData] = useState<Partial<Game>>({
    title: '',
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
    show_in_bestsellers: false,
    is_recommended: false,
    edition: 'Standard',
    base_game_id: '',
    edition_features: []
  });

  // Form state for testimonials
  const [testimonialData, setTestimonialData] = useState<Partial<Testimonial>>({
    image: ''
  });

  const resetForm = () => {
    setFormData({
      title: '',
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
      show_in_bestsellers: false,
      is_recommended: false,
      edition: 'Standard',
      base_game_id: '',
      edition_features: []
    });
    setTestimonialData({ image: '' });
  };

  const handleImageUpload = async (file: File, isTestimonial: boolean = false) => {
    if (!file) return;

    setIsUploading(true);
    try {
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
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      if (isTestimonial) {
        setTestimonialData(prev => ({ ...prev, image: data.secure_url }));
      } else {
        setFormData(prev => ({ ...prev, image: data.secure_url }));
      }
      
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (activeTab === 'testimonials') {
        if (!testimonialData.image) {
          toast.error('Please provide an image');
          return;
        }

        if (isEditModalOpen && editingItem) {
          await testimonialsService.update(editingItem.id!, testimonialData);
          toast.success('Testimonial updated successfully!');
          refetchTestimonials();
        } else {
          await testimonialsService.add(testimonialData as Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>);
          toast.success('Testimonial added successfully!');
          refetchTestimonials();
        }
      } else {
        // Validate required fields
        if (!formData.title || !formData.image || !formData.original_price || !formData.platform?.length || !formData.type?.length) {
          toast.error('Please fill in all required fields');
          return;
        }

        // Calculate discount if not provided
        const calculatedDiscount = formData.discount || Math.round(((formData.original_price! - formData.sale_price!) / formData.original_price!) * 100);

        const gameData = {
          ...formData,
          discount: calculatedDiscount,
          sale_price: formData.sale_price || formData.original_price
        };

        if (isEditModalOpen && editingItem) {
          if (activeTab === 'games') {
            await gamesService.update(editingItem.id!, gameData);
            toast.success('Game updated successfully!');
            refetchGames();
          } else {
            await subscriptionsService.update(editingItem.id!, gameData);
            toast.success('Subscription updated successfully!');
            refetchSubscriptions();
          }
        } else {
          if (activeTab === 'games') {
            await gamesService.add(gameData as Omit<Game, 'id' | 'created_at' | 'updated_at'>);
            toast.success('Game added successfully!');
            refetchGames();
          } else {
            await subscriptionsService.add(gameData as Omit<Game, 'id' | 'created_at' | 'updated_at'>);
            toast.success('Subscription added successfully!');
            refetchSubscriptions();
          }
        }
      }

      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save item. Please try again.');
    }
  };

  const handleEdit = (item: Game | Testimonial) => {
    setEditingItem(item);
    
    if (activeTab === 'testimonials') {
      setTestimonialData(item as Testimonial);
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
        toast.success('Game deleted successfully!');
        refetchGames();
      } else if (activeTab === 'subscriptions') {
        await subscriptionsService.delete(id);
        toast.success('Subscription deleted successfully!');
        refetchSubscriptions();
      } else {
        await testimonialsService.delete(id);
        toast.success('Testimonial deleted successfully!');
        refetchTestimonials();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item. Please try again.');
    }
  };

  const handlePlatformChange = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platform: prev.platform?.includes(platform)
        ? prev.platform.filter(p => p !== platform)
        : [...(prev.platform || []), platform]
    }));
  };

  const handleTypeChange = (type: string) => {
    setFormData(prev => ({
      ...prev,
      type: prev.type?.includes(type)
        ? prev.type.filter(t => t !== type)
        : [...(prev.type || []), type]
    }));
  };

  const handleEditionFeatureChange = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      edition_features: prev.edition_features?.includes(feature)
        ? prev.edition_features.filter(f => f !== feature)
        : [...(prev.edition_features || []), feature]
    }));
  };

  const renderModal = () => {
    const isOpen = isAddModalOpen || isEditModalOpen;
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditModalOpen ? 'Edit' : 'Add'} {activeTab === 'testimonials' ? 'Testimonial' : activeTab === 'games' ? 'Game' : 'Subscription'}
            </h2>
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setEditingItem(null);
                resetForm();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {activeTab === 'testimonials' ? (
              // Testimonial form
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Screenshot Image <span className="text-red-500">*</span>
                </label>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, true);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    disabled={isUploading}
                  />
                  <input
                    type="url"
                    placeholder="Or paste image URL"
                    value={testimonialData.image || ''}
                    onChange={(e) => setTestimonialData(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    disabled={isUploading}
                  />
                  {testimonialData.image && (
                    <div className="mt-4">
                      <img
                        src={testimonialData.image}
                        alt="Preview"
                        className="w-32 h-56 object-cover rounded-lg border"
                        style={{ aspectRatio: '9/16' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Game/Subscription form
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Edition
                    </label>
                    <select
                      value={formData.edition || 'Standard'}
                      onChange={(e) => setFormData(prev => ({ ...prev, edition: e.target.value as 'Standard' | 'Premium' }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Base Game ID (for linking editions)
                    </label>
                    <input
                      type="text"
                      value={formData.base_game_id || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, base_game_id: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      placeholder="Leave empty for base game"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Image <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        disabled={isUploading}
                      />
                      <input
                        type="url"
                        placeholder="Or paste image URL"
                        value={formData.image || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        disabled={isUploading}
                        required
                      />
                      {formData.image && (
                        <div className="mt-4">
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      rows={4}
                    />
                  </div>
                </div>

                {/* Pricing and Configuration */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Original Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.original_price || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, original_price: parseFloat(e.target.value) || 0 }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      required
                    />
                  </div>

                  {activeTab === 'subscriptions' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.sale_price || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, sale_price: parseFloat(e.target.value) || 0 }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      />
                    </div>
                  )}

                  {activeTab === 'games' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">1 Month Rent Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.rent_1_month || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, rent_1_month: parseFloat(e.target.value) || 0 }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">3 Months Rent Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.rent_3_months || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, rent_3_months: parseFloat(e.target.value) || 0 }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">6 Months Rent Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.rent_6_months || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, rent_6_months: parseFloat(e.target.value) || 0 }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Permanent Offline Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.permanent_offline_price || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, permanent_offline_price: parseFloat(e.target.value) || 0 }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Permanent Online Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.permanent_online_price || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, permanent_online_price: parseFloat(e.target.value) || 0 }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Discount %</label>
                    <input
                      type="number"
                      value={formData.discount || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount: parseInt(e.target.value) || 0 }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>

                  {/* Platform Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Platform <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {['PS5', 'PS4', 'PSVR2', 'Xbox', 'PC'].map(platform => (
                        <label key={platform} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.platform?.includes(platform) || false}
                            onChange={() => handlePlatformChange(platform)}
                            className="mr-2"
                          />
                          {platform}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Type Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {activeTab === 'games' 
                        ? ['Rent', 'Permanent Offline', 'Permanent Offline + Online'].map(type => (
                            <label key={type} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.type?.includes(type) || false}
                                onChange={() => handleTypeChange(type)}
                                className="mr-2"
                              />
                              {type}
                            </label>
                          ))
                        : ['Permanent'].map(type => (
                            <label key={type} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.type?.includes(type) || false}
                                onChange={() => handleTypeChange(type)}
                                className="mr-2"
                              />
                              {type}
                            </label>
                          ))
                      }
                    </div>
                  </div>

                  {/* Edition Features */}
                  {formData.edition === 'Premium' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Edition Features</label>
                      <div className="space-y-2">
                        {['Season Pass', 'DLC Pack', 'Exclusive Content', 'Early Access', 'Bonus Items'].map(feature => (
                          <label key={feature} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.edition_features?.includes(feature) || false}
                              onChange={() => handleEditionFeatureChange(feature)}
                              className="mr-2"
                            />
                            {feature}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Checkboxes */}
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.show_in_bestsellers || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, show_in_bestsellers: e.target.checked }))}
                        className="mr-2"
                      />
                      Show in Bestsellers on Homepage
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_recommended || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_recommended: e.target.checked }))}
                        className="mr-2"
                      />
                      Recommend in Cart
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  setEditingItem(null);
                  resetForm();
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isUploading ? 'Uploading...' : (isEditModalOpen ? 'Update' : 'Add')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderTable = () => {
    let data: (Game | Testimonial)[] = [];
    let loading = false;
    let error = null;

    if (activeTab === 'games') {
      data = allGames;
      loading = gamesLoading;
      error = gamesError;
    } else if (activeTab === 'subscriptions') {
      data = subscriptions;
      loading = subscriptionsLoading;
      error = subscriptionsError;
    } else {
      data = testimonials;
      loading = testimonialsLoading;
      error = testimonialsError;
    }

    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-red-600">Error loading data. Please try again.</p>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">No {activeTab} found. Add some to get started!</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow-lg">
          <thead className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white">
            <tr>
              <th className="px-6 py-4 text-left">Image</th>
              <th className="px-6 py-4 text-left">
                {activeTab === 'testimonials' ? 'ID' : 'Title'}
              </th>
              {activeTab !== 'testimonials' && (
                <>
                  <th className="px-6 py-4 text-left">Platform</th>
                  <th className="px-6 py-4 text-left">Price</th>
                  <th className="px-6 py-4 text-left">Edition</th>
                  <th className="px-6 py-4 text-left">Status</th>
                </>
              )}
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-6 py-4">
                  <img
                    src={item.image}
                    alt={activeTab === 'testimonials' ? 'Testimonial' : (item as Game).title}
                    className={`object-cover rounded ${
                      activeTab === 'testimonials' 
                        ? 'w-12 h-20' 
                        : 'w-16 h-16'
                    }`}
                    style={activeTab === 'testimonials' ? { aspectRatio: '9/16' } : {}}
                  />
                </td>
                <td className="px-6 py-4">
                  {activeTab === 'testimonials' 
                    ? item.id?.slice(0, 8) + '...' 
                    : (item as Game).title
                  }
                </td>
                {activeTab !== 'testimonials' && (
                  <>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(item as Game).platform.map(p => (
                          <span key={p} className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded text-xs">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {activeTab === 'games' 
                        ? `₹${(item as Game).rent_1_month || (item as Game).original_price}`
                        : `₹${(item as Game).sale_price}`
                      }
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        (item as Game).edition === 'Premium' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {(item as Game).edition || 'Standard'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        {(item as Game).show_in_bestsellers && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            Bestseller
                          </span>
                        )}
                        {(item as Game).is_recommended && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            Recommended
                          </span>
                        )}
                      </div>
                    </td>
                  </>
                )}
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id!)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
              { key: 'games', label: 'Games', count: allGames.length },
              { key: 'subscriptions', label: 'Subscriptions', count: subscriptions.length },
              { key: 'testimonials', label: 'Screenshots', count: testimonials.length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-cyan-600 border-b-2 border-cyan-400 bg-cyan-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Manage {activeTab === 'testimonials' ? 'Customer Screenshots' : activeTab}
              </h2>
              <button
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(true);
                }}
                className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add {activeTab === 'testimonials' ? 'Screenshot' : activeTab.slice(0, -1)}</span>
              </button>
            </div>

            {renderTable()}
          </div>
        </div>

        {renderModal()}
      </div>
    </div>
  );
};

export default AdminPage;