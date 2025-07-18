import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import axios from "axios";


const app = express();
const PORT = 3000;

import cookieParser from "cookie-parser";

// Middleware to parse cookies
app.use(cookieParser());

app.use(express.json());

// ES Modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// PostgreSQL Connection Configuration
const client = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Test",
  password: "Viraj@1000",
  port: 5432, // Default PostgreSQL port
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/login.html"));
  });
// Route for the signup page
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/signup.html"));
});
// app.get("/information", (req, res) => {
//   res.sendFile(path.join(__dirname, "/public/information.html"));
// });

// Connect to PostgreSQL
client.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Connection error:", err.stack));

// Serve the index page
app.get("/", (req, res) => {    
  res.sendFile(path.join(__dirname, "/public/index.html"));
});
//to add image
app.use(express.static(path.join(__dirname, "public")));

let h="";


app.post("/login", async (req, res) => {
    const { email, password } = req.body;
  h=email;

    const query = `
      SELECT * 
      FROM test
      WHERE email = $1 AND password = $2
    `;
    
  
    try {
      const result = await client.query(query, [email, password]);
  
      if (result.rows.length > 0) {
        // Successful login
        res.sendFile(path.join(__dirname, "/public/dashboard.html"));
      } else {
        // Invalid credentials
        res.status(401).sendFile(path.join(__dirname, "/public/signup.html"));
      }
    } catch (err) {
      console.error("Error checking login credentials:", err.stack);
      res.status(500).send("An error occurred. Please try again.");
    }
  });
  

// Handle signup form submission
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  h=email;
  console.log(req.body);

  // SQL Query to insert user data into the database
  const query = `
    INSERT INTO test ( email, password)
    VALUES ($1, $2)
  `;

  try {
    await client.query(query, [ email, password]);
    res.cookie('email', email);
    res.sendFile(path.join(__dirname, "/public/information.html"));
  } catch (err) {
    console.error("Error inserting data:", err.stack);
    res.sendFile(path.join(__dirname, "/public/signup.html"));
  }
});
app.post("/submit-info", async (req, res) => {
  console.log(req.body);

  const email = h;

  const { fullname, gender, age, fitnesslevel, activitylevel, healthconditions, injuries, dietpreference, height, weight } = req.body;
  console.log("Email in /submit-info:", email);

  const query = `
    UPDATE test
    SET fullname = $1, gender = $2, age = $3, fitnesslevel = $4, activitylevel = $5,
        healthconditions = $6, injuries = $7, dietpreference = $8, height = $9, weight = $10
    WHERE email = $11
  `;

  try {
    await client.query(query, [fullname, gender, age, fitnesslevel, activitylevel, healthconditions, injuries, dietpreference, height, weight, email]);
    
    res.sendFile(path.join(__dirname, "/public/goal.html"));
  } catch (err) {
    
    console.error("Error inserting data:", err.stack);
    res.sendFile(path.join(__dirname, "/public/signup.html"));
  }
});



