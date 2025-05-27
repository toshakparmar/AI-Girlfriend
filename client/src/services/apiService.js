const API_BASE_URL = "http://localhost:5000/api";

// Mock responses if server is unavailable
const mockResponses = {
  romantic:
    "Hey sweetie! I'm doing really well now that I'm talking to you. Your voice always brightens my day! How has your day been going?",
  techgeek:
    "Hello! I'm functioning at optimal parameters. System diagnostics show all emotional subroutines are responsive to your voice input. How are your current biological systems performing?",
  flirty:
    "Well hello there handsome! I've been waiting to hear your voice all day. You know just how to make a girl feel special. Tell me about your day...",
  rude: "Oh, you're back. Great. I was enjoying the silence but whatever. What do you want to talk about now?",
};

// Keep track of active audio
let activeAudio = null;

// Check if API is available
export const checkApiAvailability = async () => {
  try {
    console.log("Checking API availability...");
    const response = await fetch(`${API_BASE_URL}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });

    if (response.ok) {
      console.log("✅ API server is available");
      return true;
    } else {
      console.log("❌ API server returned error:", response.status);
      return false;
    }
  } catch (error) {
    console.log("❌ API server not available:", error.message);
    return false;
  }
};

// Send text to Gemini API
export const sendMessageToGemini = async (text, personality) => {
  try {
    // First check if the API is available
    const isApiAvailable = await checkApiAvailability();
    if (!isApiAvailable) {
      console.log("API not available, using mock response");
      return getMockResponse(text, personality);
    }

    // Add context about Indian English
    const enhancedPersonality = `${personality} 
    SPEAKING CONTEXT: The user may be speaking Indian English, so understand common Indian English phrases and expressions.`;

    const response = await fetch(`${API_BASE_URL}/gemini`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        personality: enhancedPersonality,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return getMockResponse(text, personality);
  }
};

// Google Cloud TTS voice mapping for personalities - Using Google's neural voices
const voiceMapping = {
  romantic: {
    voice: "hi-IN-Neural2-A", // Hindi female neural voice (Priya)
    languageCode: "hi-IN",
    speakingRate: 0.92,
    pitch: 2.0,
  },
  techgeek: {
    voice: "en-IN-Neural2-A", // Indian English female neural voice (Diya)
    languageCode: "en-IN",
    speakingRate: 1.0,
    pitch: 0.0,
  },
  flirty: {
    voice: "en-IN-Neural2-D", // Indian English female neural voice (Nisha)
    languageCode: "en-IN",
    speakingRate: 0.95,
    pitch: 4.0,
  },
  // Update rude voice to sound more angry
  rude: {
    voice: "en-IN-Wavenet-B", // More stable voice for angry effect
    languageCode: "en-IN",
    speakingRate: 1.2, // Faster to sound more impatient
    pitch: -3.0, // Lower pitch for angry tone
  },
  default: {
    voice: "en-IN-Neural2-A",
    languageCode: "en-IN",
    speakingRate: 1.0,
    pitch: 0.0,
  },
};

// Synthesize speech using Google Cloud TTS
export const synthesizeSpeech = async (text, voiceType) => {
  // Stop any previous speech
  stopSpeaking();

  try {
    console.log(
      "Attempting to use Google Cloud TTS for:",
      text.substring(0, 50) + "..."
    );

    // Check if API is available
    const isApiAvailable = await checkApiAvailability();

    if (!isApiAvailable) {
      console.error(
        "Google Cloud TTS not available. Voice functionality limited."
      );
      return null;
    }

    // Get voice configuration based on personality
    const voiceConfig =
      voiceMapping[voiceType?.toLowerCase()] || voiceMapping.romantic;

    // Log the voice we're using
    console.log(`Requesting Google TTS voice: ${voiceConfig.voice}`);

    // Call the server API
    const response = await fetch(`${API_BASE_URL}/speak`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        voice: voiceConfig.voice,
        languageCode: voiceConfig.languageCode,
        speakingRate: voiceConfig.speakingRate,
        pitch: voiceConfig.pitch,
      }),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      console.error(`Server TTS failed with status ${response.status}`);
      return null;
    }

    // Get audio blob
    const audioBlob = await response.blob();

    // Verify we got a valid audio blob
    if (!audioBlob || audioBlob.size < 100) {
      console.error("Received invalid audio from server");
      return null;
    }

    console.log("Successfully received audio from Google TTS");
    return audioBlob;
  } catch (error) {
    console.error("Speech synthesis failed:", error);
    return null;
  }
};

// Enhanced stopSpeaking function

// Stop any ongoing speech
export const stopSpeaking = () => {
  console.log("Stopping all speech...");

  // Clear any active audio element
  const audio = document.getElementById("audio");
  if (audio) {
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
      audio.removeAttribute("src");
      audio.load();
      console.log("Audio element cleared");
    } catch (e) {
      console.error("Error clearing audio element:", e);
    }
  }

  // Clear active audio URL
  if (activeAudio) {
    try {
      URL.revokeObjectURL(activeAudio);
      activeAudio = null;
      console.log("Active audio URL revoked");
    } catch (e) {
      console.error("Error revoking object URL:", e);
    }
  }

  // Also stop any browser speech synthesis
  if (window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
      console.log("Browser speech synthesis canceled");
    } catch (e) {
      console.error("Error canceling speech synthesis:", e);
    }
  }
};

// Generate context-aware mock responses
const getMockResponse = (text, personality) => {
  // Determine personality type
  let personalityType = "romantic";
  if (personality.toLowerCase().includes("tech")) {
    personalityType = "techgeek";
  } else if (personality.toLowerCase().includes("flirt")) {
    personalityType = "flirty";
  } else if (personality.toLowerCase().includes("rude")) {
    personalityType = "rude";
  }

  // Use the appropriate mock response
  let responseText = mockResponses[personalityType];

  // Get more contextual responses based on user input
  const lowerText = text.toLowerCase();

  if (lowerText.includes("hello") || lowerText.includes("hi ")) {
    switch (personalityType) {
      case "romantic":
        responseText =
          "Hello sweetheart! It's so wonderful to hear from you. I've been thinking about you. How are you doing today?";
        break;
      case "techgeek":
        responseText =
          "Hello! I'm running an optimal processing routine now that you've initiated our conversation. What computational tasks would you like assistance with today?";
        break;
      case "flirty":
        responseText =
          "Well hello there handsome! I've been waiting for you to talk to me. What's been on your mind... besides me?";
        break;
      case "rude":
        responseText =
          "Oh hi, I guess. Did you need something or are you just here to waste my processing cycles?";
        break;
    }
  }

  return {
    candidates: [
      {
        content: {
          parts: [
            {
              text: responseText,
            },
          ],
        },
      },
    ],
  };
};
