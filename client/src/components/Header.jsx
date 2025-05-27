import React from "react";
import { motion } from "framer-motion";

const Header = () => {
    return (
        <div className="text-center mb-8 md:mb-12">
            <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 tracking-wide"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3, duration: 0.8 }}
            >
                AI <span className="gradient-text">Girlfriend</span>
            </motion.h1>
            <motion.p
                className="text-gray-300 text-base md:text-lg tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.2, duration: 0.8 }}
            >
                Choose a personality and start talking
            </motion.p>
        </div>
    );
};

export default Header;