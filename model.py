import pandas as pd

# Load dataset
workout_plans = pd.read_csv("WORKOUT PLAN DATASET.csv", encoding="ISO-8859-1")


# ✅ Define Injury to Exercise Mappingpy
injury_mapping = {
    "Knee": ["Squat", "Leg Press", "Bulgarian Split Squat", "Lunges", "Jump Squats"],
    "Shoulder": ["Overhead Press", "Dumbbell Shoulder Press", "Military Press", "Face Pulls"],
    "Lower Back": ["Deadlift", "Romanian Deadlift", "Bent-Over Rows", "Barbell Rows"],
    "Elbow": ["Bicep Curls", "Triceps Dips", "Hammer Curls", "Bench Press"],
    "Wrist": ["Farmer’s Carry", "Barbell Rows", "Bicep Curls", "Triceps Dips"]
}

def get_workout_plan(plan_id, injuries):
    """Retrieve workout plan based on Plan ID and remove exercises related to injuries."""
    removed_exercises = []

    # ✅ Filter dataset for the selected plan
    plan = workout_plans[workout_plans["Plan ID"] == plan_id].copy()

    # ✅ Remove exercises related to injuries
    for injury in injuries:
        if injury in injury_mapping:
            injury_exercises = injury_mapping[injury]
            removed_exercises.extend(plan[plan["Exercise"].isin(injury_exercises)]["Exercise"].tolist())
            plan = plan[~plan["Exercise"].isin(injury_exercises)]  # Remove exercises

    # ✅ Convert full plan details to JSON format
    plan_json = plan[["Day", "Exercise", "Sets", "Reps", "Focus"]].to_dict(orient="records")

    return plan_json, removed_exercises  # Return structured workout plan and removed exercises
