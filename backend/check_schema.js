const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    // Get table schema
    const { data: users, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
        console.error('Error:', error);
    } else if (users.length > 0) {
        console.log('Columns:', Object.keys(users[0]));
    } else {
        console.log('Table users is empty, cannot infer schema.');
    }
}
check();
