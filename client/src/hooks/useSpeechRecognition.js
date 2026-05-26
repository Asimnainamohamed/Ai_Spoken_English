import { useEffect, useRef, useState } from "react";

function cleanTranscript(value) {
  return value.replace(/\s+/g, " ").trim();
}

function microphoneError(errorCode) {
  const messages = {
    "not-allowed": "Microphone permission is blocked. Allow microphone access for this site and try again.",
    "service-not-allowed": "Speech recognition permission is blocked in this browser.",
    "audio-capture": "No microphone was found. Check your microphone and try again.",
    network: "Speech recognition could not connect. Please try again.",
  };

  return messages[errorCode] || "Voice input stopped unexpectedly. Please try again.";
}

export function useSpeechRecognition({
  language = "en-IN",
  onTranscript,
  onComplete,
  onError,
  holdToSpeak = false,
}) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const callbacksRef = useRef({ onTranscript, onComplete, onError });
  const recognitionRef = useRef(null);
  const heldRef = useRef(false);
  const stoppedByUserRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const displayedTranscriptRef = useRef("");

  callbacksRef.current = { onTranscript, onComplete, onError };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return undefined;
    }

    setSupported(true);
    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = holdToSpeak;
    recognition.maxAlternatives = 1;
    recognition.continuous = holdToSpeak;

    recognition.onresult = (event) => {
      let finalTranscript = finalTranscriptRef.current;
      let interimTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0].transcript;
        if (event.results[index].isFinal) {
          finalTranscript = cleanTranscript(`${finalTranscript} ${transcript}`);
        } else {
          interimTranscript += ` ${transcript}`;
        }
      }

      finalTranscriptRef.current = finalTranscript;
      const displayedTranscript = cleanTranscript(`${finalTranscript} ${interimTranscript}`);
      displayedTranscriptRef.current = displayedTranscript;
      callbacksRef.current.onTranscript?.(displayedTranscript);
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech" && heldRef.current) {
        return;
      }

      heldRef.current = false;
      setListening(false);
      callbacksRef.current.onError?.(
        event.error === "no-speech"
          ? "No speech heard. Hold the Mic button while you speak, then release it."
          : microphoneError(event.error),
      );
    };

    recognition.onend = () => {
      if (holdToSpeak && heldRef.current) {
        try {
          recognition.start();
          return;
        } catch (_error) {
          heldRef.current = false;
        }
      }

      setListening(false);
      const transcript = cleanTranscript(displayedTranscriptRef.current);
      if (transcript) {
        callbacksRef.current.onComplete?.(transcript);
      } else if (holdToSpeak && stoppedByUserRef.current) {
        callbacksRef.current.onError?.(
          "No speech heard. Hold the Mic button while you speak, then release it.",
        );
      }
      stoppedByUserRef.current = false;
    };

    recognitionRef.current = recognition;

    return () => {
      heldRef.current = false;
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [holdToSpeak, language]);

  function startListening() {
    if (!recognitionRef.current || listening) {
      return;
    }

    finalTranscriptRef.current = "";
    displayedTranscriptRef.current = "";
    heldRef.current = holdToSpeak;
    stoppedByUserRef.current = false;
    callbacksRef.current.onTranscript?.("");

    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (_error) {
      callbacksRef.current.onError?.("Microphone is busy. Wait a moment and try again.");
    }
  }

  function stopListening() {
    if (!recognitionRef.current || !listening) {
      return;
    }

    heldRef.current = false;
    stoppedByUserRef.current = true;
    recognitionRef.current.stop();
  }

  return { listening, startListening, stopListening, supported };
}
