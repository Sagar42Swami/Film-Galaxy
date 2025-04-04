import { Film, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export function Navbar({ darkMode, toggleDarkMode }: NavbarProps) {
  // Logo animation
  const logoVariants = {
    initial: { rotate: -10, scale: 0.9 },
    animate: {
      rotate: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10,
      },
    },
    hover: {
      rotate: [0, -10, 0, -5, 0],
      transition: { duration: 0.8 },
    },
  };

  // Text animation
  const textVariants = {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.2,
        duration: 0.5,
      },
    },
  };

  // Tagline animation
  const taglineVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        delay: 0.4,
        duration: 0.5,
      },
    },
  };

  // Theme toggle animation
  const toggleVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.3,
        type: "spring",
        stiffness: 200,
      },
    },
    whileHover: {
      scale: 1.1,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
    whileTap: { scale: 0.9 },
  };

  // Sun/Moon icon animation
  const iconVariants = {
    initial: { rotate: 0 },
    animate: { rotate: 360, transition: { duration: 0.5 } },
  };

  return (
    <motion.nav
      className="bg-white dark:bg-gray-800 shadow-md"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center space-x-3"
            initial="initial"
            animate="animate"
            whileHover="hover"
          >
            <motion.div variants={logoVariants}>
              <Film className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <div>
              <motion.h1
                className="text-xl font-bold text-gray-900 dark:text-white"
                variants={textVariants}
              >
                MovieVerse
              </motion.h1>
              <motion.p
                className="text-sm text-gray-600 dark:text-gray-400"
                variants={taglineVariants}
              >
                Discover. Explore. Watch.
              </motion.p>
            </div>
          </motion.div>

          <motion.button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
            variants={toggleVariants}
            initial="initial"
            animate="animate"
            whileHover="whileHover"
            whileTap="whileTap"
            key={darkMode ? "dark-mode" : "light-mode"}
          >
            {darkMode ? (
              <motion.div
                variants={iconVariants}
                initial="initial"
                animate="animate"
              >
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.div>
            ) : (
              <motion.div
                variants={iconVariants}
                initial="initial"
                animate="animate"
              >
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.div>
            )}
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}
