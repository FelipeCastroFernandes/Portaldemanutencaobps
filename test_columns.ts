import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dnrqhuuxncyyjmwguzhc.supabase.co';
const supabaseAnonKey = 'sb_publishable_G0CUQOPWcwDivyr6Fki-KA_mBpg0oKh';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkColumns() {
  // Check occurrences columns by trying to insert with all columns
  console.log('=== Checking occurrences columns ===');
  const { data, error } = await supabase.from('occurrences').insert({
    type: 'elevadores',
    equip: 'COL-TEST',
    call_number: '00001',
    attendant: 'Test',
    created_by: 'Test',
    start_time: new Date().toISOString(),
    causa_parada: 'Teste de coluna',
    is_equipment_stopped: true,
    status_history: [{ status: 'test', start: new Date().toISOString() }],
    extra_scope_approval_ms: 0,
  }).select().single();

  if (error) {
    console.error('Occurrences insert with extra columns error:', JSON.stringify(error, null, 2));
  } else {
    console.log('Success! All columns present:', JSON.stringify(data, null, 2));
    // Clean up
    await supabase.from('occurrences').delete().eq('id', data.id);
    console.log('Cleaned up');
  }
}

checkColumns();
