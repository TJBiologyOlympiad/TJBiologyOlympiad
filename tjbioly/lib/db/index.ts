import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client. Uses the service-role key when available so
// auth callbacks can read/write the `User` table; falls back to the public
// publishable key otherwise.
export const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);
