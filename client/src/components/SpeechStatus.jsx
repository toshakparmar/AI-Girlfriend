import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SpeechStatus = ({ isListening, error }) => {
  return (
    <AnimatePresence>
      {isListening && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 px-4 py-2 rounded-full z-50"
        >
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div 
                className="w-3 h-3 bg-red-500 rounded-full absolute top-0 left-0"
                style={{
                  animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
                }}
              ></div>
            </div>
            <span className="text-white text-sm font-medium">Listening</span>
          </div>
        </motion.div>
      )}
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-red-500 bg-opacity-90 px-4 py-2 rounded-full z-50"
        >
          <span className="text-white text-sm">{error}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SpeechStatus;