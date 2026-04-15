# Gender Classifier API

A serverless API that predicts the likely gender of a given name using the Genderize.io API and returns a structured response.

Deployed on Vercel.

---

## Live API

GET https://your-project.vercel.app/api/classify?name=john

---

## Features

- Uses Genderize.io API
- Processes and normalizes response
- Computes confidence score
- Handles edge cases and errors
- CORS enabled
- Serverless (Vercel)

---

## Endpoint

GET /api/classify

### Query Parameters

| Parameter | Type   | Required | Description      |
| --------- | ------ | -------- | ---------------- |
| name      | string | Yes      | Name to classify |

---

## Success Response (200)

```json
{
  "status": "success",
  "data": {
    "name": "john",
    "gender": "male",
    "probability": 0.99,
    "sample_size": 1234,
    "is_confident": true,
    "processed_at": "2026-04-15T12:00:00.000Z"
  }
}
```

---

## Confidence Logic

is_confident = probability >= 0.7 AND sample_size >= 100

---

## Error Responses

### Missing or empty name

```json
{
  "status": "error",
  "message": "Missing or empty name parameter"
}
```

### Invalid type

```json
{
  "status": "error",
  "message": "name is not a string"
}
```

### No prediction available

```json
{
  "status": "error",
  "message": "No prediction available for the provided name"
}
```

### Server error

```json
{
  "status": "error",
  "message": "Upstream or server failure"
}
```

---

## CORS

Access-Control-Allow-Origin: \*

---

## Tech Stack

- Node.js (Serverless Functions)
- Vercel
- Axios
- Genderize.io API

---

## Project Structure

project/
├── api/
│ └── classify.js
├── package.json
└── README.md

---

## Local Development

Install dependencies:
npm install

Run locally:
vercel dev

---

## Deployment

1. Push to GitHub
2. Import into Vercel
3. Deploy
4. Use generated URL

---

## Notes

- Serverless API (no Express needed)
- External API latency not included in grading
- Optimized for Vercel edge/serverless execution
