import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Upload, Crop, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';

interface Game {
  id: number;
  title: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  rentPrice?: number;
  platform: string[];
  discount: number;
  description: string;
  features: string[];
  systemRequirements: string[];
  type: string[];
}

interface Testimonial {
  id: number;
  name: string;
  time: string;
  message: string;
  reply: string;
  avatar: string;
}

interface AdminPageProps {
  onBackToHome: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome }) => {
  const [activeSection, setActiveSection] = useState<'main' | 'testimonials' | 'stock'>('main');
  const [stockType, setStockType] = useState<'games' | 'subscriptions' | null>(null);
  const [crudOperation, setCrudOperation] = useState<'create' | 'read' | 'update' | 'delete' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isImageCropperOpen, setIsImageCropperOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Sample data - in real app this would come from backend
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: 1,
      name: "Alex StreamKing",
      time: "Today 2:45 PM",
      message: "Just got GTA V Premium Edition! Instant delivery as promised. You guys are amazing! 🎮",
      reply: "Thank you Alex! Enjoy your gaming session! 🚀",
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150"
    }
  ]);

  const [games, setGames] = useState<Game[]>([
    {
      id: 1,
      title: "Grand Theft Auto V Premium Edition",
      image: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=400",
      originalPrice: 59.99,
      salePrice: 19.99,
      rentPrice: 5.99,
      platform: ["PS5"],
      discount: 67,
      description: "Experience the award-winning Grand Theft Auto V with enhanced graphics and performance on PlayStation 5.",
      features: ["Enhanced graphics", "Complete story", "Online multiplayer"],
      systemRequirements: ["PlayStation 5 console required", "50 GB storage"],
      type: ["Permanent", "Rent"]
    }
  ]);

  const [formData, setFormData] = useState<any>({});

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setIsImageCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageCrop = (croppedImage: string) => {
    setFormData({ ...formData, image: croppedImage });
    setIsImageCropperOpen(false);
    setUploadedImage(null);
    toast.success('Image cropped successfully!');
  };

  const handleSaveItem = () => {
    if (activeSection === 'testimonials') {
      if (crudOperation === 'create') {
        const newTestimonial: Testimonial = {
          id: Date.now(),
          ...formData
        };
        setTestimonials([...testimonials, newTestimonial]);
        toast.success('Testimonial added successfully!');
      } else if (crudOperation === 'update' && selectedItem) {
        setTestimonials(testimonials.map(t => t.id === selectedItem.id ? { ...t, ...formData } : t));
        toast.success('Testimonial updated successfully!');
      }
    } else if (activeSection === 'stock') {
      if (crudOperation === 'create') {
        const newGame: Game = {
          id: Date.now(),
          ...formData,
          discount: Math.round(((formData.originalPrice - formData.salePrice) / formData.originalPrice) * 100)
        };
        setGames([...games, newGame]);
        toast.success('Game added successfully!');
      } else if (crudOperation === 'update' && selectedItem) {
        setGames(games.map(g => g.id === selectedItem.id ? { ...g, ...formData } : g));
        toast.success('Game updated successfully!');
      }
    }
    
    setFormData({});
    setSelectedItem(null);
    setCrudOperation(null);
  };

  const handleDeleteItem = (id: number) => {
    if (activeSection === 'testimonials') {
      setTestimonials(testimonials.filter(t => t.id !== id));
      toast.success('Testimonial deleted successfully!');
    } else if (activeSection === 'stock') {
      setGames(games.filter(g => g.id !== id));
      toast.success('Game deleted successfully!');
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
        Choose Operation for {stockType === 'games' ? 'Games' : 'Subscriptions'}
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

  const renderGameForm = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {crudOperation === 'create' ? 'Add New Game' : 'Edit Game'}
      </h2>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Game Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Game Image</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {formData.image ? (
                <div className="relative">
                  <img src={formData.image} alt="Game" className="w-full h-48 object-cover rounded-lg" />
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
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer text-cyan-600 hover:text-cyan-700"
                  >
                    Click to upload image
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Game Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Game Title</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Enter game title"
            />
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Platform</label>
            <div className="space-y-2">
              {['PS4', 'PS5'].map((platform) => (
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
              placeholder="Enter game description"
            />
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Features (one per line)</label>
            <textarea
              value={formData.features?.join('\n') || ''}
              onChange={(e) => setFormData({ ...formData, features: e.target.value.split('\n').filter(f => f.trim()) })}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
            />
          </div>

          {/* System Requirements */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">System Requirements (one per line)</label>
            <textarea
              value={formData.systemRequirements?.join('\n') || ''}
              onChange={(e) => setFormData({ ...formData, systemRequirements: e.target.value.split('\n').filter(r => r.trim()) })}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Requirement 1&#10;Requirement 2&#10;Requirement 3"
            />
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleSaveItem}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Game</span>
          </button>
          <button
            onClick={() => {
              setFormData({});
              setCrudOperation(null);
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const renderItemsList = () => {
    const items = activeSection === 'testimonials' ? testimonials : games;
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {activeSection === 'testimonials' ? 'Testimonials' : 'Games'} List
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
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderImageCropper = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Crop Image</h3>
        
        <div className="mb-6">
          <img src={uploadedImage || ''} alt="Crop preview" className="w-full max-h-96 object-contain rounded-lg" />
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={() => handleImageCrop(uploadedImage || '')}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Crop className="w-5 h-5" />
            <span>Apply Crop</span>
          </button>
          <button
            onClick={() => {
              setIsImageCropperOpen(false);
              setUploadedImage(null);
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

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
            {crudOperation === 'create' && renderGameForm()}
            {crudOperation === 'update' && renderGameForm()}
            {crudOperation === 'read' && renderItemsList()}
          </>
        )}
        
        {activeSection === 'stock' && (
          <>
            {!stockType && renderStockTypeSelection()}
            {stockType && !crudOperation && renderCrudOperations()}
            {stockType && crudOperation === 'create' && renderGameForm()}
            {stockType && crudOperation === 'update' && renderGameForm()}
            {stockType && crudOperation === 'read' && renderItemsList()}
          </>
        )}
        
        {isImageCropperOpen && renderImageCropper()}
      </div>
    </div>
  );
};

export default AdminPage;