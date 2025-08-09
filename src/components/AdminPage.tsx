import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Upload, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAllGames, useSubscriptions, useTestimonials } from '../hooks/useSupabaseData';
import { gamesService, subscriptionsService, testimonialsService } from '../services/supabaseService';
import { Game, Testimonial } from '../config/supabase';
import { toast } from 'react-toastify';

interface AdminPageProps {
  onBackToHome: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome }) => {
  const [activeTab, setActiveTab] = useState<'games' | 'subscriptions' | 'screenshots'>('games');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [selectedItem, setSelectedItem] = useState<Game | Testimonial | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Pagination states for each tab
  const [gamesPage, setGamesPage] = useState(1);
  const [subscriptionsPage, setSubscriptionsPage] = useState(1);
  const [screenshotsPage, setScreenshotsPage] = useState(1);
  const itemsPerPage = 9;

  // Search states for each tab
  const [gamesSearch, setGamesSearch] = useState('');
  const [subscriptionsSearch, setSubscriptionsSearch] = useState('');

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
  
  const getPaginatedData = (data: any[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  // Get paginated data for each tab
  const paginatedGames = getPaginatedData(filteredGames, gamesPage);
  const paginatedSubscriptions = getPaginatedData(filteredSubscriptions, subscriptionsPage);
  const paginatedTestimonials = getPaginatedData(testimonials, screenshotsPage);

  // Total pages for each tab
  const gamesTotalPages = getTotalPages(filteredGames.length);
  const subscriptionsTotalPages = getTotalPages(filteredSubscriptions.length);
  const testimonialsTotalPages = getTotalPages(testimonials.length);

  // Reset page when search changes
  useEffect(() => {
    setGamesPage(1);
  }, [gamesSearch]);

  useEffect(() => {
    setSubscriptionsPage(1);
  }, [subscriptionsSearch]);

  const handleAddItem = () => {
    setModalType('add');
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: Game | Testimonial) => {
    setModalType('edit');
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      if (activeTab === 'games') {
        await gamesService.delete(id);
        refetchGames();
        toast.success('Game deleted successfully');
      } else if (activeTab === 'subscriptions') {
        await subscriptionsService.delete(id);
        refetchSubscriptions();
        toast.success('Subscription deleted successfully');
      } else if (activeTab === 'screenshots') {
        await testimonialsService.delete(id);
        refetchTestimonials();
        toast.success('Screenshot deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleModalSave = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    
    // Refetch data based on active tab
    if (activeTab === 'games') {
      refetchGames();
    } else if (activeTab === 'subscriptions') {
      refetchSubscriptions();
    } else if (activeTab === 'screenshots') {
      refetchTestimonials();
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number, tab: string) => {
    if (tab === 'games') {
      setGamesPage(page);
    } else if (tab === 'subscriptions') {
      setSubscriptionsPage(page);
    } else if (tab === 'screenshots') {
      setScreenshotsPage(page);
    }
  };

  // Pagination component
  const renderPagination = (currentPage: number, totalPages: number, tab: string) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center space-x-2 mt-6">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1), tab)}
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
              onClick={() => handlePageChange(page, tab)}
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
              onClick={() => handlePageChange(totalPages, tab)}
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
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1), tab)}
          disabled={currentPage === totalPages}
          className="flex items-center space-x-1 px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const renderGamesTab = () => (
    <div className="space-y-6">
      {/* Header with Add Button and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <h3 className="text-xl font-bold text-gray-800">Manage Games</h3>
          <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm font-medium">
            {filteredGames.length} games
          </span>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search games..."
              value={gamesSearch}
              onChange={(e) => setGamesSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm w-full sm:w-64"
            />
          </div>
          <button
            onClick={handleAddItem}
            className="flex items-center space-x-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-colors shadow-lg"
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
          <p className="text-red-600">Failed to load games</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedGames.map((game) => (
              <div key={game.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative">
                  <img
                    src={game.image}
                    alt={game.title}
                    className="w-full h-48 object-cover"
                  />
                  {game.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      -{game.discount}%
                    </div>
                  )}
                  {game.edition && game.edition !== 'Standard' && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {game.edition}
                    </div>
                  )}
                  {game.is_recommended && (
                    <div className="absolute bottom-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 rounded-full text-xs font-bold">
                      ⭐ Recommended
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-gray-800 mb-2 line-clamp-2">{game.title}</h4>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-lg font-bold text-orange-500">₹{game.rent_1_month || game.sale_price}</span>
                    {game.original_price > (game.rent_1_month || game.sale_price) && (
                      <span className="text-sm text-gray-500 line-through">₹{game.original_price}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded text-xs">
                      {game.platform.join(', ')}
                    </span>
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                      {game.type.join(', ')}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditItem(game)}
                      className="flex-1 flex items-center justify-center space-x-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteItem(game.id!)}
                      className="flex-1 flex items-center justify-center space-x-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination for Games */}
          {renderPagination(gamesPage, gamesTotalPages, 'games')}
        </>
      )}
    </div>
  );

  const renderSubscriptionsTab = () => (
    <div className="space-y-6">
      {/* Header with Add Button and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <h3 className="text-xl font-bold text-gray-800">Manage Subscriptions</h3>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
            {filteredSubscriptions.length} subscriptions
          </span>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={subscriptionsSearch}
              onChange={(e) => setSubscriptionsSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm w-full sm:w-64"
            />
          </div>
          <button
            onClick={handleAddItem}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-colors shadow-lg"
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
          <p className="text-red-600">Failed to load subscriptions</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedSubscriptions.map((subscription) => (
              <div key={subscription.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative">
                  <img
                    src={subscription.image}
                    alt={subscription.title}
                    className="w-full h-48 object-cover"
                  />
                  {subscription.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      -{subscription.discount}%
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    Subscription
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-gray-800 mb-2 line-clamp-2">{subscription.title}</h4>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-lg font-bold text-purple-500">₹{subscription.sale_price}</span>
                    {subscription.original_price > subscription.sale_price && (
                      <span className="text-sm text-gray-500 line-through">₹{subscription.original_price}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                      {subscription.platform.join(', ')}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditItem(subscription)}
                      className="flex-1 flex items-center justify-center space-x-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteItem(subscription.id!)}
                      className="flex-1 flex items-center justify-center space-x-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination for Subscriptions */}
          {renderPagination(subscriptionsPage, subscriptionsTotalPages, 'subscriptions')}
        </>
      )}
    </div>
  );

  const renderScreenshotsTab = () => (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h3 className="text-xl font-bold text-gray-800">Upload Screenshots</h3>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {testimonials.length} screenshots
          </span>
        </div>
        <button
          onClick={handleAddItem}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors shadow-lg"
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
          <p className="text-red-600">Failed to load screenshots</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTestimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative">
                  {/* Phone Frame */}
                  <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-t-xl p-2">
                    <div className="bg-black rounded-lg p-1">
                      <img
                        src={testimonial.image}
                        alt="Customer screenshot"
                        className="w-full h-64 object-cover rounded-lg"
                        style={{ aspectRatio: '9/16' }}
                      />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Uploaded: {new Date(testimonial.created_at || '').toLocaleDateString()}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditItem(testimonial)}
                      className="flex-1 flex items-center justify-center space-x-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteItem(testimonial.id!)}
                      className="flex-1 flex items-center justify-center space-x-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination for Screenshots */}
          {renderPagination(screenshotsPage, testimonialsTotalPages, 'screenshots')}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={onBackToHome}
          className="flex items-center space-x-2 text-cyan-600 hover:text-orange-500 transition-colors mb-8 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your gaming inventory and customer testimonials
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'games', name: 'Games', count: filteredGames.length },
                { id: 'subscriptions', name: 'Subscriptions', count: filteredSubscriptions.length },
                { id: 'screenshots', name: 'Screenshots', count: testimonials.length }
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
                  <span>{tab.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
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
        {isModalOpen && (
          <AdminModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onSave={handleModalSave}
            type={modalType}
            item={selectedItem}
            category={activeTab === 'screenshots' ? 'testimonial' : activeTab === 'subscriptions' ? 'subscription' : 'game'}
          />
        )}
      </div>
    </div>
  );
};

