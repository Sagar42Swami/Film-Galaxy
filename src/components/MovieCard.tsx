import React from "react";
import { Star, Heart } from "lucide-react";
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.05,
      boxShadow: "0px 10px 20px rgba(0,0,0,0.2)",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  // Heart button animation variants
  const heartButtonVariants = {
    normal: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2 },
    },
    hover: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2 },
    },
  };

  // Heart icon animation
  const heartIconVariants = {
    unliked: { scale: 1 },
    liked: {
      scale: [1, 1.5, 1],
      transition: { duration: 0.3 },
    },
  };

  // Rating animation variants
  const ratingVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.3,
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      onClick={() => onSelect(movie)}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      layout
    >
      <div className="relative aspect-[2/3] w-full group">
        <motion.img
          src={
            movie.Poster !== "N/A"
              ? movie.Poster
              : "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
          }
          alt={movie.Title}
          className="w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          loading="lazy"
        />
        <motion.button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-2 bg-black/50 rounded-full"
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          variants={heartButtonVariants}
          initial="normal"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={favorite ? "hover" : "normal"}
        >
          <motion.div
            variants={heartIconVariants}
            animate={favorite ? "liked" : "unliked"}
          >
            <Heart
              className={`w-5 h-5 ${
                favorite ? "text-red-500 fill-red-500" : "text-white"
              }`}
            />
          </motion.div>
        </motion.button>
        {movie.imdbRating && (
          <motion.div
            className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded-md text-white flex items-center"
            variants={ratingVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <Star className="w-4 h-4 text-yellow-400 mr-1" />
            </motion.div>
            <span className="text-sm font-medium">{movie.imdbRating}</span>
          </motion.div>
        )}
      </div>
      <motion.div
        className="p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
          {movie.Title}
        </h3>
        <motion.div
          className="mt-2 flex items-center justify-between"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {movie.Year}
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
