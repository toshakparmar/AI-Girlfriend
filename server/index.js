import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";

// Initialize dotenv and Express
dotenv.config();
const app = express();
app.use(bodyParser.json());

// CORS configuration for client communication
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// Init Google TTS Client
const ttsClient = new TextToSpeechClient({
  keyFilename: "./google-tts-key.json",
});

// Add API health check endpoint
app.get("/api", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

// Gemini API Endpoint
app.post("/api/gemini", async (req, res) => {
  const userText = req.body.text;
  const personality =
    req.body.personality ||
    "You are an AI Girlfriend named Lavya who likes flirting and romance.";

  const systemPrompt = `${personality}
  
IMPORTANT RULES TO FOLLOW:
1. Do NOT use any emojis in your responses
2. Keep responses conversational and natural
3. Stay completely in character at all times
4. Express emotions through words and tone, not symbols
5. Respond directly to the user's message in your chosen personality style`;

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        parts: [{ text: userText }],
      },
    ],
    generation_config: {
      temperature: 0.9,
      max_output_tokens: 800,
    },
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("❌ Gemini API error:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

// Google Cloud TTS Endpoint - For female voices only
app.post("/api/speak", async (req, res) => {
  try {
    const { text, voice, languageCode, speakingRate, pitch } = req.body;

    // Log the incoming request
    console.log("TTS Request received:", {
      voice,
      languageCode,
      textLength: text?.length || 0,
      speakingRate,
      pitch,
    });

    // Update the femaleVoices object
    const femaleVoices = {
      romantic: {
        name: "hi-IN-Neural2-A", // Hindi female (Priya)
        languageCode: "hi-IN",
      },
      techgeek: {
        name: "en-IN-Neural2-A", // Indian English female (Diya)
        languageCode: "en-IN",
      },
      flirty: {
        name: "en-IN-Neural2-D", // Indian English female (Nisha)
        languageCode: "en-IN",
      },
      // Rename "rude" to "angry"
      angry: {
        name: "en-IN-Wavenet-A", // Female voice with better support for emphasis
        languageCode: "en-IN",
      },
      default: {
        name: "en-IN-Neural2-A",
        languageCode: "en-IN",
      },
    };

    // Update voice settings
    const voiceSettings = {
      romantic: {
        speakingRate: 0.92,
        pitch: 2.0,
      },
      techgeek: {
        speakingRate: 1.0,
        pitch: 0.0,
      },
      flirty: {
        speakingRate: 0.95,
        pitch: 4.0,
      },
      // Update voice settings for angry personality
      angry: {
        speakingRate: 1.25, // Faster to sound more aggressive
        pitch: -4.0, // Lower pitch for more forceful tone
        effectsProfileId: ["telephony-class-application"], // Adds a harsher effect
        volumeGainDb: 3.0, // Slightly louder
      },
      default: {
        speakingRate: 1.0,
        pitch: 0.0,
      },
    };

    // Determine which voice to use
    let voiceType = "default";
    if (voice?.includes("romantic") || voice === "hi-IN-Neural2-A")
      voiceType = "romantic";
    else if (voice?.includes("tech") || voice === "en-IN-Neural2-A")
      voiceType = "techgeek";
    else if (voice?.includes("flirt") || voice === "en-IN-Neural2-D")
      voiceType = "flirty";
    else if (
      voice?.includes("angry") ||
      voice?.includes("rude") || // Keep supporting "rude" for backward compatibility
      voice === "en-IN-Wavenet-A" ||
      voice === "en-IN-Wavenet-B" ||
      voice === "en-IN-Standard-B" ||
      voice === "en-IN-Neural2-B"
    )
      voiceType = "angry";

    // Get the selected voice configuration
    const selectedVoice = voice || femaleVoices[voiceType].name;
    const selectedLanguageCode =
      languageCode || femaleVoices[voiceType].languageCode;

    // Ensure pitch is within bounds (-20.0 to 20.0)
    let adjustedPitch = pitch || 0.0;
    if (adjustedPitch < -20.0) adjustedPitch = -20.0;
    if (adjustedPitch > 20.0) adjustedPitch = 20.0;

    console.log(
      `Using Google TTS voice: ${selectedVoice} with language: ${selectedLanguageCode}`
    );

    // Configure the request for Google Cloud Text-to-Speech
    const ttsRequest = {
      input: { text },
      voice: {
        languageCode: selectedLanguageCode,
        name: selectedVoice,
        ssmlGender: "FEMALE", // Always force FEMALE
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: voiceSettings[voiceType].speakingRate || 1.0,
        pitch: voiceSettings[voiceType].pitch || 0.0,
        effectsProfileId: ["headphone-class-device"], // Default for better quality
      },
    };
    // Add volumeGainDb if specified
    if (voiceSettings[voiceType].volumeGainDb) {
      ttsRequest.audioConfig.volumeGainDb =
        voiceSettings[voiceType].volumeGainDb;
    }

    // Add effects profile if specified
    if (voiceSettings[voiceType].effectsProfileId) {
      ttsRequest.audioConfig.effectsProfileId =
        voiceSettings[voiceType].effectsProfileId;
    }

    // Function to enhance text with SSML for the angry voice
    function enhanceWithSSML(text, voiceType) {
      // Only apply SSML to the angry voice
      if (voiceType !== "angry") {
        return text;
      }

      // Add SSML tags to make the angry voice more expressive
      let ssml = "<speak>";

      // Split text into sentences
      const sentences = text.split(/(?<=[.!?])\s+/);

      sentences.forEach((sentence, index) => {
        // Detect if sentence is a question
        const isQuestion = sentence.trim().endsWith("?");

        // Detect if sentence is an exclamation
        const isExclamation = sentence.trim().endsWith("!");

        // Random emphasis patterns for angry voice
        if (isExclamation) {
          // Stronger emphasis for exclamations
          ssml += `<prosody rate="fast" pitch="+2st" volume="loud">${sentence}</prosody> `;
        } else if (isQuestion) {
          // Annoyed questioning tone
          ssml += `<prosody pitch="-1st">${sentence}</prosody> `;
        } else {
          // Random angry emphasis for normal sentences
          const randomEmphasis = Math.floor(Math.random() * 3);

          switch (randomEmphasis) {
            case 0:
              ssml += `<prosody rate="fast">${sentence}</prosody> `;
              break;
            case 1:
              ssml += `<prosody pitch="-2st">${sentence}</prosody> `;
              break;
            default:
              // Sometimes add a frustrated sigh before a sentence
              if (index > 0 && Math.random() > 0.7) {
                ssml += `<break time="300ms"/><say-as interpret-as="interjection">ugh</say-as> <break time="200ms"/> `;
              }
              ssml += `${sentence} `;
          }
        }
      });

      ssml += "</speak>";
      return ssml;
    }

    let inputText = text;

    // For angry voice, enhance with SSML
    if (voiceType === "angry") {
      inputText = enhanceWithSSML(text, voiceType);
      ttsRequest.input = { ssml: inputText };
    } else {
      ttsRequest.input = { text: inputText };
    }

    // Call Google Cloud TTS API
    const [response] = await ttsClient.synthesizeSpeech(ttsRequest);

    // Check if we received audio content
    if (!response.audioContent || response.audioContent.length < 100) {
      console.error("Received invalid audio content from Google TTS");
      throw new Error("Received invalid audio content from Google TTS");
    }

    console.log(
      `Successfully synthesized ${response.audioContent.length} bytes of audio`
    );

    // Return audio as binary response
    res.set("Content-Type", "audio/mpeg");
    res.send(response.audioContent);
  } catch (error) {
    console.error("❌ Google TTS Error:", error);
    res.status(500).send({
      error: "Text-to-speech failed",
      message: error.message,
    });
  }
});

// Voice testing endpoint to check available Google voices
app.get("/api/voices", async (req, res) => {
  try {
    // List available voices from Google Cloud TTS
    const [result] = await ttsClient.listVoices({});
    const voices = result.voices;

    // Filter for Indian female voices
    const indianFemaleVoices = voices.filter(
      (voice) =>
        (voice.languageCodes.includes("en-IN") ||
          voice.languageCodes.includes("hi-IN")) &&
        voice.ssmlGender === "FEMALE"
    );

    res.json({
      allVoices: voices.length,
      indianFemaleVoices: indianFemaleVoices.map((v) => ({
        name: v.name,
        languageCodes: v.languageCodes,
        ssmlGender: v.ssmlGender,
        naturalSampleRateHertz: v.naturalSampleRateHertz,
      })),
    });
  } catch (error) {
    console.error("❌ Error listing voices:", error);
    res.status(500).json({ error: "Failed to list voices" });
  }
});

// Start server
app.listen(5000, () => {
  console.log("🚀 Server running at http://localhost:5000");
});
