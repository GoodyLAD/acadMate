// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabaseSchema() {
  // eslint-disable-next-line no-console
  console.log('Fixing database schema...');
  
  try {
    // Read the migration file
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250103_fix_notifications_metadata.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Error executing migration:', error);
      process.exit(1);
    }
    
    // eslint-disable-next-line no-console
    console.log('Database schema fixed successfully!');
    // eslint-disable-next-line no-console
    console.log('The community messaging should now work properly.');
    
  } catch (err) {
    console.error('Error fixing database schema:', err);
    process.exit(1);
  }
}

fixDatabaseSchema();
