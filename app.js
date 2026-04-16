import express from "express";
import axios from "axios";
import cors from "cors";
import pool from "./db.js";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  }),
);

function getAgeGroup(age) {
  if (age === null || age === undefined) return "unknown";

  if (age < 13) return "child";
  if (age < 18) return "teen";
  if (age < 60) return "adult";

  return "senior";
}

// POST route to insert data
app.post("/api/profiles", async (req, res) => {
  const { name } = req.body;

  // VALIDATION
  if (typeof name !== "string") {
    return res.status(422).json({
      status: "error",
      message: "name must be a string",
    });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({
      status: "error",
      message: "Missing or empty name parameter",
    });
  }

  const cleanName = name.trim();

  try {
    // 1. CHECK EXISTING USER

    const existing = await pool.query("SELECT * FROM users WHERE name = $1", [
      cleanName,
    ]);

    if (existing.rows.length > 0) {
      return res.status(200).json({
        status: "success",
        message: "Profile already exists",
        data: existing.rows[0],
      });
    }

    // 2. CALL EXTERNAL APIs

    const safeName = encodeURIComponent(cleanName);

    const [genderize, nationalize, agify] = await Promise.all([
      axios.get(`https://api.genderize.io?name=${safeName}`),
      axios.get(`https://api.nationalize.io?name=${safeName}`),
      axios.get(`https://api.agify.io?name=${safeName}`),
    ]);

    if (!genderize.data || !nationalize.data || !agify.data) {
      return res.status(404).json({
        status: "error",
        message: "External api failed, try again later",
      });
    }

    // 3. EXTRACT DATA

    const { count, gender, probability } = genderize.data;
    const { age } = agify.data;

    const age_group = getAgeGroup(age);

    const firstCountry = nationalize.data.country?.[0];

    const country_id = firstCountry?.country_id || null;
    const country_probability = firstCountry?.probability || null;

    // 4. INSERT NEW RECORD

    const result = await pool.query(
      `INSERT INTO users (
        name,
        gender,
        gender_probability,
        sample_size,
        age,
        age_group,
        country_id,
        country_probability
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        cleanName,
        gender,
        probability,
        count,
        age,
        age_group,
        country_id,
        country_probability,
      ],
    );

    // 5. RESPONSE

    return res.status(201).json({
      status: "success",
      message: "Profile created successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

app.get("/api/profiles/:id", async (req, res) => {
  const { id } = req.params;

  // validate id
  if (!id || isNaN(id)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid id parameter",
    });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

app.get("/api/profiles", async (req, res) => {
  const { gender, country_id, age_group } = req.query;

  try {
    let query = "SELECT * FROM users WHERE 1=1";
    const values = [];
    let index = 1;

    // gender filter (case-insensitive)
    if (gender) {
      query += ` AND LOWER(gender) = LOWER($${index})`;
      values.push(gender);
      index++;
    }

    // country filter
    if (country_id) {
      query += ` AND LOWER(country_id) = LOWER($${index})`;
      values.push(country_id);
      index++;
    }

    // age group filter
    if (age_group) {
      query += ` AND LOWER(age_group) = LOWER($${index})`;
      values.push(age_group);
      index++;
    }

    const result = await pool.query(query, values);

    return res.status(200).json({
      status: "success",
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

app.delete("/api/profiles/:id", async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid id parameter",
    });
  }

  try {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Profile not found",
      });
    }

    return res.status(204).send(); // NO CONTENT
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

export default app;
