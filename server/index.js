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

    // Define female voices for each personality
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
      rude: {
        name: "en-IN-Neural2-B", // Indian English female (Kavya)
        languageCode: "en-IN",
      },
      default: {
        name: "en-IN-Neural2-A", // Default Indian English female
        languageCode: "en-IN",
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
    else if (voice?.includes("rude") || voice === "en-IN-Neural2-B")
      voiceType = "rude";

    // Get the selected voice configuration
    const selectedVoice = voice || femaleVoices[voiceType].name;
    const selectedLanguageCode =
      languageCode || femaleVoices[voiceType].languageCode;

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
        speakingRate: speakingRate || 1.0,
        pitch: pitch || 0.0,
        effectsProfileId: ["headphone-class-device"], // For better quality
      },
    };

    // Call Google Cloud TTS API
    const [response] = await ttsClient.synthesizeSpeech(ttsRequest);

    // Check if we received audio content
    if (!response.audioContent || response.audioContent.length < 100) {
      throw new Error("Received invalid audio content from Google TTS");
    }

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
