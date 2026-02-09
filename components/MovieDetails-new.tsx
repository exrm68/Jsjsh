import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Play, Download, Star, Calendar, Eye, Award, Film, Tv, ExternalLink } from 'lucide-react';
import { Movie, Episode } from '../types-new';

interface MovieDetailsProps {
  movie: Movie;
  onClose: () => void;
  botUsername: string;
  channelLink?: string;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ movie, onClose, botUsername, channelLink }) => {
  const [selectedSeason, setSelectedSeason] = useState(1);

  // Group episodes by season
  const episodesBySeason = movie.episodes?.reduce((acc, ep) => {
    if (!acc[ep.season]) acc[ep.season] = [];
    acc[ep.season].push(ep);
    return acc;
  }, {} as Record<number, Episode[]>) || {};

  const seasons = Object.keys(episodesBySeason).map(Number).sort((a, b) => a - b);
  const currentSeasonEpisodes = episodesBySeason[selectedSeason] || [];

  // Check if this is a series
  const isSeries = movie.episodes && movie.episodes.length > 0;

  // Generate Telegram Bot Links
  const generateBotLink = (code: string) => {
    return `https://t.me/${botUsername}?start=${code}`;
  };

  // Handle Watch Click
  const handleWatch = (code?: string) => {
    if (!code) return;
    window.open(generateBotLink(code), '_blank');
  };

  // Handle Download Click
  const handleDownload = (downloadCode?: string, downloadLink?: string) => {
    if (downloadLink) {
      // If direct link is provided, open it
      window.open(downloadLink, '_blank');
    } else if (downloadCode) {
      // Otherwise use bot download code
      window.open(generateBotLink(downloadCode), '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[999] overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-screen" onClick={(e) => e.stopPropagation()}>
        {/* Header with Backdrop */}
        <div className="relative h-[60vh] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={movie.thumbnail}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-black/70 transition-all border border-white/10"
          >
            <X size={20} className="text-white" />
          </button>

          {/* Content Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="max-w-4xl mx-auto">
              {/* Badges */}
              <div className="flex items-center gap-2 mb-4">
                {movie.isPremium && (
                  <span className="bg-gold text-black text-xs font-bold px-3 py-1 rounded-full">
                    PREMIUM
                  </span>
                )}
                {movie.isTop10 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Award size={12} />
                    TOP #{movie.top10Position}
                  </span>
                )}
                {movie.quality && (
                  <span className="bg-white/10 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                    {movie.quality}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                {movie.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-gray-300 mb-6">
                {movie.rating && (
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-gold fill-gold" />
                    <span className="font-bold">{movie.rating}</span>
                  </div>
                )}
                {movie.year && (
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>{movie.year}</span>
                  </div>
                )}
                {movie.views && (
                  <div className="flex items-center gap-1">
                    <Eye size={16} />
                    <span>{movie.views} Views</span>
                  </div>
                )}
                {movie.category && (
                  <span className="bg-white/10 px-3 py-1 rounded-full text-xs">
                    {movie.category}
                  </span>
                )}
              </div>

              {/* Action Buttons - Only for Single Movie/Content */}
              {!isSeries && (
                <div className="flex gap-3">
                  {movie.watchCode && (
                    <button
                      onClick={() => handleWatch(movie.watchCode)}
                      className="flex items-center gap-2 bg-white hover:bg-gray-100 text-black font-bold px-8 py-3 rounded-full transition-all shadow-lg"
                    >
                      <Play size={20} fill="currentColor" />
                      Watch Now
                    </button>
                  )}
                  
                  {(movie.downloadCode || movie.downloadLink) && (
                    <button
                      onClick={() => handleDownload(movie.downloadCode, movie.downloadLink)}
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3 rounded-full transition-all backdrop-blur-md border border-white/20"
                    >
                      <Download size={20} />
                      Download
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Description */}
          {movie.description && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-3">About</h2>
              <p className="text-gray-300 leading-relaxed">{movie.description}</p>
            </div>
          )}

          {/* Episodes Section - Only for Series */}
          {isSeries && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Tv className="text-gold" size={24} />
                  Episodes
                </h2>
              </div>

              {/* Season Selector */}
              {seasons.length > 1 && (
                <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
                  {seasons.map((season) => (
                    <button
                      key={season}
                      onClick={() => setSelectedSeason(season)}
                      className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                        selectedSeason === season
                          ? 'bg-gradient-to-r from-gold to-yellow-500 text-black'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      Season {season}
                    </button>
                  ))}
                </div>
              )}

              {/* Episodes List */}
              <div className="space-y-3">
                {currentSeasonEpisodes
                  .sort((a, b) => a.number - b.number)
                  .map((episode, index) => (
                    <div
                      key={episode.id}
                      className="bg-white/5 hover:bg-white/10 rounded-xl p-4 border border-white/10 hover:border-gold/30 transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        {/* Episode Number */}
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gold/20 to-yellow-500/20 flex items-center justify-center border border-gold/30 flex-shrink-0">
                          <span className="text-gold font-bold">{episode.number}</span>
                        </div>

                        {/* Episode Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold mb-1 group-hover:text-gold transition-colors">
                            {episode.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                            {episode.duration && (
                              <span className="flex items-center gap-1">
                                <Film size={12} />
                                {episode.duration}
                              </span>
                            )}
                            <span>Episode {episode.number}</span>
                          </div>

                          {/* Episode Actions */}
                          <div className="flex gap-2">
                            {episode.watchCode && (
                              <button
                                onClick={() => handleWatch(episode.watchCode)}
                                className="flex items-center gap-1.5 bg-white hover:bg-gray-100 text-black font-bold px-4 py-2 rounded-full transition-all text-sm"
                              >
                                <Play size={14} fill="currentColor" />
                                Watch
                              </button>
                            )}
                            
                            {(episode.downloadCode || episode.downloadLink) && (
                              <button
                                onClick={() => handleDownload(episode.downloadCode, episode.downloadLink)}
                                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded-full transition-all backdrop-blur-md border border-white/20 text-sm"
                              >
                                <Download size={14} />
                                Download
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {currentSeasonEpisodes.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No episodes available for Season {selectedSeason}
                </div>
              )}
            </div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {movie.category && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-gray-400 text-sm mb-1">Category</div>
                <div className="text-white font-bold">{movie.category}</div>
              </div>
            )}
            {movie.quality && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-gray-400 text-sm mb-1">Quality</div>
                <div className="text-white font-bold">{movie.quality}</div>
              </div>
            )}
          </div>

          {/* Channel Link */}
          {channelLink && (
            <div className="text-center pt-6 border-t border-white/10">
              <p className="text-gray-400 text-sm mb-3">
                Join our channel for more updates
              </p>
              <a
                href={channelLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#0088cc] hover:bg-[#0077b3] text-white font-bold px-6 py-3 rounded-full transition-all"
              >
                <ExternalLink size={18} />
                Join Channel
              </a>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MovieDetails;
