import React from 'react';
import { motion } from 'framer-motion';

const LoadingIndicator = ({ isLoading, color = "#FF6B81" }) => {
    if (!isLoading) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
        >
            <div className="bg-gray-900 bg-opacity-80 p-6 rounded-xl flex flex-col items-center">
                <motion.div
                    className="p-3 rounded-full mb-4"
                    style={{ background: color }}
                    animate={{
                        scale: [1, 1.2, 1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "loop"
                    }}
                >
                    <div className="w-8 h-8" />
                </motion.div>
                <p className="text-white text-lg">Preparing voice...</p>
            </div>
        </motion.div>
    );
};

export default LoadingIndicator;