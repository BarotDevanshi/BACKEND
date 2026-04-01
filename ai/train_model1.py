import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBRegressor
import joblib

df = pd.read_csv("dataset/dataset_model1.csv")

# Encode
le_mood = LabelEncoder()
le_quality = LabelEncoder()
le_priority = LabelEncoder()

df["mood"] = le_mood.fit_transform(df["mood"])
df["sleep_quality"] = le_quality.fit_transform(df["sleep_quality"])
df["task_priority"] = le_priority.fit_transform(df["task_priority"])

X = df[["mood", "sleep_hours", "sleep_quality", "task_priority"]]

y_stress = df["stress_level"]
y_duration = df["task_duration"]

model_stress = XGBRegressor()
model_duration = XGBRegressor()

model_stress.fit(X, y_stress)
model_duration.fit(X, y_duration)

joblib.dump(model_stress, "model_stress.pkl")
joblib.dump(model_duration, "model_duration.pkl")

print("✅ Model1 trained")