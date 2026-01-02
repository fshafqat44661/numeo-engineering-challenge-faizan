import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Mic, MicOff, Languages, MessageSquare, Loader2 } from "lucide-react";

// 1. Define missing types for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
    length: number;
  };
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface Translation {
  original: string;
  translated: string;
  timestamp: string;
}

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Translation[]>([]);
  const socketRef = useRef<Socket | null>(null);

  // 2. Properly type the ref instead of 'any'
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:3001");

    socketRef.current.on("translation-results", (data: Translation) => {
      setMessages((prev) => [data, ...prev]);
      setIsProcessing(false);

      const utterance = new SpeechSynthesisUtterance(data.translated);
      utterance.lang = "es-ES";
      window.speechSynthesis.speak(utterance);
    });

    // 3. Cast window to include the possible SpeechRecognition constructors
    const GlobalSpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (GlobalSpeechRecognition) {
      const recognition = new GlobalSpeechRecognition() as SpeechRecognition;
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const results = event.results;
        const transcript = results[results.length - 1][0].transcript;

        if (transcript.trim()) {
          setIsProcessing(true);
          socketRef.current?.emit("transcript-data", transcript);
        }
      };

      recognition.onend = () => {
        if (isRecording) {
          try {
            recognition.start();
          } catch (e) {
            console.error("Recognition restart failed", e);
          }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      socketRef.current?.disconnect();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 font-sans">
      <div className="max-w-xl w-full">
        {/* Header/Control Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 mb-8 text-center">
          <div className="inline-flex bg-indigo-600 p-4 rounded-2xl mb-6 shadow-lg shadow-indigo-200">
            <Languages className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            VocalAI
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Real-time English to Spanish
          </p>

          <div className="mt-10 flex flex-col items-center">
            <button
              onClick={toggleRecording}
              className={`group relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
                isRecording
                  ? "bg-red-500 shadow-red-200 scale-110"
                  : "bg-indigo-600 shadow-indigo-200 hover:scale-105"
              }`}
            >
              {isRecording ? (
                <MicOff className="text-white z-10" size={36} />
              ) : (
                <Mic className="text-white z-10" size={36} />
              )}
              {isRecording && (
                <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20" />
              )}
            </button>
            <p className="mt-6 font-bold text-slate-400 uppercase text-[11px] tracking-[0.3em]">
              {isRecording ? "Listening..." : "Tap to Speak"}
            </p>
          </div>
        </div>

        {/* Translation Stream */}
        <div className="space-y-4">
          {isProcessing && (
            <div className="flex items-center gap-3 text-indigo-600 font-bold px-6 py-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 animate-pulse">
              <Loader2 className="animate-spin" size={18} />
              <span>Gemini is translating...</span>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 transition-all hover:border-indigo-200 group animate-in slide-in-from-bottom-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-slate-400 text-sm mb-2 group-hover:text-indigo-400 transition-colors italic">
                    "{msg.original}"
                  </p>
                  <p className="text-xl font-bold text-slate-800 leading-snug">
                    {msg.translated}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-slate-300">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          {messages.length === 0 && !isProcessing && (
            <div className="text-center py-20 opacity-20">
              <MessageSquare className="mx-auto mb-4" size={48} />
              <p className="font-bold uppercase tracking-widest text-xs">
                Waiting for voice input
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
