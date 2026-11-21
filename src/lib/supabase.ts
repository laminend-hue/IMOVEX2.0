import { createClient } from '@supabase/supabase-js';

// Configuration du projet Supabase IMMOVEX
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://bpextmygewysckipdnqu.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZXh0bXlnZXd5c2NraXBkbnF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUwMTk4NzIsImV4cCI6MjExMDU5NTg3Mn0._JXwAsolnPUZ3s1DdhwUePXb313mHq5wk7naLuSyn6s';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
