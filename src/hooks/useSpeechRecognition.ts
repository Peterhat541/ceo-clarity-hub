import { useState, useRef, useCallback } from "react";

interface UseSpeechRecognitionReturn {
  isRecording: boolean;
  isTranscribing: boolean;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => Promise<string | null>;
}

// Extend Window for webkitSpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const resolveRef = useRef<((text: string | null) => void) | null>(null);
  const transcriptRef = useRef("");

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const isSupported = !!SpeechRecognition;

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("Tu navegador no soporta reconocimiento de voz");
      return;
    }
    setError(null);
    transcriptRef.current = "";

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      transcriptRef.current = transcript;
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setError("Permiso de micrófono denegado.");
      } else if (event.error === "no-speech") {
        setError("No se detectó voz.");
      } else {
        setError("Error de reconocimiento de voz.");
      }
      setIsRecording(false);
      if (resolveRef.current) {
        resolveRef.current(null);
        resolveRef.current = null;
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsTranscribing(false);
      if (resolveRef.current) {
        resolveRef.current(transcriptRef.current || null);
        resolveRef.current = null;
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isSupported]);

  const stopListening = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!recognitionRef.current) {
        resolve(null);
        return;
      }
      setIsTranscribing(true);
      resolveRef.current = resolve;
      recognitionRef.current.stop();
    });
  }, []);

  return {
    isRecording,
    isTranscribing,
    isSupported,
    error,
    startListening,
    stopListening,
  };
}
