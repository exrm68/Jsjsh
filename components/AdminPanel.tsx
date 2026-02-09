import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Upload, Layout, Settings, LogOut, Trash2, Edit, Plus, Save, Database, 
  RefreshCw, Link, Bot, Star, List, TrendingUp, Image, Eye, EyeOff,
  ChevronDown, ChevronUp, Award, Palette, Bell, Zap, Grid, Film, Download, ExternalLink
} from 'lucide-react';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { 
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, 
  query, orderBy, writeBatch, setDoc, getDoc, where, limit, deleteField 
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Movie, Episode, AppSettings, StoryItem, BannerItem } from '../types';
import { INITIAL_MOVIES, BOT_USERNAME } from '../constants';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('upload');
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

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Exclusive');
  const [thumbnail, setThumbnail] = useState('');
  const [telegramCode, setTelegramCode] = useState('');
  
  // ✅ Download Options
  const [downloadCode, setDownloadCode] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  
  const [year, setYear] = useState('2024');
  const [rating, setRating] = useState('9.0');
  const [quality, setQuality] = useState('4K HDR');
  const [description, setDescription] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [initialViews, setInitialViews] = useState('1.2M');
  
  // Premium Features State
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredOrder, setFeaturedOrder] = useState(1);
  const [isTop10, setIsTop10] = useState(false);
  const [top10Position, setTop10Position] = useState(1);
  const [storyEnabled, setStoryEnabled] = useState(false);
  const [storyImage, setStoryImage] = useState('');
  const [priority, setPriority] = useState(0);
  
  // Episode Management State
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [newEpTitle, setNewEpTitle] = useState('');
  const [newEpSeason, setNewEpSeason] = useState('1');
  const [newEpNumber, setNewEpNumber] = useState('');
  const [newEpDuration, setNewEpDuration] = useState('');
  const [newEpCode, setNewEpCode] = useState('');
  
  // ✅ Episode Download Options
  const [newEpDownloadCode, setNewEpDownloadCode] = useState('');
  const [newEpDownloadLink, setNewEpDownloadLink] = useState('');
  
  // List State
  const [movieList, setMovieList] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // App Settings State
  const [botUsername, setBotUsername] = useState('');
  const [channelLink, setChannelLink] = useState('');
  const [noticeText, setNoticeText] = useState('');
  const [noticeEnabled, setNoticeEnabled] = useState(false);
  const [appName, setAppName] = useState('CINEFLIX');
  const [primaryColor, setPrimaryColor] = useState('#FF0000');
  const [enableTop10, setEnableTop10] = useState(true);
  const [enableStories, setEnableStories] = useState(true);
  const [enableBanners, setEnableBanners] = useState(true);
  const [categories, setCategories] = useState<string[]>(['Exclusive', 'Korean Drama', 'Series']);
  const [newCategory, setNewCategory] = useState('');

  // Stories Management
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [newStoryImage, setNewStoryImage] = useState('');
  const [newStoryThumbnail, setNewStoryThumbnail] = useState('');
  const [newStoryMovieId, setNewStoryMovieId] = useState('');

  // Banners Management
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerImage, setNewBannerImage] = useState('');
  const [newBannerMovieId, setNewBannerMovieId] = useState('');

  // UI State
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    download: false,
    premium: false,
    episodes: false
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch movies
  const fetchMovies = async () => {
    try {
      const q = query(collection(db, "movies"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Movie[];
      setMovieList(list);
      setFilteredMovies(list);
    } catch (e) {
      console.warn("Error fetching movies:", e);
    }
  };

  // Fetch Settings
  const fetchSettings = async () => {
    try {
      const docRef = doc(db, 'settings', 'config');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBotUsername(data.botUsername || BOT_USERNAME);
        setChannelLink(data.channelLink || '');
        setNoticeText(data.noticeText || '');
        setNoticeEnabled(data.noticeEnabled || false);
        setAppName(data.appName || 'CINEFLIX');
        setPrimaryColor(data.primaryColor || '#FF0000');
        setEnableTop10(data.enableTop10 !== false);
        setEnableStories(data.enableStories !== false);
        setEnableBanners(data.enableBanners !== false);
        setCategories(data.categories || ['Exclusive', 'Korean Drama', 'Series']);
      }
    } catch (e) {
      console.error("Error fetching settings:", e);
    }
  };

  // Fetch Stories
  const fetchStories = async () => {
    try {
      const q = query(collection(db, "stories"), orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StoryItem[];
      setStories(list);
    } catch (e) {
      console.error("Error fetching stories:", e);
    }
  };

  // Fetch Banners
  const fetchBanners = async () => {
    try {
      const q = query(collection(db, "banners"), orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BannerItem[];
      setBanners(list);
    } catch (e) {
      console.error("Error fetching banners:", e);
    }
  };

  useEffect(() => {
    if (user) {
      if (activeTab === 'content') fetchMovies();
      if (activeTab === 'settings') fetchSettings();
      if (activeTab === 'top10') fetchMovies();
      if (activeTab === 'stories') {
        fetchStories();
        fetchMovies();
      }
      if (activeTab === 'banners') {
        fetchBanners();
        fetchMovies();
      }
    }
  }, [user, activeTab]);

  // Filter movies
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showSuccess('লগইন সফল হয়েছে! 🎉');
    } catch (err: any) {
      setError('ইমেইল বা পাসওয়ার্ড ভুল আছে');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    onClose();
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // ✅ FIXED: Add Episode with Download Options and Auto-numbering
  const addEpisode = () => {
    if (!newEpTitle || !newEpDuration || !newEpCode) {
      alert('টাইটেল, ডিউরেশন এবং Telegram Code দিতে হবে!');
      return;
    }

    const seasonNum = parseInt(newEpSeason) || 1;
    
    // Auto-calculate episode number based on season
    const episodesInSeason = episodes.filter(e => e.season === seasonNum);
    const autoNumber = newEpNumber ? parseInt(newEpNumber) : episodesInSeason.length + 1;

    const newEp: Episode = {
      id: `ep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      number: autoNumber,
      season: seasonNum,
      title: newEpTitle,
      duration: newEpDuration,
      telegramCode: newEpCode,
      downloadCode: newEpDownloadCode || undefined,
      downloadLink: newEpDownloadLink || undefined
    };

    setEpisodes([...episodes, newEp]);
    
    // Clear form
    setNewEpTitle('');
    setNewEpNumber('');
    setNewEpDuration('');
    setNewEpCode('');
    setNewEpDownloadCode('');
    setNewEpDownloadLink('');
    
    showSuccess(`✅ Episode ${autoNumber} যোগ হয়েছে!`);
  };

  const removeEpisode = (id: string) => {
    setEpisodes(episodes.filter(ep => ep.id !== id));
  };

  // Reset Form
  const resetForm = () => {
    setTitle('');
    setCategory('Exclusive');
    setThumbnail('');
    setTelegramCode('');
    setDownloadCode('');
    setDownloadLink('');
    setYear('2024');
    setRating('9.0');
    setQuality('4K HDR');
    setDescription('');
    setEpisodes([]);
    setIsPremium(false);
    setInitialViews('1.2M');
    setIsFeatured(false);
    setFeaturedOrder(1);
    setIsTop10(false);
    setTop10Position(1);
    setStoryEnabled(false);
    setStoryImage('');
    setPriority(0);
    setIsEditing(false);
    setEditId(null);
  };

  // ✅ FIXED: Publish Content with Download Options
  const handlePublish = async () => {
    if (!title || !thumbnail) {
      alert('⚠️ টাইটেল এবং থাম্বনেইল দিতে হবে!');
      return;
    }

    if (!telegramCode) {
      alert('⚠️ Watch/Stream এর জন্য Telegram Code দিতে হবে!');
      return;
    }

    // URL validation
    if (downloadLink && !downloadLink.startsWith('http')) {
      alert('⚠️ Download link সঠিক নয়! https:// দিয়ে শুরু করতে হবে।');
      return;
    }

    setLoading(true);
    try {
      const movieData: any = {
        title,
        thumbnail,
        category,
        telegramCode,
        rating: parseFloat(rating) || 9.0,
        views: initialViews,
        year,
        quality,
        description,
        isPremium,
        isFeatured,
        isTop10,
        storyEnabled,
        priority,
        createdAt: serverTimestamp()
      };

      // ✅ Download options (only if provided)
      if (downloadCode) {
        movieData.downloadCode = downloadCode;
      }
      if (downloadLink) {
        movieData.downloadLink = downloadLink;
      }

      // Episodes with sorting
      if (episodes.length > 0) {
        const sortedEpisodes = [...episodes].sort((a, b) => {
          if (a.season !== b.season) return a.season - b.season;
          return a.number - b.number;
        });
        movieData.episodes = sortedEpisodes;
      }
      
      // Featured
      if (isFeatured) {
        movieData.featuredOrder = featuredOrder;
      }
      
      // Top 10
      if (isTop10) {
        movieData.top10Position = top10Position;
      }
      
      // Story
      if (storyEnabled) {
        movieData.storyImage = storyImage || thumbnail;
      }

      if (isEditing && editId) {
        // Editing existing movie
        const updateData: any = { ...movieData };
        
        // Remove fields that should not be present
        if (!isFeatured && updateData.featuredOrder !== undefined) {
          updateData.featuredOrder = deleteField();
        }
        if (!isTop10 && updateData.top10Position !== undefined) {
          updateData.top10Position = deleteField();
        }
        if (!storyEnabled && updateData.storyImage !== undefined) {
          updateData.storyImage = deleteField();
        }
        if (episodes.length === 0 && updateData.episodes !== undefined) {
          updateData.episodes = deleteField();
        }
        
        // ✅ Remove download fields if empty
        if (!downloadCode && updateData.downloadCode !== undefined) {
          updateData.downloadCode = deleteField();
        }
        if (!downloadLink && updateData.downloadLink !== undefined) {
          updateData.downloadLink = deleteField();
        }
        
        await updateDoc(doc(db, 'movies', editId), updateData);
        showSuccess('✅ আপডেট সফল হয়েছে!');
      } else {
        // Adding new movie
        await addDoc(collection(db, 'movies'), movieData);
        showSuccess('🚀 পাবলিশ সফল হয়েছে!');
      }

      resetForm();
      fetchMovies();
    } catch (err: any) {
      console.error(err);
      alert('❌ Error: ' + err.message);
    }
    setLoading(false);
  };

  // ✅ FIXED: Edit Movie with Download Options
  const handleEdit = (movie: Movie) => {
    setTitle(movie.title);
    setCategory(movie.category);
    setThumbnail(movie.thumbnail);
    setTelegramCode(movie.telegramCode || '');
    setDownloadCode(movie.downloadCode || '');
    setDownloadLink(movie.downloadLink || '');
    setYear(movie.year || '2024');
    setRating(movie.rating?.toString() || '9.0');
    setQuality(movie.quality || '4K HDR');
    setDescription(movie.description || '');
    setIsPremium(movie.isPremium || false);
    setInitialViews(movie.views || '1.2M');
    
    // Premium features
    setIsFeatured(movie.isFeatured || false);
    setFeaturedOrder(movie.featuredOrder || 1);
    setIsTop10(movie.isTop10 || false);
    setTop10Position(movie.top10Position || 1);
    setStoryEnabled(movie.storyEnabled || false);
    setStoryImage(movie.storyImage || '');
    setPriority(movie.priority || 0);
    
    // Episodes - Sort them properly
    const sortedEps = (movie.episodes || []).sort((a, b) => {
      if (a.season !== b.season) return a.season - b.season;
      return a.number - b.number;
    });
    setEpisodes(sortedEps);
    
    setIsEditing(true);
    setEditId(movie.id);
    setActiveTab('upload');
    
    // Expand necessary sections
    setExpandedSections({
      basic: true,
      download: !!(movie.downloadCode || movie.downloadLink),
      premium: !!(movie.isFeatured || movie.isTop10 || movie.storyEnabled),
      episodes: !!movie.episodes && movie.episodes.length > 0
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete Movie
  const handleDelete = async (id: string) => {
    if (!confirm('মুছে ফেলতে চান?')) return;
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'movies', id));
      showSuccess('মুছে ফেলা হয়েছে!');
      fetchMovies();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  // Save Settings
  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const settingsData: AppSettings = {
        botUsername,
        channelLink,
        noticeText,
        noticeEnabled,
        appName,
        primaryColor,
        enableTop10,
        enableStories,
        enableBanners,
        categories
      };

      await setDoc(doc(db, 'settings', 'config'), settingsData);
      showSuccess('সেটিংস সেভ হয়েছে! ✅');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  // Add Category
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory)) {
      alert('এই ক্যাটাগরি আগে থেকেই আছে!');
      return;
    }
    setCategories([...categories, newCategory]);
    setNewCategory('');
    showSuccess('নতুন ক্যাটাগরি যোগ হয়েছে!');
  };

  const removeCategory = (cat: string) => {
    if (categories.length <= 1) {
      alert('অন্তত একটি ক্যাটাগরি রাখতে হবে!');
      return;
    }
    setCategories(categories.filter(c => c !== cat));
  };

  // Story Management
  const handleAddStory = async () => {
    if (!newStoryImage) {
      alert('স্টোরি ইমেজ দিতে হবে!');
      return;
    }

    setLoading(true);
    try {
      const storyData: any = {
        image: newStoryImage,
        thumbnailUrl: newStoryThumbnail || newStoryImage,
        order: stories.length + 1,
        createdAt: serverTimestamp()
      };

      // Only add movieId if it has a value
      if (newStoryMovieId) {
        storyData.movieId = newStoryMovieId;
      }

      await addDoc(collection(db, 'stories'), storyData);
      showSuccess('স্টোরি যোগ হয়েছে! ✅');
      setNewStoryImage('');
      setNewStoryThumbnail('');
      setNewStoryMovieId('');
      fetchStories();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  const handleDeleteStory = async (id: string) => {
    if (!confirm('স্টোরি মুছে ফেলবেন?')) return;
    
    try {
      await deleteDoc(doc(db, 'stories', id));
      showSuccess('স্টোরি মুছে ফেলা হয়েছে!');
      fetchStories();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  // Banner Management
  const handleAddBanner = async () => {
    if (!newBannerTitle || !newBannerImage) {
      alert('ব্যানার টাইটেল ও ইমেজ দিতে হবে!');
      return;
    }

    setLoading(true);
    try {
      const bannerData: any = {
        title: newBannerTitle,
        image: newBannerImage,
        order: banners.length + 1,
        isActive: true,
        createdAt: serverTimestamp()
      };

      // Only add movieId if it has a value
      if (newBannerMovieId) {
        bannerData.movieId = newBannerMovieId;
      }

      await addDoc(collection(db, 'banners'), bannerData);
      showSuccess('ব্যানার যোগ হয়েছে! ✅');
      setNewBannerTitle('');
      setNewBannerImage('');
      setNewBannerMovieId('');
      fetchBanners();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('ব্যানার মুছে ফেলবেন?')) return;
    
    try {
      await deleteDoc(doc(db, 'banners', id));
      showSuccess('ব্যানার মুছে ফেলা হয়েছে!');
      fetchBanners();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  // Toggle Top 10
  const toggleTop10 = async (movieId: string, currentStatus: boolean) => {
    try {
      if (!currentStatus) {
        // Adding to Top 10
        await updateDoc(doc(db, 'movies', movieId), {
          isTop10: true,
          top10Position: 10
        });
      } else {
        // Removing from Top 10
        await updateDoc(doc(db, 'movies', movieId), {
          isTop10: false,
          top10Position: deleteField()
        });
      }
      showSuccess(!currentStatus ? 'Top 10 এ যোগ হয়েছে!' : 'Top 10 থেকে সরানো হয়েছে!');
      fetchMovies();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const updateTop10Position = async (movieId: string, position: number) => {
    if (position < 1 || position > 10) {
      alert('পজিশন ১ থেকে ১০ এর মধ্যে হতে হবে!');
      return;
    }

    try {
      await updateDoc(doc(db, 'movies', movieId), {
        top10Position: position
      });
      showSuccess('পজিশন আপডেট হয়েছে!');
      fetchMovies();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Seed Demo Data
  const seedDemoData = async () => {
    if (!confirm('ডেমো ডেটা যোগ করবেন? (১০টি মুভি)')) return;

    setLoading(true);
    try {
      const batch = writeBatch(db);
      INITIAL_MOVIES.forEach(movie => {
        const docRef = doc(collection(db, 'movies'));
        batch.set(docRef, { ...movie, createdAt: serverTimestamp() });
      });
      await batch.commit();
      showSuccess('ডেমো ডেটা যোগ হয়েছে! 🎉');
      fetchMovies();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 max-w-md w-full border border-red-900/30"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Settings className="text-red-500" size={28} />
              <h2 className="text-2xl font-bold text-white">অ্যাডমিন লগইন</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">ইমেইল</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                placeholder="admin@cineflix.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">পাসওয়ার্ড</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-95 z-50 overflow-y-auto"
    >
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-900 to-black rounded-2xl p-6 mb-6 border border-red-800/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Settings className="text-red-500" size={32} />
                <div>
                  <h1 className="text-3xl font-bold text-white">অ্যাডমিন কন্ট্রোল প্যানেল</h1>
                  <p className="text-gray-400 text-sm">সম্পূর্ণ নিয়ন্ত্রণ আপনার হাতে</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                >
                  <LogOut size={18} />
                  <span>লগআউট</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Success Message */}
            <AnimatePresence>
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-green-400"
                >
                  {successMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tabs */}
          <div className="bg-gray-900 rounded-2xl p-2 mb-6 flex flex-wrap gap-2">
            {[
              { id: 'upload', icon: Upload, label: 'কন্টেন্ট যোগ করুন' },
              { id: 'content', icon: Film, label: 'কন্টেন্ট ম্যানেজ' },
              { id: 'top10', icon: Award, label: 'Top 10 ম্যানেজ' },
              { id: 'banners', icon: Layout, label: 'ব্যানার কন্ট্রোল' },
              { id: 'stories', icon: Image, label: 'স্টোরি কন্ট্রোল' },
              { id: 'settings', icon: Settings, label: 'অ্যাপ সেটিংস' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <tab.icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            
            {/* UPLOAD TAB */}
            {activeTab === 'upload' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Upload className="text-red-500" />
                    {isEditing ? 'কন্টেন্ট এডিট করুন' : 'নতুন কন্টেন্ট যোগ করুন'}
                  </h2>
                  {isEditing && (
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {/* Basic Info Section */}
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <button
                    onClick={() => toggleSection('basic')}
                    className="w-full flex items-center justify-between mb-4"
                  >
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Zap className="text-yellow-500" size={20} />
                      বেসিক ইনফরমেশন
                    </h3>
                    {expandedSections.basic ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                  </button>

                  {expandedSections.basic && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">মুভি/সিরিজ নাম *</label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                          placeholder="Avengers: Endgame"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">ক্যাটাগরি *</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">থাম্বনেইল URL *</label>
                        <input
                          type="text"
                          value={thumbnail}
                          onChange={(e) => setThumbnail(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                          placeholder="https://image-link.jpg"
                        />
                        {thumbnail && (
                          <img src={thumbnail} alt="Preview" className="mt-2 h-32 rounded-lg object-cover" />
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          টেলিগ্রাম ভিডিও ID/Code
                          <span className="text-gray-500 ml-2 text-xs">(বট থেকে কপি করা ID)</span>
                        </label>
                        <input
                          type="text"
                          value={telegramCode}
                          onChange={(e) => setTelegramCode(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                          placeholder="BAACAgQAAx0..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">রিলিজ ইয়ার</label>
                        <input
                          type="text"
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                          placeholder="2024"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">রেটিং (0-10)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                          placeholder="9.0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">কোয়ালিটি</label>
                        <select
                          value={quality}
                          onChange={(e) => setQuality(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                        >
                          <option>4K HDR</option>
                          <option>4K</option>
                          <option>1080p</option>
                          <option>720p</option>
                          <option>HD</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">ইনিশিয়াল ভিউস</label>
                        <input
                          type="text"
                          value={initialViews}
                          onChange={(e) => setInitialViews(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                          placeholder="1.2M"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">ডিস্ক্রিপশন</label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                          placeholder="মুভি/সিরিজের সংক্ষিপ্ত বর্ণনা..."
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isPremium}
                            onChange={(e) => setIsPremium(e.target.checked)}
                            className="w-5 h-5 rounded bg-gray-900 border-gray-700"
                          />
                          <span className="text-white">Premium Content</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* ✅ Download Options Section - NEW */}
                <div className="bg-gradient-to-r from-purple-900/20 to-gray-800 rounded-xl p-4 border border-purple-700/30">
                  <button
                    onClick={() => toggleSection('download')}
                    className="w-full flex items-center justify-between mb-4"
                  >
                    <div className="flex items-center gap-2">
                      <Download className="text-purple-400" size={20} />
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-white">ডাউনলোড অপশন</h3>
                        <p className="text-xs text-gray-500">Watch এর আলাদা Download code/link (Optional)</p>
                      </div>
                    </div>
                    {expandedSections.download ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                  </button>

                  {expandedSections.download && (
                    <div className="space-y-4">
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                          <Bot size={14} className="text-purple-400" />
                          Download Telegram Code
                        </label>
                        <input
                          type="text"
                          value={downloadCode}
                          onChange={(e) => setDownloadCode(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                          placeholder="DOWNLOAD_ABC123 (আলাদা download code)"
                        />
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                          💡 Download এর জন্য আলাদা Telegram code দিতে চাইলে এখানে দিন। না দিলে Watch code ই ব্যবহার হবে।
                        </p>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                          <ExternalLink size={14} className="text-purple-400" />
                          Alternative Download Link
                        </label>
                        <input
                          type="text"
                          value={downloadLink}
                          onChange={(e) => setDownloadLink(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                          placeholder="https://drive.google.com/file/xyz (Optional)"
                        />
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                          🔗 অন্য কোনো host (Google Drive, Mega, Direct Link) থেকে download করাতে চাইলে link দিন।
                        </p>
                      </div>

                      <div className="bg-blue-500/5 rounded-lg p-3 border border-blue-500/20">
                        <p className="text-xs text-blue-400 leading-relaxed">
                          <strong>📌 কিভাবে কাজ করে:</strong><br/>
                          • শুধু Watch code দিলে → Download button ও Watch code ব্যবহার করবে<br/>
                          • Download code দিলে → Download button এটা ব্যবহার করবে<br/>
                          • Download link দিলে → Direct সেই link এ নিয়ে যাবে
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Premium Features Section */}
                <div className="bg-gradient-to-r from-yellow-900/20 to-gray-800 rounded-xl p-4 border border-yellow-700/30">
                  <button
                    onClick={() => toggleSection('premium')}
                    className="w-full flex items-center justify-between mb-4"
                  >
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Star className="text-yellow-500" size={20} />
                      প্রিমিয়াম ফিচারস (Top 10, Banner, Story)
                    </h3>
                    {expandedSections.premium ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                  </button>

                  {expandedSections.premium && (
                    <div className="space-y-4">
                      {/* Featured Banner */}
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <label className="flex items-center gap-2 cursor-pointer mb-3">
                          <input
                            type="checkbox"
                            checked={isFeatured}
                            onChange={(e) => setIsFeatured(e.target.checked)}
                            className="w-5 h-5 rounded"
                          />
                          <Layout className="text-blue-400" size={18} />
                          <span className="text-white font-medium">মেইন ব্যানারে দেখান</span>
                        </label>
                        {isFeatured && (
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">ব্যানার পজিশন (১-১০)</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={featuredOrder}
                              onChange={(e) => setFeaturedOrder(parseInt(e.target.value) || 1)}
                              className="w-32 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                            />
                          </div>
                        )}
                      </div>

                      {/* Top 10 */}
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <label className="flex items-center gap-2 cursor-pointer mb-3">
                          <input
                            type="checkbox"
                            checked={isTop10}
                            onChange={(e) => setIsTop10(e.target.checked)}
                            className="w-5 h-5 rounded"
                          />
                          <Award className="text-yellow-400" size={18} />
                          <span className="text-white font-medium">Top 10 তে রাখুন</span>
                        </label>
                        {isTop10 && (
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Top 10 পজিশন (১-১০)</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={top10Position}
                              onChange={(e) => setTop10Position(parseInt(e.target.value) || 1)}
                              className="w-32 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                            />
                          </div>
                        )}
                      </div>

                      {/* Story */}
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <label className="flex items-center gap-2 cursor-pointer mb-3">
                          <input
                            type="checkbox"
                            checked={storyEnabled}
                            onChange={(e) => setStoryEnabled(e.target.checked)}
                            className="w-5 h-5 rounded"
                          />
                          <Image className="text-pink-400" size={18} />
                          <span className="text-white font-medium">স্টোরি সার্কেলে দেখান</span>
                        </label>
                        {storyEnabled && (
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">
                              স্টোরি ইমেজ URL (খালি থাকলে থাম্বনেইল ব্যবহার হবে)
                            </label>
                            <input
                              type="text"
                              value={storyImage}
                              onChange={(e) => setStoryImage(e.target.value)}
                              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                              placeholder="https://story-image.jpg"
                            />
                          </div>
                        )}
                      </div>

                      {/* Priority */}
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <label className="block text-sm text-gray-300 mb-2">
                          <TrendingUp className="inline text-green-400 mr-2" size={18} />
                          প্রায়োরিটি (যত বেশি, তত উপরে দেখাবে)
                        </label>
                        <input
                          type="number"
                          value={priority}
                          onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                          className="w-32 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Episodes Section */}
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <button
                    onClick={() => toggleSection('episodes')}
                    className="w-full flex items-center justify-between mb-4"
                  >
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <List className="text-purple-500" size={20} />
                      এপিসোড ম্যানেজমেন্ট (সিরিজের জন্য)
                    </h3>
                    {expandedSections.episodes ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                  </button>

                  {expandedSections.episodes && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <input
                            type="text"
                            value={newEpTitle}
                            onChange={(e) => setNewEpTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm"
                            placeholder="Episode Title"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={newEpSeason}
                            onChange={(e) => setNewEpSeason(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm"
                            placeholder="Season"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={newEpDuration}
                            onChange={(e) => setNewEpDuration(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm"
                            placeholder="Duration (45m)"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={newEpCode}
                            onChange={(e) => setNewEpCode(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm"
                            placeholder="Telegram Code (Watch)"
                          />
                        </div>
                      </div>

                      {/* ✅ Episode Download Options - NEW */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
                        <div>
                          <label className="block text-xs text-purple-400 mb-1 font-semibold">Download Code (Optional)</label>
                          <input
                            type="text"
                            value={newEpDownloadCode}
                            onChange={(e) => setNewEpDownloadCode(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm"
                            placeholder="EP1_DOWNLOAD"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-purple-400 mb-1 font-semibold">Download Link (Optional)</label>
                          <input
                            type="text"
                            value={newEpDownloadLink}
                            onChange={(e) => setNewEpDownloadLink(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm"
                            placeholder="https://..."
                          />
                        </div>
                      </div>

                      <button
                        onClick={addEpisode}
                        className="w-full md:w-auto px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white flex items-center justify-center gap-2"
                      >
                        <Plus size={18} />
                        এপিসোড যোগ করুন
                      </button>

                      {/* Episodes List */}
                      {episodes.length > 0 && (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {episodes.map((ep, idx) => (
                            <div key={ep.id} className="bg-gray-900 rounded-lg p-3 flex items-center justify-between border border-gray-800 hover:border-gray-700 transition-colors">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-white font-medium truncate">
                                    S{ep.season}E{ep.number}: {ep.title}
                                  </span>
                                  <span className="text-xs text-gray-500 font-mono shrink-0">{ep.duration}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-gray-500">Code: {ep.telegramCode.slice(0, 12)}...</span>
                                  {ep.downloadCode && (
                                    <span className="text-green-400 flex items-center gap-1">
                                      <Download size={10} />
                                      Code
                                    </span>
                                  )}
                                  {ep.downloadLink && (
                                    <span className="text-blue-400 flex items-center gap-1">
                                      <ExternalLink size={10} />
                                      Link
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => removeEpisode(ep.id)}
                                className="text-red-500 hover:text-red-400 p-2 ml-2 shrink-0"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Publish Button */}
                <button
                  onClick={handlePublish}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-bold text-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Save size={24} />
                  {loading ? 'Processing...' : isEditing ? 'আপডেট করুন' : 'পাবলিশ করুন'}
                </button>
              </div>
            )}

            {/* CONTENT MANAGEMENT TAB */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Film className="text-red-500" />
                    সব কন্টেন্ট ({filteredMovies.length})
                  </h2>
                  <button
                    onClick={seedDemoData}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2"
                  >
                    <Database size={18} />
                    ডেমো ডেটা যোগ করুন
                  </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="খুঁজুন..."
                    className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                  />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="All">সব ক্যাটাগরি</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Movies Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
                  {filteredMovies.map(movie => (
                    <div key={movie.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-red-500/50 transition-all">
                      <div className="flex gap-4">
                        <img 
                          src={movie.thumbnail} 
                          alt={movie.title}
                          className="w-24 h-36 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold truncate">{movie.title}</h3>
                          <div className="flex flex-wrap gap-2 mt-2 text-xs">
                            <span className="px-2 py-1 bg-gray-700 rounded text-gray-300">{movie.category}</span>
                            <span className="px-2 py-1 bg-gray-700 rounded text-gray-300">{movie.year}</span>
                            <span className="px-2 py-1 bg-yellow-600 rounded text-white">⭐ {movie.rating}</span>
                            {movie.isTop10 && (
                              <span className="px-2 py-1 bg-red-600 rounded text-white">#{movie.top10Position} Top 10</span>
                            )}
                            {movie.isFeatured && (
                              <span className="px-2 py-1 bg-blue-600 rounded text-white">Featured</span>
                            )}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleEdit(movie)}
                              className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm flex items-center justify-center gap-1"
                            >
                              <Edit size={14} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(movie.id)}
                              className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-white text-sm flex items-center justify-center gap-1"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredMovies.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    কোনো কন্টেন্ট পাওয়া যায়নি
                  </div>
                )}
              </div>
            )}

            {/* TOP 10 MANAGEMENT TAB */}
            {activeTab === 'top10' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Award className="text-yellow-500" />
                  Top 10 ম্যানেজমেন্ট
                </h2>

                <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4 text-yellow-200">
                  <p className="flex items-center gap-2">
                    <TrendingUp size={18} />
                    Top 10 তে সর্বোচ্চ ১০টি মুভি রাখতে পারবেন। পজিশন দিয়ে সাজাতে পারবেন।
                  </p>
                </div>

                {/* Current Top 10 */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">বর্তমান Top 10</h3>
                  <div className="space-y-3">
                    {movieList
                      .filter(m => m.isTop10)
                      .sort((a, b) => (a.top10Position || 10) - (b.top10Position || 10))
                      .map(movie => (
                        <div key={movie.id} className="bg-gradient-to-r from-yellow-900/30 to-gray-800 rounded-lg p-4 border border-yellow-700/30">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                              #{movie.top10Position}
                            </div>
                            <img src={movie.thumbnail} alt={movie.title} className="w-16 h-24 object-cover rounded" />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-bold truncate">{movie.title}</h4>
                              <p className="text-gray-400 text-sm">{movie.category} • {movie.year}</p>
                              <div className="flex gap-2 mt-2">
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  defaultValue={movie.top10Position}
                                  onBlur={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val)) updateTop10Position(movie.id, val);
                                  }}
                                  className="w-20 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                                />
                                <button
                                  onClick={() => toggleTop10(movie.id, true)}
                                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Add to Top 10 */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Top 10 তে যোগ করুন</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {movieList
                      .filter(m => !m.isTop10)
                      .map(movie => (
                        <div key={movie.id} className="bg-gray-800 rounded-lg p-3 flex items-center gap-3 border border-gray-700">
                          <img src={movie.thumbnail} alt={movie.title} className="w-12 h-18 object-cover rounded" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium truncate text-sm">{movie.title}</h4>
                            <p className="text-gray-400 text-xs">{movie.category}</p>
                          </div>
                          <button
                            onClick={() => toggleTop10(movie.id, false)}
                            className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 rounded text-white text-sm flex-shrink-0"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* BANNERS TAB */}
            {activeTab === 'banners' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Layout className="text-blue-500" />
                  ব্যানার কন্ট্রোল
                </h2>

                {/* Add New Banner */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">নতুন ব্যানার যোগ করুন</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">ব্যানার টাইটেল *</label>
                      <input
                        type="text"
                        value={newBannerTitle}
                        onChange={(e) => setNewBannerTitle(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white"
                        placeholder="Banner Title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">মুভি সিলেক্ট (Optional)</label>
                      <select
                        value={newBannerMovieId}
                        onChange={(e) => setNewBannerMovieId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      >
                        <option value="">-- Select Movie --</option>
                        {movieList.map(m => (
                          <option key={m.id} value={m.id}>{m.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-300 mb-2">ব্যানার ইমেজ URL *</label>
                      <input
                        type="text"
                        value={newBannerImage}
                        onChange={(e) => setNewBannerImage(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white"
                        placeholder="https://banner-image.jpg"
                      />
                      {newBannerImage && (
                        <img src={newBannerImage} alt="Preview" className="mt-2 h-32 rounded-lg object-cover" />
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleAddBanner}
                    disabled={loading}
                    className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2"
                  >
                    <Plus size={18} />
                    ব্যানার যোগ করুন
                  </button>
                </div>

                {/* Existing Banners */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">বর্তমান ব্যানার ({banners.length})</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {banners.map((banner, idx) => (
                      <div key={banner.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                        <img src={banner.image} alt={banner.title} className="w-full h-48 object-cover" />
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-bold">{banner.title}</h4>
                              <p className="text-gray-400 text-sm">Order: #{banner.order}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteBanner(banner.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 rounded text-white"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {banners.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      কোনো ব্যানার নেই
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STORIES TAB */}
            {activeTab === 'stories' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Image className="text-pink-500" />
                  স্টোরি কন্ট্রোল (Instagram Style)
                </h2>

                {/* Add New Story */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">নতুন স্টোরি যোগ করুন</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">স্টোরি সার্কেল ইমেজ *</label>
                      <input
                        type="text"
                        value={newStoryImage}
                        onChange={(e) => setNewStoryImage(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white"
                        placeholder="https://circle-image.jpg"
                      />
                      {newStoryImage && (
                        <img src={newStoryImage} alt="Preview" className="mt-2 w-20 h-20 rounded-full object-cover border-2 border-pink-500" />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">ফুল ইমেজ/Thumbnail</label>
                      <input
                        type="text"
                        value={newStoryThumbnail}
                        onChange={(e) => setNewStoryThumbnail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white"
                        placeholder="https://full-image.jpg"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-300 mb-2">মুভি লিংক (Optional)</label>
                      <select
                        value={newStoryMovieId}
                        onChange={(e) => setNewStoryMovieId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      >
                        <option value="">-- Select Movie --</option>
                        {movieList.map(m => (
                          <option key={m.id} value={m.id}>{m.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleAddStory}
                    disabled={loading}
                    className="mt-4 px-6 py-2.5 bg-pink-600 hover:bg-pink-700 rounded-lg text-white flex items-center gap-2"
                  >
                    <Plus size={18} />
                    স্টোরি যোগ করুন
                  </button>
                </div>

                {/* Existing Stories */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">বর্তমান স্টোরি ({stories.length})</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {stories.map((story, idx) => (
                      <div key={story.id} className="flex-shrink-0 text-center">
                        <div className="relative">
                          <img 
                            src={story.image} 
                            alt="Story" 
                            className="w-20 h-20 rounded-full object-cover border-4 border-pink-500"
                          />
                          <button
                            onClick={() => handleDeleteStory(story.id)}
                            className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1"
                          >
                            <X size={14} className="text-white" />
                          </button>
                        </div>
                        <p className="text-gray-400 text-xs mt-1">#{story.order}</p>
                      </div>
                    ))}
                  </div>
                  {stories.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      কোনো স্টোরি নেই
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Settings className="text-green-500" />
                  অ্যাপ সেটিংস
                </h2>

                {/* App Info */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Palette className="text-blue-400" />
                    অ্যাপ ইনফরমেশন
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">অ্যাপ নাম</label>
                      <input
                        type="text"
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white"
                        placeholder="CINEFLIX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">প্রাইমারি কালার</label>
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full h-11 px-2 bg-gray-900 border border-gray-700 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Telegram Settings */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Bot className="text-blue-400" />
                    টেলিগ্রাম সেটিংস
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">বট ইউজারনেম</label>
                      <input
                        type="text"
                        value={botUsername}
                        onChange={(e) => setBotUsername(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white"
                        placeholder="@YourBot"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">চ্যানেল লিংক</label>
                      <input
                        type="text"
                        value={channelLink}
                        onChange={(e) => setChannelLink(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white"
                        placeholder="https://t.me/yourchannel"
                      />
                    </div>
                  </div>
                </div>

                {/* Notice Bar */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Bell className="text-yellow-400" />
                    নোটিশ বার
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={noticeEnabled}
                        onChange={(e) => setNoticeEnabled(e.target.checked)}
                        className="w-5 h-5 rounded"
                      />
                      <span className="text-white">নোটিশ বার চালু করুন</span>
                    </label>
                    {noticeEnabled && (
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">নোটিশ টেক্সট</label>
                        <input
                          type="text"
                          value={noticeText}
                          onChange={(e) => setNoticeText(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white"
                          placeholder="Important announcement..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Feature Toggles */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Grid className="text-purple-400" />
                    ফিচার কন্ট্রোল
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableTop10}
                        onChange={(e) => setEnableTop10(e.target.checked)}
                        className="w-5 h-5 rounded"
                      />
                      <span className="text-white">Top 10 দেখান</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableStories}
                        onChange={(e) => setEnableStories(e.target.checked)}
                        className="w-5 h-5 rounded"
                      />
                      <span className="text-white">Stories দেখান</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableBanners}
                        onChange={(e) => setEnableBanners(e.target.checked)}
                        className="w-5 h-5 rounded"
                      />
                      <span className="text-white">Banners দেখান</span>
                    </label>
                  </div>
                </div>

                {/* Categories Management */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <List className="text-green-400" />
                    ক্যাটাগরি ম্যানেজমেন্ট
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white"
                        placeholder="নতুন ক্যাটাগরি..."
                      />
                      <button
                        onClick={handleAddCategory}
                        className="px-6 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg text-white flex items-center gap-2"
                      >
                        <Plus size={18} />
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(cat => (
                        <div key={cat} className="flex items-center gap-2 px-3 py-2 bg-gray-900 rounded-lg border border-gray-700">
                          <span className="text-white">{cat}</span>
                          <button
                            onClick={() => removeCategory(cat)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={24} />
                  {loading ? 'Saving...' : 'সেটিংস সেভ করুন'}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPanel;
