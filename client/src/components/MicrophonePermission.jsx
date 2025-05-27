import React, { useState } from 'react';
import { motion } from 'framer-motion';

const MicrophonePermission = ({ onPermissionGranted }) => {
    const [isRequesting, setIsRequesting] = useState(false);

    const requestMicrophoneAccess = () => {
        setIsRequesting(true);

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                // Stop the stream immediately, we just needed the permission
                stream.getTracks().forEach(track => track.stop());
                onPermissionGranted();
            })
            .catch(err => {
                console.error("Error getting microphone permission:", err);
                setIsRequesting(false);
            });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 p-4 rounded-lg shadow-lg z-50"
        >
            <p className="text-white mb-4">To use voice chat, please allow microphone access</p>
            <button
                onClick={requestMicrophoneAccess}
                disabled={isRequesting}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
                {isRequesting ? "Requesting..." : "Allow Microphone"}
            </button>
        </motion.div>
    );
};

export default MicrophonePermission;