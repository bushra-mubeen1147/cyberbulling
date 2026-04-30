import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function Spinner() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-12 h-12 text-blue-600" />
      </motion.div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Analyzing text...</p>
    </motion.div>
  );
}
