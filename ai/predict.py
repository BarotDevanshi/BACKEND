import joblib
import numpy as np

model_stress = joblib.load("model_stress.pkl")
model_duration = joblib.load("model_duration.pkl")

def predict_missing(mood, sleep_hours, quality, priority):
    mood_map = {"happy":0, "sad":1, "stressed":2, "neutral":3}
    quality_map = {"good":0, "average":1, "poor":2}
    priority_map = {"high":0, "medium":1, "low":2}

    X = np.array([[
        mood_map.get(mood.lower() if isinstance(mood, str) else str(mood).lower(), 3),
        float(sleep_hours) if sleep_hours else 7.0,
        quality_map.get(quality.lower() if isinstance(quality, str) else str(quality).lower(), 1),
        priority_map.get(priority.lower() if isinstance(priority, str) else str(priority).lower(), 1)
    ]])

    stress = model_stress.predict(X)[0]
    duration = model_duration.predict(X)[0]

    return int(stress), int(duration)