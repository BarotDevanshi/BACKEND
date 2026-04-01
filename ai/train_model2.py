import pandas as pd
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier
import joblib

df = pd.read_csv("dataset/dataset_model2.csv")

# 🔥 ENCODING
le_mood = LabelEncoder()
le_priority = LabelEncoder()
le_action = LabelEncoder()
le_time = LabelEncoder()

df["mood"] = le_mood.fit_transform(df["mood"])
df["task_priority"] = le_priority.fit_transform(df["task_priority"])
df["action"] = le_action.fit_transform(df["action"])
df["time_slot"] = le_time.fit_transform(df["time_slot"])

X = df[["mood", "sleep_hours", "stress_level", "task_priority", "task_duration"]]

y_action = df["action"]
y_time = df["time_slot"]

model_action = XGBClassifier()
model_time = XGBClassifier()

model_action.fit(X, y_action)
model_time.fit(X, y_time)

# SAVE EVERYTHING
joblib.dump(model_action, "model_action.pkl")
joblib.dump(model_time, "model_time.pkl")
joblib.dump(le_mood, "le_mood.pkl")
joblib.dump(le_priority, "le_priority.pkl")
joblib.dump(le_action, "le_action.pkl")
joblib.dump(le_time, "le_time.pkl")

print("✅ Scheduler model trained")