import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client. Uses the service-role key when available so
// auth callbacks can read/write the `User` table; falls back to the public
// publishable key otherwise.
//
// Fall back to harmless placeholders if the env vars are missing so that
// `createClient` never throws at import time (which would fail the whole
// `next build` on a machine without the env configured). Real requests still
// require the real values to be set (locally in .env, on Vercel in Project
// Settings → Environment Variables).
const supabaseUrl =
	process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
	"placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseKey);
