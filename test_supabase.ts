import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dnrqhuuxncyyjmwguzhc.supabase.co';
const supabaseAnonKey = 'sb_publishable_G0CUQOPWcwDivyr6Fki-KA_mBpg0oKh';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('--- Querying current tables ---');
  try {
    const { data: records, error: recError } = await supabase.from('maintenance_records').select('*');
    if (recError) {
      console.error('Error querying maintenance_records:', recError.message);
    } else {
      console.log(`maintenance_records: ${records.length} records`);
      console.log(JSON.stringify(records, null, 2));
    }
  } catch (e: any) {
    console.error('Exception querying maintenance_records:', e.message);
  }

  try {
    const { data: occurrences, error: occError } = await supabase.from('occurrences').select('*');
    if (occError) {
      console.error('Error querying occurrences:', occError.message);
    } else {
      console.log(`occurrences: ${occurrences.length} occurrences`);
      // Just output count or first few
      console.log(JSON.stringify(occurrences.slice(0, 5), null, 2));
    }
  } catch (e: any) {
    console.error('Exception querying occurrences:', e.message);
  }
}

testConnection();
