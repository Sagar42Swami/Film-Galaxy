import { useEffect, useState } from "react";
import { X, Star, Heart, Clock, Calendar} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Movie, MovieDetailsModalProps } from "../types";
import { useFavorites } from "../context/FavoritesContext";

export function MovieDetailsModal({ movie, onClose }: MovieDetailsModalProps) {
  const [fullDetails, setFullDetails] = useState<Movie | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = movie ? isFavorite(movie.imdbID) : false;

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!movie) return;
      try {
        const response = await fetch(
          `https://www.omdbapi.com/?apikey=3a9b5307&i=${movie.imdbID}&plot=full`
        );
        const data = await response.json();
        setFullDetails(data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    };

    fetchMovieDetails();
  }, [movie]);

  // Close modal when escape key is pressed
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [onClose]);

  if (!movie) return null;

  // Modal animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3, delay: 0.1 },
    },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        bounce: 0.2,
      },
    },
    exit: {
      opacity: 0,
      y: 50,
      scale: 0.95,
      transition: { duration: 0.3 },
    },
  };

  // Content animation variants
  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      >
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <motion.button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors z-10"
              aria-label="Close modal"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>

            <div className="flex flex-col md:flex-row">
              <motion.div
                className="md:w-1/3 relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src={
                    fullDetails?.Poster !== "N/A"
                      ? fullDetails?.Poster
                      : "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                  }
                  alt={fullDetails?.Title}
                  className="w-full h-full object-cover"
                />

                {/* Moved heart button to bottom left of image */}
                <motion.button
                  onClick={() => movie && toggleFavorite(movie.imdbID)}
                  className="absolute bottom-4 left-4 p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  aria-label={
                    favorite ? "Remove from favorites" : "Add to favorites"
                  }
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    transition: { delay: 0.5, duration: 0.3 },
                  }}
                >
                  <motion.div
                    animate={
                      favorite
                        ? {
                            scale: [1, 1.5, 1],
                            transition: { duration: 0.3 },
                          }
                        : {}
                    }
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        favorite ? "text-red-500 fill-red-500" : "text-white"
                      }`}
                    />
                  </motion.div>
                </motion.button>
              </motion.div>

              <motion.div
                className="p-6 md:w-2/3"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.h2
                  className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2"
                  variants={itemVariants}
                >
                  {fullDetails?.Title}
                </motion.h2>

                <motion.div
                  className="flex flex-wrap gap-4 mb-6"
                  variants={itemVariants}
                >
                  {fullDetails?.imdbRating && (
                    <motion.div
                      className="flex items-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div
                        animate={{
                          rotateZ: [0, 15, -15, 15, 0],
                          transition: { duration: 1, delay: 1, repeat: 0 },
                        }}
                      >
                        <Star className="w-5 h-5 text-yellow-400 mr-1" />
                      </motion.div>
                      <span className="text-gray-700 dark:text-gray-300">
                        {fullDetails.imdbRating}/10
                      </span>
                    </motion.div>
                  )}
                  {fullDetails?.Runtime && (
                    <motion.div
                      className="flex items-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Clock className="w-5 h-5 text-gray-500 mr-1" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {fullDetails.Runtime}
                      </span>
                    </motion.div>
                  )}
                  {fullDetails?.Released && (
                    <motion.div
                      className="flex items-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Calendar className="w-5 h-5 text-gray-500 mr-1" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {fullDetails.Released}
                      </span>
                    </motion.div>
                  )}
                </motion.div>

                <motion.div className="space-y-4" variants={contentVariants}>
                  {fullDetails?.Plot && (
                    <motion.div variants={itemVariants}>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Plot
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {fullDetails.Plot}
                      </p>
                    </motion.div>
                  )}

                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    variants={itemVariants}
                  >
                    {fullDetails?.Director && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Director
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {fullDetails.Director}
                        </p>
                      </motion.div>
                    )}
                    {fullDetails?.Actors && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Cast
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {fullDetails.Actors}
                        </p>
                      </motion.div>
                    )}
                    {fullDetails?.Genre && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Genre
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {fullDetails.Genre}
                        </p>
                      </motion.div>
                    )}
                    {fullDetails?.Awards && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Awards
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {fullDetails.Awards}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>

                  {(fullDetails?.Language || fullDetails?.Country) && (
                    <motion.div
                      className="flex flex-wrap gap-2 mt-4"
                      variants={itemVariants}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 }}
                    >
                      {fullDetails?.Language && (
                        <motion.span
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
                          whileHover={{ scale: 1.05 }}
                        >
                          {fullDetails.Language}
                        </motion.span>
                      )}
                      {fullDetails?.Country && (
                        <motion.span
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
                          whileHover={{ scale: 1.05 }}
                        >
                          {fullDetails.Country}
                        </motion.span>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
