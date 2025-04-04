import { motion } from "framer-motion";

export function LoadingSpinner() {
  // Variants for container animation
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  // Variants for spinner animation
  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  // Variants for the dots that appear around the spinner
  const dotsVariants = {
    initial: { scale: 0 },
    animate: {
      scale: [0, 1, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: 0.2,
        ease: "easeInOut",
        staggerChildren: 0.2,
      },
    },
  };

  const dotVariant = {
    initial: { scale: 0 },
    animate: {
      scale: [0, 1, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      className="flex items-center justify-center w-full py-8"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="relative">
        <motion.svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-600 dark:text-blue-400"
          variants={spinnerVariants}
          animate="animate"
        >
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </motion.svg>

        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          variants={dotsVariants}
          initial="initial"
          animate="animate"
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"
              style={{
                top: `${50 - 16 * Math.sin((i * (2 * Math.PI)) / 3)}%`,
                left: `${50 - 16 * Math.cos((i * (2 * Math.PI)) / 3)}%`,
              }}
              variants={dotVariant}
              custom={i}
            />
          ))}
        </motion.div>
      </div>

      <motion.p
        className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Loading movies...
      </motion.p>
    </motion.div>
  );
}
