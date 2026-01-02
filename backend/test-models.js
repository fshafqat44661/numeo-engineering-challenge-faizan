const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    console.log(
      "Using API Key:",
      process.env.GEMINI_API_KEY
        ? "Found (starts with " +
            process.env.GEMINI_API_KEY.substring(0, 6) +
            "...)"
        : "Not Found"
    );
    // For listing models, we don't use getGenerativeModel, we access the API directly or try a standard model first.
    // The SDK might not expose listModels directly on the main class easily in all versions,
    // but let's try to just run a simple prompt on 'gemini-pro' and 'gemini-1.5-flash' to see which works.

    const modelsToTry = [
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-pro",
      "gemini-1.0-pro",
    ];

    console.log("Testing various model names...");

    for (const modelName of modelsToTry) {
      console.log(`\nTesting model: ${modelName}`);
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        const response = await result.response;
        console.log(
          `✅ Success with ${modelName}! Response: ${response.text()}`
        );
        console.log(`RECOMMENDATION: Change server.js to use '${modelName}'`);
        return; // Exit after finding a working one
      } catch (error) {
        console.log(`❌ Failed with ${modelName}: ${error.message}`);
      }
    }

    console.log(
      "\nAll common model names failed. Investigating specific error details..."
    );
  } catch (error) {
    console.error("Fatal error:", error);
  }
}

listModels();
