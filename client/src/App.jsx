import React, { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";

// Components
import AnimatedIntro from "./components/AnimatedIntro";
import SimpleBackground from "./components/SimpleBackground";
import Header from "./components/Header";
import ModelSelector from "./components/ModelSelector";
import ChatInterface from "./components/ChatInterface";

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
  const audioRef = useRef(null);

  const {
    isListening,
    startListening,
    recognition
  } = useSpeechRecognition(handleSpeechResult);

  // Hide intro after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
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
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      if (window.AudioContext) {
        const audioCtx = new AudioContext();
        console.log("Audio context initialized:", audioCtx.state);
        if (audioCtx.state === "suspended") {
          audioCtx.resume().then(() => {
            console.log("AudioContext resumed successfully");
          });
        }
      } else {
        console.warn("Web Audio API not supported by this browser");
      }
    } catch (e) {
      console.error("Error initializing audio context:", e);
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
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

  // Function to simulate typing effect
  const simulateTyping = (text) => {
    setIsTyping(true);
    setTypingText("");

    let i = 0;
    const speed = 30; // ms per character

    const typeNextChar = () => {
      if (i < text.length) {
        setTypingText(prev => prev + text.charAt(i));
        i++;
        setTimeout(typeNextChar, speed);
      } else {
        setIsTyping(false);
        // Add fully typed message to chat history
        setChatHistory(prev => [...prev, { text, sender: 'ai' }]);
      }
    };

    // Start typing animation
    typeNextChar();
  };

  // Update the speakText function

  const speakText = async (text, voiceType) => {
    // First stop any ongoing speech
    stopSpeaking();

    try {
      // Request speech synthesis
      console.log("Requesting speech synthesis for voice type:", voiceType);
      const audioBlob = await synthesizeSpeech(text, voiceType);

      // Only proceed if we got a valid blob
      if (!audioBlob) {
        console.log("No audio received, skipping speech");
        return;
      }

      // Create a URL for the blob from Google TTS
      const url = URL.createObjectURL(audioBlob);

      // Set up audio element
      const audio = audioRef.current || document.getElementById('audio');

      if (!audio) {
        console.error("Audio element not found");
        URL.revokeObjectURL(url);
        return;
      }

      // Configure audio element
      audio.oncanplaythrough = () => {
        audio.play().catch(err => console.error("❌ Audio play error:", err));
      };

      audio.onerror = () => {
        console.error("❌ Audio playback error");
        URL.revokeObjectURL(url);
      };

      audio.onended = () => {
        console.log("Audio playback finished");
        URL.revokeObjectURL(url);
      };

      // Start playback
      audio.src = url;
      audio.load();

    } catch (error) {
      console.error("Failed to speak text:", error);
    }
  };

  // Add this helper function for direct browser speech synthesis
  const useBrowserSpeechSync = (text, voiceType) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);

      // Set the voice - try to find an Indian female voice
      const voices = window.speechSynthesis.getVoices();

      let selectedVoice = voices.find(v =>
        v.lang === 'en-IN' && !v.name.toLowerCase().includes('male')
      );

      if (!selectedVoice) {
        selectedVoice = voices.find(v =>
          v.name.includes('Female') || !v.name.includes('Male')
        );
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Adjust pitch and rate based on personality
      if (voiceType.includes('romantic')) {
        utterance.pitch = 1.2;
        utterance.rate = 0.9;
      } else if (voiceType.includes('tech')) {
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
      } else if (voiceType.includes('flirt')) {
        utterance.pitch = 1.3;
        utterance.rate = 1.0;
      } else {
        utterance.pitch = 0.9;
        utterance.rate = 1.1;
      }

      // Speak the text
      window.speechSynthesis.speak(utterance);
    }
  };

  // Handle speech recognition results
  async function handleSpeechResult(transcript) {
    if (!transcript || typeof transcript !== 'string') return;

    // Add user message to chat
    setChatHistory(prev => [...prev, { text: transcript, sender: 'user' }]);

    try {
      if (!activeModel) return;

      // Get personality context
      const personalityPrompt = buildPersonalityPrompt(activeModel);

      // Show "thinking" indicator
      setChatHistory(prev => [...prev, { text: "...", sender: 'ai', thinking: true }]);

      // Send to API with enhanced personality instructions
      const geminiData = await sendMessageToGemini(transcript, personalityPrompt);

      let responseText =
        geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't understand that.";

      // Process response to remove emojis
      responseText = responseText.replace(/[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}|\u{1F900}-\u{1F9FF}|\u{1F1E0}-\u{1F1FF}|\u{1F700}-\u{1F77F}|\u{1F780}-\u{1F7FF}|\u{1F800}-\u{1F8FF}|\u{1F900}-\u{1F9FF}|\u{1FA00}-\u{1FA6F}|\u{1FA70}-\u{1FAFF}]/gu, '');

      // Remove the thinking message
      setChatHistory(prev => prev.filter(msg => !msg.thinking));

      // Start typing animation first
      simulateTyping(responseText);

      // Now speak the text using our improved function that prevents duplicates
      speakText(responseText, activeModel.voiceType);

    } catch (err) {
      console.error("❌ Error in recognition process:", err);
      setChatHistory(prev => prev.filter(msg => !msg.thinking));
      setChatHistory(prev => [...prev, {
        text: "Sorry, I encountered an error processing your message.",
        sender: 'ai'
      }]);
    }
  }

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
    // First stop any ongoing speech
    stopSpeaking();

    setActiveModel(model);
    // Clear chat history when changing models
    setChatHistory([]);

    // Add an introduction message from the AI
    simulateTyping(model.introMessage);

    // Define the voice type based on the model
    let voiceType;
    switch (model.name) {
      case "Romantic":
        voiceType = "romantic";
        break;
      case "Tech Geek":
        voiceType = "techgeek";
        break;
      case "Flirty":
        voiceType = "flirty";
        break;
      case "Rude":
        voiceType = "rude";
        break;
      default:
        voiceType = "romantic";
    }

    // Store the voice type with the model
    model.voiceType = voiceType;

    // Speak the introduction with a delay
    setTimeout(() => {
      speakText(model.introMessage, voiceType);
    }, 500);
  };

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

  return (
    <div className="min-h-screen w-full relative z-10 p-4 flex flex-col overflow-x-hidden"
      style={{
        background: `radial-gradient(circle at 80% 10%, rgba(16,16,48,0.5), transparent 60%), 
                       radial-gradient(circle at 10% 90%, rgba(32,16,32,0.5), transparent 60%)`
      }}>
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
          activeModel={activeModel}
          chatHistory={chatHistory}
          isTyping={isTyping}
          typingText={typingText}
          isListening={isListening}
          onStartListening={startListening}
        />
      )}

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
