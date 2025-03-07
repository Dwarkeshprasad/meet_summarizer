let transcriptEntries = [];
let isRecognizing = false;
let recognition;

if (!('webkitSpeechRecognition' in window)) {
  alert("Speech Recognition API is not supported in this browser. Please use Google Chrome.");
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

function updateTranscriptDisplay(interim) {
  let transcriptText = "";
  transcriptEntries.forEach(entry => {
    transcriptText += `[${entry.timestamp}] ${entry.text}\n`;
  });
  if (interim) {
    transcriptText += "[...] " + interim;
  }
  const transcriptDiv = document.getElementById("transcript");
  transcriptDiv.innerText = transcriptText;
  transcriptDiv.scrollTop = transcriptDiv.scrollHeight;
}

document.getElementById("start").addEventListener("click", async () => {
  try {
    // Request microphone access with a user gesture in this visible window
    await navigator.mediaDevices.getUserMedia({ audio: true });
    transcriptEntries = []; // Reset transcript entries
    recognition.start();
  } catch (err) {
    console.error("Error accessing microphone:", err);
    alert("Microphone access is required. Please allow microphone access and try again.");
  }
});

document.getElementById("stop").addEventListener("click", () => {
  if (isRecognizing) {
    recognition.stop();
  }
});

document.getElementById("download").addEventListener("click", () => {
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
});
