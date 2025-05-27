/**
 * Checks if the browser supports all required features
 * @returns {Object} Object containing support status for various features
 */
export function checkBrowserSupport() {
  const support = {
    speechRecognition: false,
    speechSynthesis: false,
    mediaDevices: false,
    audioContext: false,
    supportLevel: "unsupported", // unsupported, partial, full
  };

  if (typeof window !== "undefined") {
    // Speech Recognition
    support.speechRecognition = !!(
      window.SpeechRecognition || window.webkitSpeechRecognition
    );

    // Speech Synthesis
    support.speechSynthesis = "speechSynthesis" in window;

    // Media Devices (for microphone)
    support.mediaDevices = !!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    );

    // Audio Context
    support.audioContext = !!(window.AudioContext || window.webkitAudioContext);

    // Determine overall support level
    const requiredFeatures = [support.speechRecognition, support.mediaDevices];
    const preferredFeatures = [support.speechSynthesis, support.audioContext];

    if (requiredFeatures.every((feature) => feature)) {
      support.supportLevel = preferredFeatures.every((feature) => feature)
        ? "full"
        : "partial";
    }
  }

  return support;
}

/**
 * Gets a browser-specific message about feature support
 */
export function getBrowserSupportMessage() {
  const support = checkBrowserSupport();

  if (support.supportLevel === "unsupported") {
    return {
      type: "error",
      title: "Browser Not Supported",
      message: `Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari for the best experience.`,
    };
  }

  if (support.supportLevel === "partial") {
    return {
      type: "warning",
      title: "Limited Browser Support",
      message: `Some features may not work optimally in your browser. For the best experience, use Chrome or Edge.`,
    };
  }

  return {
    type: "success",
    title: "Browser Supported",
    message: "Your browser supports all required features!",
  };
}
