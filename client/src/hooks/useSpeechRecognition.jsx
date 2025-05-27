import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Enhanced Speech Recognition Hook
 * @param {Object} options - Configuration options
 * @param {Function} options.onResult - Callback when a result is received
 * @param {Function} options.onEnd - Callback when recognition ends
 */
const useSpeechRecognition = ({ onResult, onEnd } = {}) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef(null);
    const onResultRef = useRef(onResult);
    const onEndRef = useRef(onEnd);

    // Update callback refs when callbacks change
    useEffect(() => {
        onResultRef.current = onResult;
    }, [onResult]);

    useEffect(() => {
        onEndRef.current = onEnd;
    }, [onEnd]);

    // Initialize speech recognition once
    useEffect(() => {
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-IN'; // Indian English

            recognitionRef.current.onstart = () => {
                console.log("🎤 Recognition started with Indian English support...");
                setIsListening(true);
            };

            recognitionRef.current.onend = () => {
                console.log("🎤 Recognition stopped.");
                setIsListening(false);

                // Call onEnd callback if it exists
                if (typeof onEndRef.current === 'function') {
                    onEndRef.current();
                }
            };

            recognitionRef.current.onresult = (event) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
                console.log(`🗣️ You said: ${text}`);

                // Safely call the onResult callback if it exists
                if (typeof onResultRef.current === 'function') {
                    onResultRef.current(text);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error(`Speech recognition error: ${event.error}`);
                setIsListening(false);
            };
        } else {
            console.error("❌ Speech recognition not supported in this browser.");
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) {
                    // Ignore errors when stopping already stopped recognition
                }
            }
        };
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
            } catch (error) {
                console.error("❌ Error starting recognition:", error);

                // If we get "already started" error, stop and restart
                if (error.name === 'InvalidStateError') {
                    try {
                        recognitionRef.current.abort();
                        setTimeout(() => {
                            recognitionRef.current.start();
                        }, 100);
                    } catch (e) {
                        console.error('Error during abort/restart:', e);
                    }
                }
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            try {
                recognitionRef.current.stop();
            } catch (error) {
                console.error("❌ Error stopping recognition:", error);
                // Try abort as fallback
                try {
                    recognitionRef.current.abort();
                } catch (e) {
                    // Last resort
                }
                setIsListening(false);
            }
        }
    }, [isListening]);

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        setIsListening,
        recognition: recognitionRef.current
    };
};

export default useSpeechRecognition;