import { useCallback, useRef, useState } from 'react';

// Web replacement for expo-speech-recognition, backed by the browser's
// SpeechRecognition API (Chrome/Edge/Safari; no Firefox support — feature-
// detected below). Same public hook shape (status/isListening/isSupported/
// errorMessage/start/stop/cancel) as the mobile voiceInputService so callers
// (QuickAddBar) don't need to branch on platform.
const SpeechRecognitionCtor =
  typeof window !== 'undefined' ? window.SpeechRecognition ?? window.webkitSpeechRecognition : null;

export const isVoiceInputSupported = Boolean(SpeechRecognitionCtor);

const UNSUPPORTED_MESSAGE = "Voice input isn't supported in this browser.";

function describeError(code) {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone access was denied. Enable it in your browser settings to use voice input.';
    case 'no-speech':
      return "Didn't catch that — try again.";
    case 'network':
      return 'Voice input needs an internet connection.';
    case 'audio-capture':
      return 'Could not access the microphone.';
    default:
      return 'Voice input failed. Please try again.';
  }
}

export function useVoiceInput({ onFinalResult, locale = 'en-US' } = {}) {
  const [status, setStatus] = useState('idle'); // idle | listening | error
  const [errorMessage, setErrorMessage] = useState(null);
  const recognitionRef = useRef(null);

  const start = useCallback(() => {
    setErrorMessage(null);

    if (!isVoiceInputSupported) {
      setStatus('error');
      setErrorMessage(UNSUPPORTED_MESSAGE);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = locale;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setStatus('listening');
      setErrorMessage(null);
    };
    recognition.onend = () => {
      setStatus((current) => (current === 'error' ? current : 'idle'));
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) onFinalResult?.(transcript.trim());
    };
    recognition.onerror = (event) => {
      if (event.error === 'aborted') {
        setStatus('idle');
        return;
      }
      setStatus('error');
      setErrorMessage(describeError(event.error));
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [locale, onFinalResult]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const cancel = useCallback(() => {
    recognitionRef.current?.abort();
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  return {
    status,
    isListening: status === 'listening',
    isSupported: isVoiceInputSupported,
    errorMessage,
    start,
    stop,
    cancel,
  };
}
