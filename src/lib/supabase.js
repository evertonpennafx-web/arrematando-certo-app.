import { createClient } from "@supabase/supabase-js";

let supabase = null;

if (
  typeof window !== "undefined" &&
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
) {
  supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
}

export { supabase };
