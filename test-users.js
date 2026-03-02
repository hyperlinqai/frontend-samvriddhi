const axios = require('axios');
const tokenPayload = {
  email: 'shoaib.khan@hyperlinq.in',
  password: 'Hyperlinq3b$'
};
axios.post('https://attendance-api.hyperlinq.xyz/api/v1/auth/login', tokenPayload).then(async loginRes => {
  const token = loginRes.data.data.tokens ? loginRes.data.data.tokens.accessToken : loginRes.data.data.token;
  console.log('Got token:', !!token);
  
  try {
    const usersRes = await axios.get('https://attendance-api.hyperlinq.xyz/api/v1/users?limit=50', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Users found:', usersRes.data.data.length);
    console.log('First user:', usersRes.data.data[0]);
  } catch (err) {
    console.error('Users fetch error:', err.response ? err.response.data : err.message);
  }
}).catch(err => console.error('Login error:', err.response ? err.response.data : err.message));
