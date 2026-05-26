import { createClient } from "@supabase/supabase-js";
import { assertServerConfiguration, config } from "../config.js";

let supabaseAdmin;

export function getSupabaseAdmin() {
  assertServerConfiguration(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);

  if (!supabaseAdmin) {
    supabaseAdmin = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    });
  }

  return supabaseAdmin;
}
