import { supabaseAdmin } from "../lib/supabase.js";

export async function requireAuth(req, res, next) {
  try {
    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ error: "Please sign in to continue." });
    }

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Your session has expired. Please sign in again." });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}