app.post("/submit-goal", async (req, res) => {
  console.log(req.body);

  const email = h; // Fetch the email from cookies
  console.log("Email in /submit-goal:", email);

  // Extracting form data from the request body
  const { 
    weight_loss,
    weight_gain,
    muscle_building,
    powerlifting,
    strength_training,
    endurance_training,
    lower_back,
    shoulder,
    knee,
    elbow,
    neck,
    wrist,
    running,
    swimming,
    athletics,
    hatha_yoga,
    vinyasa_yoga,
    yin_yoga,
    kundalini_yoga,
    meditation,
    mindfulness,
    stress_relief,
    emotional_wellbeing
  } = req.body;

  // Prepare the query to insert or update the 'goal' table
  const query = `
    INSERT INTO goal (
      weight_loss,
      weight_gain,
      muscle_building,
      powerlifting,
      strength_training,
      endurance_training,
      lower_back,
      shoulder,
      knee,
      elbow,
      neck,
      wrist,
      running,
      swimming,
      athletics,
      hatha_yoga,
      vinyasa_yoga,
      yin_yoga,
      kundalini_yoga,
      meditation,
      mindfulness,
      stress_relief,
      emotional_wellbeing,
      email
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
    ) ON CONFLICT (email) DO UPDATE 
    SET
      weight_loss = EXCLUDED.weight_loss,
      weight_gain = EXCLUDED.weight_gain,
      muscle_building = EXCLUDED.muscle_building,
      powerlifting = EXCLUDED.powerlifting,
      strength_training = EXCLUDED.strength_training,
      endurance_training = EXCLUDED.endurance_training,
      lower_back = EXCLUDED.lower_back,
      shoulder = EXCLUDED.shoulder,
      knee = EXCLUDED.knee,
      elbow = EXCLUDED.elbow,
      neck = EXCLUDED.neck,
      wrist = EXCLUDED.wrist,
      running = EXCLUDED.running,
      swimming = EXCLUDED.swimming,
      athletics = EXCLUDED.athletics,
      hatha_yoga = EXCLUDED.hatha_yoga,
      vinyasa_yoga = EXCLUDED.vinyasa_yoga,
      yin_yoga = EXCLUDED.yin_yoga,
      kundalini_yoga = EXCLUDED.kundalini_yoga,
      meditation = EXCLUDED.meditation,
      mindfulness = EXCLUDED.mindfulness,
      stress_relief = EXCLUDED.stress_relief,
      emotional_wellbeing = EXCLUDED.emotional_wellbeing;
  `;

  try {
    // Execute the query to insert or update the 'goal' table
    await client.query(query, [
      weight_loss,
      weight_gain,
      muscle_building,
      powerlifting,
      strength_training,
      endurance_training,
      lower_back,
      shoulder,
      knee,
      elbow,
      neck,
      wrist,
      running,
      swimming,
      athletics,
      hatha_yoga,
      vinyasa_yoga,
      yin_yoga,
      kundalini_yoga,
      meditation,
      mindfulness,
      stress_relief,
      emotional_wellbeing,
      email
    ]);

    // Redirect to the confirmation page
    res.sendFile(path.join(__dirname, "/public/login.html"));
  } catch (err) {
    console.error("Error inserting/updating data in 'goal':", err.stack);
  }
});



app.get("/getUserProgress", async (req, res) => {
  // const email = req.cookies.email; // Get the email from cookies
  // console.log(email);
  const email=h;
  if (!email) {
      return res.status(401).json({ error: "User not logged in" });
  }

  try {
    
      const userQuery = "SELECT fullname, age, fitnesslevel, weight, height  FROM test WHERE email = $1";
      const goalQuery = "SELECT * FROM goal WHERE email = $1";

      const userResult = await client.query(userQuery, [email]);
      const goalResult = await client.query(goalQuery, [email]);

      if (userResult.rows.length === 0) {
          return res.status(404).json({ error: "User not found" });
      }

      res.json({
          user: userResult.rows[0],
          goals: goalResult.rows[0] || {},
      });
  } catch (err) {
      console.error("Error fetching user progress:", err);
      res.status(500).json({ error: "Internal server error" });
  }
});


const getUserGoal = async (userId) => {
  try {
      const result = await pool.query("SELECT * FROM goal WHERE user_id = $1", [userId]);

      if (result.rows.length > 0) {
          const goalData = result.rows[0];
          
          // Extract the goal with `true` value
          let selectedGoal = null;
          const goalMapping = {
              weight_loss: "weight loss",
              weight_gain: "weight gain",
              muscle_building: "muscle building",
              strength_training: "strength training",
              powerlifting: "powerlifting",
              endurance_training: "endurance training"
          };

          for (let key in goalMapping) {
              if (goalData[key]) {  // If true, set the goal
                  selectedGoal = goalMapping[key];
                  break;
              }
          }

          return selectedGoal;
      }
      return null;
  } catch (error) {
      console.error("Error fetching user goal:", error);
      return null;
  }
};



