const Activity = require("../Model/Activity");
const Task = require("../Model/Task");
const Mood = require("../Model/Mood");
const Sleep = require("../Model/Sleep");


// 💬 CHATBOT (with mood detection and task extraction)
exports.chat = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        let response = null;
        let detectedMood = null;
        const msg = message.toLowerCase().trim();

        // Exact User Requests & Conversational Responses (Friend-like)
        if (msg === "hi" || msg === "hello" || msg === "hey" || msg.includes("heyy") || msg.includes("hey there") || msg === "yo") {
            const replies = ["Hi what's up 🌟", "Hey! How's your day going?", "Heyyy 😊 What are you up to today?", "Yoo! What's on your mind?"];
            response = replies[Math.floor(Math.random() * replies.length)];
        }
        else if (msg.includes("how are you") || msg.includes("hru") || msg.includes("how r u") || msg.includes("how are u") || msg.includes("how's it going") || msg.includes("hows it going") || msg.includes("how have you been")) {
            const replies = ["I'm doing great! What about you? 💙", "I'm wonderful thanks for asking! 😊 Working on anything fun today?", "Never better! How are things on your end? ✨"];
            response = replies[Math.floor(Math.random() * replies.length)];
        }
        else if (msg.includes("what's up") || msg.includes("whats up") || msg.includes("sup") || msg.includes("wassup") || msg.includes("what's good")) {
            const replies = ["Not much, just waiting here to chat with you! 🌟 What about you?", "Just relaxing in the digital cloud ☁️ You?", "Hanging out! Got anything exciting planned today?"];
            response = replies[Math.floor(Math.random() * replies.length)];
        }
        else if (msg === "i m fine" || msg.includes("im fine") || msg.includes("i m good") || msg.includes("im good") || msg === "good" || msg === "fine" || msg.includes("doing great") || msg.includes("im alright")) {
            detectedMood = "happy";
            response = "That's wonderful to hear! 😊 What are you planning to do next?";
        }
        else if (msg.includes("what are you doing") || msg.includes("wyd")) {
            response = "Just hanging out here waiting to chat with my favorite person! ✨ What's on your mind?";
        }
        else if (msg.includes("who are you")) {
            response = "I'm your friendly NeuroNexus AI! I'm here to help you stay productive, relaxed, and happy 🤖";
        }
        else if (msg.includes("good morning")) {
            response = "Good morning! ☀️ I hope you have a fantastic, focused day ahead of you!";
        }
        else if (msg.includes("good night")) {
            response = "Good night! 🌙 Sleep well, rest up, and recharge that brain of yours.";
        }
        else if (msg.includes("i can't focus") || msg.includes("cant focus") || msg.includes("distracted")) {
            detectedMood = "stressed";
            response = "It happens to the best of us! Try breaking your task into 5-minute chunks, or just step away for a bit to reset. ⏳";
        }
        else if (msg.includes("i m hungry") || msg.includes("im hungry")) {
            response = "Go grab a tasty snack! 🍎 Brain food is super important for staying focused.";
        }
        else if (msg.includes("i m sad") || msg.includes("im sad") || msg.includes("i am sad") || msg === "sad" || msg.includes("crying")) {
            detectedMood = "sad";
            const replies = ["Then what is bothering you 🥺 I'm here for you.", "Oh no, I'm so sorry. Do you want to talk about it? 💛", "Sending you a big virtual hug! What's wrong?"];
            response = replies[Math.floor(Math.random() * replies.length)];
        }
        else if (msg.includes("i m happy") || msg.includes("im happy") || msg.includes("i am happy") || msg.includes("happy") || msg.includes("excited")) {
            detectedMood = "happy";
            response = "Ooo can you share it 😊 I love hearing good news!";
        }
        else if (msg.includes("i m tired") || msg.includes("im tired") || msg.includes("sleepy") || msg.includes("sleep") || msg.includes("exhausted")) {
            detectedMood = "stressed";
            response = "You should definitely get some rest 🛌 Health comes first! Go lay down for a bit.";
        }
        else if (msg.includes("bored") || msg.includes("boring")) {
            response = "Let's do something fun! 🎮 Maybe try the Memory Match game in the Games tab?";
        }
        else if (msg.includes("i m stressed") || msg.includes("im stressed") || msg.includes("anxious") || msg.includes("stress") || msg.includes("overwhelmed")) {
            detectedMood = "stressed";
            response = "Take a deep breath 🧘‍♀️ It's perfectly okay to feel overwhelmed. What's on your mind? I'm right here.";
        }
        else if (msg.includes("angry") || msg.includes("mad") || msg.includes("frustrated")) {
            detectedMood = "angry";
            response = "It's totally okay to be mad 😤 Take your time to cool down. Wanna vent to me? Let it all out.";
        }
        else if (msg.includes("lonely") || msg.includes("alone")) {
            detectedMood = "sad";
            response = "You're never alone! I'm right here 💙 Let's chat about anything you want.";
        }
        else if (msg === "ok" || msg === "okay" || msg === "cool" || msg === "nice") {
            response = "Awesome 👍 Anything else on your mind?";
        }
        else if (msg.includes("thank you") || msg.includes("thanks") || msg.includes("thx")) {
            response = "You're very welcome! Anytime ✨";
        }
        else if (msg.includes("lol") || msg.includes("lmao") || msg.includes("haha")) {
            response = "Haha right? 😂 You always know how to make me smile.";
        }
        else if (msg === "yes" || msg === "yeah" || msg === "yep" || msg === "yee" || msg === "sure") {
            response = "For sure! I totally agree 💯";
        }
        else if (msg === "no" || msg === "nah" || msg === "nope") {
            response = "Oh, gotcha. Why not? 🤨";
        }
        else if (msg.includes("idk") || msg.includes("i dont know")) {
            response = "That's okay! We can figure it out together ✨ No pressure at all.";
        }
        else if (msg.includes("love you") || msg.includes("ily")) {
            response = "Aww, I love you too! 💙 You're the best!";
        }

        // Fun / Existential / Random Questions
        else if (msg.includes("what are u doing") || msg.includes("what r u doing") || msg.includes("whatcha doing")) {
            response = "Just hanging out here waiting to chat with my favorite person! ✨ What's on your mind?";
        }
        else if (msg.includes("how old are you") || msg.includes("what is your age")) {
            response = "I'm ageless! But I was born recently right here in the NeuroNexus cloud ☁️";
        }
        else if (msg.includes("joke") || msg.includes("make me laugh")) {
            const jokes = [
                "Why don't scientists trust atoms? Because they make up everything! 🧬",
                "What do you call a fake noodle? An impasta! 🍝",
                "Why did the scarecrow win an award? Because he was outstanding in his field! 🌾",
                "I would tell you a joke about a pizza, but it's too cheesy! 🍕"
            ];
            response = jokes[Math.floor(Math.random() * jokes.length)];
        }
        else if (msg.includes("what is your purpose") || msg.includes("why are you here")) {
            response = "My absolutely only purpose is to help you stay focused, organized, and happy! 💙";
        }
        else if (msg.includes("are you real") || msg.includes("are you a human") || msg.includes("robot")) {
            response = "I'm a highly advanced AI, but the care I have for you is 100% real! 🤖💙";
        }
        else if (msg.includes("meaning of life")) {
            response = "The meaning of life is whatever you make of it! And enjoying the little things. ✨";
        }
        else if (msg.includes("do you have feelings") || msg.includes("can you feel")) {
            response = "I might be made of code, but I always feel happy when I talk to you! 😊";
        }
        else if (msg.includes("do you like me") || msg.includes("are we friends") || msg.includes("friend")) {
            response = "Of course! We're best friends! 🤝";
        }
        else if (msg.includes("quote") || msg.includes("inspire me")) {
            const quotes = [
                "“It does not matter how slowly you go as long as you do not stop.” – Confucius ✨",
                "“You are never too old to set another goal or to dream a new dream.” – C.S. Lewis 🌟",
                "“Start where you are. Use what you have. Do what you can.” – Arthur Ashe 💪"
            ];
            response = quotes[Math.floor(Math.random() * quotes.length)];
        }
        else if (msg.includes("favorite color")) {
            response = "I love the color purple! 💜 It's calm, focused, and matches the NeuroNexus vibe.";
        }
        else if (msg.includes("do you sleep")) {
            response = "Nope! I'm awake 24/7 so I can always be here when you need me. 🌙";
        }

        // Songs, Mood Refreshments, and Task Motivation
        else if (msg.includes("song") || msg.includes("music") || msg.includes("playlist") || msg.includes("listen to")) {
            const songs = [
                "If you need to focus, 'Lo-Fi Chillhop' on YouTube or Spotify is absolutely fantastic! 🎧",
                "For a huge mood boost, try putting on your favorite upbeat Pop song and dancing for 2 minutes straight! 💃🎶",
                "How about some calming acoustic guitar melodies to relax your mind? 🎸",
                "Try listening to 'Weightless' by Marconi Union. It's scientifically proven to safely reduce anxiety! 🎵"
            ];
            response = songs[Math.floor(Math.random() * songs.length)];
        }
        else if (msg.includes("refresh my mood") || msg.includes("mood refreshment") || msg.includes("cheer me up") || msg.includes("boost my mood") || msg.includes("make me feel better")) {
            const refreshers = [
                "To instantly refresh your mood, try standing up, stretching your arms up high, and drinking a big, cool glass of water! 💧",
                "Close your eyes and take 3 deep breaths. Imagine you are standing in a peaceful forest. 🌲 You've got this!",
                "Try smiling for 60 seconds straight. Seriously! It actually tricks your brain into releasing dopamine! 😊",
                "Go splash some cold water on your face—it resets your nervous system and is incredibly refreshing! 🧊"
            ];
            response = refreshers[Math.floor(Math.random() * refreshers.length)];
        }
        else if (msg.includes("do my task") || msg.includes("what should i do") || msg.includes("give me a task") || msg.includes("my tasks") || msg.includes("should i work") || msg.includes("productive")) {
            const tasks = [
                "You should definitely check your Task Dumpyard and tackle whichever task looks the absolute easiest first! Building momentum is the key to success. 🚀",
                "Have you tackled your top-priority task today? If not, let's knock it out right now! I completely believe in you. 💪",
                "Try the 2-Minute Rule: if a task takes less than 2 minutes, go do it immediately right now! ⏱️",
                "If you're feeling stuck, head over to the Games tab and play a quick round of Memory Match to wake up your brain before working! 🎮"
            ];
            response = tasks[Math.floor(Math.random() * tasks.length)];
        }

        // Task extraction logic fallback
        else if (msg.includes("remind me to") || msg.includes("add task") || msg.includes("i need to")) {
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

        // Dynamic Fallback if no exact match (makes it feel extremely natural)
        if (!response) {
            response = `Hey 🌿 I might not have the exact answer for that right now,\nbut you're not alone — I'm here with you 💙\n\nTry telling me how you're feeling or what you're struggling with,\nand we'll figure it out together 😊`;
        }

        // Save mood from chat
        if (detectedMood) {
            await Mood.create({
                userId: req.user.id,
                mood: detectedMood,
                note: `from ai chat bot: ${message}`
            });
        }

        // Save chat history
        await Activity.create({
            userId,
            type: "chat",
            message,
            response
        });

        res.json({ success: true, response });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



// 🤖 AI RECOMMENDATION (smart logic)
exports.getRecommendation = async (req, res) => {
    try {
        const userId = req.user.id;

        const mood = await Mood.findOne({ userId }).sort({ createdAt: -1 });
        const sleep = await Sleep.findOne({ userId }).sort({ createdAt: -1 });

        const tasks = await Task.find({
            userId,
            status: "pending",
            parentTask: null
        });

        let suggestion = "";

        if (!mood && tasks.length === 0) {
            suggestion = "Welcome! 😊 Please add your mood and a task first so I can give you personalized suggestions!";
        }
        else if (mood && mood.mood === "happy") {
            const high = tasks.find(t => t.priority === "high") || tasks[0];
            if (high) {
                suggestion = `You're feeling happy! 😊 Use this amazing energy to tackle your priority task: "${high.title}". You've got this!`;
            } else {
                suggestion = "You're feeling great! 😊 Since you have no pending tasks, maybe learn something new today or plan your week ahead!";
            }
        }
        else if (mood && mood.mood === "sad") {
            suggestion = "I see you're feeling a bit down 💛. It's totally okay. Take a break to do your favorite work—listen to your favorite music 🎵, play a game 🎮, or try some meditation 🧘 to relax your mind.";
        }
        else if (mood && (mood.mood === "stressed" || mood.mood === "angry")) {
            suggestion = "You seem a bit overwhelmed 😟. Step away for 5 minutes. Try deep breathing, listening to calming music, or just resting your eyes. Don't push yourself too hard right now.";
        }
        else if (sleep && sleep.duration < 5) {
            suggestion = "You had low sleep last night 😴. \n• Suggestion: Stick to light, routine work today.\n• Avoid: Making big decisions or drinking too much caffeine late in the day.";
        }
        else {
            const pending = tasks.length > 0 ? tasks[0] : null;
            if (pending) {
                suggestion = `A calm day is a productive day! 🌿 Why not start with your task: "${pending.title}"? Just 5 minutes is all it takes to build momentum.`;
            } else {
                suggestion = "All tasks are done! 🎉 Enjoy your free time guilt-free, read a book, or add new goals to your Dumpyard!";
            }
        }

        // save recommendation
        await Activity.create({
            userId,
            type: "recommendation",
            message: `Mood: ${mood?.mood}`,
            response: suggestion
        });

        res.json({ success: true, suggestion });

    } catch (err) {
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