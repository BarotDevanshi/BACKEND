const Activity = require("../Model/Activity");
const Task = require("../Model/Task");
const Mood = require("../Model/Mood");
const Sleep = require("../Model/Sleep");
const { Groq } = require("groq-sdk");
const { spawn } = require("child_process");
const path = require("path");
const { sendSmartNotification } = require("./notificationController");

function getGroqClient() {
    if (!process.env.GROQ_API_KEY) return null;
    return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

// 💬 CHATBOT (with mood detection and task extraction)
exports.chat = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;
        
        const groq = getGroqClient();

        let response = null;
        let detectedMood = null;

        if (!groq) {
             console.error("[GROQ API ERROR] GROQ_API_KEY not found in env variables.");
             return res.status(500).json({ error: "Groq API key not configured in .env" });
        }

        const msg = message.toLowerCase().trim();

        // 1. Task extraction logic fallback
        if (msg.includes("remind me to") || msg.includes("add task") || msg.includes("i need to")) {
            let taskTitle = message.replace(/(remind me to|add task|i need to)/i, "").trim();
            if (taskTitle) {
                let priority = "medium";
                if (msg.includes("important") || msg.includes("urgent")) priority = "high";

                await Task.create({
                    userId: req.user.id,
                    title: taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1),
                    priority
                });
                response = `Got it! I've added "${taskTitle}" to your Task Dumpyard with ${priority} priority. 📝`;
            }
        }

        // 2. Direct LLM Conversational Pass (if not an explicit task add)
        if (!response) {
            const systemPrompt = `You are a highly empathetic, supportive AI assistant for a productivity and wellness app called NeuroNexus. Your goal is to help users manage their mood, stay productive, and feel mentally supported like a best friend. Keep your replies warm, concise (no long paragraphs), naturally conversational, and use minimal relevant emojis. Don't act robotic. If users are sad, be emotionally supportive. If they are happy, be cheerful.`;
            
            const aiResponse = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                model: "llama-3.3-70b-versatile",
            });
            
            response = aiResponse.choices[0]?.message?.content || "I'm always here for you! 💙";
        }

        // Save mood from chat based on keywords
        if (msg.includes("sad") || msg.includes("crying") || msg.includes("lonely")) detectedMood = "sad";
        else if (msg.includes("happy") || msg.includes("excited")) detectedMood = "happy";
        else if (msg.includes("stress") || msg.includes("anxious") || msg.includes("overwhelmed")) detectedMood = "stressed";
        else if (msg.includes("angry") || msg.includes("mad") || msg.includes("frustrated")) detectedMood = "angry";

        if (detectedMood) {
            await Mood.create({
                userId: req.user.id,
                mood: detectedMood,
                note: "chatbot"
            });
        }

        // Save chat history
        await Activity.create({
            userId,
            type: "chat",
            message,
            response
        });
        console.log(`[DB SUCCESS] Chat stored for userId: ${userId}`);

        res.json({ success: true, response });

    } catch (err) {
        console.error(`[DB ERROR] Error in chatbot storage:`, err.message);
        res.status(500).json({ error: err.message });
    }
};

// 🤖 AI RECOMMENDATION (Smart Machine Learning AI Pipeline)
exports.getRecommendation = async (req, res) => {
    try {
        const userId = req.user.id;

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const mood = await Mood.findOne({ userId, createdAt: { $gte: startOfDay } }).sort({ createdAt: -1 });
        const sleep = await Sleep.findOne({ userId, createdAt: { $gte: startOfDay } }).sort({ createdAt: -1 });
        const tasks = await Task.find({ userId, status: "pending", parentTask: null });

        if (!mood || tasks.length === 0 || !sleep) {
            const defaultSuggestion = "Welcome! 😊 Please add your mood, a pending task, and your sleep first so I can dynamically pull predictive schedules and customized AI insights for you!";
            await Activity.create({
                userId,
                type: "recommendation",
                message: "Awaiting user data for predictions",
                response: defaultSuggestion
            });
            return res.json({ success: true, suggestion: defaultSuggestion, schedule: [] });
        }

        // 1. Prepare Python Payload data
        const pythonPayload = {
            mood: mood.mood.toLowerCase(),
            sleep_hours: sleep.duration,
            sleep_quality: sleep.quality || "average",
            tasks: tasks.map(t => ({ name: t.title, priority: t.priority })),
            current_hour: req.body.localHour !== undefined ? req.body.localHour : new Date().getHours()
        };

        const scriptPath = path.join(__dirname, "..", "ai", "main.py");
        // Windows/Linux compatibility
        const pythonCmd = process.platform === "win32" ? "python" : "python3";
        const pythonProcess = spawn(pythonCmd, [scriptPath, JSON.stringify(pythonPayload)], { cwd: path.join(__dirname, "..", "ai") });

        let outputData = "";
        let errorData = "";

        pythonProcess.stdout.on("data", (data) => outputData += data.toString());
        pythonProcess.stderr.on("data", (data) => errorData += data.toString());

        pythonProcess.on("close", async (code) => {
            if (code !== 0) {
                console.error("Python Machine Learning Pipeline Execution error:", errorData);
                const fallbackMessage = "I am currently analyzing your data, but my predictive core is slightly delayed. Stand strong and try tackling a light task! 🚀";
                return res.json({ success: true, suggestion: fallbackMessage, schedule: [] });
            }
            
            try {
                // `outputData` should be clean JSON parsed from `main.py`
                const parsedData = JSON.parse(outputData.trim());
                const suggestion = parsedData.suggestion || "Have a great day!";
                const schedule = parsedData.schedule || [];

                // Store recommendation
                await Activity.create({
                    userId,
                    type: "recommendation",
                    message: `Predictive execution - Mood: ${pythonPayload.mood}, Sleep: ${pythonPayload.sleep_hours}h`,
                    response: suggestion
                });
                console.log(`[DB SUCCESS] Recommendation successfully stored for userId: ${userId}`);

                // 🔔 Notify user that their schedule is ready
                sendSmartNotification(userId, "schedule_ready").catch(() => {});

                res.json({ success: true, suggestion, schedule });

            } catch (parseError) {
                console.error("Error parsing ML JSON output:", parseError, "Raw output:", outputData);
                res.status(500).json({ error: "Invalid AI response format from backend." });
            }
        });

    } catch (err) {
        console.error(`[DB ERROR] Error executing AI Recommendation sequence:`, err.message);
        res.status(500).json({ error: err.message });
    }
};

// 📥 CHAT HISTORY
exports.getChatHistory = async (req, res) => {
    const data = await Activity.find({
        userId: req.user.id,
        type: "chat"
    }).sort({ createdAt: -1 });

    res.json({ success: true, data });
};

// 📥 RECOMMENDATION HISTORY
exports.getRecommendations = async (req, res) => {
    const data = await Activity.find({
        userId: req.user.id,
        type: "recommendation"
    }).sort({ createdAt: -1 });

    res.json({ success: true, data });
};

// 📜 LOGS (optional)
exports.getLogs = async (req, res) => {
    const data = await Activity.find({
        userId: req.user.id,
        type: "log"
    }).sort({ createdAt: -1 });

    res.json({ success: true, data });
};