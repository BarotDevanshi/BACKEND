import joblib
import numpy as np

# LOAD
model_action = joblib.load("model_action.pkl")
model_time = joblib.load("model_time.pkl")

le_mood = joblib.load("le_mood.pkl")
le_priority = joblib.load("le_priority.pkl")
le_action = joblib.load("le_action.pkl")
le_time = joblib.load("le_time.pkl")

def safe_transform(encoder, value):
    try:
        return encoder.transform([value])[0]
    except Exception:
        # If unseen label, default to index 0
        return 0

def schedule_task(mood, sleep, stress, priority, duration):

    mood_enc = safe_transform(le_mood, mood)
    priority_enc = safe_transform(le_priority, priority)

    X = np.array([[mood_enc, sleep, stress, priority_enc, duration]])

    action_pred = model_action.predict(X)[0]
    time_pred = model_time.predict(X)[0]

    action = le_action.inverse_transform([action_pred])[0]
    time = le_time.inverse_transform([time_pred])[0]

    return action, time