async function fetchWorkoutPlan() {
    try {
        const response = await fetch("http://localhost:3000/generate-workout");
        const data = await response.json();

        console.log("Received Workout Plan:", data); // Debugging Log

        if (!data.workout_plan || data.workout_plan.length === 0) {
            document.getElementById("error-message").textContent = "No workout plan found. Please try again.";
            return;
        }

        const workoutBody = document.getElementById("workout-body");
        workoutBody.innerHTML = ""; // Clear previous data

        data.workout_plan.forEach(item => {
            const row = `<tr>
                <td>${item.Day}</td>
                <td>${item.Exercise}</td>
                <td>${item.Sets}</td>
                <td>${item.Reps}</td>
                <td>${item.Focus}</td>
            </tr>`;
            workoutBody.innerHTML += row;
        });

    } catch (error) {
        console.error("Error fetching workout plan:", error);
        document.getElementById("error-message").textContent = "Failed to fetch workout plan.";
    }
}

// Call the function when the page loads
window.onload = fetchWorkoutPlan;
