import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Upload, Settings, LogOut, Trash2, Edit, Plus, Save, 
  RefreshCw, Bot, Star, List, Film, Play, Download,
  ChevronDown, ChevronUp, Award, Bell, Zap, Grid, Image, Eye, EyeOff,
  Search, Filter, Database, Link as LinkIcon, ExternalLink, Tv
} from 'lucide-react';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { 
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, 
  query, orderBy, setDoc, getDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Movie, Episode, AppSettings } from '../types-new';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('content');
  const [user, setUser] = useState<User | null>(null);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Content Management State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [contentType, setContentType] = useState<'movie' | 'series'>('movie');

  // Basic Info
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Exclusive');
  const [thumbnail, setThumbnail] = useState('');
  const [year, setYear] = useState('2024');
  const [rating, setRating] = useState('8.0');
  const [quality, setQuality] = useState('1080p');
  const [description, setDescription] = useState('');
  const [views, setViews] = useState('1.2K');

  // Watch & Download Options
  const [watchCode, setWatchCode] = useState('');
  const [downloadCode, setDownloadCode] = useState('');
  const [downloadLink, setDownloadLink] = useState('');

  // Premium Features
  const [isPremium, setIsPremium] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredOrder, setFeaturedOrder] = useState(1);
  const [isTop10, setIsTop10] = useState(false);
  const [top10Position, setTop10Position] = useState(1);
  const [isTrending, setIsTrending] = useState(false);
  const [storyEnabled, setStoryEnabled] = useState(false);
  const [storyImage, setStoryImage] = useState('');
  const [priority, setPriority] = useState(0);

  // Episode Management
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [showEpisodeForm, setShowEpisodeForm] = useState(false);
  const [editingEpisodeIndex, setEditingEpisodeIndex] = useState<number | null>(null);
  
  const [epTitle, setEpTitle] = useState('');
  const [epSeason, setEpSeason] = useState('1');
  const [epNumber, setEpNumber] = useState('');
  const [epDuration, setEpDuration] = useState('');
  const [epWatchCode, setEpWatchCode] = useState('');
  const [epDownloadCode, setEpDownloadCode] = useState('');
  const [epDownloadLink, setEpDownloadLink] = useState('');

  // Content List
  const [movieList, setMovieList] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // App Settings
  const [botUsername, setBotUsername] = useState('Cinaflix_Streembot');
  const [channelLink, setChannelLink] = useState('https://t.me/cineflixchannel');
  const [noticeText, setNoticeText] = useState('');
  const [noticeEnabled, setNoticeEnabled] = useState(false);
  const [appName, setAppName] = useState('CINEFLIX');
  const [primaryColor, setPrimaryColor] = useState('#FFD700');
  const [categories, setCategories] = useState<string[]>(['Exclusive', 'Korean Drama', 'Series', 'Action', 'Comedy', 'Horror']);
  const [newCategory, setNewCategory] = useState('');

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Movies
  useEffect(() => {
    if (user) {
      fetchMovies();
      fetchSettings();
    }
  }, [user]);

  // Filter Movies
  useEffect(() => {
    let filtered = movieList;
    
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterCategory !== 'All') {
      filtered = filtered.filter(m => m.category === filterCategory);
    }
    
    setFilteredMovies(filtered);
  }, [searchTerm, filterCategory, movieList]);

  const fetchMovies = async () => {
    try {
      const snapshot = await getDocs(query(collection(db, 'movies'), orderBy('createdAt', 'desc')));
      const movies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Movie[];
      setMovieList(movies);
    } catch (err) {
      console.error('Error fetching movies:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'config'));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data() as AppSettings;
        setBotUsername(data.botUsername || 'Cinaflix_Streembot');
        setChannelLink(data.channelLink || '');
        setNoticeText(data.noticeText || '');
        setNoticeEnabled(data.noticeEnabled || false);
        setAppName(data.appName || 'CINEFLIX');
        setPrimaryColor(data.primaryColor || '#FFD700');
        setCategories(data.categories || ['Exclusive', 'Korean Drama', 'Series']);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccessMsg('✅ Login successful!');
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onClose();
  };

  // Reset Form
  const resetForm = () => {
    setTitle('');
    setCategory('Exclusive');
    setThumbnail('');
    setYear('2024');
    setRating('8.0');
    setQuality('1080p');
    setDescription('');
    setViews('1.2K');
    setWatchCode('');
    setDownloadCode('');
    setDownloadLink('');
    setIsPremium(false);
    setIsFeatured(false);
    setFeaturedOrder(1);
    setIsTop10(false);
    setTop10Position(1);
    setIsTrending(false);
    setStoryEnabled(false);
    setStoryImage('');
    setPriority(0);
    setEpisodes([]);
    setIsEditing(false);
    setEditId(null);
    setContentType('movie');
  };

  // Add/Update Episode
  const handleAddEpisode = () => {
    if (!epNumber || !epTitle) {
      alert('Please fill Episode Number and Title');
      return;
    }

    const newEpisode: Episode = {
      id: `ep_${Date.now()}`,
      number: parseInt(epNumber),
      season: parseInt(epSeason),
      title: epTitle,
      duration: epDuration,
      watchCode: epWatchCode || undefined,
      downloadCode: epDownloadCode || undefined,
      downloadLink: epDownloadLink || undefined,
    };

    if (editingEpisodeIndex !== null) {
      // Update existing episode
      const updated = [...episodes];
      updated[editingEpisodeIndex] = newEpisode;
      setEpisodes(updated);
      setEditingEpisodeIndex(null);
    } else {
      // Add new episode
      setEpisodes([...episodes, newEpisode]);
    }

    // Reset episode form
    setEpTitle('');
    setEpNumber('');
    setEpDuration('');
    setEpWatchCode('');
    setEpDownloadCode('');
    setEpDownloadLink('');
    setShowEpisodeForm(false);
  };

  const handleEditEpisode = (index: number) => {
    const ep = episodes[index];
    setEpTitle(ep.title);
    setEpSeason(ep.season.toString());
    setEpNumber(ep.number.toString());
    setEpDuration(ep.duration);
    setEpWatchCode(ep.watchCode || '');
    setEpDownloadCode(ep.downloadCode || '');
    setEpDownloadLink(ep.downloadLink || '');
    setEditingEpisodeIndex(index);
    setShowEpisodeForm(true);
  };

  const handleDeleteEpisode = (index: number) => {
    if (confirm('Delete this episode?')) {
      setEpisodes(episodes.filter((_, i) => i !== index));
    }
  };

  // Save Content
  const handleSaveContent = async () => {
    if (!title || !thumbnail) {
      alert('Title and Thumbnail are required!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const contentData: Partial<Movie> = {
        title,
        thumbnail,
        category,
        year,
        rating: parseFloat(rating),
        quality,
        description,
        views,
        isPremium,
        isFeatured,
        featuredOrder: isFeatured ? featuredOrder : undefined,
        isTop10,
        top10Position: isTop10 ? top10Position : undefined,
        isTrending,
        storyEnabled,
        storyImage: storyEnabled ? storyImage : undefined,
        priority,
        createdAt: serverTimestamp(),
      };

      // Add Watch/Download codes only if provided
      if (watchCode) contentData.watchCode = watchCode;
      if (downloadCode) contentData.downloadCode = downloadCode;
      if (downloadLink) contentData.downloadLink = downloadLink;

      // Add episodes only if content is series
      if (contentType === 'series' && episodes.length > 0) {
        contentData.episodes = episodes;
      }

      if (isEditing && editId) {
        // Update
        await updateDoc(doc(db, 'movies', editId), contentData);
        setSuccessMsg('✅ Content updated!');
      } else {
        // Create
        await addDoc(collection(db, 'movies'), contentData);
        setSuccessMsg('✅ Content added!');
      }

      setTimeout(() => {
        setSuccessMsg('');
        resetForm();
        fetchMovies();
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  // Edit Content
  const handleEditContent = (movie: Movie) => {
    setIsEditing(true);
    setEditId(movie.id);
    setTitle(movie.title);
    setCategory(movie.category);
    setThumbnail(movie.thumbnail);
    setYear(movie.year || '2024');
    setRating(movie.rating.toString());
    setQuality(movie.quality || '1080p');
    setDescription(movie.description || '');
    setViews(movie.views);
    setWatchCode(movie.watchCode || '');
    setDownloadCode(movie.downloadCode || '');
    setDownloadLink(movie.downloadLink || '');
    setIsPremium(movie.isPremium || false);
    setIsFeatured(movie.isFeatured || false);
    setFeaturedOrder(movie.featuredOrder || 1);
    setIsTop10(movie.isTop10 || false);
    setTop10Position(movie.top10Position || 1);
    setIsTrending(movie.isTrending || false);
    setStoryEnabled(movie.storyEnabled || false);
    setStoryImage(movie.storyImage || '');
    setPriority(movie.priority || 0);
    setEpisodes(movie.episodes || []);
    setContentType(movie.episodes && movie.episodes.length > 0 ? 'series' : 'movie');
    setActiveTab('content');
    window.scrollTo(0, 0);
  };

  // Delete Content
  const handleDeleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      await deleteDoc(doc(db, 'movies', id));
      setSuccessMsg('✅ Content deleted!');
      setTimeout(() => setSuccessMsg(''), 2000);
      fetchMovies();
    } catch (err: any) {
      setError(err.message || 'Failed to delete');
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'config'), {
        botUsername,
        channelLink,
        noticeText,
        noticeEnabled,
        appName,
        primaryColor,
        categories,
      });
      setSuccessMsg('✅ Settings saved!');
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setCategories(categories.filter(c => c !== cat));
  };

  // Login Screen
  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[9999] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900 to-black border border-gold/20 rounded-2xl p-8 max-w-md w-full shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-300 to-gold mb-2">
              🔐 ADMIN LOGIN
            </div>
            <p className="text-gray-400 text-sm">Secure Access Required</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
                placeholder="admin@cineflix.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-gold to-yellow-500 text-black font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-gold/50 transition-all disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <button
            onClick={onClose}
            className="w-full mt-4 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </motion.div>
      </motion.div>
    );
  }

  // Main Admin Panel
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-[9999] overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-black via-gray-900 to-black border-b border-gold/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="text-gold" size={24} />
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-300">
              CINEFLIX ADMIN
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">{user.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg transition-all"
            >
              <LogOut size={16} />
              Logout
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 transition-all"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex gap-2 overflow-x-auto no-scrollbar pb-3">
          {[
            { id: 'content', label: 'Content Management', icon: Film },
            { id: 'list', label: 'Content List', icon: List },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-gold to-yellow-500 text-black'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            {successMsg}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* CONTENT MANAGEMENT TAB */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gold/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Upload className="text-gold" size={24} />
                {isEditing ? 'Edit Content' : 'Add New Content'}
              </h2>

              {/* Content Type Selector */}
              <div className="mb-6">
                <label className="block text-gray-300 text-sm mb-3">Content Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setContentType('movie')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      contentType === 'movie'
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'
                    }`}
                  >
                    <Film className="mx-auto mb-2" size={24} />
                    <div className="font-bold">Single Movie/Content</div>
                    <div className="text-xs mt-1 opacity-70">One-time watch content</div>
                  </button>
                  <button
                    onClick={() => setContentType('series')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      contentType === 'series'
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'
                    }`}
                  >
                    <Tv className="mx-auto mb-2" size={24} />
                    <div className="font-bold">Series/Seasons</div>
                    <div className="text-xs mt-1 opacity-70">Multiple episodes</div>
                  </button>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
                    placeholder="Movie/Series Title"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Thumbnail URL *</label>
                  <input
                    type="text"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
                    placeholder="https://..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Year</label>
                    <input
                      type="text"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
                      placeholder="2024"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Rating</label>
                    <input
                      type="text"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
                      placeholder="8.0"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Views</label>
                    <input
                      type="text"
                      value={views}
                      onChange={(e) => setViews(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
                      placeholder="1.2M"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Quality</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
                  >
                    <option value="4K HDR">4K HDR</option>
                    <option value="4K">4K</option>
                    <option value="1080p">1080p</option>
                    <option value="720p">720p</option>
                    <option value="HD">HD</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-300 text-sm mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50 resize-none"
                    placeholder="Brief description..."
                  />
                </div>
              </div>

              {/* Watch & Download Options (Only for Movie Type) */}
              {contentType === 'movie' && (
                <div className="mb-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Play size={18} className="text-blue-400" />
                    Watch & Download Options (Optional)
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">
                        Watch Code (Telegram)
                      </label>
                      <input
                        type="text"
                        value={watchCode}
                        onChange={(e) => setWatchCode(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                        placeholder="jawan_4k"
                      />
                      <p className="text-xs text-gray-500 mt-1">For streaming</p>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">
                        Download Code (Telegram)
                      </label>
                      <input
                        type="text"
                        value={downloadCode}
                        onChange={(e) => setDownloadCode(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                        placeholder="download_jawan_4k"
                      />
                      <p className="text-xs text-gray-500 mt-1">For download via bot</p>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">
                        Direct Download Link
                      </label>
                      <input
                        type="text"
                        value={downloadLink}
                        onChange={(e) => setDownloadLink(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                        placeholder="https://..."
                      />
                      <p className="text-xs text-gray-500 mt-1">Alternative link</p>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-400 bg-black/30 p-3 rounded-lg">
                    <strong>Note:</strong> If you provide Watch Code, Watch button will appear. If you provide Download Code/Link, Download button will appear. Leave empty to hide buttons.
                  </div>
                </div>
              )}

              {/* Episodes Section (Only for Series Type) */}
              {contentType === 'series' && (
                <div className="mb-6 p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                      <Tv size={18} className="text-purple-400" />
                      Episodes ({episodes.length})
                    </h3>
                    <button
                      onClick={() => {
                        setShowEpisodeForm(!showEpisodeForm);
                        setEditingEpisodeIndex(null);
                        setEpTitle('');
                        setEpNumber('');
                        setEpDuration('');
                        setEpWatchCode('');
                        setEpDownloadCode('');
                        setEpDownloadLink('');
                      }}
                      className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-all"
                    >
                      <Plus size={16} />
                      Add Episode
                    </button>
                  </div>

                  {/* Episode Form */}
                  {showEpisodeForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-4 bg-black/30 rounded-lg border border-purple-500/30"
                    >
                      <div className="grid md:grid-cols-4 gap-3 mb-3">
                        <div>
                          <label className="block text-gray-300 text-xs mb-1">Season</label>
                          <input
                            type="number"
                            value={epSeason}
                            onChange={(e) => setEpSeason(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
                            placeholder="1"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-xs mb-1">Episode *</label>
                          <input
                            type="number"
                            value={epNumber}
                            onChange={(e) => setEpNumber(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
                            placeholder="1"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-gray-300 text-xs mb-1">Title *</label>
                          <input
                            type="text"
                            value={epTitle}
                            onChange={(e) => setEpTitle(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
                            placeholder="Episode Title"
                          />
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-4 gap-3 mb-3">
                        <div>
                          <label className="block text-gray-300 text-xs mb-1">Duration</label>
                          <input
                            type="text"
                            value={epDuration}
                            onChange={(e) => setEpDuration(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
                            placeholder="45m"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-xs mb-1">Watch Code</label>
                          <input
                            type="text"
                            value={epWatchCode}
                            onChange={(e) => setEpWatchCode(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
                            placeholder="squid_s2_ep1"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-xs mb-1">Download Code</label>
                          <input
                            type="text"
                            value={epDownloadCode}
                            onChange={(e) => setEpDownloadCode(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
                            placeholder="download_squid_s2_ep1"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-xs mb-1">Download Link</label>
                          <input
                            type="text"
                            value={epDownloadLink}
                            onChange={(e) => setEpDownloadLink(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
                            placeholder="https://..."
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleAddEpisode}
                          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-all text-sm"
                        >
                          <Save size={14} />
                          {editingEpisodeIndex !== null ? 'Update' : 'Add'} Episode
                        </button>
                        <button
                          onClick={() => {
                            setShowEpisodeForm(false);
                            setEditingEpisodeIndex(null);
                          }}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-all text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Episodes List */}
                  {episodes.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {episodes
                        .sort((a, b) => a.season - b.season || a.number - b.number)
                        .map((ep, index) => (
                          <div
                            key={ep.id}
                            className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/5 hover:border-purple-500/30 transition-all"
                          >
                            <div className="flex-1">
                              <div className="text-white font-medium text-sm">
                                S{ep.season} E{ep.number}: {ep.title}
                              </div>
                              <div className="text-xs text-gray-400 mt-1 flex items-center gap-3">
                                <span>{ep.duration}</span>
                                {ep.watchCode && (
                                  <span className="text-green-400">▶ Watch</span>
                                )}
                                {(ep.downloadCode || ep.downloadLink) && (
                                  <span className="text-blue-400">📥 Download</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditEpisode(index)}
                                className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-all"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteEpisode(index)}
                                className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No episodes added yet. Click "Add Episode" to start.
                    </div>
                  )}
                </div>
              )}

              {/* Premium Features */}
              <div className="mb-6 p-4 bg-gold/5 border border-gold/20 rounded-lg">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Star size={18} className="text-gold" />
                  Premium Features
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPremium}
                      onChange={(e) => setIsPremium(e.target.checked)}
                      className="w-5 h-5 rounded bg-white/5 border-white/20"
                    />
                    <span className="text-gray-300">Premium Content</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTrending}
                      onChange={(e) => setIsTrending(e.target.checked)}
                      className="w-5 h-5 rounded bg-white/5 border-white/20"
                    />
                    <span className="text-gray-300">Show in Trending</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-5 h-5 rounded bg-white/5 border-white/20"
                    />
                    <span className="text-gray-300">Featured (Main Banner)</span>
                  </label>

                  {isFeatured && (
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Banner Position</label>
                      <input
                        type="number"
                        min="1"
                        value={featuredOrder}
                        onChange={(e) => setFeaturedOrder(parseInt(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTop10}
                      onChange={(e) => setIsTop10(e.target.checked)}
                      className="w-5 h-5 rounded bg-white/5 border-white/20"
                    />
                    <span className="text-gray-300">Top 10 Today</span>
                  </label>

                  {isTop10 && (
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Top 10 Position (1-10)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={top10Position}
                        onChange={(e) => setTop10Position(parseInt(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={storyEnabled}
                      onChange={(e) => setStoryEnabled(e.target.checked)}
                      className="w-5 h-5 rounded bg-white/5 border-white/20"
                    />
                    <span className="text-gray-300">Enable Story</span>
                  </label>

                  {storyEnabled && (
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Story Image URL</label>
                      <input
                        type="text"
                        value={storyImage}
                        onChange={(e) => setStoryImage(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                        placeholder="https://..."
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-gray-300 text-sm mb-2">Priority (Higher = Shows First)</label>
                    <input
                      type="number"
                      value={priority}
                      onChange={(e) => setPriority(parseInt(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveContent}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gold to-yellow-500 text-black font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-gold/50 transition-all disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : isEditing ? 'Update Content' : 'Save Content'}
                </button>
                
                {isEditing && (
                  <button
                    onClick={resetForm}
                    className="px-6 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CONTENT LIST TAB */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            {/* Search & Filter */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gold/20 rounded-2xl p-4">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search content..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gold/50"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gold/50"
                  >
                    <option value="All">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl overflow-hidden hover:border-gold/30 transition-all group"
                >
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img
                      src={movie.thumbnail}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      {movie.isPremium && (
                        <span className="bg-gold text-black text-xs font-bold px-2 py-1 rounded">
                          PREMIUM
                        </span>
                      )}
                      {movie.isTop10 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          #{movie.top10Position}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-white font-bold mb-2 line-clamp-1">{movie.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                      <span>{movie.category}</span>
                      <span>•</span>
                      <span>⭐ {movie.rating}</span>
                      <span>•</span>
                      <span>{movie.year}</span>
                    </div>
                    
                    <div className="flex gap-2 text-xs mb-3">
                      {movie.watchCode && (
                        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">▶ Watch</span>
                      )}
                      {(movie.downloadCode || movie.downloadLink) && (
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">📥 Download</span>
                      )}
                      {movie.episodes && movie.episodes.length > 0 && (
                        <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                          {movie.episodes.length} Episodes
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditContent(movie)}
                        className="flex-1 flex items-center justify-center gap-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 rounded transition-all text-sm"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteContent(movie.id)}
                        className="flex-1 flex items-center justify-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded transition-all text-sm"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredMovies.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                No content found
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gold/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Settings className="text-gold" size={24} />
                App Settings
              </h2>

              <div className="space-y-6">
                {/* Basic Settings */}
                <div>
                  <h3 className="text-white font-bold mb-4">Basic Settings</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">App Name</label>
                      <input
                        type="text"
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Primary Color</label>
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Telegram Settings */}
                <div>
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Bot className="text-blue-400" size={18} />
                    Telegram Bot Settings
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Bot Username</label>
                      <input
                        type="text"
                        value={botUsername}
                        onChange={(e) => setBotUsername(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
                        placeholder="Cinaflix_Streembot"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Channel Link</label>
                      <input
                        type="text"
                        value={channelLink}
                        onChange={(e) => setChannelLink(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
                        placeholder="https://t.me/..."
                      />
                    </div>
                  </div>
                </div>

                {/* Notice Bar */}
                <div>
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Bell className="text-yellow-400" size={18} />
                    Notice Bar
                  </h3>
                  <label className="flex items-center gap-3 mb-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noticeEnabled}
                      onChange={(e) => setNoticeEnabled(e.target.checked)}
                      className="w-5 h-5 rounded bg-white/5 border-white/20"
                    />
                    <span className="text-gray-300">Enable Notice Bar</span>
                  </label>
                  {noticeEnabled && (
                    <input
                      type="text"
                      value={noticeText}
                      onChange={(e) => setNoticeText(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
                      placeholder="Your notice message..."
                    />
                  )}
                </div>

                {/* Categories Management */}
                <div>
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Grid className="text-purple-400" size={18} />
                    Categories
                  </h3>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
                      placeholder="New category name..."
                    />
                    <button
                      onClick={handleAddCategory}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-all"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <div
                        key={cat}
                        className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2"
                      >
                        <span className="text-white text-sm">{cat}</span>
                        <button
                          onClick={() => handleRemoveCategory(cat)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-gold to-yellow-500 text-black font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-gold/50 transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
};

export default AdminPanel;
