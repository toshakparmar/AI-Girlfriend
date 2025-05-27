import React, { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";

// Components
import AnimatedIntro from "./components/AnimatedIntro";
import SimpleBackground from "./components/SimpleBackground";
import Header from "./components/Header";
import ModelSelector from "./components/ModelSelector";
import ChatInterface from "./components/ChatInterface";
import LoadingIndicator from "./components/LoadingIndicator";
import SpeechStatus from "./components/SpeechStatus";
import BrowserSupportNotice from "./components/BrowserSupportNotice";

// Hooks & Utils
import useSpeechRecognition from "./hooks/useSpeechRecognition";
import { aiModels } from "./utils/aiPersonality";
import { sendMessageToGemini, synthesizeSpeech, stopSpeaking, checkApiAvailability } from "./services/apiService";

function App() {
  const [activeModel, setActiveModel] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [showIntro, setShowIntro] = useState(true);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [particlesEnabled, setParticlesEnabled] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const audioRef = useRef(null);
  const [introFinished, setIntroFinished] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);

  // Add a function to handle model ready event and play intro message

  // Add this state to track if intro has been played
  const [hasPlayedIntro, setHasPlayedIntro] = useState({});

  // Function to simulate typing effect - moved up
  const simulateTyping = useCallback((text, syncWithAudio = false, duration = 0) => {
    setIsTyping(true);
    setTypingText("");

    // Calculate typing speed based on model personality and audio duration
    let typingSpeed;

    if (syncWithAudio && duration > 0) {
      // Base speed calculation using audio duration
      const charPerMs = text.length / (duration * 1000 * 0.9); // Complete typing 10% before audio ends
      typingSpeed = 1 / charPerMs; // Ms per character

      // Adjust typing speed based on personality
      if (activeModel.id === 4) { // Angry personality
        // Make angry typing faster and more aggressive - matches her quick speech
        typingSpeed = typingSpeed * 0.7; // 30% faster typing
      } else if (activeModel.id === 2) { // Tech geek
        // Slightly faster, more precise typing
        typingSpeed = typingSpeed * 0.85;
      } else if (activeModel.id === 3) { // Flirty
        // Slightly slower, more playful typing
        typingSpeed = typingSpeed * 1.1;
      }

      // Ensure typing speed stays within reasonable limits
      typingSpeed = Math.max(15, Math.min(70, typingSpeed));
    } else {
      // Default typing speeds based on personality if no audio duration
      if (activeModel.id === 4) { // Angry
        typingSpeed = 20; // Very fast typing (ms per character)
      } else if (activeModel.id === 2) { // Tech geek
        typingSpeed = 30; // Fast typing
      } else if (activeModel.id === 3) { // Flirty
        typingSpeed = 45; // Slower, more deliberate typing
      } else { // Romantic or default
        typingSpeed = 40; // Medium typing speed
      }
    }

    console.log(`Typing speed: ${typingSpeed}ms per char, text length: ${text.length}, audio duration: ${duration}s, personality: ${activeModel.name}`);

    // Create visual cues for angry typing (add occasional quick bursts)
    let angryCues = [];
    if (activeModel.id === 4) {
      // For angry personality, create a map of typing bursts
      // This will make certain sections type very quickly then pause briefly
      const textLength = text.length;
      for (let i = 0; i < textLength; i += Math.floor(Math.random() * 10) + 5) {
        if (Math.random() > 0.7) {
          angryCues.push({
            position: i,
            burstSpeed: typingSpeed * 0.5, // Twice as fast
            duration: Math.floor(Math.random() * 5) + 3 // Burst for 3-8 characters
          });
        }
      }
    }

    // Start typing animation
    let charIndex = 0;
    let currentTypingSpeed = typingSpeed;

    const typingInterval = setInterval(() => {
      // Check if we're in an angry burst section
      if (activeModel.id === 4) {
        const activeBurst = angryCues.find(cue =>
          charIndex >= cue.position && charIndex < cue.position + cue.duration
        );

        if (activeBurst) {
          currentTypingSpeed = activeBurst.burstSpeed;
        } else {
          currentTypingSpeed = typingSpeed;
        }
      }

      // Set the next chunk of text
      setTypingText(text.substring(0, charIndex + 1));
      charIndex++;

      // When typing is complete
      if (charIndex >= text.length) {
        clearInterval(typingInterval);

        // Add a small delay before finalizing the message
        setTimeout(() => {
          setChatHistory(prev => {
            // Check if this exact message already exists
            const messageExists = prev.some(
              msg => msg.role === "assistant" && msg.content === text
            );

            // If it exists, don't add it again
            if (messageExists) {
              return prev;
            }

            return [
              ...prev.filter(msg => !msg.isLoading), // Remove any loading messages
              {
                role: "assistant",
                content: text,
                // Add a flag for angry messages to enable special styling
                isAngry: activeModel.id === 4
              }
            ];
          });

          setTypingText("");
          setIsTyping(false);
          setIsProcessing(false); // Clear processing state
        }, activeModel.id === 4 ? 100 : 300); // Shorter delay for angry model
      }
    }, currentTypingSpeed);

    // Store the interval ID for cleanup
    const intervalId = typingInterval;

    return () => {
      // Cleanup function to clear the interval if needed
      clearInterval(intervalId);
    };
  }, [activeModel, setChatHistory]);

  // The speakText function - moved up
  const speakText = async (text, voiceType) => {
    // First stop any ongoing speech
    stopSpeaking();

    try {
      // Request speech synthesis
      console.log("Requesting speech synthesis for voice type:", voiceType);
      const audioBlob = await synthesizeSpeech(text, voiceType);

      if (!audioBlob) {
        console.log("No audio received, skipping speech");
        return;
      }

      // Create a URL for the blob
      const url = URL.createObjectURL(audioBlob);

      // Set up audio element
      const audio = audioRef.current;
      if (!audio) {
        console.error("Audio element not found");
        URL.revokeObjectURL(url);
        return;
      }

      // Configure audio element
      audio.oncanplaythrough = () => {
        console.log("Audio is ready to play");
      };

      audio.onerror = () => {
        console.error("❌ Audio playback error");
        URL.revokeObjectURL(url);
      };

      audio.onended = () => {
        console.log("Audio playback finished");
        URL.revokeObjectURL(url);
      };

      // Start loading the audio
      audio.src = url;
      audio.load();
      audio.play().catch(err => console.error("❌ Audio play error:", err));

    } catch (error) {
      console.error("Failed to speak text:", error);
    }
  };

  // Handle speech recognition results - updated for Indian English
  const handleSpeechResult = async (transcript) => {
    // Don't process empty transcripts
    if (!transcript || transcript.trim() === "") return;

    // Add user message to chat history
    setChatHistory(prev => [
      ...prev,
      { role: "user", content: transcript }
    ]);

    // Set processing state
    setIsProcessing(true);

    // Use a slight delay to ensure the user message appears first
    setTimeout(async () => {
      try {
        setIsLoading(false); // Don't show the loading indicator for API calls

        // Get AI response based on personality
        const personality = activeModel.personality || "You are a friendly AI assistant.";
        const response = await sendMessageToGemini(transcript, personality);

        // Extract response text
        const responseText = response?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Sorry, I couldn't process that. Could you try again?";

        // Request speech synthesis first to get duration
        console.log("Requesting speech synthesis for voice type:", activeModel.voiceType);
        const audioBlob = await synthesizeSpeech(responseText, activeModel.voiceType);

        if (audioBlob) {
          // Create audio element to get duration
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);

          audio.addEventListener('loadedmetadata', () => {
            const baseDuration = audio.duration;
            let adjustedDuration = baseDuration;

            // For angry model, adjust expected duration because she speaks faster
            if (activeModel.id === 4) {
              // Angry voice has a faster playback rate, adjust duration accordingly
              adjustedDuration = baseDuration * 0.85; // 15% faster for typing
            }

            setAudioDuration(adjustedDuration);
            console.log(`Audio duration: ${baseDuration}s, Adjusted: ${adjustedDuration}s`);

            // Now start typing simulation synced with adjusted audio duration
            simulateTyping(responseText, true, adjustedDuration);

            // Set the audio to the real audio element
            const realAudio = audioRef.current;
            if (realAudio) {
              realAudio.src = audioUrl;

              // For angry model, start playing almost immediately
              const playDelay = activeModel.id === 4 ? 50 : 300;

              setTimeout(() => {
                realAudio.play().catch(err => console.error("❌ Audio play error:", err));
              }, playDelay);
            }
          });

          audio.addEventListener('error', () => {
            // Fallback if audio duration can't be determined
            simulateTyping(responseText, false);
            console.error("Failed to load audio for duration calculation");
          });

          // Start loading to get duration
          audio.load();
        } else {
          // Fallback if speech synthesis fails
          simulateTyping(responseText, false);
        }
      } catch (error) {
        console.error("Failed to get response:", error);

        // Show an error message
        setChatHistory(prev => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I'm having trouble processing that. Could you try again?"
          }
        ]);

        setIsProcessing(false);
      }
    }, activeModel.id === 4 ? 150 : 300); // Shorter delay for angry model
  };

  // Now we can use the handleSpeechResult function
  const {
    isListening,
    transcript,
    startListening: baseStartListening,
    stopListening,
    setIsListening
  } = useSpeechRecognition({
    onResult: handleSpeechResult,
    onEnd: () => {
      console.log("Speech recognition ended");
    }
  });

  // Wrap startListening to handle errors properly
  const startListening = useCallback(() => {
    // If already listening, do nothing
    if (isListening) return;

    // Clear any previous errors
    setSpeechError(null);

    // Stop any ongoing speech first
    stopSpeaking();

    try {
      baseStartListening();
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      setSpeechError("Failed to start speech recognition");
    }
  }, [isListening, baseStartListening]);

  // Hide intro after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
      // Mark the intro as finished after a brief delay to allow for transitions
      setTimeout(() => setIntroFinished(true), 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Initialize audio and voices
  const initializeAudio = () => {
    // Create a silent audio context to initialize audio
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      const audioCtx = new AudioContext();
      console.log("Audio context initialized");
    }

    // Initialize speech synthesis voices for fallback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  };

  // Add to App function - modify to include these properties and functions
  // Initialize web audio context on first interaction
  const setupAudioContext = useCallback(() => {
    try {
      // Initialize audio context
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();

      if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
          console.log("AudioContext resumed successfully");
        });
      }

      // Create a silent audio element to "warm up" the audio system
      const silentAudio = new Audio();
      silentAudio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

      silentAudio.play().catch(e => console.log("Silent audio init:", e));

      console.log("Audio context initialized:", audioCtx.state);

      // Initialize speech synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
      }

      return audioCtx;
    } catch (e) {
      console.error("Error initializing audio context:", e);
      return null;
    }
  }, []);

  // Use effect for audio initialization
  useEffect(() => {
    // Listen for user interaction to initialize audio
    const userInteractionHandler = () => {
      setupAudioContext();
      document.removeEventListener('click', userInteractionHandler);
      document.removeEventListener('touchstart', userInteractionHandler);
    };

    document.addEventListener('click', userInteractionHandler);
    document.addEventListener('touchstart', userInteractionHandler);

    // Get voices for speech synthesis
    if ('speechSynthesis' in window) {
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => {
          const voices = speechSynthesis.getVoices();
          console.log(`Loaded ${voices.length} voices for speech synthesis`);
        };
      }
    }

    return () => {
      document.removeEventListener('click', userInteractionHandler);
      document.removeEventListener('touchstart', userInteractionHandler);
    };
  }, [setupAudioContext]);

  // Build detailed personality prompt
  function buildPersonalityPrompt(model) {
    if (!model) return "";

    return `${model.personality}
    
IMPORTANT INSTRUCTIONS:
1. Respond completely in character as a ${model.name.toLowerCase()} AI girlfriend
2. Use ${model.speechPattern} in your responses
3. DO NOT use emojis
4. Keep responses naturally conversational
5. Show emotions through words, not symbols
6. Maintain your personality consistently`;
  }

  // Select an AI model
  const selectModel = (model) => {
    // Only perform actions if selecting a different model
    if (!activeModel || model.id !== activeModel.id) {
      // Stop any ongoing speech and typing first
      stopSpeaking();

      // If there's an active typing process, cancel it
      if (isTyping) {
        setIsTyping(false);
        setTypingText("");
      }

      // Set processing to false
      setIsProcessing(false);

      // Clear the chat history
      setChatHistory([]);

      // Set the active model AFTER clearing state
      setActiveModel(model);

      // Reset intro message state for this model if it's been over 5 minutes
      // since we last saw this model
      const lastSeen = modelLastSeen.current[model.id] || 0;
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);

      if (lastSeen < fiveMinutesAgo) {
        setHasPlayedIntro(prev => {
          const newState = { ...prev };
          delete newState[model.id];
          return newState;
        });
      }

      // Update last seen time for this model
      modelLastSeen.current = {
        ...modelLastSeen.current,
        [model.id]: Date.now()
      };
    }
  };

  // Add this ref to track when models were last seen
  const modelLastSeen = useRef({});

  // Add this handler for when a model becomes ready
  const handleModelReady = useCallback((model) => {
    // Check if we've already played the intro for this model
    if (hasPlayedIntro[model.id]) {
      return;
    }

    // Mark this model's intro as played
    setHasPlayedIntro(prev => ({
      ...prev,
      [model.id]: true
    }));

    // Get the intro message
    const introMessage = model.introMessage ||
      `Hello, I'm ${model.name}. How can I help you today?`;

    console.log(`Playing intro message for ${model.name}`);

    // Add a small delay before starting the intro
    setTimeout(() => {
      // Set the loading indicator for intro
      setIsProcessing(true);

      // IMPORTANT: Clear any existing chat history first to avoid duplicates
      setChatHistory([]);

      // Synthesize speech for the intro message
      synthesizeSpeech(introMessage, model.voiceType)
        .then(audioBlob => {
          if (audioBlob) {
            // Create audio element to get duration
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            audio.addEventListener('loadedmetadata', () => {
              const baseDuration = audio.duration;
              let adjustedDuration = baseDuration;

              // For angry model, adjust expected duration because she speaks faster
              if (model.id === 4) {
                adjustedDuration = baseDuration * 0.85; // 15% faster for typing
              }

              setAudioDuration(adjustedDuration);
              console.log(`Intro audio duration: ${baseDuration}s, Adjusted: ${adjustedDuration}s`);

              // Start typing simulation synced with adjusted audio duration
              simulateTyping(introMessage, true, adjustedDuration);

              // Play the audio
              const realAudio = audioRef.current;
              if (realAudio) {
                realAudio.src = audioUrl;

                // For angry model, start playing almost immediately
                const playDelay = model.id === 4 ? 50 : 300;

                setTimeout(() => {
                  realAudio.play().catch(err => {
                    console.error("❌ Audio play error:", err);
                    // If audio fails, at least show the message
                    if (!isTyping) {
                      simulateTyping(introMessage, false);
                    }
                  });
                }, playDelay);
              }
            });

            audio.addEventListener('error', () => {
              // Fallback if audio duration can't be determined
              simulateTyping(introMessage, false);
              console.error("Failed to load intro audio for duration calculation");
            });

            // Start loading to get duration
            audio.load();
          } else {
            // Fallback if speech synthesis fails
            simulateTyping(introMessage, false);
          }
        })
        .catch(error => {
          console.error("Failed to synthesize intro speech:", error);
          simulateTyping(introMessage, false);
        });
    }, 500);
  }, [hasPlayedIntro, synthesizeSpeech, simulateTyping, audioRef]);

  const handleParticlesError = useCallback(() => {
    console.error("Failed to load particles, disabling...");
    setParticlesEnabled(false);
  }, []);

  // Add this effect to check API availability
  useEffect(() => {
    const checkApi = async () => {
      try {
        const isAvailable = await checkApiAvailability();
        setApiAvailable(isAvailable);

        if (!isAvailable) {
          console.warn("API is not available. Voice functionality will be limited.");
        }
      } catch (error) {
        console.error("Error checking API:", error);
        setApiAvailable(false);
      }
    };

    checkApi();
  }, []);

  // Show a warning if API is unavailable
  useEffect(() => {
    if (!apiAvailable) {
      alert(
        "Server is not available. Please make sure the server is running at http://localhost:5000 and restart the application."
      );
    }
  }, [apiAvailable]);

  // Add useEffect to check microphone permission
  useEffect(() => {
    // Check if the browser supports the permissions API
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' })
        .then(permissionStatus => {
          setHasMicrophonePermission(permissionStatus.state === 'granted');

          // Listen for changes to permission state
          permissionStatus.onchange = () => {
            setHasMicrophonePermission(permissionStatus.state === 'granted');
          };
        })
        .catch(err => {
          console.log("Error checking microphone permission:", err);
          // Fall back to assuming no permission
          setHasMicrophonePermission(false);
        });
    } else {
      // For browsers that don't support the permissions API
      console.log("Permissions API not supported, assuming no microphone permission");
      setHasMicrophonePermission(false);
    }
  }, []);

  return (
    <div className="min-h-screen w-full relative z-10 p-4 flex flex-col overflow-x-hidden"
      style={{
        background: `radial-gradient(circle at 80% 10%, rgba(16,16,48,0.5), transparent 60%), 
                       radial-gradient(circle at 10% 90%, rgba(32,16,32,0.5), transparent 60%)`
      }}>
      {/* Browser support notice */}
      <BrowserSupportNotice />

      <AnimatePresence>
        {showIntro && <AnimatedIntro />}
      </AnimatePresence>

      {particlesEnabled && (
        <SimpleBackground activeModel={activeModel} />
      )}

      <Header />

      <ModelSelector
        aiModels={aiModels}
        activeModel={activeModel}
        onSelectModel={selectModel}
      />

      {activeModel && (
        <ChatInterface
          key={`chat-interface-${activeModel.id}`} // Add this key to prevent duplicate intros
          activeModel={activeModel}
          chatHistory={chatHistory}
          isTyping={isTyping}
          typingText={typingText}
          isListening={isListening}
          onStartListening={hasMicrophonePermission ? startListening : requestMicrophonePermission}
          isProcessing={isProcessing}
          microphonePermission={hasMicrophonePermission}
          onModelReady={handleModelReady}
        />
      )}

      {/* Speech status indicator */}
      <SpeechStatus
        isListening={isListening}
        error={speechError}
      />

      {/* Loading indicator for audio processing */}
      <AnimatePresence>
        {isLoading && (
          <LoadingIndicator
            isLoading={isLoading}
            color={activeModel?.color || "#FF6B81"}
          />
        )}
      </AnimatePresence>

      {/* Hidden audio element for speech */}
      <audio
        ref={audioRef}
        className="hidden"
        controls={false}
        preload="none"
      />
    </div>
  );
}

export default App;

// ErrorBoundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}
