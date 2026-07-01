import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dnrqhuuxncyyjmwguzhc.supabase.co';
const supabaseAnonKey = 'sb_publishable_G0CUQOPWcwDivyr6Fki-KA_mBpg0oKh';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTasks() {
  console.log('=== Testing tasks table ===');
  
  // Test SELECT
  const { data: tasks, error: selectError } = await supabase.from('tasks').select('*');
  if (selectError) {
    console.error('SELECT tasks error:', JSON.stringify(selectError, null, 2));
  } else {
    console.log(`Tasks found: ${tasks.length}`);
    if (tasks.length > 0) console.log('First task:', JSON.stringify(tasks[0], null, 2));
  }

  // Test INSERT
  console.log('\n=== Testing INSERT into tasks ===');
  const { data: insertedTask, error: insertError } = await supabase.from('tasks').insert({
    title: 'Test Task',
    hours: 2,
    impact: 'medium',
    urgency: 'planned',
    responsible: 'Test',
    notes: 'Testing insert',
    status: 'backlog',
    score: 4,
  }).select().single();

  if (insertError) {
    console.error('INSERT tasks error:', JSON.stringify(insertError, null, 2));
  } else {
    console.log('Inserted task:', JSON.stringify(insertedTask, null, 2));
  }

  // Test INSERT into occurrences
  console.log('\n=== Testing INSERT into occurrences ===');
  const { data: insertedOcc, error: occInsertError } = await supabase.from('occurrences').insert({
    type: 'elevadores',
    equip: 'TEST-1',
    call_number: '99999',
    attendant: 'Test User',
    created_by: 'Test',
    start_time: new Date().toISOString(),
  }).select().single();

  if (occInsertError) {
    console.error('INSERT occurrences error:', JSON.stringify(occInsertError, null, 2));
  } else {
    console.log('Inserted occurrence:', JSON.stringify(insertedOcc, null, 2));
    // Clean up
    if (insertedOcc) {
      await supabase.from('occurrences').delete().eq('id', insertedOcc.id);
      console.log('Cleaned up test occurrence');
    }
  }

  // Test INSERT into users
  console.log('\n=== Testing INSERT into users ===');
  const { data: insertedUser, error: userInsertError } = await supabase.from('users').insert({
    full_name: 'Test User',
    email: `test-${Date.now()}@test.com`,
    password: 'test',
    team: 'Test',
    role: 'Test',
    profile: 'visualização',
  }).select().single();

  if (userInsertError) {
    console.error('INSERT users error:', JSON.stringify(userInsertError, null, 2));
  } else {
    console.log('Inserted user:', JSON.stringify(insertedUser, null, 2));
    // Clean up
    if (insertedUser) {
      await supabase.from('users').delete().eq('id', insertedUser.id);
      console.log('Cleaned up test user');
    }
  }

  // Clean up test task if it was created
  if (insertedTask) {
    await supabase.from('tasks').delete().eq('id', insertedTask.id);
    console.log('Cleaned up test task');
  }
}

testTasks();
