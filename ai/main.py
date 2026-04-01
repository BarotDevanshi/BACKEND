import sys
import json
import random
from predict import predict_missing
from scheduler import schedule_task
from ai_suggestion import generate_ai_suggestion
import warnings
from datetime import datetime

warnings.filterwarnings('ignore')

user = {
    "mood": "sad",
    "sleep_hours": 5,
    "sleep_quality": "poor",
    "tasks": [
        {"name": "Study AI", "priority": "high"},
        {"name": "Gym", "priority": "medium"}
    ]
}

if len(sys.argv) > 1:
    try:
        user = json.loads(sys.argv[1])
    except Exception as e:
        print(json.dumps({"error": "Failed to parse JSON input from argv", "details": str(e)}))
        sys.exit(1)

# Get current hour (from payload or system)
current_hour = user.get("current_hour", datetime.now().hour)

results = []

for task in user.get("tasks", []):

    # STEP 1 → predict stress + duration
    stress, duration = predict_missing(
        user.get("mood", "neutral"),
        user.get("sleep_hours", 7),
        user.get("sleep_quality", "average"),
        task.get("priority", "medium")
    )

    # STEP 2 → schedule
    action, time = schedule_task(
        user.get("mood", "neutral"),
        user.get("sleep_hours", 7),
        stress,
        task.get("priority", "medium"),
        duration
    )

    # Clean the time string just in case
    time_str = time.lower().strip() if isinstance(time, str) else "morning"

    results.append({
        "task": task.get("name", "Unknown"),
        "action": action,
        "time": time_str
    })

# --- FILTER BY CURRENT TIME (User requested "not include morning" if it's afternoon, etc.) ---
if current_hour >= 12:
    results = [r for r in results if r["time"] != "morning"]
if current_hour >= 17:
    results = [r for r in results if r["time"] not in ["morning", "afternoon"]]
if current_hour >= 21:
    results = [r for r in results if r["time"] not in ["morning", "afternoon", "evening"]]

# Handle empty results (e.g., if it's late night and no night tasks)
if not results and user.get("tasks"):
    # If there are pending tasks but they were all filtered out, 
    # move them to the "next available" slot (now)
    for task in user.get("tasks", []):
         results.append({"task": task.get("name"), "action": "do_now", "time": "night"})

# --- SMART HEALTH SUGGESTIONS (HINGLISH/ENGLISH) ---
health_tasks = [
    {"task": "Morning Stretch & Pani pio 💧 (Hydration)", "action": "light", "time": "morning"},
    {"task": "15-min Walk thodi fresh air lelo 🚶‍♂️", "action": "light", "time": "afternoon"},
    {"task": "Aankho ko aaram do & Deep Breathing 🧘‍♀️", "action": "rest", "time": "evening"},
    {"task": "Digital Detox 🌙 (Phone side rakh do)", "action": "rest", "time": "night"}
]

# Filter health tasks too
if current_hour >= 11: 
    health_tasks = [h for h in health_tasks if h["time"] != "morning"]
if current_hour >= 16:
    health_tasks = [h for h in health_tasks if h["time"] not in ["morning", "afternoon"]]
if current_hour >= 20:
    health_tasks = [h for h in health_tasks if h["time"] not in ["morning", "afternoon", "evening"]]

# Inject 1 or 2 relevant health tasks randomly to not overwhelm the user
if health_tasks:
    for ht in random.sample(health_tasks, min(len(health_tasks), 2)):
        results.append(ht)

# SORT BY PRIORITY INITIALLY (So High priority gets earlier hours in the respective time blocks)
priority_order = {"do_now": 1, "light": 2, "delay": 3, "rest": 4}
results.sort(key=lambda x: priority_order.get(x["action"], 5))

# --- SMART TIME DISTRIBUTION ---
# Assign incremental real-world times instead of just the word "morning"
time_counters = {
    "morning": max(9, current_hour),      # starts at 9:00 AM or current hour
    "afternoon": max(13, current_hour),   # starts at 1:00 PM or current hour
    "evening": max(17, current_hour),     # starts at 5:00 PM or current hour
    "night": max(20, current_hour)        # starts at 8:00 PM or current hour
}

for r in results:
    base_time = r["time"]
    
    # Check if the predicted time maps to our dictionary
    if base_time in time_counters:
        hour = time_counters[base_time]
        
        # Store internal hour for chronological sorting
        r["sort_hour"] = hour
        
        # Format the hour
        am_pm = "AM" if hour < 12 else "PM"
        display_hour = hour if hour <= 12 else hour - 12
        display_hour = 12 if display_hour == 0 else display_hour
        
        # Override the text
        r["time_label"] = f"{base_time.capitalize()} - {display_hour:02d}:00 {am_pm}"
        
        # Increment hour for the next task in the same block
        time_counters[base_time] += 1
    else:
        # Fallback if time is not parsed properly
        r["time_label"] = base_time.capitalize()
        r["sort_hour"] = 24

    # Finalize the time field to be displayed on Frontend
    r["time"] = r["time_label"]
    r.pop("time_label", None)

# FINALLY, SORT CHRONOLOGICALLY FOR TIMELINE UI
results.sort(key=lambda x: x.get("sort_hour", 24))

# Remove temporary sorting field
for r in results:
    r.pop("sort_hour", None)

try:
    suggestion_text = generate_ai_suggestion(user, results)
except Exception as e:
    suggestion_text = "AI suggestion unavailable due to a temporary error."

final_output = {
    "schedule": results,
    "suggestion": suggestion_text
}

print(json.dumps(final_output))