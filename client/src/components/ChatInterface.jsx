import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Message from "./Message";
import VoiceControls from "./VoiceControls";

const ChatInterface = ({
    activeModel,
    chatHistory,
    isTyping,
    typingText,
    isListening,
    onStartListening
}) => {
    const messagesEndRef = useRef(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isTyping]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

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
                                    'fa-comment-slash'
                        }`}></i>
                </div>
                <div className="relative z-10">
                    <h2 className="text-lg font-semibold m-0">{activeModel.name}</h2>
                    <p className={`text-sm opacity-80 m-0 ${isListening ? 'pl-4 relative' : ''}`}>
                        {isListening && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                        {isListening ? 'Listening...' : 'Online'}
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-2 min-h-[300px]">
                {chatHistory.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-full text-gray-300 opacity-70 gap-6">
                        <div className="flex items-center gap-1.5 h-[60px]">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="waveform-bar"
                                    style={{ animationDelay: `${i * 0.2}s` }}
                                ></div>
                            ))}
                        </div>
                        <p>Start talking to {activeModel.name}</p>
                    </div>
                ) : (
                    <>
                        {chatHistory.map((msg, index) => (
                            <Message
                                key={index}
                                message={msg}
                                activeModel={activeModel}
                                index={index}
                            />
                        ))}
                        {isTyping && (
                            <motion.div
                                className="max-w-[85%] py-3 px-4 rounded-[18px] rounded-bl-[4px] self-start shadow-sm"
                                style={{
                                    backgroundColor: `${activeModel.color}20`,
                                    borderLeft: `3px solid ${activeModel.color}`
                                }}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <p className="m-0 leading-normal text-[0.95rem]">
                                    {typingText}<span className="typing-cursor"></span>
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
            />
        </motion.div>
    );
};

export default ChatInterface;