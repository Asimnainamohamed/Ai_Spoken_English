import cors from "cors";
import express from "express";
import { config, missingServerVariables } from "./config.js";
import apiRoutes from "./routes/api.js";

const app = express();

app.use(
  cors({
    origin: config.clientUrl,
  }),
);
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (_req, res) => {
  const missing = missingServerVariables();
  res.json({
    status: "ok",
    configured: missing.length === 0,
    ...(missing.length > 0 ? { missing } : {}),
  });
});

app.use("/api", apiRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  const configurationError = err.message?.startsWith("Missing server environment variables:");
  res.status(500).json({
    error: configurationError ? err.message : "Something went wrong on the server.",
  });
});

export default app;