app.get("/generate-workout", async (req, res) => {
  try {
      // ✅ Fetch email from cookies/session
      const email = h;
      if (!email) {
          return res.status(400).json({ error: "User not authenticated" });
      }

      // ✅ Fetch user data from database
      const userQuery = "SELECT * FROM test WHERE email = $1";
      const goalQuery = "SELECT * FROM goal WHERE email = $1";

      const [userResult, goalResult] = await Promise.all([
          client.query(userQuery, [email]),
          client.query(goalQuery, [email]),
      ]);

      if (userResult.rows.length === 0 || goalResult.rows.length === 0) {
          return res.status(404).json({ error: "User data not found" });
      }

      const userData = userResult.rows[0];
      const goalData = goalResult.rows[0];

      // ✅ Extract selected goal
      const goalMapping = {
          weight_loss: "weight loss",
          weight_gain: "weight gain",
          muscle_building: "muscle building",
          strength_training: "strength training",
          powerlifting: "powerlifting",
          endurance_training: "endurance training",
      };

      let userGoal = null;
      for (const key in goalMapping) {
          if (goalData[key]) {
              userGoal = goalMapping[key];
              break;
          }
      }

      if (!userGoal) {
          return res.status(400).json({ error: "No valid goal selected" });
      }

      // ✅ Convert injuries to a clean array
      const userInjuries = userData.injuries
          ? userData.injuries.split(",").map(injury => injury.trim().replace(/[^a-zA-Z\s]/g, "").toLowerCase())
          : [];

      // ✅ Prepare data for AI model
      const userInput = {
          user_age: userData.age,
          user_height: userData.height,
          user_weight: userData.weight,
          user_goal: userGoal,
          user_injuries: userInjuries,
          user_fitness_level: userData.fitnesslevel,
          user_activity_level: userData.activitylevel,
          user_gender: userData.gender // 🔥 Ensure this field is included!
      };

      console.log("🚀 Sending Data to AI Model:", userInput);

      // 📡 Send request to Flask AI model
      const response = await axios.post("http://localhost:5000/predict", userInput);
      const aiResult = response.data;

      console.log("✅ AI Response:", aiResult);

      res.json(aiResult);
  } catch (err) {
      console.error("❌ Error generating workout plan:", err.message || err);
      res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/generate-diet", async (req, res) => {
  try {
      // ✅ Fetch email from cookies/session
      const email = h;
      if (!email) {
          return res.status(400).json({ error: "User not authenticated" });
      }
      

      // ✅ Fetch user data from database
      const userQuery = "SELECT * FROM test WHERE email = $1";
      const goalQuery = "SELECT * FROM goal WHERE email = $1";

      const [userResult, goalResult] = await Promise.all([
          client.query(userQuery, [email]),
          client.query(goalQuery, [email]),
      ]);

      if (userResult.rows.length === 0 || goalResult.rows.length === 0) {
          return res.status(404).json({ error: "User data not found" });
      }

      const userData = userResult.rows[0];
      const goalData = goalResult.rows[0];

      // ✅ Extract selected goal
      const goalMapping = {
          weight_loss: "weight loss",
          weight_gain: "weight gain",
          muscle_building: "muscle building",
          strength_training: "strength training",
          powerlifting: "powerlifting",
          endurance_training: "endurance training",
      };

      let userGoal = null;
      for (const key in goalMapping) {
          if (goalData[key]) {
              userGoal = goalMapping[key];
              break;
          }
      }

      if (!userGoal) {
          return res.status(400).json({ error: "No valid goal selected" });
      }

      // ✅ Convert dietary preferences
      const userDietPreference = userData.dietpreference ? userData.dietpreference.toLowerCase() : "none";

      // ✅ Prepare data for AI model
      const userInput = {
          user_age: userData.age,
          user_height: userData.height,
          user_weight: userData.weight,
          user_goal: userGoal,
          user_fitness_level: userData.fitnesslevel,
          user_gender: userData.gender,
          user_diet_preference: userDietPreference, // 🔥 Ensuring dietary preferences are included!
      };

      console.log("🚀 Sending Data to AI Model:", userInput);

      // 📡 Send request to Flask AI model
      const response = await axios.post("http://localhost:5000/predict_diet", userInput);
      const aiResult = response.data;

      console.log("✅ AI Response:", aiResult);

      if (!response.data || typeof response.data !== "object") {
        console.error("❌ AI Response is missing or invalid:", response.data);
        return res.status(500).json({ error: "AI response is missing or invalid" });
    }
    if (!Array.isArray(response.data.diet_plan) || response.data.diet_plan.length === 0) {
        console.error("❌ Diet Plan issue:", response.data.diet_plan);
        return res.status(500).json({ error: "AI response contains an invalid diet plan" });
    }
    
    console.log("Full AI Response:", response);
    console.log("AI Response Data:", response.data);

    

      res.json(aiResult);
  } catch (err) {
      console.error("❌ Error generating diet plan:", err.message || err);
      res.status(500).json({ error: "Internal Server Error" });
  }
});







// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

