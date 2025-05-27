import React from "react";
import { motion } from "framer-motion";

const VoiceControls = ({
    isListening,
    onStartListening,
    activeModel,
    disabled = false,
    microphonePermission = true  // Add new prop to track permission
}) => {
    return (
        <div className="p-4 flex flex-col items-center justify-center border-t border-gray-700/50">
            <button
                className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${disabled || !microphonePermission
                        ? 'bg-gray-600 cursor-not-allowed opacity-50'
                        : isListening
                            ? `bg-red-500`
                            : ``
                    }`}
                onClick={
                    disabled || !microphonePermission
                        ? undefined
                        : onStartListening
                }
                style={{
                    backgroundColor:
                        disabled || !microphonePermission
                            ? '#4a5568'
                            : isListening
                                ? '#f56565'
                                : activeModel.color
                }}
                disabled={disabled || !microphonePermission}
            >
                {isListening ? (
                    <motion.i
                        className="fas fa-microphone text-2xl text-white"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.8, 1]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: "loop"
                        }}
                    />
                ) : (
                    <i className={`fas ${microphonePermission ? 'fa-microphone' : 'fa-microphone-slash'} text-2xl text-white`}></i>
                )}
            </button>

            {isListening ? (
                <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-white"
                >
                    Listening in Indian English...
                </motion.p>
            ) : !microphonePermission && (
                <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-300"
                >
                    Microphone access required
                </motion.p>
            )}
        </div>
    );
};

export default VoiceControls;