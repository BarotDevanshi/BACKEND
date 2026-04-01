from ai_suggestion import generate_ai_suggestion

user = {
    "mood": "sad",
    "sleep_hours": 5,
    "sleep_quality": "poor"
}

results = [
    {"task": "Study AI", "action": "delay", "time": "evening"},
    {"task": "Gym", "action": "light", "time": "afternoon"}
]

output = generate_ai_suggestion(user, results)

print("\n AI Suggestion:\n")
print(output)