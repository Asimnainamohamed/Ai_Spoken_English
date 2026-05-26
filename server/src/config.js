import "dotenv/config";

const requiredVariables = [
  "GROQ_API_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
];

export function missingServerVariables(keys = requiredVariables) {
  return keys.filter((key) => !process.env[key]);
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
  groqModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};
