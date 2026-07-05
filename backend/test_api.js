const axios = require('axios');
const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting Backend Tests ---');
  let token = null;

  try {
    // 1. Test Login
    console.log('Testing Login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@restoconnect.com',
      password: 'password123'
    });
    token = loginRes.data.token;
    console.log('Login successful.');

    // 2. Test Authorized GET (Users)
    console.log('Testing Authorized GET (/users)...');
    const usersRes = await axios.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Users fetched successfully. Count:', usersRes.data.users.length);

    // 3. Test Public GET (Menu)
    console.log('Testing Public GET (/menu)...');
    const menuRes = await axios.get(`${API_URL}/menu`);
    console.log('Menu fetched successfully.');

    console.log('--- All Tests Passed Successfully ---');
  } catch (error) {
    console.error('--- Test Failed ---');
    console.error(error.response ? JSON.stringify(error.response.data) : error.message);
    process.exit(1);
  }
}

runTests();
