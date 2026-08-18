import { useState, useEffect, useCallback, useMemo } from "react";
import { SearchBar } from "./components/SearchBar";
import { MovieCard } from "./components/MovieCard";
import { SkeletonGrid } from "./components/SkeletonCard";
import { Navbar } from "./components/Navbar";
import { MovieDetailsModal } from "./components/MovieDetailsModal";
import { FavoritesProvider, useFavorites } from "./context/FavoritesContext";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronLeft, ChevronRight, ListCollapse, Plus, Trash2, Library, Sparkles } from "lucide-react";
import { useDebounce } from "./hooks/useDebounce";
import { topMovies } from "./data/topMovies";
import type { Movie, SearchResponse } from "./types";

const OMDB_API_KEY = import.meta.env.VITE_API_KEY || "3a9b5307";

function App() {
  // Search & Results States
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Selected Movie for Modal
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  
  // Autocomplete Suggestions
  const debouncedQuery = useDebounce(query, 400);
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filters & Sorting States
  const [selectedType, setSelectedType] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [sortBy, setSortBy] = useState("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Watchlists Panel States
  const [showWatchlists, setShowWatchlists] = useState(false);
  const [activeWatchlistTab, setActiveWatchlistTab] = useState("Favorites");
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);
  const [newListName, setNewListName] = useState("");

  const {
    watchlists,
    createWatchlist,
    deleteWatchlist,
    getWatchlistMovies,
  } = useFavorites();

  // Client-side filter and sort for local Top 50 dataset
  const displayedTopMovies = useMemo(() => {
    let result = [...topMovies];
    
    // Apply filters
    if (selectedType) {
      result = result.filter(
        (m) => m.Type.toLowerCase() === selectedType.toLowerCase()
      );
    }
    if (selectedYear) {
      result = result.filter((m) => m.Year.includes(selectedYear));
    }
    
    // Apply sorting
    if (sortBy === "rating") {
      result.sort((a, b) => {
        const rA = parseFloat(a.imdbRating || "0");
        const rB = parseFloat(b.imdbRating || "0");
        return rB - rA;
      });
    } else if (sortBy === "year-desc") {
      result.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
    } else if (sortBy === "year-asc") {
      result.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
    } else if (sortBy === "title") {
      result.sort((a, b) => a.Title.localeCompare(b.Title));
    }
    
    return result;
  }, [selectedType, selectedYear, sortBy]);

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("darkMode") === "true";
    }
    return false;
  });

  // Toggle Dark Mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  // Deep-linking URL hash listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#/movie/")) {
        const imdbID = hash.replace("#/movie/", "");
        if (imdbID && (!selectedMovie || selectedMovie.imdbID !== imdbID)) {
          setSelectedMovie({ imdbID } as Movie);
        }
      } else if (!hash) {
        setSelectedMovie(null);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    // Trigger on initial page load
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync selectedMovie with URL hash
  const handleSelectMovie = (movie: Movie | null) => {
    if (movie) {
      window.location.hash = `#/movie/${movie.imdbID}`;
    } else {
      window.location.hash = "";
    }
    setSelectedMovie(movie);
  };

  // Autocomplete Suggestions fetcher
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.trim().length < 3) {
        setSuggestions([]);
        return;
      }
      setLoadingSuggestions(true);
      try {
        let url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(
          debouncedQuery
        )}`;
        if (selectedType) url += `&type=${selectedType}`;
        if (selectedYear) url += `&y=${selectedYear}`;

        const response = await fetch(url);
        const data = await response.json();
        if (data.Response === "True") {
          setSuggestions(data.Search.slice(0, 5));
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Suggestions fetch error:", err);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, selectedType, selectedYear]);

  // Client-side sorting logic helper
  const sortResults = useCallback((movieList: Movie[], sortParam: string) => {
    const sorted = [...movieList];
    if (sortParam === "rating") {
      sorted.sort((a, b) => {
        const ratingA = parseFloat(a.imdbRating || "0");
        const ratingB = parseFloat(b.imdbRating || "0");
        return ratingB - ratingA;
      });
    } else if (sortParam === "year-desc") {
      sorted.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
    } else if (sortParam === "year-asc") {
      sorted.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
    } else if (sortParam === "title") {
      sorted.sort((a, b) => a.Title.localeCompare(b.Title));
    }
    return sorted;
  }, []);

  // Main search function
  const searchMovies = async (page = 1) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setShowWatchlists(false);
    setCurrentPage(page);

    try {
      let url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(
        query
      )}&page=${page}`;
      if (selectedType) url += `&type=${selectedType}`;
      if (selectedYear) url += `&y=${selectedYear}`;

      const response = await fetch(url);
      const data: SearchResponse = await response.json();

      if (data.Response === "True") {
        setTotalResults(parseInt(data.totalResults));
        // Fetch rating details for each search result
        const moviesWithDetails = await Promise.all(
          data.Search.map(async (movie) => {
            try {
               const detailsResponse = await fetch(
                 `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${movie.imdbID}`
               );
               return detailsResponse.json();
             } catch {
               return movie;
             }
           })
         );
         
         // Apply client sorting if needed
         setMovies(sortResults(moviesWithDetails, sortBy));
       } else {
         setError(data.Error || "No results found");
         setMovies([]);
         setTotalResults(0);
       }
     } catch {
       setError("Failed to fetch movies. Please check your network and try again.");
       setMovies([]);
       setTotalResults(0);
     } finally {
      setLoading(false);
    }
  };

  // Re-sort results if sortBy changes
  useEffect(() => {
    setMovies((prev) => (prev.length > 0 ? sortResults(prev, sortBy) : prev));
  }, [sortBy, sortResults]);

  // Load and refresh current watchlist movie details
  const loadWatchlistDetails = useCallback(async () => {
    if (!watchlists[activeWatchlistTab]) return;
    setLoadingWatchlist(true);
    try {
      const items = await getWatchlistMovies(activeWatchlistTab);
      // Sort watchlisted items client side if needed
      setWatchlistMovies(sortResults(items, sortBy));
    } catch (err) {
      console.error("Error loading watchlist items:", err);
    } finally {
      setLoadingWatchlist(false);
    }
  }, [activeWatchlistTab, watchlists, getWatchlistMovies, sortBy, sortResults]);

  // Trigger loading details of watchlist
  useEffect(() => {
    if (showWatchlists) {
      loadWatchlistDetails();
    }
  }, [showWatchlists, activeWatchlistTab, watchlists, loadWatchlistDetails]);

  const handleWatchlistClick = () => {
    setShowWatchlists(!showWatchlists);
  };

  const handleCreateWatchlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      createWatchlist(newListName.trim());
      setActiveWatchlistTab(newListName.trim());
      setNewListName("");
    }
  };

  const handleDeleteList = (listName: string) => {
    deleteWatchlist(listName);
    if (activeWatchlistTab === listName) {
      setActiveWatchlistTab("Favorites");
    }
  };

  // Calculate total pages for paginator
  const totalPages = Math.ceil(totalResults / 10);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Navbar
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
      />

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Banner Section */}
        <div className="max-w-4xl mx-auto text-center mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Cinematic Library
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
            Explore the MovieVerse
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg mb-8 max-w-xl mx-auto">
            Search, filter, and curate custom folders of your absolute favorite movies and shows.
          </p>

          {/* Search bar & collections dashboard button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="w-full sm:flex-grow">
              <SearchBar
                query={query}
                setQuery={setQuery}
                onSearch={() => searchMovies(1)}
                suggestions={suggestions}
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
                loadingSuggestions={loadingSuggestions}
                onSuggestionClick={(movie) => handleSelectMovie(movie)}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
            </div>
            
            <motion.button
              onClick={handleWatchlistClick}
              className={`w-full sm:w-auto px-5 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border shadow-sm transition-all ${
                showWatchlists
                  ? "bg-rose-500 hover:bg-rose-600 text-white border-rose-500 shadow-rose-500/20"
                  : "bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              aria-label="Toggle watchlists dashboard"
            >
              <Library className="w-4 h-4" />
              <span>Collections</span>
              <span className="bg-slate-100 dark:bg-slate-800/80 text-indigo-600 dark:text-indigo-400 text-xs px-2 py-0.5 rounded-md font-bold">
                {Object.keys(watchlists).length}
              </span>
            </motion.button>
          </div>
        </div>

        {/* Watchlist dashboard drawer container */}
        <AnimatePresence>
          {showWatchlists && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto mb-12"
            >
              <div className="bg-white/80 dark:bg-slate-900/60 border border-gray-200/50 dark:border-slate-800/50 backdrop-blur-md p-6 rounded-2xl shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-5 mb-5">
                  <div className="flex items-center gap-2">
                    <Library className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Curated Playlists & Collections
                    </h3>
                  </div>

                  {/* Inline list creator form */}
                  <form onSubmit={handleCreateWatchlist} className="flex gap-2 w-full md:w-auto">
                    <input
                      type="text"
                      placeholder="Create list, e.g. Sci-Fi"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      className="text-sm px-3.5 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none w-full md:w-48"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Create
                    </button>
                  </form>
                </div>

                {/* Playlist tabs navigation */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {Object.keys(watchlists).map((listName) => (
                    <div
                      key={listName}
                      className={`flex items-center rounded-lg border transition-all ${
                        activeWatchlistTab === listName
                          ? "bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-500/20"
                          : "bg-gray-100 dark:bg-slate-800 border-transparent text-slate-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveWatchlistTab(listName)}
                        className="px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5"
                      >
                        <Heart className={`w-3.5 h-3.5 ${activeWatchlistTab === listName ? "fill-white text-white" : "text-rose-500"}`} />
                        <span>{listName}</span>
                        <span className="text-[10px] opacity-70">({watchlists[listName].length})</span>
                      </button>
                      
                      {listName !== "Favorites" && (
                        <button
                          type="button"
                          onClick={() => handleDeleteList(listName)}
                          className={`p-1.5 hover:text-red-500 transition-colors border-l ${
                            activeWatchlistTab === listName
                              ? "border-white/20 text-white/70"
                              : "border-gray-200 dark:border-slate-700 text-slate-400"
                          }`}
                          aria-label={`Delete ${listName} list`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Dashboard Loading state */}
                {loadingWatchlist && <SkeletonGrid />}

                {/* Dashboard contents */}
                {!loadingWatchlist && watchlists[activeWatchlistTab]?.length === 0 && (
                  <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-dashed border-gray-200 dark:border-slate-800">
                    <Heart className="w-10 h-10 mx-auto text-rose-500/40 mb-3 animate-pulse" />
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      No movies in this collection yet.
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Open any movie details card and toggle this collection badge to add movies here!
                    </p>
                  </div>
                )}

                {!loadingWatchlist &&
                  watchlists[activeWatchlistTab]?.length > 0 &&
                  watchlistMovies.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {watchlistMovies.map((movie) => (
                        <MovieCard
                          key={movie.imdbID}
                          movie={movie}
                          onSelect={handleSelectMovie}
                        />
                      ))}
                    </div>
                  )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Indicator */}
        {loading && <SkeletonGrid />}

        {/* Error Message */}
        {error && (
          <div className="text-center text-red-600 dark:text-red-400 my-12 bg-red-500/10 border border-red-500/20 p-5 max-w-xl mx-auto rounded-xl">
            <p className="font-semibold text-sm">{error}</p>
          </div>
        )}

        {/* Search Results Display */}
        {!loading && !error && movies.length > 0 && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.imdbID}
                  movie={movie}
                  onSelect={handleSelectMovie}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 border-t border-slate-200 dark:border-slate-800 pt-8 mt-12">
                <motion.button
                  onClick={() => searchMovies(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all font-semibold flex items-center gap-1 text-sm shadow-sm"
                  whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
                  whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
                >
                  <ChevronLeft size={16} />
                  <span>Prev</span>
                </motion.button>

                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-850 px-3.5 py-2 rounded-xl">
                  Page {currentPage} of {totalPages}
                </span>

                <motion.button
                  onClick={() => searchMovies(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all font-semibold flex items-center gap-1 text-sm shadow-sm"
                  whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
                  whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </motion.button>
              </div>
            )}
          </div>
        )}

        {/* Landing/Trending IMDb Top 50 Section */}
        {!query.trim() && !showWatchlists && !loading && !error && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  IMDb Global Top 50 Movies (Trending)
                </h3>
              </div>
              {(selectedType || selectedYear || sortBy) && (
                <button
                  onClick={() => {
                    setSelectedType("");
                    setSelectedYear("");
                    setSortBy("");
                  }}
                  className="text-xs font-bold text-indigo-500 hover:underline"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {displayedTopMovies.length === 0 ? (
              <div className="text-center py-20 bg-slate-100/50 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <ListCollapse className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  No top movies match your selected filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayedTopMovies.map((movie) => (
                  <MovieCard
                    key={movie.imdbID}
                    movie={movie}
                    onSelect={handleSelectMovie}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty Search Results Message */}
        {!loading && !error && movies.length === 0 && query && (
          <div className="text-center py-20 bg-slate-100/50 dark:bg-slate-900/20 max-w-xl mx-auto rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <ListCollapse className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Press Enter or click Search to load your results.
            </p>
          </div>
        )}
      </main>

      {/* Movie Details Modal */}
      {selectedMovie && (
        <MovieDetailsModal
          movie={selectedMovie}
          onClose={() => handleSelectMovie(null)}
          onSearchName={(name) => {
            setQuery(name);
            // Initiate a fresh name query search
            setTimeout(() => {
              const fetchNewResults = async () => {
                setLoading(true);
                setError(null);
                setShowWatchlists(false);
                setCurrentPage(1);
                try {
                  const url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(name)}&page=1`;
                  const response = await fetch(url);
                  const data: SearchResponse = await response.json();
                  if (data.Response === "True") {
                    setTotalResults(parseInt(data.totalResults));
                    const details = await Promise.all(
                      data.Search.map(async (m) => {
                        const r = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${m.imdbID}`);
                        return r.json();
                      })
                    );
                    setMovies(details);
                  } else {
                    setError(data.Error || "No results found");
                    setMovies([]);
                  }
                } catch {
                  setError("Failed to fetch search results.");
                  setMovies([]);
                } finally {
                  setLoading(false);
                }
              };
              fetchNewResults();
            }, 50);
          }}
        />
      )}
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
