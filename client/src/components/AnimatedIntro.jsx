import { motion } from "framer-motion";

const AnimatedIntro = () => {
    return (
        <motion.div
            className="fixed top-0 left-0 w-full h-full bg-[#050510] z-50 flex justify-center items-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
        >
            <div className="text-center p-8">
                <h1 className="text-5xl md:text-6xl lg:text-7xl mb-8 tracking-wide">
                    AI <span className="gradient-text">Girlfriend</span>
                </h1>
                <div className="relative w-[180px] h-[180px] mx-auto mb-8">
                    {/* Neural network animation nodes */}
                    {Array.from({ length: 15 }).map((_, i) => (
                        <div
                            key={`neuron-${i}`}
                            className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-[#FF6B81] to-[#A569BD] animate-neuron-pulse"
                            style={{
                                top: `${20 + Math.random() * 60}%`,
                                left: `${20 + Math.random() * 60}%`,
                                animationDelay: `${Math.random() * 1.5}s`,
                            }}
                        ></div>
                    ))}

                    {/* Connection lines */}
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div
                            key={`synapse-${i}`}
                            className="absolute h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent animate-synapse-flash"
                            style={{
                                width: `${40 + Math.random() * 40}px`,
                                top: `${10 + Math.random() * 80}%`,
                                left: `${10 + Math.random() * 70}%`,
                                transform: `rotate(${Math.random() * 360}deg)`,
                                transformOrigin: "left center",
                                animationDelay: `${Math.random() * 2}s`,
                            }}
                        ></div>
                    ))}
                </div>
                <p className="text-lg">Initializing Neural Network...</p>
            </div>
        </motion.div>
    );
};

export default AnimatedIntro;