// Admin Modal Component
interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  type: 'add' | 'edit';
  item: Game | Testimonial | null;
  category: 'game' | 'subscription' | 'testimonial';
}

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onSave, type, item, category }) => {
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (type === 'edit' && item) {
        setFormData(item);
      } else {
        // Initialize form data based on category
        if (category === 'game') {
          setFormData({
            title: '',
            edition: 'Standard',
            base_game_id: '',
            edition_features: [],
            image: '',
            original_price: 0,
            rent_1_month: 0,
            rent_3_months: 0,
            rent_6_months: 0,
            rent_12_months: 0,
            permanent_offline_price: 0,
            permanent_online_price: 0,
            platform: [],
            discount: 0,
            description: '',
            type: [],
            show_in_bestsellers: false,
            is_recommended: false
          });
        } else if (category === 'subscription') {
          setFormData({
            title: '',
            image: '',
            original_price: 0,
            sale_price: 0,
            platform: ['Subscription'],
            discount: 0,
            description: '',
            type: ['Permanent']
          });
        } else {
          setFormData({
            image: ''
          });
        }
      }
    }
  }, [isOpen, type, item, category]);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field]?.includes(value)
        ? prev[field].filter((item: string) => item !== value)
        : [...(prev[field] || []), value]
    }));
  };

  const handleFeatureAdd = () => {
    const newFeature = prompt('Enter new edition feature:');
    if (newFeature?.trim()) {
      setFormData((prev: any) => ({
        ...prev,
        edition_features: [...(prev.edition_features || []), newFeature.trim()]
      }));
    }
  };

  const handleFeatureRemove = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      edition_features: prev.edition_features?.filter((_: any, i: number) => i !== index) || []
    }));
  };

  const handleImageUpload = async (file: File) => {
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
      handleInputChange('image', data.secure_url);
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
    setIsSubmitting(true);

    try {
      if (category === 'game') {
        if (type === 'add') {
          await gamesService.add(formData);
          toast.success('Game added successfully');
        } else {
          await gamesService.update(formData.id, formData);
          toast.success('Game updated successfully');
        }
      } else if (category === 'subscription') {
        if (type === 'add') {
          await subscriptionsService.add(formData);
          toast.success('Subscription added successfully');
        } else {
          await subscriptionsService.update(formData.id, formData);
          toast.success('Subscription updated successfully');
        }
      } else if (category === 'testimonial') {
        if (type === 'add') {
          await testimonialsService.add(formData);
          toast.success('Screenshot added successfully');
        } else {
          await testimonialsService.update(formData.id, formData);
          toast.success('Screenshot updated successfully');
        }
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-[70] p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {type === 'add' ? 'Add' : 'Edit'} {category === 'testimonial' ? 'Screenshot' : category === 'subscription' ? 'Subscription' : 'Game'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {category === 'testimonial' ? (
            // Testimonial Form
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Screenshot Image</label>
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-cyan-400 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('testimonial-file-input')?.click()}
                >
                  {isUploading ? (
                    <div className="space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
                      <p className="text-gray-600">Uploading...</p>
                    </div>
                  ) : formData.image ? (
                    <div className="space-y-2">
                      <img src={formData.image} alt="Preview" className="w-32 h-48 object-cover mx-auto rounded-lg" />
                      <p className="text-green-600 font-medium">Image uploaded successfully!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <p className="text-gray-600">Click to upload phone screenshot</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
                <input
                  id="testimonial-file-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="hidden"
                />
                <input
                  type="url"
                  placeholder="Or paste image URL directly"
                  value={formData.image || ''}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                />
              </div>
            </div>
          ) : (
            // Game/Subscription Form
            <>
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  required
                />
              </div>

              {/* Edition (Games Only) */}
              {category === 'game' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Edition</label>
                  <select
                    value={formData.edition || 'Standard'}
                    onChange={(e) => handleInputChange('edition', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="Deluxe">Deluxe</option>
                  </select>
                </div>
              )}

              {/* Edition Features (Premium/Deluxe Only) */}
              {category === 'game' && formData.edition && formData.edition !== 'Standard' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Edition Features</label>
                  <div className="space-y-2">
                    {(formData.edition_features || []).map((feature: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
                        <span className="flex-1 text-sm">{feature}</span>
                        <button
                          type="button"
                          onClick={() => handleFeatureRemove(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleFeatureAdd}
                      className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Feature</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image</label>
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-cyan-400 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    {isUploading ? (
                      <div className="space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
                        <p className="text-gray-600">Uploading...</p>
                      </div>
                    ) : formData.image ? (
                      <div className="space-y-2">
                        <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover mx-auto rounded-lg" />
                        <p className="text-green-600 font-medium">Image uploaded successfully!</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                        <p className="text-gray-600">Click to upload image</p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="hidden"
                  />
                  <input
                    type="url"
                    placeholder="Or paste image URL directly"
                    value={formData.image || ''}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                </div>
              </div>

              {category !== 'testimonial' && (
                <>
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      rows={3}
                      required
                    />
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price (₹)</label>
                      <input
                        type="number"
                        value={formData.original_price || ''}
                        onChange={(e) => handleInputChange('original_price', parseFloat(e.target.value) || 0)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    {category === 'subscription' ? (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Price (₹)</label>
                        <input
                          type="number"
                          value={formData.sale_price || ''}
                          onChange={(e) => handleInputChange('sale_price', parseFloat(e.target.value) || 0)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Discount (%)</label>
                        <input
                          type="number"
                          value={formData.discount || ''}
                          onChange={(e) => handleInputChange('discount', parseInt(e.target.value) || 0)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                          min="0"
                          max="100"
                        />
                      </div>
                    )}
                  </div>

                  {/* Game-specific pricing */}
                  {category === 'game' && (
                    <>
                      {/* Rental Pricing */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Rental Pricing (₹)</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">1 Month</label>
                            <input
                              type="number"
                              value={formData.rent_1_month || ''}
                              onChange={(e) => handleInputChange('rent_1_month', parseFloat(e.target.value) || 0)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">3 Months</label>
                            <input
                              type="number"
                              value={formData.rent_3_months || ''}
                              onChange={(e) => handleInputChange('rent_3_months', parseFloat(e.target.value) || 0)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">6 Months</label>
                            <input
                              type="number"
                              value={formData.rent_6_months || ''}
                              onChange={(e) => handleInputChange('rent_6_months', parseFloat(e.target.value) || 0)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">12 Months</label>
                            <input
                              type="number"
                              value={formData.rent_12_months || ''}
                              onChange={(e) => handleInputChange('rent_12_months', parseFloat(e.target.value) || 0)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Permanent Pricing */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Permanent Pricing (₹)</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Offline Only</label>
                            <input
                              type="number"
                              value={formData.permanent_offline_price || ''}
                              onChange={(e) => handleInputChange('permanent_offline_price', parseFloat(e.target.value) || 0)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Offline + Online</label>
                            <input
                              type="number"
                              value={formData.permanent_online_price || ''}
                              onChange={(e) => handleInputChange('permanent_online_price', parseFloat(e.target.value) || 0)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Platform Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Platform</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {category === 'subscription' ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="subscription-platform"
                            checked={formData.platform?.includes('Subscription')}
                            onChange={() => handleArrayToggle('platform', 'Subscription')}
                            className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                          />
                          <label htmlFor="subscription-platform" className="text-sm text-gray-700">Subscription</label>
                        </div>
                      ) : (
                        ['PS4', 'PS5', 'PSVR2', 'Xbox'].map((platform) => (
                          <div key={platform} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={platform}
                              checked={formData.platform?.includes(platform)}
                              onChange={() => handleArrayToggle('platform', platform)}
                              className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                            />
                            <label htmlFor={platform} className="text-sm text-gray-700">{platform}</label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Type Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {category === 'subscription' ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="permanent-type"
                            checked={formData.type?.includes('Permanent')}
                            onChange={() => handleArrayToggle('type', 'Permanent')}
                            className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                          />
                          <label htmlFor="permanent-type" className="text-sm text-gray-700">Permanent</label>
                        </div>
                      ) : (
                        ['Rent', 'Permanent Offline', 'Permanent Offline + Online'].map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={type}
                              checked={formData.type?.includes(type)}
                              onChange={() => handleArrayToggle('type', type)}
                              className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                            />
                            <label htmlFor={type} className="text-sm text-gray-700">{type}</label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Game-specific options */}
                  {category === 'game' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="show-in-bestsellers"
                          checked={formData.show_in_bestsellers || false}
                          onChange={(e) => handleInputChange('show_in_bestsellers', e.target.checked)}
                          className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        <label htmlFor="show-in-bestsellers" className="text-sm text-gray-700">Show in Bestsellers</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is-recommended"
                          checked={formData.is_recommended || false}
                          onChange={(e) => handleInputChange('is_recommended', e.target.checked)}
                          className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        <label htmlFor="is-recommended" className="text-sm text-gray-700">⭐ Recommended</label>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Submit Button */}
          <div className="flex space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 text-white py-3 rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{type === 'add' ? 'Add' : 'Update'} {category === 'testimonial' ? 'Screenshot' : category === 'subscription' ? 'Subscription' : 'Game'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPage;