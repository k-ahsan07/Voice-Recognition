"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export default function RecordingView() {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingComplete, setRecordingComplete] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [error, setError] = useState<string | null>(null);  // New error state
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Ensure speech recognition is only initialized in the browser
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const results = event.results;
        const latestResult = results[results.length - 1];
        const { transcript } = latestResult[0];
        setTranscript((prev) => `${prev} ${transcript}`);
      };

      recognitionRef.current.onerror = (error: any) => {
        console.error("Speech recognition error:", error);
        setError("An error occurred with speech recognition."); // Set error state
        if (error.error === "not-allowed") {
          alert("Microphone access is denied.");
        } else if (error.error === "no-speech") {
          alert("No speech detected.");
        } else {
          alert("An unknown error occurred.");
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        setRecordingComplete(true);
      };
    } else {
      console.error("webkitSpeechRecognition is not supported in this browser.");
    }
  }, []);

  const startRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
    setIsRecording(true);
    setRecordingComplete(false);
    setError(null); // Clear any previous errors
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setRecordingComplete(true);
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="w-full max-w-xl">
        {error && <div className="text-red-500">{error}</div>} {/* Display error if exists */}

        {/* Display recording status */}
        {isRecording && (
          <div className="w-1/2 m-auto rounded-md border p-4 bg-white">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {recordingComplete ? "Recording Complete" : "Recording..."}
                </p>
                <p className="text-sm">
                  {recordingComplete ? "Thanks for talking!" : "Start speaking now."}
                </p>
              </div>
              <div className="rounded-full w-4 h-4 bg-red-400 animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Display transcript */}
        {transcript && (
          <div className="border rounded-md p-2 mt-4">
            <p className="mb-0">{transcript}</p>
          </div>
        )}

        {/* Button to toggle recording */}
        <div className="flex items-center justify-center mt-4">
          <button
            className={`mt-4 px-4 py-2 rounded-md ${
              isRecording
                ? "bg-red-400 hover:bg-red-500 text-white"
                : "bg-blue-400 hover:bg-blue-500 text-white"
            }`}
            onClick={handleToggleRecording}
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>
        </div>
      </div>
    </div>
  );
}
