# 📊 Profile Enrichment API

A Node.js + Express API that generates enriched user profiles using external APIs (Genderize, Agify, Nationalize) and stores them in a PostgreSQL (Neon) database.

---

## 🚀 Features

- Create enriched user profiles using external APIs
- Prevent duplicate profiles (based on `name`)
- Retrieve all profiles with optional filters
- Get profile by ID
- Delete profile by ID
- Case-insensitive filtering
- Full error handling (400, 404, 422, 500, 502)
- PostgreSQL (Neon) integration

---

## 🛠️ Tech Stack

- Node.js (ES Modules)
- Express.js
- PostgreSQL (Neon)
- Axios
- dotenv
- pg

---

## 📦 Installation

```bash
git clone <your-repo-url>
cd project-folder
npm install
```

## ⚙️ Environment Variables

Create a `.env` file in the root of your project:

DATABASE_URL=your_neon_postgres_connection_string

---

## ▶️ Run Server

node index.js

Server runs on:

http://localhost:3000

---

## 📌 API Endpoints

---

## 🔹 Create Profile

POST /api/profiles

Request Body:

{
"name": "ella"
}

Success Response (201):

{
"status": "success",
"message": "Profile created successfully",
"data": {
"id": 1,
"name": "ella",
"gender": "female",
"gender_probability": 0.99,
"sample_size": 1234,
"age": 46,
"age_group": "adult",
"country_id": "DRC",
"country_probability": 0.85,
"created_at": "2026-04-01T12:00:00Z"
}
}

Duplicate Response (200):

{
"status": "success",
"message": "Profile already exists",
"data": {}
}

---

## 🔹 Get All Profiles

GET /api/profiles

Optional Query Parameters:

- gender
- country_id
- age_group

Example:

/api/profiles?gender=male&country_id=NG

Response:

{
"status": "success",
"count": 2,
"data": []
}

---

## 🔹 Get Profile by ID

GET /api/profiles/:id

Response:

{
"status": "success",
"data": {}
}

Error Response (404):

{
"status": "error",
"message": "Profile not found"
}

---

## 🔹 Delete Profile

DELETE /api/profiles/:id

Success Response:

204 No Content

---

## ⚠️ Error Format

All errors follow this structure:

{
"status": "error",
"message": "Error description"
}

---

## 🔸 Status Codes

400 - Bad Request (missing/invalid input)  
422 - Invalid input type  
404 - Not Found  
500 - Server error  
502 - External API failure

---

## 🔸 External API Rules

Genderize:

- gender = null OR count = 0 → return 502

Agify:

- age = null → return 502

Nationalize:

- empty country array → return 502

---

## 🧠 Key Logic

- `name` is PRIMARY KEY (no duplicates)
- Duplicate names return existing profile instead of creating new record
- External APIs enrich user data
- PostgreSQL stores final structured profile

---

## 📁 Project Structure

project/
│── index.js
│── db.js
│── .env
│── routes/
│── controllers/
│── services/
│── utils/

---

## 📜 License

This project is for learning purposes.
