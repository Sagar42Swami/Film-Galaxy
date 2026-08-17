/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import type { Movie } from "../types";

export interface Watchlists {
  [listName: string]: string[];
}

interface FavoritesContextType {
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  getFavoriteMovies: () => Promise<Movie[]>;
  
  // Custom watchlists
  watchlists: Watchlists;
  createWatchlist: (name: string) => void;
  deleteWatchlist: (name: string) => void;
  toggleMovieInWatchlist: (listName: string, id: string) => void;
  isMovieInWatchlist: (listName: string, id: string) => boolean;
  getWatchlistMovies: (listName: string) => Promise<Movie[]>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

const OMDB_API_KEY = import.meta.env.VITE_API_KEY || "3a9b5307";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  // Initialize watchlists from localStorage, default to having a "Favorites" list
  const [watchlists, setWatchlists] = useState<Watchlists>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("watchlists");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (!parsed.Favorites) {
            parsed.Favorites = [];
          }
          return parsed;
        } catch (e) {
          console.error("Failed to parse watchlists", e);
        }
      }
      
      // Fallback: check legacy favorites key for backward compatibility
      const legacyFavs = localStorage.getItem("favorites");
      const legacyParsed = legacyFavs ? JSON.parse(legacyFavs) : [];
      return { Favorites: legacyParsed };
    }
    return { Favorites: [] };
  });

  useEffect(() => {
    localStorage.setItem("watchlists", JSON.stringify(watchlists));
    // Keep legacy favorites in sync just in case
    localStorage.setItem("favorites", JSON.stringify(watchlists.Favorites || []));
  }, [watchlists]);

  // Backward compatibility convenience mappings - Memoized to prevent hook trigger loops
  const favorites = useMemo(() => watchlists.Favorites || [], [watchlists]);

  const isFavorite = useCallback(
    (id: string) => {
      return favorites.includes(id);
    },
    [favorites]
  );

  const toggleFavorite = useCallback((id: string) => {
    setWatchlists((prev) => {
      const favs = prev.Favorites || [];
      const updatedFavs = favs.includes(id)
        ? favs.filter((movieId) => movieId !== id)
        : [...favs, id];
      return {
        ...prev,
        Favorites: updatedFavs,
      };
    });
  }, []);

  const getWatchlistMovies = useCallback(async (listName: string): Promise<Movie[]> => {
    const listIds = watchlists[listName] || [];
    if (listIds.length === 0) return [];

    try {
      const moviesPromises = listIds.map(async (id) => {
        const response = await fetch(
          `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${id}`
        );
        if (!response.ok) throw new Error("Failed to fetch movie details");
        return response.json();
      });

      return Promise.all(moviesPromises);
    } catch (error) {
      console.error(`Error fetching movies for watchlist ${listName}:`, error);
      return [];
    }
  }, [watchlists]);

  const getFavoriteMovies = useCallback(async (): Promise<Movie[]> => {
    return getWatchlistMovies("Favorites");
  }, [getWatchlistMovies]);

  // Custom lists functions
  const createWatchlist = useCallback((name: string) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    setWatchlists((prev) => {
      if (prev[cleanName]) return prev; // Avoid overwriting existing list
      return {
        ...prev,
        [cleanName]: [],
      };
    });
  }, []);

  const deleteWatchlist = useCallback((name: string) => {
    if (name === "Favorites") return; // Cannot delete default favorites
    setWatchlists((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  }, []);

  const toggleMovieInWatchlist = useCallback((listName: string, id: string) => {
    setWatchlists((prev) => {
      const list = prev[listName] || [];
      const updatedList = list.includes(id)
        ? list.filter((movieId) => movieId !== id)
        : [...list, id];
      return {
        ...prev,
        [listName]: updatedList,
      };
    });
  }, []);

  const isMovieInWatchlist = useCallback(
    (listName: string, id: string) => {
      return (watchlists[listName] || []).includes(id);
    },
    [watchlists]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        getFavoriteMovies,
        watchlists,
        createWatchlist,
        deleteWatchlist,
        toggleMovieInWatchlist,
        isMovieInWatchlist,
        getWatchlistMovies,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
