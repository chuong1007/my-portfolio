const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://sfjrfitckltbpevumcre.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmanJmaXRja2x0YnBldnVtY3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNzU3OTEsImV4cCI6MjA4ODk1MTc5MX0.OvaKfzsCO_t1phZUBNA4BzSokRFahNvpUlIWUYfm2R0";

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .eq('id', 'about')
    .single();
  
  if (error) {
    console.error("Error fetching data:", error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

check();
