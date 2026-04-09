import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 bg-red-500/10 border-2 border-red-500/50"
        >
          <span className="text-5xl text-red-400">✕</span>
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>
          התשלום בוטל
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          התשלום בוטל. תוכל לנסות שוב בכל עת.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/#plans" className="neon-btn px-8 py-3 rounded-xl font-bold text-base">
            נסה שוב
          </Link>
          <Link to="/" className="px-8 py-3 rounded-xl font-bold text-base border border-[#2a2a2a] text-white hover:border-[#39FF14] transition-all">
            לדף הבית
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
