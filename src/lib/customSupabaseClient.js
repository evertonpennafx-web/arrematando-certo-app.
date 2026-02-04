import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dybzykolilsuxewkulbq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Ynp5a29saWxzdXhld2t1bGJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3Mzc3NDcsImV4cCI6MjA4NTMxMzc0N30.j3HWqGaJRODLS_ORlkY3cKy6DN76BW9USnR1Sh1wtDs';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
