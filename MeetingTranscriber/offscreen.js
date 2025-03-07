// Global variables for speech recognition
let transcriptEntries = []; // Array to store { timestamp, text } objects
let isRecognizing = false;
let recognition;

if (!('webkitSpeechRecognition' in window)) {
  console.error("Speech Recognition API is not supported in this browser. Please use Google Chrome.");
} else {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;      // Continue listening until stopped
  recognition.interimResults = true;    // Show interim results
  recognition.lang = "en-US";           // Set language as needed

  recognition.onstart = function() {
    isRecognizing = true;
    console.log("Speech recognition started.");
  };

  recognition.onresult = function(event) {
    let interimTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        // Record current time when a final result is received
        const currentTime = new Date().toLocaleTimeString();
        const finalText = event.results[i][0].transcript.trim();
        if (finalText) {
          transcriptEntries.push({ timestamp: currentTime, text: finalText });
        }
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    updateTranscriptDisplay(interimTranscript);
  };

  recognition.onerror = function(event) {
    console.error("Speech recognition error:", event.error);
    if (event.error === "not-allowed") {
      console.error("Microphone access is denied. Please allow microphone access and try again.");
    }
  };

  recognition.onend = function() {
    isRecognizing = false;
    console.log("Speech recognition ended.");
  };
}

// Function to update the transcript display area and send updates to the popup
function updateTranscriptDisplay(interim) {
  let transcriptText = "";
  transcriptEntries.forEach(entry => {
    transcriptText += `[${entry.timestamp}] ${entry.text}\n`;
  });
  if (interim) {
    transcriptText += "[...] " + interim;
  }
  // Send the updated transcript to the popup via the background
  chrome.runtime.sendMessage({ type: "TRANSCRIPT_UPDATE", transcript: transcriptText });
}

// Listen for commands from the popup (routed through the background)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === "START_TRANSCRIPTION") {
    // Reset previous transcript entries and start recognition
    transcriptEntries = [];
    try {
      recognition.start();
    } catch (error) {
      console.error("Error starting recognition:", error.message);
    }
  } else if (message.command === "STOP_TRANSCRIPTION") {
    if (isRecognizing) {
      recognition.stop();
    }
  } else if (message.command === "DOWNLOAD_TRANSCRIPT") {
    let transcriptText = "";
    transcriptEntries.forEach(entry => {
      transcriptText += `[${entry.timestamp}] ${entry.text}\n`;
    });
    let blob = new Blob([transcriptText], { type: "text/plain" });
    let url = URL.createObjectURL(blob);
    chrome.downloads.download({
      url: url,
      filename: "transcript.txt",
      saveAs: true
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error("Download error:", chrome.runtime.lastError.message);
      } else {
        console.log("Download initiated, id:", downloadId);
      }
    });
  }
});
