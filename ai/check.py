from predict import predict_missing

user = {
    "mood": "sad",
    "sleep_hours": 5,
    "sleep_quality": "poor",
    "tasks": [
        {"name": "Study AI", "priority": "high"},
        {"name": "Gym", "priority": "medium"}
    ]
}

for task in user["tasks"]:
    stress, duration = predict_missing(
        user["mood"],
        user["sleep_hours"],
        user["sleep_quality"],
        task["priority"]
    )

    print("task:-",task["name"],"stress level:-",stress,"duration:-", duration)