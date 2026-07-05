const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function debug() {
    const { data: users, error } = await supabase.from('users').select('*');
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Users in public.users:', JSON.stringify(users, null, 2));
    }
}
debug();
