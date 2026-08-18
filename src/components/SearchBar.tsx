import React, { useState, useRef, useEffect } from "react";
import { Search, SlidersHorizontal, Film, Calendar, ArrowUpDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Movie } from "../types";

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  onSearch: () => void;
  
  // Autocomplete suggestions
  suggestions: Movie[];
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  loadingSuggestions: boolean;
  onSuggestionClick: (movie: Movie) => void;

  // Filter & Sort state
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export function SearchBar({
  query,
  setQuery,
  onSearch,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  loadingSuggestions,
  onSuggestionClick,
  selectedType,
  setSelectedType,
  selectedYear,
  setSelectedYear,
  sortBy,
  setSortBy,
}: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions and filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowSuggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch();
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto z-30">
      <motion.form
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit}
        className="w-full"
      >
        <div className="relative flex items-center gap-2">
          {/* Main Input Field */}
          <div className="relative flex-grow flex items-center">
            <motion.input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search movies, series, or games..."
              className="w-full px-5 py-3 pl-11 pr-24 text-gray-900 dark:text-white border border-gray-300/80 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500/80 dark:focus:ring-indigo-500/80 focus:border-transparent transition-all shadow-sm dark:shadow-inner"
              whileFocus={{ scale: 1.005 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
            <div className="absolute left-4 text-gray-400 dark:text-slate-500">
              <Search size={18} />
            </div>

            {/* Embed Loader in Search Bar */}
            {loadingSuggestions && (
              <div className="absolute right-24 mr-2">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Search Submit Button */}
            <motion.button
              type="submit"
              className="absolute right-2 px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-md transition-all focus:outline-none"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Search
            </motion.button>
          </div>

          {/* Filter toggle button */}
          <motion.button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-xl border flex items-center justify-center transition-all ${
              showFilters || selectedType !== "" || selectedYear !== "" || sortBy !== ""
                ? "bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-500/20"
                : "bg-white dark:bg-slate-900/80 border-gray-300 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Filter search results"
          >
            <SlidersHorizontal size={18} />
          </motion.button>
        </div>
      </motion.form>

      {/* Autocomplete Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && query.trim().length >= 3 && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900/95 border border-gray-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl max-h-80 overflow-y-auto"
          >
            <div className="py-2">
              <div className="px-4 py-1 text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                Suggestions
              </div>
              {suggestions.map((movie) => (
                <button
                  key={movie.imdbID}
                  type="button"
                  onClick={() => {
                    onSuggestionClick(movie);
                    setShowSuggestions(false);
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-slate-800/80 text-left transition-colors"
                >
                  <img
                    src={movie.Poster !== "N/A" ? movie.Poster : "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=100"}
                    alt={movie.Title}
                    className="w-8 h-12 object-cover rounded shadow"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-grow min-w-0">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {movie.Title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] capitalize">
                        {movie.Type}
                      </span>
                      <span>•</span>
                      <span>{movie.Year}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Filters Expandable Drawer */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden bg-white/90 dark:bg-slate-900/90 border border-gray-200 dark:border-slate-800 rounded-xl shadow-lg backdrop-blur-md"
          >
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Type Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 flex items-center gap-1">
                  <Film size={12} /> Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">All Types</option>
                  <option value="movie">Movies</option>
                  <option value="series">TV Shows</option>
                  <option value="episode">Episodes</option>
                </select>
              </div>

              {/* Year Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 flex items-center gap-1">
                  <Calendar size={12} /> Year
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2024"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-gray-400"
                />
              </div>

              {/* Sort Controls */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 flex items-center gap-1">
                  <ArrowUpDown size={12} /> Sort By (Page)
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Default Order</option>
                  <option value="rating">IMDb Rating (High to Low)</option>
                  <option value="year-desc">Year (Newest First)</option>
                  <option value="year-asc">Year (Oldest First)</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Reset Filters Bar */}
            {(selectedType !== "" || selectedYear !== "" || sortBy !== "") && (
              <div className="px-4 py-2 bg-gray-50 dark:bg-slate-800/40 border-t border-gray-200 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType("");
                    setSelectedYear("");
                    setSortBy("");
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
