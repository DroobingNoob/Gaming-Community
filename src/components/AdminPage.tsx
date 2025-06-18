import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Upload, Image, Sparkles, Database, Settings } from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  gamesService, 
  subscriptionsService, 
  testimonialsService
} from '../services/supabaseService';
import { Game, Testimonial } from '../config/supabase';
import { useGames, useSubscriptions, useTestimonials } from '../hooks/useSupabaseData';

interface AdminPageProps {
  onBackToHome: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome }) => {
  const [activeSection, setActiveSection] = useState<'main' | 'testimonials' | 'stock'>('main');
  const [stockType, setStockType] = useState<'games' | 'subscriptions' | null>(null);
  const [crudOperation, setCrudOperation] = useState<'create' | 'read' | 'update' | 'delete' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Supabase data hooks
  const { games, refetch: refetchGames } = useGames();
  const { subscriptions, refetch: refetchSubscriptions } = useSubscriptions();
  const { testimonials, refetch: refetchTestimonials } = useTestimonials();

  // Cloudinary upload function
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'gaming_community'); // You'll need to create this preset
    
    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dcodirzsc/image/upload', // Replace with your cloud name
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
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image to Cloudinary');
    }
  };

  // Handle file upload with cropping for product cards
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      toast.info('Processing and uploading image...');
      
      // Create canvas for cropping to square aspect ratio
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = async () => {
        // Set canvas size to square (400x400 for product cards)
        const size = 400;
        canvas.width = size;
        canvas.height = size;
        
        // Calculate crop dimensions to maintain aspect ratio
        const minDimension = Math.min(img.width, img.height);
        const cropX = (img.width - minDimension) / 2;
        const cropY = (img.height - minDimension) / 2;
        
        // Draw cropped and resized image
        ctx?.drawImage(
          img,
          cropX, cropY, minDimension, minDimension, // Source crop
          0, 0, size, size // Destination size
        );
        
        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              // Create file from blob
              const croppedFile = new File([blob], file.name, { type: 'image/jpeg' });
              
              // Upload to Cloudinary
              const imageUrl = await uploadToCloudinary(croppedFile);
              
              setFormData({ ...formData, [fieldName]: imageUrl });
              toast.success('Image processed and uploaded successfully!');
            } catch (error) {
              toast.error('Failed to upload processed image. Please try again.');
              console.error(error);
            } finally {
              setUploading(false);
            }
          }
        }, 'image/jpeg', 0.9);
      };
      
      img.src = URL.createObjectURL(file);
    } catch (error) {
      toast.error('Failed to process image. Please try again.');
      console.error(error);
      setUploading(false);
    }
  };

  const handleSaveItem = async () => {
    try {
      setLoading(true);
      
      if (activeSection === 'testimonials') {
        if (crudOperation === 'create') {
          await testimonialsService.add(formData);
          toast.success('Screenshot added successfully!');
          refetchTestimonials();
        } else if (crudOperation === 'update' && selectedItem) {
          await testimonialsService.update(selectedItem.id, formData);
          toast.success('Screenshot updated successfully!');
          refetchTestimonials();
        }
      } else if (activeSection === 'stock') {
        // Calculate discount
        const discount = formData.original_price && formData.sale_price 
          ? Math.round(((formData.original_price - formData.sale_price) / formData.original_price) * 100)
          : 0;
        
        const itemData = {
          ...formData,
          discount,
          platform: Array.isArray(formData.platform) ? formData.platform : [formData.platform],
          type: Array.isArray(formData.type) ? formData.type : [formData.type],
          features: Array.isArray(formData.features) ? formData.features : formData.features?.split('\n').filter((f: string) => f.trim()) || [],
          system_requirements: Array.isArray(formData.system_requirements) ? formData.system_requirements : formData.system_requirements?.split('\n').filter((r: string) => r.trim()) || []
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
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      setLoading(true);
      
      if (activeSection === 'testimonials') {
        await testimonialsService.delete(id);
        toast.success('Screenshot deleted successfully!');
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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-3 rounded-full">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h2>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Manage your gaming community content with ease. Upload images, add games, and update testimonials.
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-3 rounded-xl">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{games.length}</h3>
              <p className="text-gray-600">Total Games</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-orange-400 to-red-500 p-3 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{subscriptions.length}</h3>
              <p className="text-gray-600">Subscriptions</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-purple-400 to-indigo-500 p-3 rounded-xl">
              <Image className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{testimonials.length}</h3>
              <p className="text-gray-600">Screenshots</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          onClick={() => setActiveSection('testimonials')}
          className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
        >
          <div className="text-center">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-600 p-6 rounded-2xl mx-auto w-fit mb-6 transition-all duration-300">
              <Image className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-cyan-600 transition-colors">
              Upload Screenshots
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Upload customer phone screenshots and testimonials. Drag & drop images with automatic Cloudinary integration.
            </p>
            <div className="mt-6 inline-flex items-center space-x-2 text-cyan-600 font-medium">
              <span>Manage Screenshots</span>
              <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => setActiveSection('stock')}
          className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
        >
          <div className="text-center">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 group-hover:from-orange-600 group-hover:to-red-600 p-6 rounded-2xl mx-auto w-fit mb-6 transition-all duration-300">
              <Plus className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-orange-600 transition-colors">
              Manage Stock
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Manage games and subscription inventory. Add new products, update pricing, and organize your catalog.
            </p>
            <div className="mt-6 inline-flex items-center space-x-2 text-orange-600 font-medium">
              <span>Manage Inventory</span>
              <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStockTypeSelection = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
          Choose Stock Type
        </h2>
        <p className="text-gray-600 text-lg">Select the type of content you want to manage</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div 
          onClick={() => setStockType('games')}
          className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
        >
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 group-hover:from-purple-600 group-hover:to-indigo-600 p-4 rounded-xl mx-auto w-fit mb-4 transition-all duration-300">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">Games</h3>
            <p className="text-gray-600">Manage PS4 & PS5 games</p>
          </div>
        </div>
        
        <div 
          onClick={() => setStockType('subscriptions')}
          className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
        >
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 group-hover:from-green-600 group-hover:to-emerald-600 p-4 rounded-xl mx-auto w-fit mb-4 transition-all duration-300">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">Subscriptions</h3>
            <p className="text-gray-600">Manage subscription services</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCrudOperations = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
          Choose Operation for {activeSection === 'testimonials' ? 'Screenshots' : stockType === 'games' ? 'Games' : 'Subscriptions'}
        </h2>
        <p className="text-gray-600 text-lg">Select what you want to do</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div 
          onClick={() => setCrudOperation('create')}
          className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 group-hover:from-green-600 group-hover:to-emerald-600 p-3 rounded-xl mx-auto w-fit mb-3 transition-all duration-300">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-800 group-hover:text-green-600 transition-colors">Add New</span>
          </div>
        </div>
        
        <div 
          onClick={() => setCrudOperation('read')}
          className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:from-blue-600 group-hover:to-cyan-600 p-3 rounded-xl mx-auto w-fit mb-3 transition-all duration-300">
              <Edit className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">View & Edit All</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderForm = () => {
    const isTestimonial = activeSection === 'testimonials';
    
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
            {crudOperation === 'create' ? 'Add New' : 'Edit'} {isTestimonial ? 'Screenshot' : stockType === 'games' ? 'Game' : 'Subscription'}
          </h2>
          <p className="text-gray-600 text-lg">Fill in the details below</p>
        </div>
        
        <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Upload Section */}
            <div className={isTestimonial ? "md:col-span-2" : "md:col-span-2"}>
              <label className="block text-lg font-semibold text-gray-700 mb-4">
                {isTestimonial ? 'Phone Screenshot Upload' : 'Game Image Upload (Auto-cropped to square)'}
              </label>
              
              {/* File Upload Option */}
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-cyan-400 transition-colors bg-gradient-to-br from-gray-50 to-blue-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'image')}
                    className="hidden"
                    id="file-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="file-upload"
                    className={`cursor-pointer flex flex-col items-center space-y-4 ${uploading ? 'opacity-50' : ''}`}
                  >
                    <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-4 rounded-2xl">
                      <Upload className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-center">
                      <span className="text-lg font-medium text-gray-700 block mb-2">
                        {uploading ? 'Processing & Uploading...' : `Click to upload ${isTestimonial ? 'phone screenshot' : 'game image'}`}
                      </span>
                      <span className="text-sm text-gray-500">
                        {isTestimonial ? 'Phone resolution (9:16 aspect ratio recommended)' : 'Will be auto-cropped to square format (400x400px)'}
                      </span>
                    </div>
                  </label>
                </div>

                {/* Manual URL Input (Fallback) */}
                <div className="relative">
                  <span className="text-sm text-gray-500 mb-3 block">Or paste image URL manually:</span>
                  <input
                    type="url"
                    value={formData.image || ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="https://res.cloudinary.com/your-cloud-name/image/upload/..."
                  />
                </div>

                {/* Image Preview */}
                {formData.image && (
                  <div className="relative">
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      className={`mx-auto rounded-2xl border shadow-xl ${
                        isTestimonial 
                          ? 'w-48 h-auto max-h-96' // Phone screenshot dimensions
                          : 'w-64 h-64 object-cover' // Square game image dimensions
                      }`}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        toast.error('Invalid image URL');
                      }}
                    />
                  </div>
                )}

                {/* Cloudinary Setup Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-3">Cloudinary Setup Required:</h4>
                      <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                        <li>Create account at <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">cloudinary.com</a></li>
                        <li>Replace "dcodirzsc" in the code with your actual cloud name</li>
                        <li>Create an unsigned upload preset named "gaming_community"</li>
                        <li>Enable unsigned uploads in your Cloudinary settings</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form fields based on type */}
            {!isTestimonial && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Title</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="Enter title"
                  />
                </div>

                {/* Platform Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Platform</label>
                  <div className="space-y-3">
                    {(stockType === 'games' ? ['PS4', 'PS5'] : ['Xbox', 'PlayStation', 'PC', 'Nintendo Switch', 'Apple']).map((platform) => (
                      <label key={platform} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
                          className="rounded w-5 h-5 text-cyan-600"
                        />
                        <span className="font-medium">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Type</label>
                  <div className="space-y-3">
                    {['Permanent', 'Rent'].map((type) => (
                      <label key={type} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
                          className="rounded w-5 h-5 text-orange-600"
                        />
                        <span className="font-medium">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Original Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.original_price || ''}
                    onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) })}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Sale Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sale_price || ''}
                    onChange={(e) => setFormData({ ...formData, sale_price: parseFloat(e.target.value) })}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                {formData.type?.includes('Rent') && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Rent Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.rent_price || ''}
                      onChange={(e) => setFormData({ ...formData, rent_price: parseFloat(e.target.value) })}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                )}

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="Enter description"
                  />
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Features (one per line)</label>
                  <textarea
                    value={Array.isArray(formData.features) ? formData.features.join('\n') : formData.features || ''}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    rows={4}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  />
                </div>

                {/* System Requirements */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">System Requirements (one per line)</label>
                  <textarea
                    value={Array.isArray(formData.system_requirements) ? formData.system_requirements.join('\n') : formData.system_requirements || ''}
                    onChange={(e) => setFormData({ ...formData, system_requirements: e.target.value })}
                    rows={4}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="Requirement 1&#10;Requirement 2&#10;Requirement 3"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex space-x-4 mt-8">
            <button
              onClick={handleSaveItem}
              disabled={loading || uploading}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Saving...' : uploading ? 'Uploading...' : 'Save'}</span>
            </button>
            <button
              onClick={() => {
                setFormData({});
                setCrudOperation(null);
                setSelectedItem(null);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
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
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
            {activeSection === 'testimonials' ? 'Screenshots' : stockType === 'games' ? 'Games' : 'Subscriptions'} List
          </h2>
          <p className="text-gray-600 text-lg">Manage your existing content</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
          {items.map((item) => (
            <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 flex items-center justify-between hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center space-x-6">
                {activeSection === 'testimonials' ? (
                  <>
                    <img src={item.image} alt="Screenshot" className="w-16 h-20 rounded-xl object-cover shadow-lg" />
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Screenshot #{item.id?.slice(-6)}</h3>
                      <p className="text-gray-600">Uploaded {new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <img src={item.image} alt={item.title} className="w-20 h-20 rounded-xl object-cover shadow-lg" />
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{item.title}</h3>
                      <p className="text-gray-600">₹{item.sale_price} - {item.platform?.join(', ')}</p>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setFormData(item);
                    setCrudOperation('update');
                  }}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white p-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  disabled={loading}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white p-3 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          
          {items.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Database className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg">No items found.</p>
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
      className="flex items-center space-x-3 text-cyan-600 hover:text-orange-500 transition-colors mb-8 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105"
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="font-medium">Back</span>
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