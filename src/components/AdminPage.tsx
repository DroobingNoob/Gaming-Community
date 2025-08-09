import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Upload, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAllGames, useSubscriptions, useTestimonials } from '../hooks/useSupabaseData';
import { gamesService, subscriptionsService, testimonialsService } from '../services/supabaseService';
import { Game, Testimonial } from '../config/supabase';

interface AdminPageProps {
  onBackToHome: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome }) => {
  const [activeTab, setActiveTab] = useState<'games' | 'subscriptions' | 'screenshots'>('games');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Game | Testimonial | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Pagination states
  const [gamesPage, setGamesPage] = useState(1);
  const [subscriptionsPage, setSubscriptionsPage] = useState(1);
  const [screenshotsPage, setScreenshotsPage] = useState(1);
  const itemsPerPage = 9;

  // Search states
  const [gamesSearch, setGamesSearch] = useState('');
  const [subscriptionsSearch, setSubscriptionsSearch] = useState('');

  // Form states
  const [formData, setFormData] = useState<Partial<Game>>({
    title: '',
    image: '',
    original_price: 0,
    sale_price: 0,
    rent_1_month: 0,
    rent_3_months: 0,
    rent_6_months: 0,
    rent_12_months: 0,
    permanent_offline_price: 0,
    permanent_online_price: 0,
    platform: [],
    description: '',
    type: [],
    category: 'game',
    show_in_bestsellers: false,
    edition: 'Standard',
    edition_features: [],
    is_recommended: false
  });

  const [screenshotFormData, setScreenshotFormData] = useState<Partial<Testimonial>>({
    image: ''
  });

  const [newFeature, setNewFeature] = useState('');

  // Data hooks
  const { allGames, loading: gamesLoading, error: gamesError, refetch: refetchGames } = useAllGames();
  const { subscriptions, loading: subscriptionsLoading, error: subscriptionsError, refetch: refetchSubscriptions } = useSubscriptions({ limit: 1000 });
  const { testimonials, loading: testimonialsLoading, error: testimonialsError, refetch: refetchTestimonials } = useTestimonials();

  // Filter data based on search
  const filteredGames = allGames.filter(game => 
    game.title.toLowerCase().includes(gamesSearch.toLowerCase())
  );

  const filteredSubscriptions = subscriptions.filter(sub => 
    sub.title.toLowerCase().includes(subscriptionsSearch.toLowerCase())
  );

  // Pagination calculations
  const getTotalPages = (totalItems: number) => Math.ceil(totalItems / itemsPerPage);
  const getPageData = (data: any[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  // Get paginated data
  const paginatedGames = getPageData(filteredGames, gamesPage);
  const paginatedSubscriptions = getPageData(filteredSubscriptions, subscriptionsPage);
  const paginatedScreenshots = getPageData(testimonials, screenshotsPage);

  // Reset pagination when search changes
  useEffect(() => {
    setGamesPage(1);
  }, [gamesSearch]);

  useEffect(() => {
    setSubscriptionsPage(1);
  }, [subscriptionsSearch]);

  const resetForm = () => {
    setFormData({
      title: '',
      image: '',
      original_price: 0,
      sale_price: 0,
      rent_1_month: 0,
      rent_3_months: 0,
      rent_6_months: 0,
      rent_12_months: 0,
      permanent_offline_price: 0,
      permanent_online_price: 0,
      platform: [],
      description: '',
      type: [],
      category: 'game',
      show_in_bestsellers: false,
      edition: 'Standard',
      edition_features: [],
      is_recommended: false
    });
    setNewFeature('');
  };

  const resetScreenshotForm = () => {
    setScreenshotFormData({
      image: ''
    });
  };

  const handleImageUpload = async (file: File, isScreenshot: boolean = false) => {
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
      
      if (isScreenshot) {
        setScreenshotFormData(prev => ({ ...prev, image: data.secure_url }));
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
      if (activeTab === 'games' || activeTab === 'subscriptions') {
        if (editingItem) {
          if (activeTab === 'games') {
            await gamesService.update(editingItem.id!, formData);
            toast.success('Game updated successfully!');
            refetchGames();
          } else {
            await subscriptionsService.update(editingItem.id!, formData);
            toast.success('Subscription updated successfully!');
            refetchSubscriptions();
          }
          setIsEditModalOpen(false);
        } else {
          if (activeTab === 'games') {
            await gamesService.add(formData as Omit<Game, 'id' | 'created_at' | 'updated_at'>);
            toast.success('Game added successfully!');
            refetchGames();
          } else {
            await subscriptionsService.add(formData as Omit<Game, 'id' | 'created_at' | 'updated_at'>);
            toast.success('Subscription added successfully!');
            refetchSubscriptions();
          }
          setIsAddModalOpen(false);
        }
      } else if (activeTab === 'screenshots') {
        if (editingItem) {
          await testimonialsService.update(editingItem.id!, screenshotFormData);
          toast.success('Screenshot updated successfully!');
          refetchTestimonials();
          setIsEditModalOpen(false);
        } else {
          await testimonialsService.add(screenshotFormData as Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>);
          toast.success('Screenshot added successfully!');
          refetchTestimonials();
          setIsAddModalOpen(false);
        }
      }
      
      resetForm();
      resetScreenshotForm();
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save item. Please try again.');
    }
  };

  const handleEdit = (item: Game | Testimonial) => {
    setEditingItem(item);
    
    if (activeTab === 'screenshots') {
      setScreenshotFormData({
        image: (item as Testimonial).image
      });
    } else {
      const gameItem = item as Game;
      setFormData({
        title: gameItem.title,
        image: gameItem.image,
        original_price: gameItem.original_price,
        sale_price: gameItem.sale_price,
        rent_1_month: gameItem.rent_1_month || 0,
        rent_3_months: gameItem.rent_3_months || 0,
        rent_6_months: gameItem.rent_6_months || 0,
        rent_12_months: gameItem.rent_12_months || 0,
        permanent_offline_price: gameItem.permanent_offline_price || 0,
        permanent_online_price: gameItem.permanent_online_price || 0,
        platform: gameItem.platform,
        description: gameItem.description,
        type: gameItem.type,
        category: gameItem.category,
        show_in_bestsellers: gameItem.show_in_bestsellers || false,
        edition: gameItem.edition || 'Standard',
        edition_features: gameItem.edition_features || [],
        is_recommended: gameItem.is_recommended || false
      });
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
      } else if (activeTab === 'screenshots') {
        await testimonialsService.delete(id);
        toast.success('Screenshot deleted successfully!');
        refetchTestimonials();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item. Please try again.');
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && !formData.edition_features?.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        edition_features: [...(prev.edition_features || []), newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      edition_features: prev.edition_features?.filter(f => f !== feature) || []
    }));
  };

  const renderPagination = (currentPage: number, totalPages: number, onPageChange: (page: number) => void) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center space-x-2 mt-6">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex items-center space-x-1 px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const page = i + 1;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                currentPage === page
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white'
                  : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          );
        })}
        
        {totalPages > 5 && (
          <>
            <span className="px-2 text-gray-500">...</span>
            <button
              onClick={() => onPageChange(totalPages)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                currentPage === totalPages
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white'
                  : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex items-center space-x-1 px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const renderGamesTab = () => {
    const totalPages = getTotalPages(filteredGames.length);
    
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h3 className="text-xl font-bold text-gray-800">Games Management</h3>
            <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm font-medium">
              {filteredGames.length} total
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search games..."
                value={gamesSearch}
                onChange={(e) => setGamesSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
              />
            </div>
            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Game</span>
            </button>
          </div>
        </div>

        {gamesLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading games...</p>
          </div>
        ) : gamesError ? (
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load games. Please try again.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedGames.map((game) => (
                <div key={game.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <img
                    src={game.image}
                    alt={game.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{game.title}</h4>
                      {game.edition && game.edition !== 'Standard' && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                          {game.edition}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">{game.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-orange-500 font-bold">₹{game.rent_1_month || game.sale_price}</span>
                      <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded text-xs">
                        {game.platform.join(', ')}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(game)}
                        className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1 text-sm"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(game.id!)}
                        className="flex-1 bg-red-500 text-white py-2 px-3 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-1 text-sm"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {renderPagination(gamesPage, totalPages, setGamesPage)}
          </>
        )}
      </div>
    );
  };

  const renderSubscriptionsTab = () => {
    const totalPages = getTotalPages(filteredSubscriptions.length);
    
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h3 className="text-xl font-bold text-gray-800">Subscriptions Management</h3>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              {filteredSubscriptions.length} total
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={subscriptionsSearch}
                onChange={(e) => setSubscriptionsSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
              />
            </div>
            <button
              onClick={() => {
                resetForm();
                setFormData(prev => ({ ...prev, category: 'subscription' }));
                setIsAddModalOpen(true);
              }}
              className="bg-gradient-to-r from-purple-400 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-purple-500 hover:to-indigo-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subscription</span>
            </button>
          </div>
        </div>

        {subscriptionsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading subscriptions...</p>
          </div>
        ) : subscriptionsError ? (
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load subscriptions. Please try again.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedSubscriptions.map((subscription) => (
                <div key={subscription.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <img
                    src={subscription.image}
                    alt={subscription.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-bold text-gray-800 text-sm mb-2 line-clamp-1">{subscription.title}</h4>
                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">{subscription.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-orange-500 font-bold">₹{subscription.sale_price}</span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                        Subscription
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(subscription)}
                        className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1 text-sm"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(subscription.id!)}
                        className="flex-1 bg-red-500 text-white py-2 px-3 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-1 text-sm"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {renderPagination(subscriptionsPage, totalPages, setSubscriptionsPage)}
          </>
        )}
      </div>
    );
  };

  const renderScreenshotsTab = () => {
    const totalPages = getTotalPages(testimonials.length);
    
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h3 className="text-xl font-bold text-gray-800">Customer Screenshots</h3>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {testimonials.length} total
            </span>
          </div>
          <button
            onClick={() => {
              resetScreenshotForm();
              setIsAddModalOpen(true);
            }}
            className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-500 hover:to-emerald-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Screenshot</span>
          </button>
        </div>

        {testimonialsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading screenshots...</p>
          </div>
        ) : testimonialsError ? (
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load screenshots. Please try again.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedScreenshots.map((screenshot) => (
                <div key={screenshot.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="relative">
                    <img
                      src={screenshot.image}
                      alt="Customer screenshot"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(screenshot)}
                        className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1 text-sm"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(screenshot.id!)}
                        className="flex-1 bg-red-500 text-white py-2 px-3 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-1 text-sm"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {renderPagination(screenshotsPage, totalPages, setScreenshotsPage)}
          </>
        )}
      </div>
    );
  };

  const renderModal = () => {
    const isScreenshotModal = activeTab === 'screenshots';
    const isOpen = isAddModalOpen || isEditModalOpen;
    
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {isEditModalOpen ? 'Edit' : 'Add'} {isScreenshotModal ? 'Screenshot' : activeTab === 'games' ? 'Game' : 'Subscription'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  setEditingItem(null);
                  resetForm();
                  resetScreenshotForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isScreenshotModal ? (
                // Screenshot form
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Screenshot Image
                  </label>
                  <div className="space-y-3">
                    <input
                      type="url"
                      value={screenshotFormData.image}
                      onChange={(e) => setScreenshotFormData(prev => ({ ...prev, image: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      placeholder="Enter image URL or upload below"
                    />
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, true);
                        }}
                        className="hidden"
                        id="screenshot-upload"
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="screenshot-upload"
                        className={`cursor-pointer flex flex-col items-center space-y-2 ${isUploading ? 'opacity-50' : ''}`}
                      >
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {isUploading ? 'Uploading...' : 'Click to upload image'}
                        </span>
                      </label>
                    </div>

                    {screenshotFormData.image && (
                      <div className="mt-4">
                        <img
                          src={screenshotFormData.image}
                          alt="Preview"
                          className="w-32 h-auto rounded-lg shadow-md mx-auto"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Game/Subscription form
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Edition</label>
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

                  {/* Edition Features - Only show for non-Standard editions */}
                  {activeTab === 'games' && formData.edition !== 'Standard' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Edition Features</label>
                      <div className="space-y-3">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            placeholder="Add a feature for this edition"
                          />
                          <button
                            type="button"
                            onClick={handleAddFeature}
                            className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                        
                        {formData.edition_features && formData.edition_features.length > 0 && (
                          <div className="space-y-2">
                            {formData.edition_features.map((feature, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                <span className="text-sm text-gray-700">{feature}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFeature(feature)}
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                    <div className="space-y-3">
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        placeholder="Enter image URL or upload below"
                        required
                      />
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                          className="hidden"
                          id="image-upload"
                          disabled={isUploading}
                        />
                        <label
                          htmlFor="image-upload"
                          className={`cursor-pointer flex flex-col items-center space-y-2 ${isUploading ? 'opacity-50' : ''}`}
                        >
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {isUploading ? 'Uploading...' : 'Click to upload image'}
                          </span>
                        </label>
                      </div>

                      {formData.image && (
                        <div className="mt-4">
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg shadow-md mx-auto"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      rows={3}
                      required
                    />
                  </div>

                  {/* Pricing Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (₹)</label>
                      <input
                        type="number"
                        value={formData.original_price}
                        onChange={(e) => setFormData(prev => ({ ...prev, original_price: parseFloat(e.target.value) || 0 }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price (₹)</label>
                      <input
                        type="number"
                        value={formData.sale_price}
                        onChange={(e) => setFormData(prev => ({ ...prev, sale_price: parseFloat(e.target.value) || 0 }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  {/* Rental Pricing - Only for games */}
                  {activeTab === 'games' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rental Pricing (₹)</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">1 Month</label>
                          <input
                            type="number"
                            value={formData.rent_1_month}
                            onChange={(e) => setFormData(prev => ({ ...prev, rent_1_month: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">3 Months</label>
                          <input
                            type="number"
                            value={formData.rent_3_months}
                            onChange={(e) => setFormData(prev => ({ ...prev, rent_3_months: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">6 Months</label>
                          <input
                            type="number"
                            value={formData.rent_6_months}
                            onChange={(e) => setFormData(prev => ({ ...prev, rent_6_months: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">12 Months</label>
                          <input
                            type="number"
                            value={formData.rent_12_months}
                            onChange={(e) => setFormData(prev => ({ ...prev, rent_12_months: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Permanent Pricing - Only for games */}
                  {activeTab === 'games' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Permanent Pricing (₹)</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Offline Only</label>
                          <input
                            type="number"
                            value={formData.permanent_offline_price}
                            onChange={(e) => setFormData(prev => ({ ...prev, permanent_offline_price: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Offline + Online</label>
                          <input
                            type="number"
                            value={formData.permanent_online_price}
                            onChange={(e) => setFormData(prev => ({ ...prev, permanent_online_price: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                  )}

               {/* Platform Selection */}
{activeTab === 'games' && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {['PS4', 'PS5', 'PSVR2', 'Xbox'].map((platform) => (
        <label key={platform} className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.platform?.includes(platform)}
            onChange={(e) => {
              if (e.target.checked) {
                setFormData(prev => ({
                  ...prev,
                  platform: [...(prev.platform || []), platform]
                }));
              } else {
                setFormData(prev => ({
                  ...prev,
                  platform: prev.platform?.filter(p => p !== platform) || []
                }));
              }
            }}
            className="rounded"
          />
          <span className="text-sm">{platform}</span>
        </label>
      ))}
    </div>
  </div>
)}

                  {activeTab === 'games' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {['Rent', 'Permanent Offline', 'Permanent Offline + Online'].map((type) => (
                          <label key={type} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.type?.includes(type)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    type: [...(prev.type || []), type]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    type: prev.type?.filter(t => t !== type) || []
                                  }));
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Duration Selection - Only for subscriptions */}
                  {activeTab === 'subscriptions' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Available Durations</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                          { key: 'rent_1_month', label: '1 Month' },
                          { key: 'rent_3_months', label: '3 Months' },
                          { key: 'rent_6_months', label: '6 Months' },
                          { key: 'rent_12_months', label: '12 Months' }
                        ].map((duration) => (
                          <label key={duration.key} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={(formData as any)[duration.key] > 0}
                              onChange={(e) => {
                                if (!e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    [duration.key]: 0
                                  }));
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{duration.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  )}

                  {/* Rental Pricing - Only show if Rent type is selected for games */}
                  {activeTab === 'games' && formData.type?.includes('Rent') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rental Pricing (₹) - Optional</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">1 Month</label>
                          <input
                            type="number"
                            value={formData.rent_1_month}
                            onChange={(e) => setFormData(prev => ({ ...prev, rent_1_month: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            min="0"
                            step="0.01"
                            placeholder="Optional"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">3 Months</label>
                          <input
                            type="number"
                            value={formData.rent_3_months}
                            onChange={(e) => setFormData(prev => ({ ...prev, rent_3_months: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            min="0"
                            step="0.01"
                            placeholder="Optional"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">6 Months</label>
                          <input
                            type="number"
                            value={formData.rent_6_months}
                            onChange={(e) => setFormData(prev => ({ ...prev, rent_6_months: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            min="0"
                            step="0.01"
                            placeholder="Optional"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">12 Months</label>
                          <input
                            type="number"
                            value={formData.rent_12_months}
                            onChange={(e) => setFormData(prev => ({ ...prev, rent_12_months: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            min="0"
                            step="0.01"
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Permanent Pricing - Only show if permanent types are selected for games */}
                  {activeTab === 'games' && (formData.type?.includes('Permanent Offline') || formData.type?.includes('Permanent Offline + Online')) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Permanent Pricing (₹)</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.type?.includes('Permanent Offline') && (
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Offline Only</label>
                            <input
                              type="number"
                              value={formData.permanent_offline_price}
                              onChange={(e) => setFormData(prev => ({ ...prev, permanent_offline_price: parseFloat(e.target.value) || 0 }))}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        )}
                        {formData.type?.includes('Permanent Offline + Online') && (
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Offline + Online</label>
                            <input
                              type="number"
                              value={formData.permanent_online_price}
                              onChange={(e) => setFormData(prev => ({ ...prev, permanent_online_price: parseFloat(e.target.value) || 0 }))}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Subscription Duration Pricing - Only for subscriptions */}
                  {activeTab === 'subscriptions' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration Pricing (₹) - Optional</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">1 Month</label>
                          <input
                            type="number"
                            value={formData.rent_1_month}
                            onChange={(e) => setFormData(prev => ({ ...prev, rent_1_month: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            min="0"
                            step="0.01"
                            placeholder="Optional"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">3 Months</label>
                          <input
                            type="number"
                            value={formData.rent_3_months}
                            onChange={(e) => setFormData(prev => ({ ...prev, rent_3_months: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            min="0"
                            step="0.01"
                            placeholder="Optional"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">6 Months</label>
                          <input
                            type="number"
                            value={formData.rent_6_months}
                            onChange={(e) => setFormData(prev => ({ ...prev, rent_6_months: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            min="0"
                            step="0.01"
                            placeholder="Optional"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">12 Months</label>
                          <input
                            type="number"
                            value={formData.rent_12_months}
                            onChange={(e) => setFormData(prev => ({ ...prev, rent_12_months: parseFloat(e.target.value) || 0 }))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            min="0"
                            step="0.01"
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.show_in_bestsellers}
                          onChange={(e) => setFormData(prev => ({ ...prev, show_in_bestsellers: e.target.checked }))}
                          className="rounded"
                        />
                        <span className="text-sm">Show in Bestsellers</span>
                      </label>
                      
                      {activeTab === 'games' && (
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.is_recommended}
                            onChange={(e) => setFormData(prev => ({ ...prev, is_recommended: e.target.checked }))}
                            className="rounded"
                          />
                          <span className="text-sm">Recommended Game</span>
                        </label>
                      )}
                  </div>
                </>
              )}

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    setEditingItem(null);
                    resetForm();
                    resetScreenshotForm();
                  }}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 text-white py-3 rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-colors disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : isEditModalOpen ? 'Update' : 'Add'} {isScreenshotModal ? 'Screenshot' : activeTab === 'games' ? 'Game' : 'Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
              Admin Dashboard
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'games', label: 'Games', count: filteredGames.length },
                { id: 'subscriptions', label: 'Subscriptions', count: filteredSubscriptions.length },
                { id: 'screenshots', label: 'Screenshots', count: testimonials.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-cyan-400 text-cyan-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    activeTab === tab.id
                      ? 'bg-cyan-100 text-cyan-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'games' && renderGamesTab()}
            {activeTab === 'subscriptions' && renderSubscriptionsTab()}
            {activeTab === 'screenshots' && renderScreenshotsTab()}
          </div>
        </div>

        {/* Modal */}
        {renderModal()}
      </div>
    </div>
  );
};

export default AdminPage;