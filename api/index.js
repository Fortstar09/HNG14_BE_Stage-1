import app from "../app";

export default function handler(req, res) {
  const origin = req.headers.origin;

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "GET") {
    return res.status(200).end();
  }

  return app(req, res);
}
