import React from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  onSearch: () => void;
}

export function SearchBar({ query, setQuery, onSearch }: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="w-full"
    >
      <div className="relative flex items-center">
        <motion.input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for movies..."
          className="w-full px-4 py-2.5 pl-10 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          whileFocus={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        <motion.div
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          className="absolute left-3"
        >
          <Search className="text-gray-400 dark:text-gray-500" size={20} />
        </motion.div>
        <motion.button
          type="submit"
          className="absolute right-2 px-3 py-1 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Search
        </motion.button>
      </div>
    </motion.form>
  );
}
