import React from "react";
import { Star, Heart, Clapperboard, MonitorPlay, Film } from "lucide-react";
import { motion } from "framer-motion";
import type { Movie } from "../types";
import { useFavorites } from "../context/FavoritesContext";

interface MovieCardProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
}

export function MovieCard({ movie, onSelect }: MovieCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(movie.imdbID);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(movie.imdbID);
  };

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    hover: {
      y: -6,
      boxShadow: "0px 15px 30px rgba(99, 102, 241, 0.15)", // Indigo colored shadow highlight
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "movie":
        return <Film className="w-3.5 h-3.5" />;
      case "series":
        return <MonitorPlay className="w-3.5 h-3.5" />;
      default:
        return <Clapperboard className="w-3.5 h-3.5" />;
    }
  };

  return (
    <motion.div
      onClick={() => onSelect(movie)}
      className="group bg-white/70 dark:bg-slate-900/60 border border-gray-200/50 dark:border-slate-800/50 backdrop-blur-md rounded-2xl shadow-md overflow-hidden cursor-pointer flex flex-col justify-between h-full transition-colors duration-300"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      layout
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        {/* Cover Image with Zoom Effect */}
        <motion.img
          src={
            movie.Poster !== "N/A"
              ? movie.Poster
              : "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800"
          }
          alt={movie.Title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800";
          }}
        />

        {/* Cinematic dark overlay on image hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Type Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-950/70 border border-slate-700/50 backdrop-blur-md rounded-lg text-white flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
          {getTypeIcon(movie.Type)}
          <span>{movie.Type}</span>
        </div>

        {/* Heart Favorite Button */}
        <motion.button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-2 bg-slate-950/70 border border-slate-700/50 backdrop-blur-md rounded-lg text-white hover:bg-red-500/80 hover:border-red-500/50 transition-all z-10"
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              favorite ? "text-red-500 fill-red-500" : "text-white"
            }`}
          />
        </motion.button>

        {/* Rating Badge */}
        {movie.imdbRating && movie.imdbRating !== "N/A" && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-slate-950/70 border border-slate-700/50 backdrop-blur-md rounded-lg text-white flex items-center">
            <Star className="w-3.5 h-3.5 text-amber-400 mr-1.5 fill-amber-400" />
            <span className="text-xs font-bold">{movie.imdbRating}</span>
          </div>
        )}
      </div>

      {/* Card Info Details */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <h3 className="text-base font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2 transition-colors duration-200">
          {movie.Title}
        </h3>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded">
            {movie.Year}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
