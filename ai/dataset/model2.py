import pandas as pd
import random
import os

os.makedirs("dataset", exist_ok=True)

moods = ["happy", "sad", "stressed", "neutral"]
task_priority = ["high", "medium", "low"]
actions = ["do_now", "delay", "light", "rest"]
time_slots = ["morning", "afternoon", "evening"]

data = []

for i in range(500):
    mood = random.choice(moods)
    sleep = random.randint(3, 9)
    stress = random.randint(1, 10)
    priority = random.choice(task_priority)
    duration = random.randint(30, 180)

    # 🔥 LOGIC TO GENERATE TARGET (training data)
    if mood == "happy" and priority == "high":
        action = "do_now"
        time = "morning"
    elif stress > 7:
        action = "rest"
        time = "evening"
    elif mood == "sad":
        action = "light"
        time = "afternoon"
    else:
        action = random.choice(actions)
        time = random.choice(time_slots)

    data.append([mood, sleep, stress, priority, duration, action, time])

df = pd.DataFrame(data, columns=[
    "mood", "sleep_hours", "stress_level",
    "task_priority", "task_duration",
    "action", "time_slot"
])

df.to_csv("dataset_model2.csv", index=False)

print("✅ Model2 dataset ready")