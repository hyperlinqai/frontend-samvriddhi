const axios = require('axios');
const API_URL = 'https://attendance-api.hyperlinq.xyz/api/v1';

async function test() {
  try {
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'shoaib.khan@hyperlinq.in',
      password: 'Hyperlinq3b$'
    });
    const token = loginRes.data.data.tokens ? loginRes.data.data.tokens.accessToken : loginRes.data.data.token;
    
    // Get roles
    const rolesRes = await axios.get(`${API_URL}/roles?limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const roles = rolesRes.data.data;
    const testRole = roles.find(r => r.name !== 'SUPER ADMIN') || roles[0];

    // Create a new user
    const newUserStr = `testuser_${Date.now()}`;
    console.log(`Creating user: ${newUserStr}`);
    
    const createRes = await axios.post(`${API_URL}/users`, {
      fullName: `Test User ${Date.now()}`,
      email: `${newUserStr}@example.com`,
      phone: `+9199999${Math.floor(Math.random() * 10000)}`,
      password: 'Password123!',
      roleId: testRole.id
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('User created:', createRes.data.data.id);
    
    // Fetch users list
    const usersRes = await axios.get(`${API_URL}/users?limit=50`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const users = usersRes.data.data;
    console.log('Total users fetched:', users.length);
    const createdFound = users.find(u => u.id === createRes.data.data.id);
    if (createdFound) {
      console.log('New user IS in the list!');
      console.log('User object:', createdFound);
    } else {
      console.log('New user is NOT in the list! Oh no!');
    }
    
  } catch (err) {
    if (err.response) {
      console.error('API Error:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Error:', err.message);
    }
  }
}
test();
