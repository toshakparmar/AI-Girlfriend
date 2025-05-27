import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VoiceControls from "./VoiceControls";

const ChatInterface = ({
    activeModel,
    chatHistory,
    isTyping,
    typingText,
    isListening,
    onStartListening,
    isProcessing = false,
    microphonePermission = true,
    onModelReady = null // Add this prop
}) => {
    const messagesEndRef = useRef(null);
    const [modelReady, setModelReady] = useState(false);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isTyping]);

    // Effect to set model ready after a delay when activeModel changes
    // and display the intro message
    useEffect(() => {
        setModelReady(false);

        // This delay simulates the model "preparing" to talk
        const timer = setTimeout(() => {
            setModelReady(true);

            // When the model becomes ready, notify parent component
            // that it should display the intro message
            if (onModelReady) {
                onModelReady(activeModel);
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [activeModel, onModelReady]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const renderMessage = (message, index) => {
        const isUser = message.role === "user";

        // Special case for loading message
        if (message.isLoading) {
            return (
                <div
                    key={`loading-${index}`}
                    className="flex w-full my-2"
                >
                    <div className="max-w-[85%] bg-gray-700 bg-opacity-40 rounded-lg p-3 text-white">
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2 animate-pulse"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                            <span className="text-sm text-gray-300">Thinking...</span>
                        </div>
                    </div>
                </div>
            );
        }

        // Special styling for angry model messages
        const isAngryModel = activeModel.id === 4 && !isUser;

        // Regular user or assistant message
        return (
            <motion.div
                key={index}
                className={`flex w-full my-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div
                    className={`max-w-[85%] rounded-lg p-3 ${isUser
                        ? 'bg-blue-600 text-white'
                        : isAngryModel
                            ? 'bg-red-800 bg-opacity-40 text-white border-l-2 border-red-600' // Special styling for angry model
                            : 'bg-gray-700 bg-opacity-40 text-white'
                        }`}
                >
                    {isAngryModel ? (
                        // Add special text formatting for angry messages
                        <div className="relative">
                            {message.content}

                            {/* Optional: Add subtle shaking effect to angry messages */}
                            <motion.div
                                className="absolute inset-0 pointer-events-none"
                                animate={{
                                    x: [0, -1, 1, -1, 0],
                                }}
                                transition={{
                                    duration: 0.3,
                                    repeat: 1,
                                    repeatType: "mirror"
                                }}
                            />
                        </div>
                    ) : (
                        message.content
                    )}
                </div>
            </motion.div>
        );
    };

    // Processing indicator component
    const ProcessingIndicator = () => (
        <motion.div
            className="flex items-center justify-center p-3 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="flex items-center space-x-1">
                {activeModel.id === 4 ? (
                    // Angry processing dots - faster and red
                    <>
                        <motion.span
                            className="h-2 w-2 bg-red-400 rounded-full"
                            animate={{
                                scale: [1, 1.4, 1],
                                opacity: [0.7, 1, 0.7]
                            }}
                            transition={{
                                duration: 0.7, // Faster for angry model
                                repeat: Infinity,
                                repeatType: "loop",
                                times: [0, 0.5, 1],
                                delay: 0
                            }}
                        />
                        <motion.span
                            className="h-2 w-2 bg-red-400 rounded-full"
                            animate={{
                                scale: [1, 1.4, 1],
                                opacity: [0.7, 1, 0.7]
                            }}
                            transition={{
                                duration: 0.7,
                                repeat: Infinity,
                                repeatType: "loop",
                                times: [0, 0.5, 1],
                                delay: 0.15 // Faster delay
                            }}
                        />
                        <motion.span
                            className="h-2 w-2 bg-red-400 rounded-full"
                            animate={{
                                scale: [1, 1.4, 1],
                                opacity: [0.7, 1, 0.7]
                            }}
                            transition={{
                                duration: 0.7,
                                repeat: Infinity,
                                repeatType: "loop",
                                times: [0, 0.5, 1],
                                delay: 0.3 // Faster delay
                            }}
                        />
                    </>
                ) : (
                    // Normal processing dots
                    <>
                        <motion.span
                            className="h-2 w-2 bg-gray-400 rounded-full"
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                repeatType: "loop",
                                times: [0, 0.5, 1],
                                delay: 0
                            }}
                        />
                        <motion.span
                            className="h-2 w-2 bg-gray-400 rounded-full"
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                repeatType: "loop",
                                times: [0, 0.5, 1],
                                delay: 0.2
                            }}
                        />
                        <motion.span
                            className="h-2 w-2 bg-gray-400 rounded-full"
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                repeatType: "loop",
                                times: [0, 0.5, 1],
                                delay: 0.4
                            }}
                        />
                    </>
                )}
            </div>
        </motion.div>
    );

    return (
        <motion.div
            className="bg-[rgba(15,15,25,0.8)] backdrop-blur-md rounded-2xl overflow-hidden mt-4 shadow-xl border border-white/10 flex-1 flex flex-col min-h-[500px]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                type: "spring",
                stiffness: 500,
                damping: 30
            }}
        >
            <div
                className="p-5 flex items-center shadow-md relative overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${activeModel.color}, ${activeModel.color}80)`
                }}
            >
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/15 to-transparent pointer-events-none"></div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-4 text-lg text-white bg-black/20 relative z-10">
                    <i className={`fas ${activeModel.id === 1 ? 'fa-heart' :
                        activeModel.id === 2 ? 'fa-laptop-code' :
                            activeModel.id === 3 ? 'fa-kiss-wink-heart' :
                                activeModel.id === 4 ? 'fa-fire' : // Fire icon for angry girlfriend
                                    'fa-comment-slash'
                        }`}></i>

                    {/* Add pulsing effect for angry model */}
                    {activeModel.id === 4 && (
                        <motion.div
                            className="absolute inset-0 rounded-full bg-red-500 z-[-1]"
                            animate={{
                                opacity: [0.2, 0.4, 0.2],
                                scale: [1, 1.05, 1]
                            }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                repeatType: "loop"
                            }}
                        />
                    )}
                </div>
                <div className="relative z-10">
                    <h2 className="text-lg font-semibold m-0">{activeModel.name}</h2>
                    <p className={`text-sm opacity-80 m-0 ${isListening ? 'pl-4 relative' : ''}`}>
                        {isListening && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                        {isListening ? 'Listening...' : isProcessing ? 'Processing...' : modelReady ? 'Online' : 'Initializing...'}
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-2 min-h-[300px]">
                {chatHistory.length === 0 && !modelReady ? (
                    <div className="flex flex-col justify-center items-center h-full text-gray-300 opacity-70 gap-6">
                        <motion.div
                            className="flex items-center gap-1.5 h-[60px]"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="waveform-bar"
                                    style={{
                                        animationDelay: `${i * 0.2}s`,
                                        backgroundColor: activeModel.color,
                                        width: '4px',
                                        height: `${15 + Math.random() * 30}px`,
                                        borderRadius: '2px',
                                        animation: 'waveform 1.2s ease-in-out infinite'
                                    }}
                                ></div>
                            ))}
                        </motion.div>
                        <p>Initializing {activeModel.name}...</p>
                    </div>
                ) : (
                    <>
                        {/* Empty space if no messages yet */}
                        {chatHistory.length === 0 && (
                            <div className="h-full flex-1"></div>
                        )}

                        {/* Chat messages */}
                        {chatHistory.map((msg, index) => (
                            renderMessage(msg, index)
                        ))}

                        {/* Processing animation when needed */}
                        <AnimatePresence>
                            {isProcessing && chatHistory.length > 0 && !isTyping && (
                                <ProcessingIndicator />
                            )}
                        </AnimatePresence>

                        {/* Typing animation with special angry styling */}
                        {isTyping && (
                            <motion.div
                                className={`max-w-[85%] py-3 px-4 rounded-[18px] rounded-bl-[4px] self-start shadow-sm ${activeModel.id === 4 ? 'border-l-2 border-red-600' : ''
                                    }`}
                                style={{
                                    backgroundColor: activeModel.id === 4
                                        ? 'rgba(159, 29, 29, 0.2)' // Darker red background for angry
                                        : `${activeModel.color}20`,
                                    borderLeft: activeModel.id === 4
                                        ? '3px solid #e53e3e' // Red border for angry
                                        : `3px solid ${activeModel.color}`
                                }}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{
                                    opacity: 1,
                                    scale: activeModel.id === 4
                                        ? [1, 1.01, 1] // Subtle pulsing effect for angry typing
                                        : 1
                                }}
                                transition={{
                                    duration: 0.2,
                                    ...(activeModel.id === 4 && {
                                        scale: {
                                            repeat: Infinity,
                                            duration: 0.8,
                                            repeatType: "mirror"
                                        }
                                    })
                                }}
                            >
                                <p className="m-0 leading-normal text-[0.95rem]">
                                    {typingText}
                                    <span
                                        className="typing-cursor"
                                        style={{
                                            display: 'inline-block',
                                            width: '2px',
                                            height: '1rem',
                                            backgroundColor: activeModel.id === 4 ? '#e53e3e' : activeModel.color,
                                            marginLeft: '2px',
                                            animation: activeModel.id === 4
                                                ? 'angryBlink 0.7s infinite' // Faster blinking for angry
                                                : 'blink 1s infinite'
                                        }}
                                    ></span>
                                </p>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            <VoiceControls
                isListening={isListening}
                onStartListening={onStartListening}
                activeModel={activeModel}
                disabled={!modelReady || isProcessing}
                microphonePermission={microphonePermission}
            />
        </motion.div>
    );
};

export default ChatInterface;