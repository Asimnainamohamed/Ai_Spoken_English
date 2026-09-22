import "dotenv/config";

const requiredVariables = [
  "GROQ_API_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
];

function isPlaceholderValue(value) {
  if (typeof value !== "string") {
    return false;
  }

  const normalized = value.trim();
  return (
    normalized.length === 0 ||
    normalized.includes("your_") ||
    normalized.includes("your-") ||
    normalized.includes("your.") ||
    normalized.includes("example") ||
    normalized.includes("placeholder") ||
    normalized.includes("replace-me") ||
    normalized.includes("demo-")
  );
}

export function missingServerVariables(keys = requiredVariables) {
  return keys.filter((key) => {
    const value = process.env[key];
    return !value || isPlaceholderValue(value);
  });
}

export function assertServerConfiguration(keys = requiredVariables) {
  const missingVariables = missingServerVariables(keys);

  if (missingVariables.length > 0) {
    throw new Error(`Missing server environment variables: ${missingVariables.join(", ")}.`);
  }
}

export const config = {
  port: Number(process.env.PORT) || 5000,
  clientUrl: (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/+$/, ""),
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

export function isAllowedLocalOrigin(origin) {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = origin.replace(/\/+$/, "");
  const allowed = [config.clientUrl, "http://localhost:5173", "http://127.0.0.1:5173"];

  if (allowed.includes(normalizedOrigin)) {
    return true;
  }

  return /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(normalizedOrigin);
}
