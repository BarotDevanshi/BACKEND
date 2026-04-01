import os
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def generate_ai_suggestion(user, results):

    task_text = ""
    for r in results:
        task_text += f"{r['task']} → {r['action']} at {r['time']}\n"

    # prompt = f"""
    # User mood: {user['mood']}
    # Sleep hours: {user['sleep_hours']}
    # Sleep quality: {user['sleep_quality']}

    # Tasks:
    # {task_text}

    # Give smart, human-like daily advice.
    # Suggest what to do, how to manage energy, and motivation.
    # """
    prompt = f"""
User mood: {user['mood']}
Sleep hours: {user['sleep_hours']}
Sleep quality: {user['sleep_quality']}

Tasks:
{task_text}

Instructions:
- Give response in SHORT SUMMARY (max 10-12 lines)
- Use friendly, Gen Z tone (simple, relatable, casual)
- Reply in HINGLISH (mix of Hindi + English, written in English letters)
- Sound like a supportive friend (not robotic or formal)

- Focus on:
  1. What to do today
  2. Energy level guidance
  3. Motivation boost

- If no tasks or data → gently tell user to add mood/tasks first in a friendly way

- Keep sentences short
- Avoid long paragraphs
- Avoid formal language
- Use 1-3 emojis max

- Make it feel natural like:
  "aaj thoda chill le", "start small", "zyada pressure mat le", etc.

Start response like:
"Alright 👀 here's your vibe for today:"
"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",  # ✅ WORKING MODEL
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.content