const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://kkfctwmrgvrinoythhqb.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZmN0d21yZ3ZyaW5veXRoaHFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE0OTI5NiwiZXhwIjoyMDkzNzI1Mjk2fQ.9ukbTf0256NvamsSPFZKOPbKABpvDjvckW3ebPAwTIg';
const client = createClient(supabaseUrl, supabaseServiceRoleKey);

async function run() {
  const { data, error } = await client.rpc('get_table_columns', { table_name: 'notifications' });
  if (error || !data) {
    // fallback query
    const { data: colsData, error: colsErr } = await client.from('notifications').select().limit(1);
    if (colsErr) {
      console.error('Error fetching notifications columns:', colsErr);
    } else {
      console.log('Empty table, but success! Column names:', Object.keys(colsData[0] || {}));
    }
  } else {
    console.log('Columns metadata:', data);
  }
}

run();
