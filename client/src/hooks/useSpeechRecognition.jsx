import { useState, useEffect, useRef, useCallback } from "react";

const useSpeechRecognition = (onResultCallback) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const callbackRef = useRef(onResultCallback);

    // Update the callback ref when onResultCallback changes
    useEffect(() => {
        callbackRef.current = onResultCallback;
    }, [onResultCallback]);

    // Initialize speech recognition once
    useEffect(() => {
        if (typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onstart = () => {
                console.log("🎤 Recognition started...");
                setIsListening(true);
            };

            recognitionRef.current.onend = () => {
                console.log("🎤 Speech recognition ended");
                setIsListening(false);
            };

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                console.log(`🗣️ You said: ${transcript}`);

                if (callbackRef.current) {
                    callbackRef.current(transcript);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error(`❌ Recognition error: ${event.error}`);
                setIsListening(false);
            };
        } else {
            console.error("❌ Speech recognition not supported in this browser.");
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    // Ignore errors when stopping already stopped recognition
                }
            }
        };
    }, []); // Empty dependency array so this only runs once

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
            } catch (error) {
                console.error("❌ Error starting recognition:", error);
            }
        }
    }, [isListening]);

    return {
        isListening,
        startListening,
        recognition: recognitionRef.current
    };
};

export default useSpeechRecognition;