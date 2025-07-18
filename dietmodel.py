import pandas as pd

def get_clean_diet_plan(plan_id):
    """
    Retrieve the diet plan based on Diet Plan ID.
    Reads the 'DIET PLAN DATASET.csv' file and returns the corresponding diet plan
    without certain columns.
    """
    try:
        # ✅ Load the diet plans dataset
        diet_plans = pd.read_csv("DIET PLANS.csv", encoding="ISO-8859-1")

        # ✅ Check if 'Diet Plan ID' column exists
        if "Diet Plan ID" not in diet_plans.columns:
            raise KeyError("Missing 'Diet Plan ID' column in dataset!")

        # ✅ Retrieve the plan based on ID
        plan = diet_plans[diet_plans["Diet Plan ID"] == plan_id].copy()

        if plan.empty:
            return {"error": f"No diet plan found for ID: {plan_id}"}

        # 🔹 **Drop Unwanted Columns**
        columns_to_drop = [
            "BMI Category", "BMI Range", "Diet Plan ID", 
            "Diet Preference", "Goal", "Maintenance Calorie Range"
        ]
        plan.drop(columns=[col for col in columns_to_drop if col in plan.columns], inplace=True)

        # ✅ Convert DataFrame to a JSON-friendly format
        return plan.to_dict(orient="records")

    except FileNotFoundError:
        return {"error": "Diet plan dataset file not found!"}

    except Exception as e:
        return {"error": f"Error fetching diet plan: {str(e)}"}
