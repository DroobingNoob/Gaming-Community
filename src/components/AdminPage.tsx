import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Upload, X, Save, Eye, EyeOff, Star, Award } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAllGames, useTestimonials } from '../hooks/useSupabaseData';
import { gamesService, subscriptionsService, testimonialsService } from '../services/supabaseService';
import { Game, Testimonial } from '../config/supabase';

interface AdminPageProps {
  onBackToHome: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome }) => {
  const { allGames, loading: gamesLoading, refetch: refetchGames } = useAllGames();
  const { testimonials, loading: testimonialsLoading, refetch: refetchTestimonials } = useTestimonials();
  
  const [activeTab, setActiveTab] = useState<'games' | 'subscriptions' | 'screenshots'>('games');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Game | Testimonial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for games/subscriptions
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
    edition_features: []
  });

  // Form state for testimonials
  const [testimonialData, setTestimonialData] = useState<Partial<Testimonial>>({
    image: ''
  });

  // Image upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const games = allGames.filter(item => item.category === 'game');
  const subscriptions = allGames.filter(item => item.category === 'subscription');

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
      category: activeTab === 'subscriptions' ? 'subscription' : 'game',
      show_in_bestsellers: false,
      is_recommended: false,
      edition: 'Standard',
      edition_features: []
    });
    setTestimonialData({ image: '' });
    setImagePreview('');
    setEditingItem(null);
    setShowForm(false);
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    setUploadingImage(true);

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
      const imageUrl = data.secure_url;

      if (activeTab === 'screenshots') {
        setTestimonialData(prev => ({ ...prev, image: imageUrl }));
      } else {
        setFormData(prev => ({ ...prev, image: imageUrl }));
      }
      
      setImagePreview(imageUrl);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (activeTab === 'screenshots') {
        if (!testimonialData.image) {
          toast.error('Please upload an image');
          return;
        }

        if (editingItem) {
          await testimonialsService.update(editingItem.id!, testimonialData);
          toast.success('Screenshot updated successfully!');
        } else {
          await testimonialsService.add(testimonialData as Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>);
          toast.success('Screenshot added successfully!');
        }
        refetchTestimonials();
      } else {
        // Validate required fields
        if (!formData.title || !formData.image || !formData.platform?.length || !formData.type?.length) {
          toast.error('Please fill in all required fields');
          return;
        }

        const service = activeTab === 'subscriptions' ? subscriptionsService : gamesService;
        
        if (editingItem) {
          await service.update(editingItem.id!, formData);
          toast.success(`${activeTab === 'subscriptions' ? 'Subscription' : 'Game'} updated successfully!`);
        } else {
          await service.add(formData as Omit<Game, 'id' | 'created_at' | 'updated_at'>);
          toast.success(`${activeTab === 'subscriptions' ? 'Subscription' : 'Game'} added successfully!`);
        }
        refetchGames();
      }

      resetForm();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: Game | Testimonial) => {
    setEditingItem(item);
    
    if (activeTab === 'screenshots') {
      setTestimonialData(item as Testimonial);
      setImagePreview((item as Testimonial).image);
    } else {
      setFormData(item as Game);
      setImagePreview((item as Game).image);
    }
    
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      if (activeTab === 'screenshots') {
        await testimonialsService.delete(id);
        toast.success('Screenshot deleted successfully!');
        refetchTestimonials();
      } else {
        const service = activeTab === 'subscriptions' ? subscriptionsService : gamesService;
        await service.delete(id);
        toast.success(`${activeTab === 'subscriptions' ? 'Subscription' : 'Game'} deleted successfully!`);
        refetchGames();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete. Please try again.');
    }
  };

  const handleArrayInput = (field: 'platform' | 'type' | 'edition_features', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  const renderGameForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">Edition</label>
          <select
            value={formData.edition || 'Standard'}
            onChange={(e) => setFormData(prev => ({ ...prev, edition: e.target.value as 'Standard' | 'Premium' }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="Standard">Standard</option>
            <option value="Premium">Premium</option>
          </select>
        </div>

        {/* Image Upload */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Image <span className="text-red-500">*</span>
          </label>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                className="hidden"
                id="image-upload"
                disabled={uploadingImage}
              />
              <label
                htmlFor="image-upload"
                className={`flex items-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-cyan-400 transition-colors ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </span>
              </label>
              <input
                type="url"
                placeholder="Or paste image URL"
                value={formData.image || ''}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, image: e.target.value }));
                  setImagePreview(e.target.value);
                }}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
            {imagePreview && (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview('');
                    setFormData(prev => ({ ...prev, image: '' }));
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price (₹)</label>
          <input
            type="number"
            value={formData.original_price || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, original_price: parseFloat(e.target.value) || 0 }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Price (₹)</label>
          <input
            type="number"
            value={formData.sale_price || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, sale_price: parseFloat(e.target.value) || 0 }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
            min="0"
            step="0.01"
          />
        </div>

        {/* Rental Pricing (only for games) */}
        {activeTab === 'games' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">1 Month Rent (₹)</label>
              <input
                type="number"
                value={formData.rent_1_month || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, rent_1_month: parseFloat(e.target.value) || 0 }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">3 Months Rent (₹)</label>
              <input
                type="number"
                value={formData.rent_3_months || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, rent_3_months: parseFloat(e.target.value) || 0 }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">6 Months Rent (₹)</label>
              <input
                type="number"
                value={formData.rent_6_months || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, rent_6_months: parseFloat(e.target.value) || 0 }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Permanent Offline (₹)</label>
              <input
                type="number"
                value={formData.permanent_offline_price || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, permanent_offline_price: parseFloat(e.target.value) || 0 }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Permanent Online (₹)</label>
              <input
                type="number"
                value={formData.permanent_online_price || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, permanent_online_price: parseFloat(e.target.value) || 0 }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                min="0"
                step="0.01"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Discount (%)</label>
          <input
            type="number"
            value={formData.discount || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, discount: parseInt(e.target.value) || 0 }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
            min="0"
            max="100"
          />
        </div>

        {/* Platform */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Platforms <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="PS5, PS4, PSVR2 (comma separated)"
            value={formData.platform?.join(', ') || ''}
            onChange={(e) => handleArrayInput('platform', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
            required
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Types <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Rent, Permanent Offline, Permanent Offline + Online (comma separated)"
            value={formData.type?.join(', ') || ''}
            onChange={(e) => handleArrayInput('type', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
            required
          />
        </div>

        {/* Edition Features */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Edition Features</label>
          <input
            type="text"
            placeholder="DLC included, Season Pass, Bonus content (comma separated)"
            value={formData.edition_features?.join(', ') || ''}
            onChange={(e) => handleArrayInput('edition_features', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
            rows={4}
            placeholder="Enter game description..."
          />
        </div>

        {/* Checkboxes */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="show_in_bestsellers"
              checked={formData.show_in_bestsellers || false}
              onChange={(e) => setFormData(prev => ({ ...prev, show_in_bestsellers: e.target.checked }))}
              className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
            />
            <label htmlFor="show_in_bestsellers" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Show in Bestsellers</span>
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_recommended"
              checked={formData.is_recommended || false}
              onChange={(e) => setFormData(prev => ({ ...prev, is_recommended: e.target.checked }))}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="is_recommended" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Award className="w-4 h-4 text-orange-500" />
              <span>Put in Recommendation</span>
            </label>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex space-x-4 pt-6 border-t">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center space-x-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving...' : editingItem ? 'Update' : 'Create'}</span>
        </button>
        <button
          type="button"
          onClick={resetForm}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );

  const renderScreenshotForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Screenshot Image <span className="text-red-500">*</span>
        </label>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
              className="hidden"
              id="screenshot-upload"
              disabled={uploadingImage}
            />
            <label
              htmlFor="screenshot-upload"
              className={`flex items-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-cyan-400 transition-colors ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">
                {uploadingImage ? 'Uploading...' : 'Upload Screenshot'}
              </span>
            </label>
            <input
              type="url"
              placeholder="Or paste image URL"
              value={testimonialData.image || ''}
              onChange={(e) => {
                setTestimonialData(prev => ({ ...prev, image: e.target.value }));
                setImagePreview(e.target.value);
              }}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          {imagePreview && (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-64 object-cover rounded-lg border border-gray-300"
                style={{ aspectRatio: '9/16' }}
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview('');
                  setTestimonialData(prev => ({ ...prev, image: '' }));
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex space-x-4 pt-6 border-t">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center space-x-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving...' : editingItem ? 'Update' : 'Add'}</span>
        </button>
        <button
          type="button"
          onClick={resetForm}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );

  const renderItemsList = () => {
    let items: (Game | Testimonial)[] = [];
    let isLoading = false;

    if (activeTab === 'games') {
      items = games;
      isLoading = gamesLoading;
    } else if (activeTab === 'subscriptions') {
      items = subscriptions;
      isLoading = gamesLoading;
    } else {
      items = testimonials;
      isLoading = testimonialsLoading;
    }

    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">No {activeTab} found.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative">
              <img
                src={activeTab === 'screenshots' ? (item as Testimonial).image : (item as Game).image}
                alt={activeTab === 'screenshots' ? 'Screenshot' : (item as Game).title}
                className={`w-full object-cover ${activeTab === 'screenshots' ? 'h-64' : 'h-48'}`}
              />
              <div className="absolute top-2 right-2 flex space-x-2">
                {activeTab !== 'screenshots' && (
                  <>
                    {(item as Game).show_in_bestsellers && (
                      <div className="bg-yellow-500 text-white p-1 rounded-full" title="Bestseller">
                        <Star className="w-4 h-4" />
                      </div>
                    )}
                    {(item as Game).is_recommended && (
                      <div className="bg-orange-500 text-white p-1 rounded-full" title="Recommended">
                        <Award className="w-4 h-4" />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="p-4">
              {activeTab !== 'screenshots' && (
                <>
                  <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{(item as Game).title}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded text-xs font-medium">
                      {(item as Game).platform?.join(', ')}
                    </span>
                    {(item as Game).edition && (item as Game).edition !== 'Standard' && (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                        {(item as Game).edition}
                      </span>
                    )}
                  </div>
                  <p className="text-orange-600 font-bold text-lg">₹{(item as Game).sale_price}</p>
                </>
              )}
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(item.id!)}
                  className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
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
          
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Add {activeTab === 'screenshots' ? 'Screenshot' : activeTab === 'subscriptions' ? 'Subscription' : 'Game'}</span>
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-white/20">
          {[
            { id: 'games', label: 'Games', count: games.length },
            { id: 'subscriptions', label: 'Subscriptions', count: subscriptions.length },
            { id: 'screenshots', label: 'Screenshots', count: testimonials.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                resetForm();
              }}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6">
          {showForm ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingItem ? 'Edit' : 'Add'} {activeTab === 'screenshots' ? 'Screenshot' : activeTab === 'subscriptions' ? 'Subscription' : 'Game'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              {activeTab === 'screenshots' ? renderScreenshotForm() : renderGameForm()}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {activeTab === 'screenshots' ? 'Customer Screenshots' : activeTab === 'subscriptions' ? 'Subscriptions' : 'Games'}
                </h2>
              </div>
              {renderItemsList()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;