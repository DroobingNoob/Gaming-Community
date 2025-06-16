import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Upload, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  gamesService, 
  subscriptionsService, 
  testimonialsService, 
  storageService,
  Game, 
  Testimonial 
} from '../services/firebaseService';
import { useGames, useSubscriptions, useTestimonials } from '../hooks/useFirebaseData';

interface AdminPageProps {
  onBackToHome: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome }) => {
  const [activeSection, setActiveSection] = useState<'main' | 'testimonials' | 'stock'>('main');
  const [stockType, setStockType] = useState<'games' | 'subscriptions' | null>(null);
  const [crudOperation, setCrudOperation] = useState<'create' | 'read' | 'update' | 'delete' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // Firebase data hooks
  const { games, refetch: refetchGames } = useGames();
  const { subscriptions, refetch: refetchSubscriptions } = useSubscriptions();
  const { testimonials, refetch: refetchTestimonials } = useTestimonials();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        const timestamp = Date.now();
        const fileName = `${activeSection}/${timestamp}_${file.name}`;
        const imageUrl = await storageService.uploadImage(file, fileName);
        setFormData({ ...formData, image: imageUrl });
        toast.success('Image uploaded successfully!');
      } catch (error) {
        toast.error('Failed to upload image');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveItem = async () => {
    try {
      setLoading(true);
      
      if (activeSection === 'testimonials') {
        if (crudOperation === 'create') {
          await testimonialsService.add(formData);
          toast.success('Testimonial added successfully!');
          refetchTestimonials();
        } else if (crudOperation === 'update' && selectedItem) {
          await testimonialsService.update(selectedItem.id, formData);
          toast.success('Testimonial updated successfully!');
          refetchTestimonials();
        }
      } else if (activeSection === 'stock') {
        // Calculate discount
        const discount = formData.originalPrice && formData.salePrice 
          ? Math.round(((formData.originalPrice - formData.salePrice) / formData.originalPrice) * 100)
          : 0;
        
        const itemData = {
          ...formData,
          discount,
          platform: Array.isArray(formData.platform) ? formData.platform : [formData.platform],
          type: Array.isArray(formData.type) ? formData.type : [formData.type],
          features: Array.isArray(formData.features) ? formData.features : formData.features?.split('\n').filter((f: string) => f.trim()) || [],
          systemRequirements: Array.isArray(formData.systemRequirements) ? formData.systemRequirements : formData.systemRequirements?.split('\n').filter((r: string) => r.trim()) || []
        };

        if (stockType === 'games') {
          if (crudOperation === 'create') {
            await gamesService.add(itemData);
            toast.success('Game added successfully!');
            refetchGames();
          } else if (crudOperation === 'update' && selectedItem) {
            await gamesService.update(selectedItem.id, itemData);
            toast.success('Game updated successfully!');
            refetchGames();
          }
        } else if (stockType === 'subscriptions') {
          if (crudOperation === 'create') {
            await subscriptionsService.add(itemData);
            toast.success('Subscription added successfully!');
            refetchSubscriptions();
          } else if (crudOperation === 'update' && selectedItem) {
            await subscriptionsService.update(selectedItem.id, itemData);
            toast.success('Subscription updated successfully!');
            refetchSubscriptions();
          }
        }
      }
      
      setFormData({});
      setSelectedItem(null);
      setCrudOperation(null);
    } catch (error) {
      toast.error('Failed to save item');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      setLoading(true);
      
      if (activeSection === 'testimonials') {
        await testimonialsService.delete(id);
        toast.success('Testimonial deleted successfully!');
        refetchTestimonials();
      } else if (activeSection === 'stock') {
        if (stockType === 'games') {
          await gamesService.delete(id);
          toast.success('Game deleted successfully!');
          refetchGames();
        } else if (stockType === 'subscriptions') {
          await subscriptionsService.delete(id);
          toast.success('Subscription deleted successfully!');
          refetchSubscriptions();
        }
      }
    } catch (error) {
      toast.error('Failed to delete item');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderMainMenu = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-8">
        Admin Dashboard
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => setActiveSection('testimonials')}
          className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <div className="text-center">
            <Edit className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Update Testimonials</h3>
            <p className="text-sm opacity-90">Manage customer testimonials and reviews</p>
          </div>
        </button>
        
        <button
          onClick={() => setActiveSection('stock')}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <div className="text-center">
            <Plus className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Update Stock</h3>
            <p className="text-sm opacity-90">Manage games and subscription inventory</p>
          </div>
        </button>
      </div>
    </div>
  );

  const renderStockTypeSelection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose Stock Type</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => setStockType('games')}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <h3 className="text-lg font-bold">Games</h3>
          <p className="text-sm opacity-90">Manage PS4 & PS5 games</p>
        </button>
        
        <button
          onClick={() => setStockType('subscriptions')}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <h3 className="text-lg font-bold">Subscriptions</h3>
          <p className="text-sm opacity-90">Manage subscription services</p>
        </button>
      </div>
    </div>
  );

  const renderCrudOperations = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Choose Operation for {activeSection === 'testimonials' ? 'Testimonials' : stockType === 'games' ? 'Games' : 'Subscriptions'}
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setCrudOperation('create')}
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg transition-colors"
        >
          <Plus className="w-6 h-6 mx-auto mb-2" />
          <span className="text-sm font-medium">Add</span>
        </button>
        
        <button
          onClick={() => setCrudOperation('read')}
          className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg transition-colors"
        >
          <Edit className="w-6 h-6 mx-auto mb-2" />
          <span className="text-sm font-medium">View</span>
        </button>
        
        <button
          onClick={() => setCrudOperation('update')}
          className="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-lg transition-colors"
        >
          <Edit className="w-6 h-6 mx-auto mb-2" />
          <span className="text-sm font-medium">Edit</span>
        </button>
        
        <button
          onClick={() => setCrudOperation('delete')}
          className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-lg transition-colors"
        >
          <Trash2 className="w-6 h-6 mx-auto mb-2" />
          <span className="text-sm font-medium">Delete</span>
        </button>
      </div>
    </div>
  );

  const renderForm = () => {
    const isTestimonial = activeSection === 'testimonials';
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {crudOperation === 'create' ? 'Add New' : 'Edit'} {isTestimonial ? 'Testimonial' : stockType === 'games' ? 'Game' : 'Subscription'}
        </h2>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {isTestimonial ? 'Avatar' : 'Image'}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {formData.image ? (
                  <div className="relative">
                    <img src={formData.image} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    <button
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={loading}
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer text-cyan-600 hover:text-cyan-700"
                    >
                      {loading ? 'Uploading...' : 'Click to upload image'}
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Form fields based on type */}
            {isTestimonial ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                  <input
                    type="text"
                    value={formData.time || ''}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="e.g., Today 2:45 PM"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                  <textarea
                    value={formData.message || ''}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="Customer message"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reply</label>
                  <textarea
                    value={formData.reply || ''}
                    onChange={(e) => setFormData({ ...formData, reply: e.target.value })}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="Your reply"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="Enter title"
                  />
                </div>

                {/* Platform Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Platform</label>
                  <div className="space-y-2">
                    {(stockType === 'games' ? ['PS4', 'PS5'] : ['Xbox', 'PlayStation', 'PC', 'Nintendo Switch', 'Apple']).map((platform) => (
                      <label key={platform} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.platform?.includes(platform) || false}
                          onChange={(e) => {
                            const platforms = formData.platform || [];
                            if (e.target.checked) {
                              setFormData({ ...formData, platform: [...platforms, platform] });
                            } else {
                              setFormData({ ...formData, platform: platforms.filter((p: string) => p !== platform) });
                            }
                          }}
                          className="rounded"
                        />
                        <span>{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                  <div className="space-y-2">
                    {['Permanent', 'Rent'].map((type) => (
                      <label key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.type?.includes(type) || false}
                          onChange={(e) => {
                            const types = formData.type || [];
                            if (e.target.checked) {
                              setFormData({ ...formData, type: [...types, type] });
                            } else {
                              setFormData({ ...formData, type: types.filter((t: string) => t !== type) });
                            }
                          }}
                          className="rounded"
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice || ''}
                    onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.salePrice || ''}
                    onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="0.00"
                  />
                </div>

                {formData.type?.includes('Rent') && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Rent Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.rentPrice || ''}
                      onChange={(e) => setFormData({ ...formData, rentPrice: parseFloat(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      placeholder="0.00"
                    />
                  </div>
                )}

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="Enter description"
                  />
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Features (one per line)</label>
                  <textarea
                    value={Array.isArray(formData.features) ? formData.features.join('\n') : formData.features || ''}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  />
                </div>

                {/* System Requirements */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">System Requirements (one per line)</label>
                  <textarea
                    value={Array.isArray(formData.systemRequirements) ? formData.systemRequirements.join('\n') : formData.systemRequirements || ''}
                    onChange={(e) => setFormData({ ...formData, systemRequirements: e.target.value })}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="Requirement 1&#10;Requirement 2&#10;Requirement 3"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleSaveItem}
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={() => {
                setFormData({});
                setCrudOperation(null);
                setSelectedItem(null);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderItemsList = () => {
    let items: any[] = [];
    
    if (activeSection === 'testimonials') {
      items = testimonials;
    } else if (stockType === 'games') {
      items = games;
    } else if (stockType === 'subscriptions') {
      items = subscriptions;
    }
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {activeSection === 'testimonials' ? 'Testimonials' : stockType === 'games' ? 'Games' : 'Subscriptions'} List
        </h2>
        
        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {activeSection === 'testimonials' ? (
                  <>
                    <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h3 className="font-bold text-gray-800">{item.name}</h3>
                      <p className="text-gray-600 text-sm">{item.message.substring(0, 50)}...</p>
                    </div>
                  </>
                ) : (
                  <>
                    <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-cover" />
                    <div>
                      <h3 className="font-bold text-gray-800">{item.title}</h3>
                      <p className="text-gray-600 text-sm">${item.salePrice} - {item.platform?.join(', ')}</p>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setFormData(item);
                    setCrudOperation('update');
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  disabled={loading}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          {items.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No items found.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBackButton = () => (
    <button
      onClick={() => {
        if (crudOperation) {
          setCrudOperation(null);
          setFormData({});
          setSelectedItem(null);
        } else if (stockType) {
          setStockType(null);
        } else if (activeSection !== 'main') {
          setActiveSection('main');
        } else {
          onBackToHome();
        }
      }}
      className="flex items-center space-x-2 text-cyan-600 hover:text-orange-500 transition-colors mb-6 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
    >
      <ArrowLeft className="w-5 h-5" />
      <span>Back</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {renderBackButton()}
        
        {activeSection === 'main' && renderMainMenu()}
        
        {activeSection === 'testimonials' && (
          <>
            {!crudOperation && renderCrudOperations()}
            {(crudOperation === 'create' || crudOperation === 'update') && renderForm()}
            {crudOperation === 'read' && renderItemsList()}
          </>
        )}
        
        {activeSection === 'stock' && (
          <>
            {!stockType && renderStockTypeSelection()}
            {stockType && !crudOperation && renderCrudOperations()}
            {stockType && (crudOperation === 'create' || crudOperation === 'update') && renderForm()}
            {stockType && crudOperation === 'read' && renderItemsList()}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;