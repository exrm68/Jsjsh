// 🎬 CINEFLIX - Improved Type Definitions

export interface Episode {
  id: string;
  number: number;
  season: number;
  title: string;
  duration: string;
  
  // Watch & Download Options (Both Optional)
  watchCode?: string;        // Telegram Video ID for streaming
  downloadCode?: string;     // Telegram File ID for download
  downloadLink?: string;     // Direct download link (optional alternative)
}

export interface Movie {
  id: string;
  title: string;
  thumbnail: string;
  category: string;          // Exclusive, Korean Drama, Series, Action, etc.
  
  // Watch & Download Options (Both Optional)
  watchCode?: string;        // For single movie/content streaming
  downloadCode?: string;     // For single movie/content download
  downloadLink?: string;     // Direct download link (optional alternative)
  
  rating: number;
  views: string;
  year?: string;
  quality?: string;
  description?: string;
  
  // Series/Episodes (Optional - only for series)
  episodes?: Episode[];
  
  // Premium Features
  isPremium?: boolean;
  isFeatured?: boolean;        // Show in main banner
  featuredOrder?: number;      // Banner position
  isTop10?: boolean;           // Show in Top 10
  top10Position?: number;      // Position in Top 10 (1-10)
  isTrending?: boolean;        // Show in Trending section
  
  // Story Features
  storyImage?: string;         // Story circle image
  storyEnabled?: boolean;      // Enable story for this content
  
  // Sorting & Priority
  priority?: number;           // Higher = shows first
  createdAt?: any;            // Firebase timestamp
}

export interface StoryItem {
  id: string;
  image: string;              // Story circle image
  thumbnailUrl?: string;      // Full-screen story image
  movieId?: string;           // Link to movie (optional)
  link?: string;              // External link (optional)
  order: number;              // Display order
  createdAt?: any;
}

export interface BannerItem {
  id: string;
  movieId?: string;           // Link to movie
  title: string;
  image: string;              // Banner image
  description?: string;
  link?: string;              // External link (optional)
  order: number;              // Display order
  isActive: boolean;
  createdAt?: any;
}

export interface AppSettings {
  botUsername: string;                    // e.g., "Cinaflix_Streembot"
  channelLink: string;                    // Telegram channel link
  noticeText?: string;                    // Notice bar text
  noticeEnabled?: boolean;                // Show/hide notice
  autoViewIncrement?: boolean;
  categories?: string[];                  // Custom categories
  
  // Premium Settings
  enableTop10?: boolean;
  enableTrending?: boolean;
  enableStories?: boolean;
  enableBanners?: boolean;
  primaryColor?: string;                  // Theme color
  secondaryColor?: string;                // Accent color
  appName?: string;                       // App name
  appLogo?: string;                       // Logo URL
}

export type Category = 'Exclusive' | 'Korean Drama' | 'Series' | 'Action' | 'Comedy' | 'Horror' | 'All' | 'Favorites' | string;

// Helper type to check if content is a series
export interface ContentTypeInfo {
  isSeries: boolean;
  hasWatchOption: boolean;
  hasDownloadOption: boolean;
  episodeCount: number;
}
