import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Upload, Image as ImageIcon, Sparkles, Database, Settings, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  gamesService, 
  subscriptionsService, 
  testimonialsService
} from '../services/supabaseService';
import { Game, Testimonial } from '../config/supabase';
import { useGames, useSubscriptions, useTestimonials } from '../hooks/useSupabaseData';
import Loader from './Loader';

interface AdminPageProps {
  onBackToHome: () => void;
}

interface EditionFormData {
  edition: 'Standard' | 'Premium' | 'Deluxe';
  platform: string[];
  type: string[];
  original_price: number;
  sale_price: number;
  rent_1_month?: number;
  rent_3_months?: number;
  rent_6_months?: number;
  permanent_offline_price?: number;
  permanent_online_price?: number;
  edition_features?: string[];
}

interface GameFormData {
  title: string;
  image: string;
  description: string;
  show_in_bestsellers: boolean;
  availableEditions: ('Standard' | 'Premium' | 'Deluxe')[];
  editions: {
    Standard?: EditionFormData;
    Premium?: EditionFormData;
    Deluxe?: EditionFormData;
  };
}

const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome }) => {
  const [activeSection, setActiveSection] = useState<'main' | 'testimonials' | 'stock'>('main');
  const [stockType, setStockType] = useState<'games' | 'subscriptions' | null>(null);
  const [crudOperation, setCrudOperation] = useState<'create' | 'read' | 'update' | 'delete' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [gameFormData, setGameFormData] = useState<GameFormData>({
    title: '',
    image: '',
    description: '',
    show_in_bestsellers: false,
    availableEditions: ['Standard'],
    editions: {
      Standard: {
        edition: 'Standard',
        platform: ['PS5'],
        type: ['Rent'],
        original_price: 0,
        sale_price: 0
      }
    }
  });
  const [subscriptionFormData, setSubscriptionFormData] = useState<any>({});
  const [testimonialFormData, setTestimonialFormData] = useState<any>({});
  const [currentEdition, setCurrentEdition] = useState<'Standard' | 'Premium' | 'Deluxe'>('Standard');
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
    formData.append('upload_preset', 'gaming_community');
    formData.append('quality', 'auto:best');
    formData.append('fetch_format', 'auto');
    
    try {
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
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image to Cloudinary');
    }
  };

  // Enhanced image processing function
  const processImage = (file: File, isTestimonial: boolean): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          if (isTestimonial) {
            const maxWidth = 600;
            const maxHeight = 1200;
            
            let { width, height } = img;
            
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width *= ratio;
              height *= ratio;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            ctx!.imageSmoothingEnabled = true;
            ctx!.imageSmoothingQuality = 'high';
            ctx!.drawImage(img, 0, 0, width, height);
          } else {
            const targetSize = 600;
            canvas.width = targetSize;
            canvas.height = targetSize;
            
            ctx!.imageSmoothingEnabled = true;
            ctx!.imageSmoothingQuality = 'high';
            
            const minDimension = Math.min(img.width, img.height);
            const cropX = (img.width - minDimension) / 2;
            const cropY = (img.height - minDimension) / 2;
            
            ctx!.drawImage(
              img,
              cropX, cropY, minDimension, minDimension,
              0, 0, targetSize, targetSize
            );
          }
          
          canvas.toBlob((blob) => {
            if (blob) {
              const processedFile = new File([blob], file.name, { 
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(processedFile);
            } else {
              reject(new Error('Failed to process image'));
            }
          }, 'image/jpeg', 0.95);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  // Handle file upload with enhanced processing
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('Image size should be less than 20MB');
      return;
    }

    try {
      setUploading(true);
      toast.info('Processing and optimizing image...');
      
      const isTestimonial = activeSection === 'testimonials';
      const processedFile = await processImage(file, isTestimonial);
      
      toast.info('Uploading to Cloudinary...');
      const imageUrl = await uploadToCloudinary(processedFile);
      
      if (activeSection === 'testimonials') {
        setTestimonialFormData({ ...testimonialFormData, [fieldName]: imageUrl });
      } else if (stockType === 'games') {
        setGameFormData({ ...gameFormData, [fieldName]: imageUrl });
      } else {
        setSubscriptionFormData({ ...subscriptionFormData, [fieldName]: imageUrl });
      }
      
      toast.success('Image uploaded successfully with optimal quality!');
    } catch (error) {
      toast.error('Failed to process and upload image. Please try again.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveGame = async () => {
    try {
      setLoading(true);
      
      // Validate that at least one edition is selected
      if (gameFormData.availableEditions.length === 0) {
        toast.error('Please select at least one edition');
        return;
      }

      // Validate that all selected editions have data
      for (const edition of gameFormData.availableEditions) {
        const editionData = gameFormData.editions[edition];
        if (!editionData) {
          toast.error(`Please fill in data for ${edition} edition`);
          return;
        }
        if (!editionData.platform.length || !editionData.type.length) {
          toast.error(`Please select platform and type for ${edition} edition`);
          return;
        }
      }

      let baseGameId: string | null = null;

      // Create/update each edition
      for (const edition of gameFormData.availableEditions) {
        const editionData = gameFormData.editions[edition]!;
        
        // Calculate discount
        const discount = editionData.original_price && editionData.sale_price 
          ? Math.round(((editionData.original_price - editionData.sale_price) / editionData.original_price) * 100)
          : 0;

        const gameData = {
          title: gameFormData.title,
          image: gameFormData.image,
          description: gameFormData.description,
          edition: edition,
          base_game_id: baseGameId,
          platform: editionData.platform,
          type: editionData.type,
          original_price: editionData.original_price,
          sale_price: editionData.sale_price,
          rent_1_month: editionData.rent_1_month,
          rent_3_months: editionData.rent_3_months,
          rent_6_months: editionData.rent_6_months,
          permanent_offline_price: editionData.permanent_offline_price,
          permanent_online_price: editionData.permanent_online_price,
          discount: discount,
          show_in_bestsellers: gameFormData.show_in_bestsellers && edition === 'Standard', // Only Standard can be bestseller
          edition_features: edition === 'Premium' || edition === 'Deluxe' ? editionData.edition_features || [] : [],
          category: 'game'
        };

        if (crudOperation === 'create') {
          const newGameId = await gamesService.add(gameData);
          
          // If this is the Standard edition, use its ID as base_game_id for Premium
          if (edition === 'Standard') {
            baseGameId = newGameId;
            await gamesService.update(newGameId, { base_game_id: newGameId });
          } else if (baseGameId) {
            await gamesService.update(newGameId, { base_game_id: baseGameId });
          }
        } else if (crudOperation === 'update' && selectedItem) {
          // For updates, find the existing edition or create new one
          const existingEdition = games.find(game => 
            (game.base_game_id === selectedItem.base_game_id || game.id === selectedItem.base_game_id) && 
            game.edition === edition
          );
          
          if (existingEdition) {
            await gamesService.update(existingEdition.id!, gameData);
          } else {
            // Create new edition
            const newGameId = await gamesService.add({
              ...gameData,
              base_game_id: selectedItem.base_game_id || selectedItem.id
            });
          }
        }
      }

      // If updating, remove editions that are no longer selected
      if (crudOperation === 'update' && selectedItem) {
        const baseId = selectedItem.base_game_id || selectedItem.id;
        const existingEditions = games.filter(game => 
          game.base_game_id === baseId || game.id === baseId
        );
        
        for (const existingGame of existingEditions) {
          if (!gameFormData.availableEditions.includes(existingGame.edition as 'Standard' | 'Premium' | 'Deluxe')) {
            await gamesService.delete(existingGame.id!);
          }
        }
      }
      
      toast.success(crudOperation === 'create' ? 'Game added successfully!' : 'Game updated successfully!');
      refetchGames();
      resetGameForm();
    } catch (error) {
      toast.error('Failed to save game');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSubscription = async () => {
    try {
      setLoading(true);
      
      const discount = subscriptionFormData.original_price && subscriptionFormData.sale_price 
        ? Math.round(((subscriptionFormData.original_price - subscriptionFormData.sale_price) / subscriptionFormData.original_price) * 100)
        : 0;

      const itemData = {
        ...subscriptionFormData,
        discount,
        platform: ['Multi-Platform'],
        type: ['Permanent'],
        show_in_bestsellers: false,
        category: 'subscription'
      };

      if (crudOperation === 'create') {
        await subscriptionsService.add(itemData);
        toast.success('Subscription added successfully!');
      } else if (crudOperation === 'update' && selectedItem) {
        await subscriptionsService.update(selectedItem.id, itemData);
        toast.success('Subscription updated successfully!');
      }
      
      refetchSubscriptions();
      resetSubscriptionForm();
    } catch (error) {
      toast.error('Failed to save subscription');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTestimonial = async () => {
    try {
      setLoading(true);
      
      if (crudOperation === 'create') {
        await testimonialsService.add(testimonialFormData);
        toast.success('Screenshot added successfully!');
      } else if (crudOperation === 'update' && selectedItem) {
        await testimonialsService.update(selectedItem.id, testimonialFormData);
        toast.success('Screenshot updated successfully!');
      }
      
      refetchTestimonials();
      resetTestimonialForm();
    } catch (error) {
      toast.error('Failed to save screenshot');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async () => {
    if (activeSection === 'testimonials') {
      await handleSaveTestimonial();
    } else if (stockType === 'games') {
      await handleSaveGame();
    } else if (stockType === 'subscriptions') {
      await handleSaveSubscription();
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
      } else if (stockType === 'games') {
        // For games, we need to delete all editions
        const gameToDelete = games.find(g => g.id === id);
        if (gameToDelete) {
          const baseId = gameToDelete.base_game_id || gameToDelete.id;
          const allEditions = games.filter(g => g.base_game_id === baseId || g.id === baseId);
          
          for (const edition of allEditions) {
            await gamesService.delete(edition.id!);
          }
        }
        toast.success('Game deleted successfully!');
        refetchGames();
      } else if (stockType === 'subscriptions') {
        await subscriptionsService.delete(id);
        toast.success('Subscription deleted successfully!');
        refetchSubscriptions();
      }
    } catch (error) {
      toast.error('Failed to delete item');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditGame = (game: Game) => {
    setSelectedItem(game);
    
    // Find all editions of this game
    const baseId = game.base_game_id || game.id;
    const allEditions = games.filter(g => g.base_game_id === baseId || g.id === baseId);
    
    const formData: GameFormData = {
      title: game.title,
      image: game.image,
      description: game.description,
      show_in_bestsellers: game.show_in_bestsellers || false,
      availableEditions: allEditions.map(e => e.edition as 'Standard' | 'Premium' | 'Deluxe'),
      editions: {}
    };

    // Populate edition data
    for (const edition of allEditions) {
      formData.editions[edition.edition as 'Standard' | 'Premium' | 'Deluxe'] = {
        edition: edition.edition as 'Standard' | 'Premium' | 'Deluxe',
        platform: edition.platform,
        type: edition.type,
        original_price: edition.original_price,
        sale_price: edition.sale_price,
        rent_1_month: edition.rent_1_month,
        rent_3_months: edition.rent_3_months,
        rent_6_months: edition.rent_6_months,
        permanent_offline_price: edition.permanent_offline_price,
        permanent_online_price: edition.permanent_online_price,
        edition_features: edition.edition_features || []
      };
    }

    setGameFormData(formData);
    setCurrentEdition(allEditions[0].edition as 'Standard' | 'Premium');
    setCrudOperation('update');
  };

  const handleEditItem = (item: any) => {
    if (stockType === 'games') {
      handleEditGame(item);
    } else if (stockType === 'subscriptions') {
      setSelectedItem(item);
      setSubscriptionFormData(item);
      setCrudOperation('update');
    } else if (activeSection === 'testimonials') {
      setSelectedItem(item);
      setTestimonialFormData(item);
      setCrudOperation('update');
    }
  };

  const resetGameForm = () => {
    setGameFormData({
      title: '',
      image: '',
      description: '',
      show_in_bestsellers: false,
      availableEditions: ['Standard'],
      editions: {
        Standard: {
          edition: 'Standard',
          platform: ['PS5'],
          type: ['Rent'],
          original_price: 0,
          sale_price: 0
        }
      }
    });
    setCurrentEdition('Standard');
    setSelectedItem(null);
    setCrudOperation(null);
  };

  const resetSubscriptionForm = () => {
    setSubscriptionFormData({});
    setSelectedItem(null);
    setCrudOperation(null);
  };

  const resetTestimonialForm = () => {
    setTestimonialFormData({});
    setSelectedItem(null);
    setCrudOperation(null);
  };

  const updateEditionData = (field: string, value: any) => {
    const currentEditionData = gameFormData.editions[currentEdition] || {
      edition: currentEdition,
      platform: ['PS5'],
      type: ['Rent'],
      original_price: 0,
      sale_price: 0
    };

    setGameFormData({
      ...gameFormData,
      editions: {
        ...gameFormData.editions,
        [currentEdition]: {
          ...currentEditionData,
          [field]: value
        }
      }
    });
  };

  const addEditionFeature = () => {
    const currentEditionData = gameFormData.editions[currentEdition];
    if (currentEditionData) {
      updateEditionData('edition_features', [...(currentEditionData.edition_features || []), '']);
    }
  };

  const updateEditionFeature = (index: number, value: string) => {
    const currentEditionData = gameFormData.editions[currentEdition];
    if (currentEditionData) {
      const newFeatures = [...(currentEditionData.edition_features || [])];
      newFeatures[index] = value;
      updateEditionData('edition_features', newFeatures);
    }
  };

  const removeEditionFeature = (index: number) => {
    const currentEditionData = gameFormData.editions[currentEdition];
    if (currentEditionData) {
      const newFeatures = (currentEditionData.edition_features || []).filter((_, i) => i !== index);
      updateEditionData('edition_features', newFeatures);
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
          Manage your gaming community content with ease. Upload high-quality images, add games, and update testimonials.
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
              <ImageIcon className="w-6 h-6 text-white" />
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
              <ImageIcon className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-cyan-600 transition-colors">
              Upload Screenshots
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Upload customer phone screenshots with automatic optimization. High-quality processing with Cloudinary integration.
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
              Manage games and subscription inventory with edition-based pricing. Auto-cropping and optimization included.
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
            <p className="text-gray-600">Manage PS4 & PS5 games with edition support</p>
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

  const renderGameForm = () => {
    const currentEditionData = gameFormData.editions[currentEdition];
    
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
            {crudOperation === 'create' ? 'Add New' : 'Edit'} Game
          </h2>
          <p className="text-gray-600 text-lg">Fill in the game details and configure editions</p>
        </div>
        
        <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Basic Game Information */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Basic Game Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Game Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Game Title</label>
                <input
                  type="text"
                  value={gameFormData.title}
                  onChange={(e) => setGameFormData({ ...gameFormData, title: e.target.value })}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder="Enter game title"
                />
              </div>

              {/* Image Upload */}
              <div className="md:col-span-2">
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  Game Image Upload (Auto-cropped to 600x600px)
                </label>
                
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-cyan-400 transition-colors bg-gradient-to-br from-gray-50 to-blue-50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'image')}
                      className="hidden"
                      id="game-image-upload"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="game-image-upload"
                      className={`cursor-pointer flex flex-col items-center space-y-4 ${uploading ? 'opacity-50' : ''}`}
                    >
                      <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-4 rounded-2xl">
                        <Upload className="w-10 h-10 text-white" />
                      </div>
                      <div className="text-center">
                        <span className="text-lg font-medium text-gray-700 block mb-2">
                          {uploading ? 'Processing & Uploading...' : 'Click to upload game image'}
                        </span>
                        <span className="text-sm text-gray-500">
                          Will be auto-cropped to square format (600x600px) with high quality
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="relative">
                    <span className="text-sm text-gray-500 mb-3 block">Or paste image URL manually:</span>
                    <input
                      type="url"
                      value={gameFormData.image}
                      onChange={(e) => setGameFormData({ ...gameFormData, image: e.target.value })}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      placeholder="https://res.cloudinary.com/your-cloud-name/image/upload/..."
                    />
                  </div>

                  {gameFormData.image && (
                    <div className="relative">
                      <img 
                        src={gameFormData.image} 
                        alt="Preview" 
                        className="mx-auto rounded-2xl border shadow-xl w-64 h-64 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          toast.error('Invalid image URL');
                        }}
                      />
                      <div className="mt-2 text-center text-sm text-gray-500">
                        Game Image Preview (600x600px when uploaded)
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Description</label>
                <textarea
                  value={gameFormData.description}
                  onChange={(e) => setGameFormData({ ...gameFormData, description: e.target.value })}
                  rows={4}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder="Enter game description"
                />
              </div>

              {/* Show in Bestsellers */}
              <div className="md:col-span-2">
                <label className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                  <input
                    type="checkbox"
                    checked={gameFormData.show_in_bestsellers}
                    onChange={(e) => setGameFormData({ ...gameFormData, show_in_bestsellers: e.target.checked })}
                    className="rounded w-5 h-5 text-purple-600"
                  />
                  <div>
                    <span className="font-semibold text-purple-800">Show in Bestsellers on Homepage</span>
                    <p className="text-sm text-purple-600">Check this to display the game in the bestsellers section (Standard edition only)</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Edition Selection */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Available Editions</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={gameFormData.availableEditions.includes('Standard')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setGameFormData({
                          ...gameFormData,
                          availableEditions: [...gameFormData.availableEditions, 'Standard'],
                          editions: {
                            ...gameFormData.editions,
                            Standard: {
                              edition: 'Standard',
                              platform: ['PS5'],
                              type: ['Rent'],
                              original_price: 0,
                              sale_price: 0
                            }
                          }
                        });
                      } else {
                        const newEditions = gameFormData.availableEditions.filter(e => e !== 'Standard');
                        const newEditionData = { ...gameFormData.editions };
                        delete newEditionData.Standard;
                        setGameFormData({
                          ...gameFormData,
                          availableEditions: newEditions,
                          editions: newEditionData
                        });
                        if (currentEdition === 'Standard' && newEditions.length > 0) {
                          setCurrentEdition(newEditions[0]);
                        }
                      }
                    }}
                    className="rounded w-5 h-5 text-cyan-600"
                  />
                  <span className="font-medium text-gray-800">Standard Edition</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={gameFormData.availableEditions.includes('Premium')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setGameFormData({
                          ...gameFormData,
                          availableEditions: [...gameFormData.availableEditions, 'Premium'],
                          editions: {
                            ...gameFormData.editions,
                            Premium: {
                              edition: 'Premium',
                              platform: ['PS5'],
                              type: ['Rent'],
                              original_price: 0,
                              sale_price: 0,
                              edition_features: []
                            }
                          }
                        });
                      } else {
                        const newEditions = gameFormData.availableEditions.filter(e => e !== 'Premium');
                        const newEditionData = { ...gameFormData.editions };
                        delete newEditionData.Premium;
                        setGameFormData({
                          ...gameFormData,
                          availableEditions: newEditions,
                          editions: newEditionData
                        });
                        if (currentEdition === 'Premium' && newEditions.length > 0) {
                          setCurrentEdition(newEditions[0]);
                        }
                      }
                    }}
                    className="rounded w-5 h-5 text-purple-600"
                  />
                  <span className="font-medium text-gray-800">Deluxe Edition</span>
                </label>
              </div>

              {gameFormData.availableEditions.length === 0 && (
                <p className="text-red-600 text-sm">Please select at least one edition</p>
              )}
            </div>
          </div>

          {/* Edition Configuration */}
          {gameFormData.availableEditions.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Edition Configuration</h3>
              
              {/* Edition Tabs */}
              <div className="flex space-x-2 mb-6">
                {gameFormData.availableEditions.map((edition) => (
                  <button
                    key={edition}
                    onClick={() => setCurrentEdition(edition)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      currentEdition === edition
                        ? edition === 'Standard'
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg'
                          : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {edition} Edition
                  </button>
                ))}
              </div>

              {/* Edition Form */}
              {currentEditionData && (
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                  <h4 className="text-lg font-bold text-gray-800 mb-6">
                    {currentEdition} Edition Settings
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Platform Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Platform</label>
                      <div className="space-y-3">
                        {['PS4', 'PS5'].map((platform) => (
                          <label key={platform} className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              checked={currentEditionData.platform.includes(platform)}
                              onChange={(e) => {
                                const platforms = currentEditionData.platform;
                                if (e.target.checked) {
                                  updateEditionData('platform', [...platforms, platform]);
                                } else {
                                  updateEditionData('platform', platforms.filter(p => p !== platform));
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
                        {['Rent', 'Permanent Offline', 'Permanent Offline + Online'].map((type) => (
                          <label key={type} className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              checked={currentEditionData.type.includes(type)}
                              onChange={(e) => {
                                const types = currentEditionData.type;
                                if (e.target.checked) {
                                  updateEditionData('type', [...types, type]);
                                } else {
                                  updateEditionData('type', types.filter(t => t !== type));
                                }
                              }}
                              className="rounded w-5 h-5 text-orange-600"
                            />
                            <span className="font-medium">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Premium Edition Features */}
                    {currentEdition === 'Premium' && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Deluxe Edition Features</label>
                        <div className="space-y-2">
                          {(currentEditionData.edition_features || []).map((feature: string, index: number) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Star className="w-4 h-4 text-purple-500 flex-shrink-0" />
                              <input
                                type="text"
                                value={feature}
                                onChange={(e) => updateEditionFeature(index, e.target.value)}
                                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                placeholder="Enter feature"
                              />
                              <button
                                type="button"
                                onClick={() => removeEditionFeature(index)}
                                className="text-red-500 hover:text-red-700 p-2"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addEditionFeature}
                            className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center space-x-1"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Feature</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Pricing */}
                    <div className="md:col-span-2">
                      <h5 className="text-md font-bold text-gray-800 mb-4">Pricing</h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Original Price */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price (₹)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={currentEditionData.original_price || ''}
                            onChange={(e) => updateEditionData('original_price', parseFloat(e.target.value) || 0)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>

                        {/* Sale Price */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Price (₹)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={currentEditionData.sale_price || ''}
                            onChange={(e) => updateEditionData('sale_price', parseFloat(e.target.value) || 0)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>

                        {/* Rental Prices - Only show if Rent type is selected */}
                        {currentEditionData.type.includes('Rent') && (
                          <>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">1 Month Rent (₹)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={currentEditionData.rent_1_month || ''}
                                onChange={(e) => updateEditionData('rent_1_month', parseFloat(e.target.value) || undefined)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                                placeholder="0.00"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">3 Months Rent (₹)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={currentEditionData.rent_3_months || ''}
                                onChange={(e) => updateEditionData('rent_3_months', parseFloat(e.target.value) || undefined)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                                placeholder="0.00"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">6 Months Rent (₹)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={currentEditionData.rent_6_months || ''}
                                onChange={(e) => updateEditionData('rent_6_months', parseFloat(e.target.value) || undefined)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                                placeholder="0.00"
                              />
                            </div>
                          </>
                        )}

                        {/* Permanent Offline Price */}
                        {currentEditionData.type.includes('Permanent Offline') && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Permanent Offline Price (₹)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={currentEditionData.permanent_offline_price || ''}
                              onChange={(e) => updateEditionData('permanent_offline_price', parseFloat(e.target.value) || undefined)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                              placeholder="0.00"
                            />
                          </div>
                        )}

                        {/* Permanent Offline + Online Price */}
                        {currentEditionData.type.includes('Permanent Offline + Online') && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Permanent Offline + Online Price (₹)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={currentEditionData.permanent_online_price || ''}
                              onChange={(e) => updateEditionData('permanent_online_price', parseFloat(e.target.value) || undefined)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                              placeholder="0.00"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Save/Cancel Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleSaveItem}
              disabled={loading || uploading}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Saving...' : uploading ? 'Processing...' : 'Save Game'}</span>
            </button>
            <button
              onClick={resetGameForm}
              className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSubscriptionForm = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
          {crudOperation === 'create' ? 'Add New' : 'Edit'} Subscription
        </h2>
        <p className="text-gray-600 text-lg">Fill in the subscription details</p>
      </div>
      
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Upload Section */}
          <div className="md:col-span-2">
            <label className="block text-lg font-semibold text-gray-700 mb-4">
              Subscription Image Upload (Auto-cropped to 600x600px)
            </label>
            
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-cyan-400 transition-colors bg-gradient-to-br from-gray-50 to-blue-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'image')}
                  className="hidden"
                  id="subscription-image-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="subscription-image-upload"
                  className={`cursor-pointer flex flex-col items-center space-y-4 ${uploading ? 'opacity-50' : ''}`}
                >
                  <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-4 rounded-2xl">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-medium text-gray-700 block mb-2">
                      {uploading ? 'Processing & Uploading...' : 'Click to upload subscription image'}
                    </span>
                    <span className="text-sm text-gray-500">
                      Will be auto-cropped to square format (600x600px) with high quality
                    </span>
                  </div>
                </label>
              </div>

              <div className="relative">
                <span className="text-sm text-gray-500 mb-3 block">Or paste image URL manually:</span>
                <input
                  type="url"
                  value={subscriptionFormData.image || ''}
                  onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, image: e.target.value })}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder="https://res.cloudinary.com/your-cloud-name/image/upload/..."
                />
              </div>

              {subscriptionFormData.image && (
                <div className="relative">
                  <img 
                    src={subscriptionFormData.image} 
                    alt="Preview" 
                    className="mx-auto rounded-2xl border shadow-xl w-64 h-64 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      toast.error('Invalid image URL');
                    }}
                  />
                  <div className="mt-2 text-center text-sm text-gray-500">
                    Subscription Image Preview (600x600px when uploaded)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Title</label>
            <input
              type="text"
              value={subscriptionFormData.title || ''}
              onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, title: e.target.value })}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="Enter title"
            />
          </div>

          {/* Pricing */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Original Price (₹)</label>
            <input
              type="number"
              step="0.01"
              value={subscriptionFormData.original_price || ''}
              onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, original_price: parseFloat(e.target.value) })}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Sale Price (₹)</label>
            <input
              type="number"
              step="0.01"
              value={subscriptionFormData.sale_price || ''}
              onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, sale_price: parseFloat(e.target.value) })}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Description</label>
            <textarea
              value={subscriptionFormData.description || ''}
              onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, description: e.target.value })}
              rows={4}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="Enter description"
            />
          </div>
        </div>

        <div className="flex space-x-4 mt-8">
          <button
            onClick={handleSaveItem}
            disabled={loading || uploading}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Saving...' : uploading ? 'Processing...' : 'Save'}</span>
          </button>
          <button
            onClick={resetSubscriptionForm}
            className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const renderTestimonialForm = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
          {crudOperation === 'create' ? 'Add New' : 'Edit'} Screenshot
        </h2>
        <p className="text-gray-600 text-lg">Upload customer phone screenshot</p>
      </div>
      
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
        {/* Image Upload Section */}
        <div className="md:col-span-2">
          <label className="block text-lg font-semibold text-gray-700 mb-4">
            Phone Screenshot Upload (High Quality)
          </label>
          
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-cyan-400 transition-colors bg-gradient-to-br from-gray-50 to-blue-50">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'image')}
                className="hidden"
                id="testimonial-image-upload"
                disabled={uploading}
              />
              <label
                htmlFor="testimonial-image-upload"
                className={`cursor-pointer flex flex-col items-center space-y-4 ${uploading ? 'opacity-50' : ''}`}
              >
                <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-4 rounded-2xl">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                <div className="text-center">
                  <span className="text-lg font-medium text-gray-700 block mb-2">
                    {uploading ? 'Processing & Uploading...' : 'Click to upload phone screenshot'}
                  </span>
                  <span className="text-sm text-gray-500">
                    Phone resolution optimized automatically (max 600x1200px)
                  </span>
                </div>
              </label>
            </div>

            <div className="relative">
              <span className="text-sm text-gray-500 mb-3 block">Or paste image URL manually:</span>
              <input
                type="url"
                value={testimonialFormData.image || ''}
                onChange={(e) => setTestimonialFormData({ ...testimonialFormData, image: e.target.value })}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                placeholder="https://res.cloudinary.com/your-cloud-name/image/upload/..."
              />
            </div>

            {testimonialFormData.image && (
              <div className="relative">
                <img 
                  src={testimonialFormData.image} 
                  alt="Preview" 
                  className="mx-auto rounded-2xl border shadow-xl w-48 h-auto max-h-96"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    toast.error('Invalid image URL');
                  }}
                />
                <div className="mt-2 text-center text-sm text-gray-500">
                  Phone Screenshot Preview
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-4 mt-8">
          <button
            onClick={handleSaveItem}
            disabled={loading || uploading}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Saving...' : uploading ? 'Processing...' : 'Save'}</span>
          </button>
          <button
            onClick={resetTestimonialForm}
            className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const renderItemsList = () => {
    let items: any[] = [];
    
    if (activeSection === 'testimonials') {
      items = testimonials;
    } else if (stockType === 'games') {
      // Group games by title and show only one entry per game (with edition info)
      const gameGroups = games.reduce((groups, game) => {
        if (!groups[game.title]) {
          groups[game.title] = [];
        }
        groups[game.title].push(game);
        return groups;
      }, {} as { [title: string]: Game[] });

      items = Object.values(gameGroups).map(group => {
        const standardEdition = group.find(g => g.edition === 'Standard') || group[0];
        return {
          ...standardEdition,
          editions: group.map(g => g.edition).join(', '),
          editionCount: group.length
        };
      });
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
                      <div className="flex items-center space-x-2">
                        <p className="text-gray-600">₹{item.sale_price} - {item.platform?.join(', ')}</p>
                        {stockType === 'games' && item.editionCount > 1 && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {item.editionCount} editions
                          </span>
                        )}
                      </div>
                      {stockType === 'games' && item.editions && (
                        <p className="text-sm text-gray-500">Editions: {item.editions}</p>
                      )}
                      {stockType === 'games' && item.show_in_bestsellers && (
                        <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mt-1">
                          Bestseller
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => handleEditItem(item)}
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
          if (stockType === 'games') {
            resetGameForm();
          } else if (stockType === 'subscriptions') {
            resetSubscriptionForm();
          } else {
            resetTestimonialForm();
          }
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

  // Show loader while data is being fetched
  if (games.length === 0 && subscriptions.length === 0 && testimonials.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {renderBackButton()}
          <Loader size="large" message="Loading admin dashboard..." fullScreen={false} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {renderBackButton()}
        
        {activeSection === 'main' && renderMainMenu()}
        
        {activeSection === 'testimonials' && (
          <>
            {!crudOperation && renderCrudOperations()}
            {(crudOperation === 'create' || crudOperation === 'update') && renderTestimonialForm()}
            {crudOperation === 'read' && renderItemsList()}
          </>
        )}
        
        {activeSection === 'stock' && (
          <>
            {!stockType && renderStockTypeSelection()}
            {stockType && !crudOperation && renderCrudOperations()}
            {stockType === 'games' && (crudOperation === 'create' || crudOperation === 'update') && renderGameForm()}
            {stockType === 'subscriptions' && (crudOperation === 'create' || crudOperation === 'update') && renderSubscriptionForm()}
            {stockType && crudOperation === 'read' && renderItemsList()}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;