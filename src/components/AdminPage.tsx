import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Upload, X, Check, AlertCircle, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAllGames, useGames, useSubscriptions, useTestimonials } from '../hooks/useSupabaseData';
import { gamesService, subscriptionsService, testimonialsService } from '../services/supabaseService';

interface AdminPageProps {
  onBackToHome: () => void;
}

interface EditionPricing {
  edition: 'Standard' | 'Premium' | 'Deluxe';
  original_price: number;
  sale_price: number;
  rent_1_month?: number;
  rent_3_months?: number;
  rent_6_months?: number;
  rent_12_months?: number;
  permanent_offline_price?: number;
  permanent_online_price?: number;
  edition_features: string[];
}

const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome }) => {
  const [activeTab, setActiveTab] = useState<'games' | 'subscriptions' | 'testimonials'>('games');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Game | Testimonial | null>(null);
  const [gamesSearchQuery, setGamesSearchQuery] = useState('');
  const [subscriptionsSearchQuery, setSubscriptionsSearchQuery] = useState('');
  const [testimonialsSearchQuery, setTestimonialsSearchQuery] = useState('');
  const [gamesCurrentPage, setGamesCurrentPage] = useState(1);
  const [subscriptionsCurrentPage, setSubscriptionsCurrentPage] = useState(1);
  const [testimonialsCurrentPage, setTestimonialsCurrentPage] = useState(1);
  
  const itemsPerPage = 9;
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form state for games/subscriptions
  const [formData, setFormData] = useState<Partial<Game>>({
    title: '',
    image: '',
    description: '',
    platform: [],
    type: [],
    category: 'game',
    show_in_bestsellers: false,
    is_recommended: false
  });

  // Edition management state
  const [availableEditions, setAvailableEditions] = useState<('Standard' | 'Premium' | 'Deluxe')[]>(['Standard']);
  const [selectedEdition, setSelectedEdition] = useState<'Standard' | 'Premium' | 'Deluxe'>('Standard');
  const [editionPricings, setEditionPricings] = useState<{ [key: string]: EditionPricing }>({
    'Standard': {
      edition: 'Standard',
      original_price: 0,
      sale_price: 0,
      edition_features: []
    }
  });

  const [newFeature, setNewFeature] = useState('');

  // Data hooks
  const { allGames, loading: gamesLoading, refetch: refetchGames } = useAllGames();
  const { subscriptions, loading: subscriptionsLoading, refetch: refetchSubscriptions } = useSubscriptions({ limit: 1000 });
  const { testimonials, loading: testimonialsLoading, refetch: refetchTestimonials } = useTestimonials();

  // Filter items based on active tab and search
  const filteredItems = useMemo(() => {
    let items: Game[] = [];
    let searchQuery = '';
    
    if (activeTab === 'games') {
      items = allGames || []; // Show all games including all editions as separate items
      searchQuery = gamesSearchQuery;
    } else if (activeTab === 'subscriptions') {
      items = subscriptions || [];
      searchQuery = subscriptionsSearchQuery;
    }

    const filtered = items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return filtered;
  }, [allGames, subscriptions, activeTab, gamesSearchQuery, subscriptionsSearchQuery]);

  // Filter testimonials separately
  const filteredTestimonials = useMemo(() => {
    return (testimonials || []).filter(testimonial => {
      // For testimonials, we can search by image URL or any other criteria
      return testimonial.image.toLowerCase().includes(testimonialsSearchQuery.toLowerCase());
    });
  }, [testimonials, testimonialsSearchQuery]);

  // Pagination logic
  const getCurrentPageItems = () => {
    let currentPage = 1;
    let items: any[] = [];
    
    if (activeTab === 'testimonials') {
      currentPage = testimonialsCurrentPage;
      items = filteredTestimonials;
    } else {
      if (activeTab === 'games') {
        currentPage = gamesCurrentPage;
      } else {
        currentPage = subscriptionsCurrentPage;
      }
      items = filteredItems;
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return {
      items: items.slice(startIndex, endIndex),
      totalItems: items.length,
      totalPages: Math.ceil(items.length / itemsPerPage),
      currentPage
    };
  };

  const { items: paginatedItems, totalItems, totalPages, currentPage } = getCurrentPageItems();

  const handlePageChange = (page: number) => {
    if (activeTab === 'games') {
      setGamesCurrentPage(page);
    } else if (activeTab === 'subscriptions') {
      setSubscriptionsCurrentPage(page);
    } else {
      setTestimonialsCurrentPage(page);
    }
  };

  const getCurrentSearchQuery = () => {
    if (activeTab === 'games') return gamesSearchQuery;
    if (activeTab === 'subscriptions') return subscriptionsSearchQuery;
    return testimonialsSearchQuery;
  };

  const setCurrentSearchQuery = (query: string) => {
    if (activeTab === 'games') {
      setGamesSearchQuery(query);
      setGamesCurrentPage(1); // Reset to first page when searching
    } else if (activeTab === 'subscriptions') {
      setSubscriptionsSearchQuery(query);
      setSubscriptionsCurrentPage(1);
    } else {
      setTestimonialsSearchQuery(query);
      setTestimonialsCurrentPage(1);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      image: '',
      description: '',
      platform: [],
      type: [],
      category: 'game',
      show_in_bestsellers: false,
      is_recommended: false
    });
    setAvailableEditions(['Standard']);
    setSelectedEdition('Standard');
    setEditionPricings({
      'Standard': {
        edition: 'Standard',
        original_price: 0,
        sale_price: 0,
        edition_features: []
      }
    });
    setNewFeature('');
  };

  const handleEditGame = (gameItem: Game) => {
    setEditingItem(gameItem);
    setFormData({
      title: gameItem.title,
      image: gameItem.image,
      description: gameItem.description,
      platform: gameItem.platform,
      type: gameItem.type,
      category: gameItem.category,
      show_in_bestsellers: gameItem.show_in_bestsellers || false,
      is_recommended: gameItem.is_recommended || false
    });

    // Set up edition data for editing
    const edition = gameItem.edition || 'Standard';
    setAvailableEditions([edition]);
    setSelectedEdition(edition);
    setEditionPricings({
      [edition]: {
        edition: edition as 'Standard' | 'Premium' | 'Deluxe',
        original_price: gameItem.original_price,
        sale_price: gameItem.sale_price,
        rent_1_month: gameItem.rent_1_month || 0,
        rent_3_months: gameItem.rent_3_months || 0,
        rent_6_months: gameItem.rent_6_months || 0,
        rent_12_months: gameItem.rent_12_months || 0,
        permanent_offline_price: gameItem.permanent_offline_price || 0,
        permanent_online_price: gameItem.permanent_online_price || 0,
        edition_features: gameItem.edition_features || []
      }
    });

    setIsModalOpen(true);
  };

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setEditingItem(testimonial);
    setIsModalOpen(true);
  };

  const handleEditionCheckboxChange = (edition: 'Standard' | 'Premium' | 'Deluxe', checked: boolean) => {
    if (checked) {
      setAvailableEditions(prev => [...prev, edition]);
      setEditionPricings(prev => ({
        ...prev,
        [edition]: {
          edition,
          original_price: 0,
          sale_price: 0,
          edition_features: []
        }
      }));
      // Auto-select the newly added edition
      setSelectedEdition(edition);
    } else {
      setAvailableEditions(prev => prev.filter(e => e !== edition));
      setEditionPricings(prev => {
        const newPricings = { ...prev };
        delete newPricings[edition];
        return newPricings;
      });
      // If we removed the selected edition, select the first available one
      if (selectedEdition === edition) {
        const remaining = availableEditions.filter(e => e !== edition);
        setSelectedEdition(remaining[0] || 'Standard');
      }
    }
  };

  const updateCurrentEditionPricing = (field: string, value: any) => {
    setEditionPricings(prev => ({
      ...prev,
      [selectedEdition]: {
        ...prev[selectedEdition],
        [field]: value
      }
    }));
  };

  const addFeatureToCurrentEdition = () => {
    if (newFeature.trim()) {
      updateCurrentEditionPricing('edition_features', [
        ...(editionPricings[selectedEdition]?.edition_features || []),
        newFeature.trim()
      ]);
      setNewFeature('');
    }
  };

  const removeFeatureFromCurrentEdition = (index: number) => {
    const currentFeatures = editionPricings[selectedEdition]?.edition_features || [];
    updateCurrentEditionPricing('edition_features', currentFeatures.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

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
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);

      return data.secure_url;
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validation
      if (!formData.title?.trim()) {
        toast.error('Please enter a title');
        return;
      }

      if (!formData.image?.trim()) {
        toast.error('Please provide an image');
        return;
      }

      if (activeTab === 'games') {
        if (!formData.platform || formData.platform.length === 0) {
          toast.error('Please select at least one platform');
          return;
        }

        if (!formData.type || formData.type.length === 0) {
          toast.error('Please select at least one type');
          return;
        }

        if (availableEditions.length === 0) {
          toast.error('Please select at least one edition');
          return;
        }

        // Validate that all selected editions have pricing
        for (const edition of availableEditions) {
          const pricing = editionPricings[edition];
          if (!pricing || pricing.original_price <= 0 || pricing.sale_price <= 0) {
            toast.error(`Please set valid pricing for ${edition} edition`);
            return;
          }
        }

        // Create/update games for each edition
        for (const edition of availableEditions) {
          const pricing = editionPricings[edition];
          const gameData: Omit<Game, 'id' | 'created_at' | 'updated_at'> = {
            title: formData.title!,
            image: formData.image!,
            original_price: pricing.original_price,
            sale_price: pricing.sale_price,
            rent_1_month: pricing.rent_1_month || undefined,
            rent_3_months: pricing.rent_3_months || undefined,
            rent_6_months: pricing.rent_6_months || undefined,
            rent_12_months: pricing.rent_12_months || undefined,
            permanent_offline_price: pricing.permanent_offline_price || undefined,
            permanent_online_price: pricing.permanent_online_price || undefined,
            platform: formData.platform!,
            description: formData.description || '',
            type: formData.type!,
            category: 'game',
            show_in_bestsellers: formData.show_in_bestsellers,
            edition: edition,
            edition_features: pricing.edition_features,
            is_recommended: formData.is_recommended
          };

          if (editingItem && availableEditions.length === 1) {
            // Editing existing game
            await gamesService.update(editingItem.id!, gameData);
          } else {
            // Creating new game edition
            await gamesService.add(gameData);
          }
        }

        toast.success(editingItem ? 'Game updated successfully!' : 'Game(s) created successfully!');
      } else if (activeTab === 'subscriptions') {
        // Validate subscription pricing
        const pricing = editionPricings[selectedEdition];
        if (!pricing || pricing.original_price <= 0 || pricing.sale_price <= 0) {
          toast.error('Please set valid pricing for the subscription');
          return;
        }

        const subscriptionData: Omit<Game, 'id' | 'created_at' | 'updated_at'> = {
          title: formData.title!,
          image: formData.image!,
          original_price: pricing.original_price,
          sale_price: pricing.sale_price,
          rent_1_month: pricing.rent_1_month || undefined,
          rent_3_months: pricing.rent_3_months || undefined,
          rent_6_months: pricing.rent_6_months || undefined,
          rent_12_months: pricing.rent_12_months || undefined,
          platform: ['Subscription'],
          description: formData.description || '',
          type: ['Permanent'],
          category: 'subscription',
          show_in_bestsellers: formData.show_in_bestsellers
        };

        if (editingItem) {
          await subscriptionsService.update(editingItem.id!, subscriptionData);
          toast.success('Subscription updated successfully!');
        } else {
          await subscriptionsService.add(subscriptionData);
          toast.success('Subscription created successfully!');
        }
      }

      // Refresh data and close modal
      if (activeTab === 'games') {
        refetchGames();
      } else if (activeTab === 'subscriptions') {
        refetchSubscriptions();
      }
      
      setIsModalOpen(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save item. Please try again.');
    }
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
      } else if (activeTab === 'testimonials') {
        await testimonialsService.delete(id);
        toast.success('Screenshot deleted successfully!');
        refetchTestimonials();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item. Please try again.');
    }
  };

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.image?.trim()) {
        toast.error('Please provide an image URL');
        return;
      }

      const testimonialData: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'> = {
        image: formData.image!
      };

      if (editingItem) {
        await testimonialsService.update(editingItem.id!, testimonialData);
        toast.success('Screenshot updated successfully!');
      } else {
        await testimonialsService.add(testimonialData);
        toast.success('Screenshot added successfully!');
      }

      refetchTestimonials();
      setIsModalOpen(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error('Failed to save screenshot. Please try again.');
    }
  };

  const getCurrentEditionPricing = () => {
    return editionPricings[selectedEdition] || {
      edition: selectedEdition,
      original_price: 0,
      sale_price: 0,
      edition_features: []
    };
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
        <div className="flex space-x-1 mb-8 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-white/20">
          {[
            { id: 'games', label: 'Games', count: filteredItems.length },
            { id: 'subscriptions', label: 'Subscriptions', count: subscriptions.length },
            { id: 'testimonials', label: 'Screenshots', count: testimonials.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Add Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => {
              setEditingItem(null);
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add {activeTab === 'games' ? 'Game' : activeTab === 'subscriptions' ? 'Subscription' : 'Screenshot'}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'games' ? 'games' : activeTab === 'subscriptions' ? 'subscriptions' : 'testimonials'}...`}
              value={getCurrentSearchQuery()}
              onChange={(e) => setCurrentSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600 text-sm">
            Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} {activeTab}
          </p>
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeTab === 'games' && (gamesLoading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading games...</p>
            </div>
          ) : (
            paginatedItems.map((item) => (
              <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {item.title}
                        {/* Show edition badge for games and subscriptions */}
                        {item.edition && (
                          <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                            {item.edition}
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-orange-500 font-bold">₹{activeTab === 'games' ? (
                          item.rent_1_month || item.sale_price
                        ) : item.sale_price}</span>
                        <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded text-xs">
                          {activeTab === 'games' ? item.platform.join(', ') : 'Subscription'}
                        </span>
                      </div>
                    </div>
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
            ))
          ))}

          {activeTab === 'subscriptions' && (subscriptionsLoading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading subscriptions...</p>
            </div>
          ) : (
            paginatedItems.map((subscription) => (
              <div key={subscription.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300">
                <img
                  src={subscription.image}
                  alt={subscription.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2">{subscription.title}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-orange-500 font-bold">₹{subscription.sale_price}</span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                      Subscription
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditGame(subscription)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(subscription.id!)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ))}

          {activeTab === 'testimonials' && (testimonialsLoading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading screenshots...</p>
            </div>
          ) : (
            paginatedItems.map((testimonial) => (
              <div key={testimonial.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300">
                <img
                  src={testimonial.image}
                  alt="Customer testimonial"
                  className="w-full h-64 object-cover"
                />
                <div className="p-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditTestimonial(testimonial)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(testimonial.id!)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
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
                  onClick={() => handlePageChange(totalPages)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
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
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingItem ? 'Edit' : 'Add'} {activeTab === 'games' ? 'Game' : activeTab === 'subscriptions' ? 'Subscription' : 'Screenshot'}
                  </h2>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingItem(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={activeTab === 'testimonials' ? handleTestimonialSubmit : handleSubmit} className="space-y-6">
                  {activeTab !== 'testimonials' && (
                    <>
                      {/* Basic Information */}
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          rows={3}
                        />
                      </div>

                      {/* Platform Selection - Only for games */}
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

                      {/* Type Selection - Only for games */}
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

                      {/* Edition Selection - Only for games */}
                      {activeTab === 'games' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Available Editions</label>
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            {['Standard', 'Premium', 'Deluxe'].map((edition) => (
                              <label key={edition} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={availableEditions.includes(edition as any)}
                                  onChange={(e) => handleEditionCheckboxChange(edition as any, e.target.checked)}
                                  className="rounded"
                                />
                                <span className="text-sm">{edition}</span>
                              </label>
                            ))}
                          </div>

                          {/* Edition Dropdown */}
                          {availableEditions.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Configure Edition: 
                                <span className="ml-2 text-cyan-600 font-semibold">{selectedEdition}</span>
                              </label>
                              <select
                                value={selectedEdition}
                                onChange={(e) => setSelectedEdition(e.target.value as any)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                              >
                                {availableEditions.map((edition) => (
                                  <option key={edition} value={edition}>
                                    {edition} Edition
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Edition-specific Pricing */}
                      {availableEditions.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                          <h3 className="text-lg font-bold text-blue-800 mb-4">
                            {selectedEdition} Edition Pricing
                          </h3>

                          {/* Basic Pricing */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (₹)</label>
                              <input
                                type="number"
                                value={getCurrentEditionPricing().original_price}
                                onChange={(e) => updateCurrentEditionPricing('original_price', parseFloat(e.target.value) || 0)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                
                                step="0.01"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {activeTab === 'subscriptions' ? 'Subscription Price (₹)' : 'Sale Price (₹)'}
                              </label>
                              <input
                                type="number"
                                value={getCurrentEditionPricing().sale_price}
                                onChange={(e) => updateCurrentEditionPricing('sale_price', parseFloat(e.target.value) || 0)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                 
                                step="0.01"
                                required
                              />
                            </div>
                          </div>

                          {/* Rental Pricing - Only show if Rent type is selected for games */}
                          {activeTab === 'games' && formData.type?.includes('Rent') && (
                            <div className="mb-6">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Rental Pricing (₹) - Optional</label>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">1 Month</label>
                                  <input
                                    type="number"
                                    value={getCurrentEditionPricing().rent_1_month || ''}
                                    onChange={(e) => updateCurrentEditionPricing('rent_1_month', parseFloat(e.target.value) || 0)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                    
                                    step="0.01"
                                    placeholder="Optional"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">3 Months</label>
                                  <input
                                    type="number"
                                    value={getCurrentEditionPricing().rent_3_months || ''}
                                    onChange={(e) => updateCurrentEditionPricing('rent_3_months', parseFloat(e.target.value) || 0)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                    
                                    step="0.01"
                                    placeholder="Optional"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">6 Months</label>
                                  <input
                                    type="number"
                                    value={getCurrentEditionPricing().rent_6_months || ''}
                                    onChange={(e) => updateCurrentEditionPricing('rent_6_months', parseFloat(e.target.value) || 0)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                    
                                    step="0.01"
                                    placeholder="Optional"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">12 Months</label>
                                  <input
                                    type="number"
                                    value={getCurrentEditionPricing().rent_12_months || ''}
                                    onChange={(e) => updateCurrentEditionPricing('rent_12_months', parseFloat(e.target.value) || 0)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                    
                                    step="0.01"
                                    placeholder="Optional"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Permanent Pricing - Only show if permanent types are selected for games */}
                          {activeTab === 'games' && (formData.type?.includes('Permanent Offline') || formData.type?.includes('Permanent Offline + Online')) && (
                            <div className="mb-6">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Permanent Pricing (₹)</label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {formData.type?.includes('Permanent Offline') && (
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">Offline Only</label>
                                    <input
                                      type="number"
                                      value={getCurrentEditionPricing().permanent_offline_price || ''}
                                      onChange={(e) => updateCurrentEditionPricing('permanent_offline_price', parseFloat(e.target.value) || 0)}
                                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                      
                                      step="0.01"
                                    />
                                  </div>
                                )}
                                {formData.type?.includes('Permanent Offline + Online') && (
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">Offline + Online</label>
                                    <input
                                      type="number"
                                      value={getCurrentEditionPricing().permanent_online_price || ''}
                                      onChange={(e) => updateCurrentEditionPricing('permanent_online_price', parseFloat(e.target.value) || 0)}
                                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                      
                                      step="0.01"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Subscription Duration Pricing - Only for subscriptions */}
                          {activeTab === 'subscriptions' && (
                            <div className="mb-6">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Duration Pricing (₹) - Optional</label>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">1 Month</label>
                                  <input
                                    type="number"
                                    value={getCurrentEditionPricing().rent_1_month || ''}
                                    onChange={(e) => updateCurrentEditionPricing('rent_1_month', parseFloat(e.target.value) || 0)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                    
                                    step="0.01"
                                    placeholder="Optional"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">3 Months</label>
                                  <input
                                    type="number"
                                    value={getCurrentEditionPricing().rent_3_months || ''}
                                    onChange={(e) => updateCurrentEditionPricing('rent_3_months', parseFloat(e.target.value) || 0)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                    
                                    step="0.01"
                                    placeholder="Optional"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">6 Months</label>
                                  <input
                                    type="number"
                                    value={getCurrentEditionPricing().rent_6_months || ''}
                                    onChange={(e) => updateCurrentEditionPricing('rent_6_months', parseFloat(e.target.value) || 0)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                    
                                    step="0.01"
                                    placeholder="Optional"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">12 Months</label>
                                  <input
                                    type="number"
                                    value={getCurrentEditionPricing().rent_12_months || ''}
                                    onChange={(e) => updateCurrentEditionPricing('rent_12_months', parseFloat(e.target.value) || 0)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                    
                                    step="0.01"
                                    placeholder="Optional"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Edition Features - Only for games */}
                          {activeTab === 'games' && (
                            <div className="mb-6">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {selectedEdition} Edition Features
                              </label>
                              <div className="space-y-2">
                                {getCurrentEditionPricing().edition_features.map((feature, index) => (
                                  <div key={index} className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                                    <span className="flex-1 text-sm">{feature}</span>
                                    <button
                                      type="button"
                                      onClick={() => removeFeatureFromCurrentEdition(index)}
                                      className="text-red-500 hover:text-red-700 transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                                <div className="flex space-x-2">
                                  <input
                                    type="text"
                                    value={newFeature}
                                    onChange={(e) => setNewFeature(e.target.value)}
                                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                    placeholder="Add edition feature"
                                  />
                                  <button
                                    type="button"
                                    onClick={addFeatureToCurrentEdition}
                                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
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

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {activeTab === 'testimonials' ? 'Screenshot Image' : 'Game Image'}
                    </label>
                    
                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-cyan-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const imageUrl = await handleImageUpload(file);
                              setFormData(prev => ({ ...prev, image: imageUrl }));
                              toast.success('Image uploaded successfully!');
                            } catch (error) {
                              toast.error('Failed to upload image. Please try again.');
                            }
                          }
                        }}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload image</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                      </label>
                      
                      {isUploading && (
                        <div className="mt-4">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">Uploading... {uploadProgress}%</p>
                        </div>
                      )}
                    </div>

                    {/* Manual URL Input */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Or enter image URL manually</label>
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    {/* Image Preview */}
                    {formData.image && (
                      <div className="mt-4">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingItem(null);
                        resetForm();
                      }}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white py-3 px-6 rounded-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      {editingItem ? 'Update' : 'Create'} {activeTab === 'games' ? 'Game' : activeTab === 'subscriptions' ? 'Subscription' : 'Screenshot'}
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