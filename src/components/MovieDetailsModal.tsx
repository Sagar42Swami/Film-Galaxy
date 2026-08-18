import { useEffect, useState } from "react";
import { X, Star, Heart, Clock, Calendar, Share2, Check, ExternalLink, Plus, FolderHeart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Movie } from "../types";
import { useFavorites } from "../context/FavoritesContext";

interface DetailedMovie extends Movie {
  Rated?: string;
  Ratings?: { Source: string; Value: string }[];
}

interface ParsedRating {
  source: string;
  value: string;
  percent: number;
  color: string;
}

interface ExtendedMovieDetailsModalProps {
  movie: Movie | null;
  onClose: () => void;
  onSearchName?: (name: string) => void;
}

const OMDB_API_KEY = import.meta.env.VITE_API_KEY || "3a9b5307";

export function MovieDetailsModal({ movie, onClose, onSearchName }: ExtendedMovieDetailsModalProps) {
  const [fullDetails, setFullDetails] = useState<DetailedMovie | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [showAddListForm, setShowAddListForm] = useState(false);

  const {
    watchlists,
    toggleMovieInWatchlist,
    isMovieInWatchlist,
    createWatchlist
  } = useFavorites();

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!movie) return;
      setLoading(true);
      try {
        const response = await fetch(
          `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${movie.imdbID}&plot=full`
        );
        const data = await response.json();
        setFullDetails(data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setLoading(false);
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

  const handleShare = () => {
    // Generates a deep link hash
    const shareUrl = `${window.location.origin}${window.location.pathname}#/movie/${movie.imdbID}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      createWatchlist(newListName.trim());
      setNewListName("");
      setShowAddListForm(false);
    }
  };

  // Helper to parse ratings
  const parseRatings = (): ParsedRating[] => {
    if (!fullDetails || !fullDetails.Ratings) return [];
    
    return fullDetails.Ratings.map((rating: { Source: string; Value: string }) => {
      const source = rating.Source;
      const value = rating.Value;
      
      if (source === "Internet Movie Database") {
        const val = parseFloat(value.split("/")[0]);
        return { source: "IMDb", value: `${val}/10`, percent: val * 10, color: "bg-amber-500" };
      }
      if (source === "Rotten Tomatoes") {
        const val = parseInt(value.replace("%", ""));
        return { source: "Rotten Tomatoes", value, percent: val, color: "bg-rose-500" };
      }
      if (source === "Metacritic") {
        const val = parseInt(value.split("/")[0]);
        return { source: "Metacritic", value: `${val}/100`, percent: val, color: "bg-emerald-500" };
      }
      return { source, value, percent: 50, color: "bg-blue-500" };
    });
  };

  const parsedRatings = parseRatings();

  // Backdrop motion variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2, delay: 0.1 } },
  };

  // Modal motion variants
  const modalVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.35, ease: "easeOut" },
    },
    exit: { opacity: 0, y: 30, scale: 0.98, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      >
        <motion.div
          className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Modal Button */}
          <motion.button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 bg-slate-950/60 hover:bg-slate-950 border border-slate-700/40 rounded-full text-white transition-colors z-20"
            aria-label="Close modal"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4" />
          </motion.button>

          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading details...</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row">
              {/* Left Column: Image Cover and Actions */}
              <div className="md:w-1/3 relative bg-slate-950/20">
                <img
                  src={
                    fullDetails?.Poster !== "N/A"
                      ? fullDetails?.Poster
                      : "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800"
                  }
                  alt={fullDetails?.Title}
                  className="w-full h-full object-cover min-h-[300px] md:min-h-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800";
                  }}
                />

                {/* Bottom Left Cover Buttons (Quick Fav, Share) */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
                  {/* Share button */}
                  <button
                    onClick={handleShare}
                    className="p-3 bg-slate-950/80 border border-slate-700/50 backdrop-blur-md rounded-xl text-white hover:bg-slate-800 transition-all flex items-center justify-center flex-grow gap-2 text-xs font-bold"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Copied Link!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        <span>Share Movie</span>
                      </>
                    )}
                  </button>

                  {/* YouTube Trailer button */}
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                      (fullDetails?.Title || "") + " " + (fullDetails?.Year || "") + " official trailer"
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-red-600/90 border border-red-500/50 backdrop-blur-md rounded-xl text-white hover:bg-red-700 transition-all flex items-center justify-center flex-grow gap-2 text-xs font-bold text-center"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Watch Trailer</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Title and Details */}
              <div className="p-6 md:p-8 md:w-2/3 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">
                    {fullDetails?.Title}
                  </h2>

                  {/* Quick Meta Row */}
                  <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400 mb-6">
                    {fullDetails?.imdbRating && fullDetails.imdbRating !== "N/A" && (
                      <span className="flex items-center text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <Star className="w-3.5 h-3.5 mr-1 fill-amber-500" />
                        {fullDetails.imdbRating}
                      </span>
                    )}
                    {fullDetails?.Runtime && fullDetails.Runtime !== "N/A" && (
                      <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5" />
                        {fullDetails.Runtime}
                      </span>
                    )}
                    {fullDetails?.Released && fullDetails.Released !== "N/A" && (
                      <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                        <Calendar className="w-3.5 h-3.5" />
                        {fullDetails.Released}
                      </span>
                    )}
                    {fullDetails?.Rated && fullDetails.Rated !== "N/A" && (
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700/50 uppercase text-[10px] font-bold">
                        {fullDetails.Rated}
                      </span>
                    )}
                  </div>

                  {/* Plot summary */}
                  {fullDetails?.Plot && fullDetails.Plot !== "N/A" && (
                    <div className="mb-6">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                        Plot Summary
                      </h3>
                      <p className="text-sm md:text-base leading-relaxed text-slate-700 dark:text-slate-300">
                        {fullDetails.Plot}
                      </p>
                    </div>
                  )}

                  {/* Dynamic Multi-Source Rating Gauges */}
                  {parsedRatings.length > 0 && (
                    <div className="mb-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 p-4 rounded-xl">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                        Review Ratings
                      </h3>
                      <div className="space-y-3.5">
                        {parsedRatings.map((rating: ParsedRating) => (
                          <div key={rating.source} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-700 dark:text-slate-300">{rating.source}</span>
                              <span className="text-indigo-600 dark:text-indigo-400">{rating.value}</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div
                                className={`${rating.color} h-full rounded-full transition-all duration-1000`}
                                style={{ width: `${rating.percent}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cast & Director exploration */}
                  <div className="space-y-4 mb-6">
                    {fullDetails?.Director && fullDetails.Director !== "N/A" && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                          Director
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {fullDetails.Director.split(", ").map((dir: string) => (
                            <button
                              key={dir}
                              onClick={() => {
                                if (onSearchName) {
                                  onSearchName(dir);
                                  onClose();
                                }
                              }}
                              className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition-all"
                            >
                              {dir}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {fullDetails?.Actors && fullDetails.Actors !== "N/A" && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                          Cast members
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {fullDetails.Actors.split(", ").map((actor: string) => (
                            <button
                              key={actor}
                              onClick={() => {
                                if (onSearchName) {
                                  onSearchName(actor);
                                  onClose();
                                }
                              }}
                              className="px-3 py-1 bg-slate-100 hover:bg-indigo-500 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all border border-transparent dark:border-slate-700/50"
                            >
                              {actor}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {fullDetails?.Genre && fullDetails.Genre !== "N/A" && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                          Genres
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {fullDetails.Genre.split(", ").map((genre: string) => (
                            <span
                              key={genre}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-[11px] font-bold"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Watchlists Add/Remove Panel */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <FolderHeart className="w-4 h-4 text-indigo-500" />
                      Add to Custom Lists
                    </h4>
                    
                    <button
                      onClick={() => setShowAddListForm(!showAddListForm)}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create List
                    </button>
                  </div>

                  {/* Create New List Inline Form */}
                  <AnimatePresence>
                    {showAddListForm && (
                      <motion.form
                        onSubmit={handleCreateList}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 flex gap-2 overflow-hidden"
                      >
                        <input
                          type="text"
                          placeholder="e.g. Action Hits"
                          value={newListName}
                          onChange={(e) => setNewListName(e.target.value)}
                          className="flex-grow text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-600 transition-colors"
                        >
                          Create
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Checklist of watchlists */}
                  <div className="flex flex-wrap gap-2.5">
                    {Object.keys(watchlists).map((listName) => {
                      const inList = isMovieInWatchlist(listName, movie.imdbID);
                      return (
                        <button
                          key={listName}
                          onClick={() => toggleMovieInWatchlist(listName, movie.imdbID)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                            inList
                              ? "bg-rose-500 border-rose-500 text-white shadow-sm shadow-rose-500/25"
                              : "bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${inList ? "fill-white text-white" : "text-rose-500"}`} />
                          <span>{listName}</span>
                          <span className="text-[10px] opacity-70">({watchlists[listName].length})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
