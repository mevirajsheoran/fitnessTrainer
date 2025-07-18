from flask import Flask, request, jsonify
import pickle
import numpy as np
import pandas as pd
from model import get_workout_plan  # Ensure model.py exists and has get_workout_plan()
from dietmodel import get_clean_diet_plan

# ✅ Load trained AI models
with open("workout_plan_model.pkl", "rb") as f:
    model = pickle.load(f)

with open("diet_plan_model.pkl", "rb") as f:
    diet_model = pickle.load(f)

# # Load LabelEncoders
# with open("label_encoders.pkl", "rb") as enc_file:
#     label_encoders = pickle.load(enc_file)

# # Load StandardScaler
# with open("scaler.pkl", "rb") as scaler_file:
#     scaler = pickle.load(scaler_file)
app = Flask(__name__)

@app.route("/")
def home():
    return "Flask API is running!"

# 🔹 Category mappings
fitness_levels = {"beginner": 0, "intermediate": 1, "advanced": 2}
activity_levels = {"low": 0, "moderate": 1, "high": 2}


goals = {
     "weight gain": 0,"weight loss": 1, "muscle building": 2,
     "powerlifting": 3,"strength training": 4,"endurance training": 5
}
bmi_categories = {
    "underweight": 0, "normal weight": 1, "overweight": 2,
    "obesity class i": 3, "obesity class ii": 4, "obesity class iii": 5
}
diet_preferences = {"veg": 0, "nonVeg": 1}

# ✅ Known injuries for binary encoding
injury_list = ["knee", "shoulder", "lower back", "elbow", "neck", "wrist"]

def encode_category(value, mapping):
    """Convert categorical inputs to numerical values."""
    return mapping.get(value.lower(), -1)  # Default to -1 if not found

def calculate_bmi(weight, height):
    """Calculate BMI and categorize it."""
    bmi = weight / ((height / 100) ** 2)
    if bmi < 18.5:
        return bmi, "underweight"
    elif 18.5 <= bmi < 25:
        return bmi, "normal weight"
    elif 25 <= bmi < 30:
        return bmi, "overweight"
    elif 30 <= bmi < 35:
        return bmi, "obesity class i"
    elif 35 <= bmi < 40:
        return bmi, "obesity class ii"
    else:
        return bmi, "obesity class iii"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        print("📥 Received Data:", data)

        required_fields = ["user_age", "user_height", "user_weight", "user_gender",
                           "user_goal", "user_fitness_level", "user_activity_level"]

        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        # ✅ Extract values
        user_age = int(data["user_age"])
        user_height = float(data["user_height"])
        user_weight = float(data["user_weight"])
        user_gender = 1 if data["user_gender"].strip().lower() == "male" else 0
        user_goal = data["user_goal"].replace("_", " ").strip().lower()
        user_fitness_level = data["user_fitness_level"].strip().lower()
        user_activity_level = data["user_activity_level"].strip().lower()

        # ✅ Process injuries
        user_injuries = data.get("user_injuries", [])
        if isinstance(user_injuries, list):
            user_injuries = [injury.strip().lower() for injury in user_injuries]
        else:
            user_injuries = []

        # ✅ Calculate BMI
        user_bmi, bmi_category = calculate_bmi(user_weight, user_height)

        # ✅ Encode categorical variables
        fitness_level_num = encode_category(user_fitness_level, fitness_levels)
        activity_level_num = encode_category(user_activity_level, activity_levels)
        goal_num = encode_category(user_goal, goals)
        bmi_category_num = encode_category(bmi_category, bmi_categories)

        # ✅ Validate inputs
        invalid_entries = [k for k, v in {
            "user_goal": goal_num, "user_fitness_level": fitness_level_num,
            "user_activity_level": activity_level_num, "bmi_category": bmi_category_num
        }.items() if v == -1]
        if invalid_entries:
            return jsonify({"error": f"Invalid values for: {', '.join(invalid_entries)}"}), 400

        # ✅ Convert injuries into binary flags
        injury_flags = [1 if injury in user_injuries else 0 for injury in injury_list]

        # ✅ Prepare input for model
        input_data = np.array([[user_age, user_gender, user_height, user_weight,
                                user_bmi, bmi_category_num, goal_num, fitness_level_num,
                                activity_level_num] + injury_flags])

        print("🔹 Processed Data:", input_data)

        # ✅ Predict plan ID
        plan_id = int(model.predict(input_data)[0])

        # ✅ Fetch workout plan
        workout_plan, removed_exercises = get_workout_plan(plan_id, user_injuries)

        response = {
            "plan_id": plan_id,
            "bmi": round(user_bmi, 2),
            "bmi_category": bmi_category,
            "workout_plan": workout_plan,
            "removed_exercises": removed_exercises
        }

        print("✅ Response:", response)
        return jsonify(response)

    except Exception as e:
        print("❌ Error:", str(e))
        return jsonify({"error": str(e)}), 500
    



@app.route("/predict_diet", methods=["POST"])
def predict_diet():
    try:
        data = request.json
        print("📥 Received Diet Data:", data)

        required_fields = ["user_age", "user_height", "user_weight", "user_goal", "user_fitness_level", "user_diet_preference"]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        # ✅ Extract user input
        user_age = int(data["user_age"])
        user_height = float(data["user_height"])
        user_weight = float(data["user_weight"])
        user_goal = data["user_goal"].strip().lower()
        user_diet_preference = data["user_diet_preference"].strip().lower()
        user_fitness_level = data["user_fitness_level"].strip().lower()

        # ✅ Convert fitness level to integer
        fitness_mapping = {"beginner": 1, "intermediate": 2, "advanced": 3}
        user_fitness_level_num = fitness_mapping.get(user_fitness_level)
        if user_fitness_level_num is None:
            return jsonify({"error": "Invalid fitness level provided!"}), 400

        # ✅ Calculate BMI and get BMI Category
        user_bmi, bmi_category = calculate_bmi(user_weight, user_height)

        # ✅ Encode categorical values
        bmi_category_num = encode_category(bmi_category, bmi_categories)  
        goal_num = encode_category(user_goal, goals)    
        print(f"🔍 Encoded Goal: {user_goal} -> {goal_num}")

        diet_preference_num = encode_category(user_diet_preference, diet_preferences)  

        if -1 in [bmi_category_num, goal_num, diet_preference_num]:
            return jsonify({"error": "Invalid categorical value"}), 400

        # ✅ Prepare input for model
        input_data = np.array([[user_age, user_height, user_weight, user_bmi, bmi_category_num, 
                                goal_num, user_fitness_level_num, diet_preference_num]])

        print("🔍 Processed Input Data:", input_data)

        # ✅ Predict diet plan ID
        diet_plan_id = int(diet_model.predict(input_data)[0])

        # ✅ Fetch diet plan
        diet_plan = get_clean_diet_plan(diet_plan_id)

        response = {
            "diet_plan_id": diet_plan_id,
            "bmi": round(user_bmi, 2),
            "bmi_category": bmi_category,
            "diet_plan": diet_plan
        }

        print("✅ Diet Response:", response)
        return jsonify(response), 200

    except Exception as e:
        print("❌ Error:", str(e))
        return jsonify({"error": "An error occurred while processing the request"}), 500



if __name__ == "__main__":
    app.run(port=5000, debug=True)