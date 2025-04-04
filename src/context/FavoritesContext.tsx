import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { Movie } from "../types";

interface FavoritesContextType {
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  getFavoriteMovies: () => Promise<Movie[]>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

const OMDB_API_KEY = "3a9b5307";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const savedFavorites = localStorage.getItem("favorites");
      return savedFavorites ? JSON.parse(savedFavorites) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = useCallback(
    (id: string) => {
      return favorites.includes(id);
    },
    [favorites]
  );

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      if (prev.includes(id)) {
        return prev.filter((movieId) => movieId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const getFavoriteMovies = useCallback(async (): Promise<Movie[]> => {
    if (favorites.length === 0) return [];

    try {
      const moviesPromises = favorites.map(async (id) => {
        const response = await fetch(
          `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${id}`
        );
        if (!response.ok) throw new Error("Failed to fetch movie details");
        return response.json();
      });

      return Promise.all(moviesPromises);
    } catch (error) {
      console.error("Error fetching favorite movies:", error);
      return [];
    }
  }, [favorites]);

  return (
    <FavoritesContext.Provider
      value={{ favorites, isFavorite, toggleFavorite, getFavoriteMovies }}
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
