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
                "How about some calming acoustic guitar melodies to relax your mind? 🎸"
            ];
            response = songs[Math.floor(Math.random() * songs.length)];
        }
        else if (msg.includes("improve my mood") || msg.includes("feel happy") || msg.includes("refresh my mood")) {
            response = "To improve your mood quickly: stand up, stretch, drink water, and put on your favorite upbeat song! ☀️";
        }
        else if (msg.includes("unmotivated") || msg.includes("procrastination") || msg.includes("lazy")) {
            response = "Motivation often follows action, it doesn't precede it. Use the '5-Second Rule': count 5-4-3-2-1 and just start for 2 minutes! 🚀";
        }
        else if (msg.includes("angry") || msg.includes("calm down")) {
            response = "Take a deep breath. Try the 4-7-8 method: Inhale for 4 seconds, hold for 7, and exhale slowly for 8. You are in control. 🌿";
        }
        else if (msg.includes("reduce anxiety")) {
            response = "Grounding helps: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. 💙";
        }
        else if (msg.includes("track my mood patterns") || msg.includes("mood radar mean")) {
            response = "I track your moods! The mood radar visualizes your emotional trends so you can see what days you feel best. Check the Dashboard! 📊";
        }
        else if (msg.includes("dopamine")) {
            response = "Dopamine is the brain's reward chemical. To increase it naturally: exercise, get morning sunlight, take cold showers, and check off small tasks! Avoid cheap dopamine like doomscrolling. 🧠";
        }
        else if (msg.includes("increase my streak")) {
            response = "Your streak increases every single day you log into NeuroNexus. Consistency is key! 🔥";
        }
        else if (msg.includes("100% completion mean")) {
            response = "It means you are an absolute rockstar and completed all your tasks for the day! 🌟";
        }
        else if (msg.includes("analyze my progress") || msg.includes("insights from my data") || msg.includes("improving or not") || msg.includes("weekly performance")) {
            const todayTasks = await Task.find({ userId, status: "completed" });
            const allMoods = await Mood.find({ userId });
            response = `You've completed ${todayTasks.length} tasks and logged ${allMoods.length} total moods. Every step forward is progress! Keep building that momentum. 📈`;
        }
        else if (msg.includes("tasks faster") || msg.includes("focus") || msg.includes("break my task")) {
            response = "To focus better: Break your task into 3 tiny chunks. Use the Pomodoro Technique (25m work, 5m rest). Put your phone in another room! ⏱️";
        }
        else if (msg.includes("suggest a plan") || msg.includes("routine") || msg.includes("healthy habits") || msg.includes("habits based on my mood")) {
            response = "Daily Routine Recipe: 1. Hydrate first thing. 2. 10 mins of sunlight. 3. Tackle your hardest task first. 4. Wind down without screens an hour before bed. 📝";
        }
        else if (msg.includes("remind me to complete my tasks") || msg.includes("what should i do")) {
            response = "This is your reminder! Head to the Task Dumpyard, pick the easiest task, and just knock it out. 🎯";
        }
        else if (msg.includes("addicted to my phone")) {
            response = "Phones are engineered to be addictive via cheap dopamine. Try turning your screen to grayscale or leaving your phone in another room while working! 📱";
        }
        else if (msg.includes("consistent") || msg.includes("disciplined") || msg.includes("successful")) {
            response = "Discipline is choosing what you want MOST over what you want NOW. Success is just showing up consistently, even on bad days. 💪";
        }
        else if (msg.includes("motivate me") || msg.includes("challenge") || msg.includes("lazy today")) {
            response = "You didn't come this far to only come this far! Your challenge today: Work uninterrupted for 30 minutes straight. You can do it! 🔥";
        }
        else if (msg.includes("personalized advice")) {
            response = "My advice for you: Don't overwhelm yourself. Pick just ONE non-negotiable task today and crush it. Everything else is a bonus! ✨";
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



// 🤖 AI RECOMMENDATION (smart logic)
exports.getRecommendation = async (req, res) => {
    try {
        const userId = req.user.id;

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const mood = await Mood.findOne({ userId, createdAt: { $gte: startOfDay } }).sort({ createdAt: -1 });
        const sleep = await Sleep.findOne({ userId, createdAt: { $gte: startOfDay } }).sort({ createdAt: -1 });

        const tasks = await Task.find({
            userId,
            status: "pending",
            parentTask: null
        });

        let suggestion = "";

        if (!mood || tasks.length === 0 || !sleep) {
            suggestion = "Welcome! 😊 Please add your mood, a task, and your sleep first so I can give you personalized suggestions!";
        } else {
            const m = mood.mood.toLowerCase();
            const s = sleep.duration;
            const highTask = tasks.find(t => t.priority === "high");
            const medTask = tasks.find(t => t.priority === "medium");
            const anyTask = tasks[0];

            let sleepLvl = "";
            let sleepPrefix = "";
            if (s < 5) {
                sleepLvl = "low";
                sleepPrefix = "sleep-deprived";
            } else if (s >= 5 && s <= 7) {
                sleepLvl = "average";
                sleepPrefix = "average sleep";
            } else if (s > 7 && s <= 9) {
                sleepLvl = "good";
                sleepPrefix = "well-rested";
            } else {
                sleepLvl = "overslept";
                sleepPrefix = "overslept";
            }

            const tName = highTask ? `"${highTask.title}"` : (medTask ? `"${medTask.title}"` : (anyTask ? `"${anyTask.title}"` : "your pending tasks"));
            
            const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

            if (m === "happy" || m === "excited") {
                if (sleepLvl === "good") {
                    suggestion = randomPick([
                        `You're beaming with positive energy and you're well-rested! ⚡\nThis is the absolute perfect time to tackle ${tName}. Let's make some huge progress today! 🎯`,
                        `Great mood + great sleep = unstoppable! 🔥\nChannel this fantastic energy directly into ${tName}. You're going to crush it today! 🚀`,
                        `I can feel your great energy! 🌟 Since your sleep was solid, let's ride this wave and knock out ${tName}. You've got this! 💪`
                    ]);
                } else if (sleepLvl === "low") {
                    suggestion = randomPick([
                        `You're feeling really good, but you're running on low sleep ⚡\nTry focusing on ${tName}, but please don't overwork yourself. Try to sleep a bit earlier tonight! 🛌`,
                        `Your mood is amazing, but your battery might quietly drop later due to lack of sleep! 🔋\nTackle ${tName} now while you feel fresh, then take an early break! ✨`
                    ]);
                } else if (sleepLvl === "overslept") {
                    suggestion = randomPick([
                        `You're in a great mood but maybe a bit groggy from oversleeping! 😅\nShake it off, drink some water, and dive straight into ${tName}. Let's get active! 🚀`,
                        `Happy but overslept? Sometimes too much rest makes us lazy. 🛋️\nUse your good mood to break the inertia! Start with just 10 minutes of ${tName}. You got this! 💥`
                    ]);
                } else {
                    suggestion = randomPick([
                        `You're feeling happy with an okay amount of sleep! ⚡\nUse this bright energy to smoothly tackle ${tName}. Keep the momentum going! 🎯`,
                        `Positivity is a superpower! 🦸‍♂️ With decent sleep behind you, it's a great day to knock out ${tName}. Let's make it a productive day! ✨`
                    ]);
                }
            } 
            else if (m === "sad" || m === "lonely") {
                if (sleepLvl === "low") {
                    suggestion = randomPick([
                        `I notice you're feeling down, and you barely slept. That's a tough combination. 💛\nPlease skip the heavy lifting today. Try doing something comforting and take a long nap. You deserve rest. 😌`,
                        `Your system is depleted today, physically and emotionally. 🥺\nI strongly suggest taking a break from heavy tasks like ${tName}. Watch a comforts show, listen to relaxing music, or simply sleep. 🛌`
                    ]);
                } else {
                    suggestion = randomPick([
                        `I'm sorry you're feeling a bit heavy today. 💛\nDon't force yourself too hard. If you feel up to it, try working lightly on ${tName}, or simply take the day to recover and do what makes you smile. 🎵`,
                        `It's completely okay to have down days. 🌧️\nIf ${tName} feels like too much, break it into tiny pieces. Otherwise, just listen to some comforting music and take it easy. I'm rooting for you! 🫂`
                    ]);
                }
            }
            else if (m === "calm" || m === "neutral") {
                if (sleepLvl === "average" || sleepLvl === "good") {
                    suggestion = randomPick([
                        `You're in a perfectly steady, balanced state! 🌿\nIt's a fantastic day for deep focus. Let's peacefully tackle ${tName} and maybe enjoy a cup of tea. 🍵`,
                        `Calm minds get the most done. 🧘‍♂️\nSince you're reasonably rested, you can definitely make steady progress on ${tName} today without feeling overwhelmed. ⚖️`,
                        `Neutral days are the secret engine of productivity! ⚙️\nWith your solid sleep, just sit down, play some focus music, and slowly work through ${tName}. You'll be amazed at what you finish! 🎯`
                    ]);
                } else {
                    suggestion = randomPick([
                        `You're feeling calm, but your lack of sleep might catch up to you. 🌿\nKeep things steady. Try light productivity on ${tName}, but step away if you feel your brain fogging up. ☕`,
                        `A peaceful mind but a tired body. ☁️\nDo what you can with ${tName}, but don't hesitate to take a 20-minute power nap to recharge your battery! 🔋`
                    ]);
                }
            }
            else if (m === "stressed" || m === "angry" || m === "frustrated") {
                if (sleepLvl === "low") {
                    suggestion = randomPick([
                        `You're highly stressed and sleep-deprived. Your brain is running on fumes! 😟\nPlease pause. Step away from ${tName}. Do a 5-minute breathing exercise, drink a glass of water, and seriously prioritize rest today. ✨`,
                        `Lack of sleep heavily amplifies stress! 🚨\nDo not try to force your way through ${tName} right now. Your only priority should be unwinding, drinking water, and getting a good night's sleep. 🌙`
                    ]);
                } else {
                    suggestion = randomPick([
                        `You seem tense right now. 😟\nWhen you're overwhelmed, the best thing is to do less. Focus ONLY on one tiny step of ${tName}. If it's too much, step completely away for 15 minutes. 💙`,
                        `Take a deep breath. 🌬️ Stress makes everything harder.\nHow about trying the Pomodoro method? Just 20 minutes on ${tName}, then a strict 5-minute break. You are in control! 🧘‍♀️`,
                        `I can feel your frustration. 😤 Let's channel that energy!\nSometimes writing out what's bothering you helps. Once you cool down, see if you can lightly begin on ${tName}. No pressure! 🌿`
                    ]);
                }
            } else {
                suggestion = randomPick([
                    `You're doing great! 🌟 With ${sleepPrefix}, let's keep the momentum going on ${tName}.`,
                    `Checking in! You're ${sleepPrefix} today. Let's see if we can make a dent in ${tName}! 🚀`,
                    `Hello! 🤖 Your AI assistant is here. Based on your recent ${sleepPrefix}, I highly recommend taking a look at ${tName} when you're ready! ✨`
                ]);
            }
        }

        // save recommendation
        await Activity.create({
            userId,
            type: "recommendation",
            message: `Mood: ${mood?.mood}, Sleep: ${sleep?.duration}h`,
            response: suggestion
        });
        console.log(`[DB SUCCESS] Recommendation stored for userId: ${userId}`);

        res.json({ success: true, suggestion });

    } catch (err) {
        console.error(`[DB ERROR] Error saving recommendation:`, err.message);
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