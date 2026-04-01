const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const path = require("path");

router.post("/suggest", (req, res) => {
  try {
    const userData = req.body;
    
    // Convert the JS object to a JSON string to pass it as an argument
    const argsString = JSON.stringify(userData);
    
    // Define path to the main.py file
    const scriptPath = path.join(__dirname, "..", "ai", "main.py");
    
    // Spawn python process
    // Use 'python' for Windows. Use 'python3' for Mac/Linux usually if python doesn't resolve to v3.
    const pythonProcess = spawn("python", [scriptPath, argsString]);

    let outputData = "";
    let errorData = "";

    pythonProcess.stdout.on("data", (data) => {
      outputData += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorData += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("Python script error:", errorData);
        return res.status(500).json({ error: "AI suggestion failed due to python error." });
      }
      
      try {
        // Parse the printed JSON from python
        const parsedData = JSON.parse(outputData.trim());
        res.status(200).json(parsedData);
      } catch (parseError) {
        console.error("Error parsing AI JSON output:", parseError, "Raw output:", outputData);
        res.status(500).json({ error: "Invalid AI response format." });
      }
    });

  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Server error generating AI suggestion." });
  }
});

module.exports = router;
