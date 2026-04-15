import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
  }),
);

app.get("/api/classify", async (req, res) => {
  const name = req.query.name;

  if (typeof name !== "string") {
    return res
      .status(422)
      .json({ status: "error", message: "name is not a string" });
  }

  if (!name || !name.trim()) {
    return res
      .status(400)
      .json({ status: "error", message: "Missing or empty name parameter" });
  }

  console.log(name);
  try {
    const safeName = encodeURIComponent(name);

    const response = await axios.get(
      `https://api.genderize.io?name=${safeName}`,
    );

    if (response.data.count === 0 || !response.data.gender) {
      return res.json({
        status: "error",
        message: "No prediction available for the provided name",
      });
    }

    const { count, ...rest } = response.data;

    return res.json({
      status: "success",
      data: {
        ...rest,
        sample_size: count,
        is_confident: response.data.probability >= 0.7 && count >= 100,
        processed_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Upstream or server failure" });
  }
});

export default app;
