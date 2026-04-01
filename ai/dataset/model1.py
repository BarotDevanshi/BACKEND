import pandas as pd
import random

moods = ["happy", "sad", "stressed", "neutral"]
sleep_quality = ["good", "average", "poor"]
task_priority = ["high", "medium", "low"]

data = []

for i in range(300):
    mood = random.choice(moods)
    sleep_hours = random.randint(3, 9)
    quality = random.choice(sleep_quality)
    priority = random.choice(task_priority)

    # 🔥 TARGETS
    stress = random.randint(1, 10)
    duration = random.randint(30, 180)

    data.append([mood, sleep_hours, quality, priority, stress, duration])

df = pd.DataFrame(data, columns=[
    "mood", "sleep_hours", "sleep_quality",
    "task_priority", "stress_level", "task_duration"
])

df.to_csv("dataset_model1.csv", index=False)

print("✅ Model1 dataset ready")