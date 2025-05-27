import React from "react";
import { motion } from "framer-motion";

const Message = ({ message, activeModel, index }) => {
    const isAI = message.sender === 'ai';

    return (
        <motion.div
            className={`max-w-[85%] py-3 px-4 rounded-[18px] shadow-sm
        ${isAI
                    ? 'self-start rounded-bl-[4px]'
                    : 'self-end rounded-br-[4px] bg-gradient-to-r from-blue-900 to-blue-800'
                }
        ${message.thinking ? 'bg-[rgba(30,30,40,0.6)] px-4 py-4 min-w-[100px]' : ''}
      `}
            style={isAI && !message.thinking ? {
                backgroundColor: `${activeModel.color}20`,
                borderLeft: `3px solid ${activeModel.color}`
            } : {}}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                type: "spring",
                stiffness: 500,
                damping: 40,
                mass: 1,
                delay: index * 0.05,
            }}
        >
            {message.thinking ? (
                <div className="typing-indicator flex justify-center">
                    <span style={{ animationDelay: '0s' }}></span>
                    <span style={{ animationDelay: '0.2s' }}></span>
                    <span style={{ animationDelay: '0.4s' }}></span>
                </div>
            ) : (
                <p className="m-0 leading-normal text-[0.95rem]">{message.text}</p>
            )}
        </motion.div>
    );
};

export default Message;