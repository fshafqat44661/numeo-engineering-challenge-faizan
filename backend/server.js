const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to try multiple models
async function generateTranslation(text) {
  const models = [
    "gemini-3-flash", // Latest 3rd gen (Preview)
    "gemini-3-pro", // High-reasoning (Preview)
    "gemini-2.5-flash", // Current Standard (GA)
    "gemini-2.5-pro", // Current Standard (GA)
    "gemini-2.5-flash-lite", // Efficient version
    "gemini-2.0-flash", // Previous Standard (Stable)
  ];

  console.log(
    `Attempting translation with ${models.length} candidate models...`
  );

  for (const modelName of models) {
    try {
      // console.log(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = `Translate the following sentence to Spanish. Return ONLY the translated text: "${text}"`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const textResponse = response.text();

      console.log(`✅ Success with model: ${modelName}`);
      return textResponse;
    } catch (error) {
      console.warn(
        `⚠️ Model ${modelName} failed: ${error.message.split("[")[0]}`
      ); // Log brief error
      // Continue to next model
    }
  }
  throw new Error(
    `All ${models.length} models failed to generate content. Please check API Key permissions.`
  );
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("transcript-data", async (text) => {
    try {
      console.log("Translating...", text);
      const translated = await generateTranslation(text);

      socket.emit("translation-results", {
        original: text,
        translated: translated.trim(),
        timeStamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(
        "Translation error details:",
        JSON.stringify(error, null, 2)
      );
      console.error("Translation error message:", error.message);
      socket.emit("translation-error", {
        error: "Translation failed",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
