import { useState, useEffect } from "react";
import { SearchBar } from "./components/SearchBar";
import { MovieCard } from "./components/MovieCard";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { Navbar } from "./components/Navbar";
import { MovieDetailsModal } from "./components/MovieDetailsModal";
import { FavoritesProvider, useFavorites } from "./context/FavoritesContext";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import type { Movie, SearchResponse } from "./types";

const OMDB_API_KEY = import.meta.env.VITE_API_KEY;

function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const { favorites, getFavoriteMovies } = useFavorites();
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("darkMode") === "true";
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  const searchMovies = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    // Hide favorites when searching
    setShowFavorites(false);

    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(
          query
        )}`
      );
      const data: SearchResponse = await response.json();

      if (data.Response === "True") {
        // Fetch additional details for each movie to get ratings
        const moviesWithDetails = await Promise.all(
          data.Search.map(async (movie) => {
            const detailsResponse = await fetch(
              `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${movie.imdbID}`
            );
            return detailsResponse.json();
          })
        );
        setMovies(moviesWithDetails);
      } else {
        setError(data.Error || "No results found");
        setMovies([]);
      }
    } catch (err) {
      setError("Failed to fetch movies. Please try again.");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoritesClick = async () => {
    setShowFavorites(!showFavorites);

    if (!showFavorites && favorites.length > 0) {
      setLoadingFavorites(true);
      try {
        const movies = await getFavoriteMovies();
        setFavoriteMovies(movies);
      } catch (error) {
        console.error("Error fetching favorite movies:", error);
      } finally {
        setLoadingFavorites(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Find Your Next Movie
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Search through thousands of movies and discover your next favorite
            film
          </p>

          <div className="flex items-center justify-center gap-4">
            <div className="flex-grow max-w-2xl">
              <SearchBar
                query={query}
                setQuery={setQuery}
                onSearch={searchMovies}
              />
            </div>
            <motion.button
              onClick={handleFavoritesClick}
              className="px-4 py-2.5 bg-red-500 hover:bg-red-700 text-white rounded-lg font-medium shadow flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Show favorites"
            >
              <Heart className="w-5 h-5" fill="white" />
              <span className="hidden sm:inline">{favorites.length}</span>
            </motion.button>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && <LoadingSpinner />}

        {/* Error Message */}
        {error && (
          <div className="text-center text-red-600 dark:text-red-400 mb-8">
            <p>{error}</p>
          </div>
        )}

        {/* Search Results */}
        {!loading && !error && movies.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.imdbID}
                movie={movie}
                onSelect={setSelectedMovie}
              />
            ))}
          </div>
        )}

        {/* Empty Search Results Message */}
        {!loading && !error && movies.length === 0 && query && (
          <div className="text-center text-gray-600 dark:text-gray-400 mb-12">
            <p>Click Enter or Press on Search.</p>
          </div>
        )}
        {/* Favorites Section */}
        <AnimatePresence>
          {showFavorites && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto mb-12"
            >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Heart
                    className="w-5 h-5 mr-2 text-red-500"
                    fill="currentColor"
                  />
                  My Favorites ({favorites.length})
                </h3>

                {loadingFavorites && <LoadingSpinner />}

                {!loadingFavorites && favorites.length === 0 && (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-6">
                    You haven't added any favorites yet. Click the heart icon on
                    any movie to add it to your favorites!
                  </p>
                )}

                {!loadingFavorites &&
                  favorites.length > 0 &&
                  favoriteMovies.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {favoriteMovies.map((movie) => (
                        <MovieCard
                          key={movie.imdbID}
                          movie={movie}
                          onSelect={setSelectedMovie}
                        />
                      ))}
                    </div>
                  )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Movie Details Modal */}
        {selectedMovie && (
          <MovieDetailsModal
            movie={selectedMovie}
            onClose={() => setSelectedMovie(null)}
          />
        )}
      </main>
    </div>
  );
}

export default function AppWithProviders() {
  return (
    <FavoritesProvider>
      <App />
    </FavoritesProvider>
  );
}
