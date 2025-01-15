import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vyyfvwiopelmyefrkgws.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5eWZ2d2lvcGVsbXllZnJrZ3dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5NTU0NzQsImV4cCI6MjA1MTUzMTQ3NH0.bcKonThq7pi2VsR3vxqSWvpiEmDcmTAz1WzWjQ2q6PY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 