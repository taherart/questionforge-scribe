// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jmtylarxxgphnieslbzi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptdHlsYXJ4eGdwaG5pZXNsYnppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NTU5MjMsImV4cCI6MjA1NjQzMTkyM30.tTMC4ad3prx2mGsRyEsVorI7UPHCqee9FM4udj8ZV0g";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);