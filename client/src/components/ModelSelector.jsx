import React from 'react';
import { motion } from 'framer-motion';

const ModelSelector = ({ aiModels, activeModel, onSelectModel }) => {
    // Personality-specific animations
    const getPersonalityAnimation = (modelId) => {
        switch (modelId) {
            case 1: // Romantic
                return {
                    icon: (
                        <>
                            <i className="fas fa-heart"></i>
                            <motion.div
                                className="absolute inset-0 rounded-full z-[-1]"
                                animate={{
                                    boxShadow: [
                                        '0 0 0 0px rgba(255, 107, 129, 0)',
                                        '0 0 0 8px rgba(255, 107, 129, 0.1)',
                                        '0 0 0 0px rgba(255, 107, 129, 0)'
                                    ]
                                }}
                                transition={{
                                    duration: 2.5,
                                    repeat: Infinity,
                                    repeatType: "loop"
                                }}
                            />
                            <motion.div
                                className="absolute text-xs"
                                style={{
                                    top: '-5px',
                                    right: '-2px',
                                    color: '#FF6B81',
                                    opacity: 0
                                }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    y: [0, -10, -15],
                                    x: [0, 5, 8]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    repeatDelay: 3
                                }}
                            >
                                <i className="fas fa-heart"></i>
                            </motion.div>
                        </>
                    )
                };

            case 2: // Tech Geek
                return {
                    icon: (
                        <>
                            <i className="fas fa-laptop-code"></i>
                            <motion.div
                                className="absolute text-xs"
                                style={{
                                    bottom: '3px',
                                    left: '6px',
                                    color: '#5E81AC',
                                    fontSize: '8px'
                                }}
                                animate={{
                                    opacity: [1, 1, 0, 1, 0, 1, 1],
                                }}
                                transition={{
                                    duration: 0.8,
                                    repeat: Infinity,
                                    repeatType: "loop"
                                }}
                            >
                                <i className="fas fa-code"></i>
                            </motion.div>
                            <motion.div
                                className="absolute text-xs"
                                style={{
                                    top: '4px',
                                    right: '6px',
                                    color: '#5E81AC',
                                    fontSize: '8px'
                                }}
                                animate={{
                                    opacity: [0, 1, 0, 1, 0, 1, 0],
                                }}
                                transition={{
                                    duration: 0.8,
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    delay: 0.4
                                }}
                            >
                                <i className="fas fa-terminal"></i>
                            </motion.div>
                        </>
                    )
                };

            case 3: // Flirty
                return {
                    icon: (
                        <>
                            <i className="fas fa-kiss-wink-heart"></i>
                            <motion.div
                                className="absolute inset-0 rounded-full z-[-1]"
                                animate={{
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{
                                    duration: 1.2,
                                    repeat: Infinity,
                                    repeatType: "loop"
                                }}
                            />
                            <motion.div
                                className="absolute text-sm"
                                style={{
                                    top: '-6px',
                                    right: '-3px',
                                    color: '#B48EAD'
                                }}
                                animate={{
                                    rotate: [0, 15, 0, -15, 0],
                                    opacity: [0, 1, 0]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatType: "loop"
                                }}
                            >
                                <i className="fas fa-sparkles"></i>
                            </motion.div>
                        </>
                    )
                };

            case 4: // Angry
                return {
                    icon: (
                        <>
                            <i className="fas fa-fire"></i>
                            <motion.div
                                className="absolute inset-0 rounded-full z-[-1]"
                                style={{ backgroundColor: '#BF616A' }}
                                animate={{
                                    opacity: [0.1, 0.3, 0.1],
                                    scale: [1, 1.05, 1]
                                }}
                                transition={{
                                    duration: 0.8, // Faster for angry
                                    repeat: Infinity,
                                    repeatType: "loop"
                                }}
                            />
                            <motion.div
                                className="absolute"
                                style={{
                                    bottom: '-4px',
                                    left: '12px',
                                    color: '#BF616A',
                                    fontSize: '8px',
                                    opacity: 0.7
                                }}
                                animate={{
                                    y: [0, -2, -4, -6, -8],
                                    opacity: [0.7, 0.5, 0],
                                    rotate: [-5, 5, -5]
                                }}
                                transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    repeatType: "loop"
                                }}
                            >
                                <i className="fas fa-fire"></i>
                            </motion.div>
                            <motion.div
                                className="absolute"
                                style={{
                                    bottom: '-4px',
                                    right: '10px',
                                    color: '#BF616A',
                                    fontSize: '6px',
                                    opacity: 0.7
                                }}
                                animate={{
                                    y: [0, -3, -6, -9, -12],
                                    opacity: [0.7, 0.5, 0],
                                    rotate: [5, -5, 5]
                                }}
                                transition={{
                                    duration: 0.8,
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    delay: 0.3
                                }}
                            >
                                <i className="fas fa-fire"></i>
                            </motion.div>
                        </>
                    )
                };

            default:
                return {
                    icon: <i className="fas fa-comment-slash"></i>
                };
        }
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {aiModels.map((model) => {
                const personalityAnimation = getPersonalityAnimation(model.id);

                return (
                    <motion.div
                        key={model.id}
                        className={`relative rounded-xl p-6 cursor-pointer transition-all duration-300 ${activeModel && activeModel.id === model.id
                            ? 'border-2 shadow-xl scale-[1.02]'
                            : 'border'
                            }`}
                        style={{
                            backgroundColor: `${model.color}15`,
                            borderColor: activeModel && activeModel.id === model.id ? model.color : 'transparent',
                            minHeight: '180px', // Slightly increased for animations
                            overflow: 'hidden'
                        }}
                        whileHover={{
                            scale: 1.03,
                            borderColor: model.color,
                            boxShadow: `0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px ${model.color}30`
                        }}
                        onClick={() => onSelectModel(model)}
                    >
                        {/* Background effect based on personality */}
                        {model.id === 1 && (
                            <motion.div
                                className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5"
                                style={{ background: `radial-gradient(circle, ${model.color}, transparent)` }}
                                animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.05, 0.03] }}
                                transition={{ duration: 4, repeat: Infinity }}
                            />
                        )}
                        {model.id === 2 && (
                            <motion.div
                                className="absolute bottom-5 right-5 opacity-10 text-xs"
                                style={{ color: model.color }}
                                animate={{ opacity: [0.05, 0.1, 0.05] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className="font-mono" style={{ marginLeft: i * 8 }}>
                                        {i % 2 === 0 ? '01' : '10'}
                                    </div>
                                ))}
                            </motion.div>
                        )}
                        {model.id === 3 && (
                            <motion.div
                                className="absolute bottom-0 right-0 w-32 h-32 opacity-5"
                                style={{
                                    background: `radial-gradient(circle at 70% 70%, ${model.color}, transparent)`
                                }}
                                animate={{
                                    rotate: [0, 360],
                                    opacity: [0.03, 0.05, 0.03]
                                }}
                                transition={{
                                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                                    opacity: { duration: 2, repeat: Infinity }
                                }}
                            />
                        )}
                        {model.id === 4 && (
                            <motion.div
                                className="absolute inset-0 opacity-10"
                                style={{
                                    background: `linear-gradient(45deg, transparent 65%, ${model.color}40 100%)`
                                }}
                                animate={{
                                    opacity: [0.05, 0.15, 0.05]
                                }}
                                transition={{
                                    duration: 1.8,
                                    repeat: Infinity
                                }}
                            />
                        )}

                        <div className="flex items-center relative z-10">
                            <div
                                className="w-14 h-14 rounded-full flex items-center justify-center mr-4 text-xl relative"
                                style={{
                                    backgroundColor: `${model.color}30`,
                                    color: model.color
                                }}
                            >
                                {personalityAnimation.icon}
                            </div>
                            <div>
                                <h3 className="font-medium text-lg">{model.name}</h3>
                                <p className="text-sm text-gray-400 mt-1">{model.description.split('.')[0]}</p>
                            </div>
                        </div>

                        {/* Personality trait tags */}
                        <div className="mt-4 flex flex-wrap gap-1">
                            {model.id === 1 && (
                                <>
                                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${model.color}20`, color: model.color }}>
                                        Sweet
                                    </span>
                                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${model.color}20`, color: model.color }}>
                                        Caring
                                    </span>
                                </>
                            )}
                            {model.id === 2 && (
                                <>
                                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${model.color}20`, color: model.color }}>
                                        Tech Savvy
                                    </span>
                                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${model.color}20`, color: model.color }}>
                                        Intelligent
                                    </span>
                                </>
                            )}
                            {model.id === 3 && (
                                <>
                                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${model.color}20`, color: model.color }}>
                                        Flirty
                                    </span>
                                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${model.color}20`, color: model.color }}>
                                        Playful
                                    </span>
                                </>
                            )}
                            {model.id === 4 && (
                                <>
                                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${model.color}20`, color: model.color }}>
                                        Fierce
                                    </span>
                                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${model.color}20`, color: model.color }}>
                                        Passionate
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Active indicator */}
                        {activeModel && activeModel.id === model.id && (
                            <div
                                className="absolute top-3 right-3 w-3 h-3 rounded-full"
                                style={{ backgroundColor: model.color }}
                            ></div>
                        )}

                        {/* Call-to-action button */}
                        {(!activeModel || activeModel.id !== model.id) && (
                            <div className="absolute bottom-4 right-4 opacity-70 hover:opacity-100">
                                <span className="text-xs" style={{ color: model.color }}>Select</span>
                            </div>
                        )}
                    </motion.div>
                )
            })}
        </div>
    );
};

export default ModelSelector;