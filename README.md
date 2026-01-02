VocalAI - Real-time AI Voice Translator

VocalAI is a full-stack application that captures user voice input, transcribes it locally using the Web Speech API, and translates it in real-time using Google’s Gemini 1.5 Flash AI via a WebSocket connection.

This project was built as part of a Full-stack Engineering Challenge.

🚀 Features

Real-time Transcription: Uses the browser's native SpeechRecognition to convert voice to text instantly.

AI-Powered Translation: Integrates Google Gemini 1.5 Flash for high-speed, accurate translations.

Bi-directional Communication: Leverages Socket.io for low-latency, real-time data streaming.

Responsive UI: A clean, modern interface built with React and Tailwind CSS.

Type Safety: Fully typed with TypeScript to ensure robust data handling between client and server.

🛠 Tech Stack
Frontend

React (Vite)

TypeScript

Tailwind CSS (Styling)

Socket.io-client (Real-time communication)

Lucide React (Iconography)

Backend

Node.js & Express

Socket.io (WebSocket Server)

@google/generative-ai (Gemini AI SDK)

⚙️ Setup & Installation
Prerequisites

A Google AI Studio API Key (Get one for free at aistudio.google.com)

Node.js installed (v18+)

1. Backend Setup

Navigate to the backend directory:

code
Bash
download
content_copy
expand_less
cd backend

Install dependencies:

code
Bash
download
content_copy
expand_less
npm install

Create a .env file in the backend folder:

code
Env
download
content_copy
expand_less
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001

Start the server:

code
Bash
download
content_copy
expand_less
node server.js
2. Frontend Setup

Navigate to the frontend directory:

code
Bash
download
content_copy
expand_less
cd frontend

Install dependencies:

code
Bash
download
content_copy
expand_less
npm install

Start the development server:

code
Bash
download
content_copy
expand_less
npm run dev

Open http://localhost:5173 in your browser.

🧠 Engineering Decisions & Trade-offs
1. Web Speech API vs. Raw Audio Streaming

Decision: I chose to use the browser’s native Web Speech API for transcription rather than streaming raw audio chunks (PCM/WebM) to the backend.

Pros: It handles Voice Activity Detection (VAD) and sentence segmentation locally. This significantly reduces server-side CPU load and bandwidth usage.

Trade-off: Browser support for the Web Speech API is strongest in Chrome and Safari. For a production cross-browser app, I would consider a service like OpenAI Whisper or Deepgram.

2. Socket.io for Real-time Communication

Decision: Used Socket.io instead of standard HTTP Polling or raw WebSockets.

Pros: It provides out-of-the-box support for auto-reconnection, heartbeats, and binary fallback, ensuring a stable connection during voice sessions.

3. Gemini 1.5 Flash

Decision: Selected gemini-1.5-flash over gpt-4.

Pros: It is specifically optimized for high-speed, low-latency tasks. In a translation app, the speed of the "return trip" is more critical for UX than the deep reasoning capabilities of a larger model.

4. Custom TypeScript Interfaces

Decision: Manually defined interfaces for the Web Speech API (SpeechRecognition).

Reason: The Web Speech API is not yet fully included in the standard TypeScript lib.dom.d.ts. By defining custom interfaces, I eliminated any types and ensured strict type checking for the speech event results.

📈 Future Improvements

Language Selection: Add a dropdown to allow users to translate into languages other than Spanish.

Text-to-Speech (TTS): Integrate a "Speak" button to play back the translated text.

Persistence: Use a database (e.g., MongoDB or PostgreSQL) to save translation history for users.

Audio Visualizer: Add a Canvas-based frequency visualizer to give better feedback during active recording.

📝 Rules & Guidelines Followed

Continuous screen recording provided.

Built from scratch during the challenge.

Focused on frontend engineering and real-time state management.
