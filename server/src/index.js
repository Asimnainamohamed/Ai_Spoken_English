import cors from "cors";
import express from "express";
import { config } from "./config.js";
import apiRoutes from "./routes/api.js";

const app = express();

app.use(
  cors({
    origin: config.clientUrl,
  }),
);
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", apiRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

app.listen(config.port, () => {
  console.log(`AI Spoken English Tutor server running at http://localhost:${config.port}`);
});

