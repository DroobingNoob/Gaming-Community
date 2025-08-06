import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Upload, X, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { gamesService, subscriptionsService, testimonialsService } from '../services/supabaseService';
import { Game, Testimonial } from '../config/supabase';

interface AdminPageProps {
  onBackToHome: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome }) => {
  const [activeTab, setActiveTab] = useState<'games' | 'subscriptions' | 'screenshots'>('games');
  const [games, setGames] = useState<Game[]>([]);
  const [subscriptions, setSubscriptions] = useState<Game[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Game | Testimonial | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [uploading, setUploading] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'games') {
        const gamesData = await gamesService.getAll();
        setGames(gamesData);
      } else if (activeTab === 'subscriptions') {
        const subscriptionsData = await subscriptionsService.getAll();
        setSubscriptions(subscriptionsData);
      } else if (activeTab === 'screenshots') {
        const testimonialsData = await testimonialsService.getAll();
        setTestimonials(testimonialsData);
      }
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (activeTab === 'games') {
      setFormData({
        title: '',
        image: '',
        original_price: '',
        sale_price: '',
        rent_1_month: '',
        rent_3_months: '',
        rent_6_months: '',
        permanent_offline_price: '',
        permanent_online_price: '',
        platform: [],
        discount: 0,
        description: '',
        type: [],
        show_in_bestsellers: false,
        is_recommended: false,
        edition: 'Standard',
        base_game_id: '',
        edition_features: []
      });
    } else if (activeTab === 'subscriptions') {
      setFormData({
        title: '',
        image: '',
        original_price: '',
        sale_price: '',
        platform: [],
        discount: 0,
        description: '',
        type: []
      });
    } else {
      setFormData({
        image: ''
      });
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (item: Game | Testimonial) => {
    setEditingItem(item);
    if (activeTab === 'screenshots') {
      setFormData({
        image: (item as Testimonial).image
      });
    } else {
      const game = item as Game;
      setFormData({
        title: game.title || '',
        image: game.image || '',
        original_price: game.original_price || '',
        sale_price: game.sale_price || '',
        rent_1_month: game.rent_1_month || '',
        rent_3_months: game.rent_3_months || '',
        rent_6_months: game.rent_6_months || '',
        permanent_offline_price: game.permanent_offline_price || '',
        permanent_online_price: game.permanent_online_price || '',
        platform: game.platform || [],
        discount: game.discount || 0,
        description: game.description || '',
        type: game.type || [],
        show_in_bestsellers: game.show_in_bestsellers || false,
        is_recommended: game.is_recommended || false,
        edition: game.edition || 'Standard',
        base_game_id: game.base_game_id || '',
        edition_features: game.edition_features || []
      });
    }
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      if (activeTab === 'games') {
        await gamesService.delete(id);
        toast.success('Game deleted successfully');
      } else if (activeTab === 'subscriptions') {
        await subscriptionsService.delete(id);
        toast.success('Subscription deleted successfully');
      } else {
        await testimonialsService.delete(id);
        toast.success('Screenshot deleted successfully');
      }
      loadData();
    } catch (error) {
      toast.error('Failed to delete item');
      console.error(error);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'gaming_community');

      const response = await fetch('https://api.cloudinary.com/v1_1/dcodirzsc/image/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await handleImageUpload(file);
      setFormData({ ...formData, image: imageUrl });
      toast.success('Image uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeTab === 'games') {
        const gameData = {
          ...formData,
          original_price: parseFloat(formData.original_price) || 0,
          sale_price: parseFloat(formData.sale_price) || 0,
          rent_1_month: parseFloat(formData.rent_1_month) || null,
          rent_3_months: parseFloat(formData.rent_3_months) || null,
          rent_6_months: parseFloat(formData.rent_6_months) || null,
          permanent_offline_price: parseFloat(formData.permanent_offline_price) || null,
          permanent_online_price: parseFloat(formData.permanent_online_price) || null,
          discount: parseInt(formData.discount) || 0,
          platform: Array.isArray(formData.platform) ? formData.platform : [formData.platform].filter(Boolean),
          type: Array.isArray(formData.type) ? formData.type : [formData.type].filter(Boolean),
          edition_features: Array.isArray(formData.edition_features) ? formData.edition_features : [],
          show_in_bestsellers: Boolean(formData.show_in_bestsellers),
          is_recommended: Boolean(formData.is_recommended)
        };

        if (editingItem) {
          await gamesService.update(editingItem.id!, gameData);
          toast.success('Game updated successfully');
        } else {
          await gamesService.add(gameData);
          toast.success('Game added successfully');
        }
      } else if (activeTab === 'subscriptions') {
        const subscriptionData = {
          ...formData,
          original_price: parseFloat(formData.original_price) || 0,
          sale_price: parseFloat(formData.sale_price) || 0,
          discount: parseInt(formData.discount) || 0,
          platform: Array.isArray(formData.platform) ? formData.platform : [formData.platform].filter(Boolean),
          type: Array.isArray(formData.type) ? formData.type : [formData.type].filter(Boolean)
        };

        if (editingItem) {
          await subscriptionsService.update(editingItem.id!, subscriptionData);
          toast.success('Subscription updated successfully');
        } else {
          await subscriptionsService.add(subscriptionData);
          toast.success('Subscription added successfully');
        }
      } else {
        if (editingItem) {
          await testimonialsService.update(editingItem.id!, formData);
          toast.success('Screenshot updated successfully');
        } else {
          await testimonialsService.add(formData);
          toast.success('Screenshot added successfully');
        }
      }

      setShowForm(false);
      loadData();
    } catch (error) {
      toast.error('Failed to save item');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleArrayInput = (field: string, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData({ ...formData, [field]: items });
  };

  const toggleBestseller = async (game: Game) => {
    try {
      await gamesService.update(game.id!, { 
        show_in_bestsellers: !game.show_in_bestsellers 
      });
      toast.success(`Game ${!game.show_in_bestsellers ? 'added to' : 'removed from'} bestsellers`);
      loadData();
    } catch (error) {
      toast.error('Failed to update bestseller status');
      console.error(error);
    }
  };

  const toggleRecommended = async (game: Game) => {
    try {
      await gamesService.update(game.id!, { 
        is_recommended: !game.is_recommended 
      });
      toast.success(`Game ${!game.is_recommended ? 'added to' : 'removed from'} recommendations`);
      loadData();
    } catch (error) {
      toast.error('Failed to update recommendation status');
      console.error(error);
    }
  };

  const renderForm = () => {
    if (activeTab === 'screenshots') {
      return (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Screenshot Image
            </label>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
                disabled={uploading}
              />
              {uploading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Uploading image...</p>
                </div>
              )}
              <input
                type="url"
                placeholder="Or paste image URL"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
                required
              />
              {formData.image && (
                <div className="mt-4">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-32 h-auto rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingItem ? 'Update Screenshot' : 'Add Screenshot'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Image</label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
                disabled={uploading}
              />
              <input
                type="url"
                placeholder="Or paste image URL"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
                required
              />
              {uploading && (
                <div className="text-center py-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400 mx-auto"></div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price</label>
            <input
              type="number"
              step="0.01"
              value={formData.original_price}
              onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Price</label>
            <input
              type="number"
              step="0.01"
              value={formData.sale_price}
              onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
              required
            />
          </div>

          {activeTab === 'games' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">1 Month Rent</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rent_1_month}
                  onChange={(e) => setFormData({ ...formData, rent_1_month: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">3 Months Rent</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rent_3_months}
                  onChange={(e) => setFormData({ ...formData, rent_3_months: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">6 Months Rent</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rent_6_months}
                  onChange={(e) => setFormData({ ...formData, rent_6_months: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Permanent Offline Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.permanent_offline_price}
                  onChange={(e) => setFormData({ ...formData, permanent_offline_price: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Permanent Online Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.permanent_online_price}
                  onChange={(e) => setFormData({ ...formData, permanent_online_price: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Edition</label>
                <select
                  value={formData.edition}
                  onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Base Game ID (for editions)</label>
                <input
                  type="text"
                  value={formData.base_game_id}
                  onChange={(e) => setFormData({ ...formData, base_game_id: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Leave empty for base game"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Platform (comma-separated)</label>
            <input
              type="text"
              value={Array.isArray(formData.platform) ? formData.platform.join(', ') : formData.platform}
              onChange={(e) => handleArrayInput('platform', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="PS5, PS4, Xbox"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type (comma-separated)</label>
            <input
              type="text"
              value={Array.isArray(formData.type) ? formData.type.join(', ') : formData.type}
              onChange={(e) => handleArrayInput('type', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Rent, Permanent Offline, Permanent Offline + Online"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Discount (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          {activeTab === 'games' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Edition Features (comma-separated)</label>
              <input
                type="text"
                value={Array.isArray(formData.edition_features) ? formData.edition_features.join(', ') : ''}
                onChange={(e) => handleArrayInput('edition_features', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Extra content, Season pass, DLC"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
            rows={4}
            required
          />
        </div>

        {activeTab === 'games' && (
          <div className="flex space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.show_in_bestsellers}
                onChange={(e) => setFormData({ ...formData, show_in_bestsellers: e.target.checked })}
                className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
              />
              <span className="text-sm font-medium text-gray-700">Show in Bestsellers</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_recommended}
                onChange={(e) => setFormData({ ...formData, is_recommended: e.target.checked })}
                className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
              />
              <span className="text-sm font-medium text-gray-700">Put in Recommendation</span>
            </label>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading || uploading}
            className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : editingItem ? `Update ${activeTab.slice(0, -1)}` : `Add ${activeTab.slice(0, -1)}`}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  };

  const renderGamesList = () => (
    <div className="space-y-4">
      {games.map((game) => (
        <div key={game.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-start space-x-4">
            <img
              src={game.image}
              alt={game.title}
              className="w-20 h-20 object-cover rounded-lg shadow-md"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{game.title}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-cyan-400 text-white px-2 py-1 rounded text-sm">
                      {game.platform.join(', ')}
                    </span>
                    <span className="bg-orange-500 text-white px-2 py-1 rounded text-sm">
                      {game.edition}
                    </span>
                    {game.show_in_bestsellers && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">
                        Bestseller
                      </span>
                    )}
                    {game.is_recommended && (
                      <span className="bg-purple-500 text-white px-2 py-1 rounded text-sm">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{game.description}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-green-600 font-semibold">₹{game.sale_price}</span>
                    {game.original_price > game.sale_price && (
                      <span className="text-gray-500 line-through">₹{game.original_price}</span>
                    )}
                    {game.discount > 0 && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                        -{game.discount}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleBestseller(game)}
                    className={`p-2 rounded-lg transition-colors ${
                      game.show_in_bestsellers
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    title={game.show_in_bestsellers ? 'Remove from bestsellers' : 'Add to bestsellers'}
                  >
                    {game.show_in_bestsellers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => toggleRecommended(game)}
                    className={`p-2 rounded-lg transition-colors ${
                      game.is_recommended
                        ? 'bg-purple-500 text-white hover:bg-purple-600'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    title={game.is_recommended ? 'Remove from recommendations' : 'Add to recommendations'}
                  >
                    ⭐
                  </button>
                  <button
                    onClick={() => handleEdit(game)}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(game.id!)}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSubscriptionsList = () => (
    <div className="space-y-4">
      {subscriptions.map((subscription) => (
        <div key={subscription.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-start space-x-4">
            <img
              src={subscription.image}
              alt={subscription.title}
              className="w-20 h-20 object-cover rounded-lg shadow-md"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{subscription.title}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-cyan-400 text-white px-2 py-1 rounded text-sm">
                      {subscription.platform.join(', ')}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{subscription.description}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-green-600 font-semibold">₹{subscription.sale_price}</span>
                    {subscription.original_price > subscription.sale_price && (
                      <span className="text-gray-500 line-through">₹{subscription.original_price}</span>
                    )}
                    {subscription.discount > 0 && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                        -{subscription.discount}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(subscription)}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(subscription.id!)}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderScreenshotsList = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {testimonials.map((testimonial) => (
        <div key={testimonial.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
          <div className="relative mb-4">
            <img
              src={testimonial.image}
              alt="Customer screenshot"
              className="w-full aspect-[9/16] object-cover rounded-lg shadow-md"
            />
          </div>
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => handleEdit(testimonial)}
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(testimonial.id!)}
              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

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
              onClick={handleAdd}
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-6 py-3 rounded-full font-semibold transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Add {activeTab.slice(0, -1)}</span>
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
          {[
            { key: 'games', label: 'Games' },
            { key: 'subscriptions', label: 'Subscriptions' },
            { key: 'screenshots', label: 'Screenshots' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as any);
                setShowForm(false);
              }}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          {showForm ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingItem ? `Edit ${activeTab.slice(0, -1)}` : `Add New ${activeTab.slice(0, -1)}`}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              {renderForm()}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 capitalize">
                  {activeTab} Management
                </h2>
                <div className="text-sm text-gray-600">
                  Total: {activeTab === 'games' ? games.length : activeTab === 'subscriptions' ? subscriptions.length : testimonials.length}
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading {activeTab}...</p>
                </div>
              ) : (
                <>
                  {activeTab === 'games' && renderGamesList()}
                  {activeTab === 'subscriptions' && renderSubscriptionsList()}
                  {activeTab === 'screenshots' && renderScreenshotsList()}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;