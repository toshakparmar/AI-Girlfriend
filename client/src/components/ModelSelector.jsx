import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ModelCard from "./ModelCard";

const ModelSelector = ({ aiModels, activeModel, onSelectModel }) => {
    const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
    const [isFullView, setIsFullView] = useState(true);

    // Update viewport height on resize
    useEffect(() => {
        const handleResize = () => {
            setViewportHeight(window.innerHeight);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Set isFullView to false when a model is selected
    useEffect(() => {
        if (activeModel) {
            setIsFullView(false);
        } else {
            setIsFullView(true);
        }
    }, [activeModel, setIsFullView]); // Added setIsFullView to dependency array

    return (
        <motion.div
            className="w-full transition-all duration-500"
            style={{
                minHeight: isFullView ? `${viewportHeight - 120}px` : 'auto',
                height: isFullView ? '100%' : 'auto'
            }}
            initial={{ opacity: 0 }}
            animate={{
                opacity: 1,
                height: isFullView ? '100%' : 'auto'
            }}
            transition={{
                duration: 0.8,
                delay: isFullView ? 3.4 : 0,
                height: { duration: 0.5 }
            }}
        >
            <h2 className={`text-center mb-6 ${isFullView ? 'text-4xl md:text-5xl animate-float' : 'text-2xl md:text-3xl'}`}>
                Choose Your Ideal <span className="gradient-text">Companion</span>
            </h2>

            <motion.div
                className={`grid gap-4 md:gap-6 w-full ${isFullView
                    ? 'flex-1 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                    }`}
                variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                            staggerChildren: 0.1
                        }
                    }
                }}
                initial="hidden"
                animate="visible"
            >
                {aiModels.map((model, index) => (
                    <ModelCard
                        key={model.id}
                        model={model}
                        isActive={activeModel?.id === model.id}
                        onClick={() => onSelectModel(model)}
                        index={index}
                        isFullView={isFullView}
                    />
                ))}
            </motion.div>
        </motion.div>
    );
};

export default ModelSelector;