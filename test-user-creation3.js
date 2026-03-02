const axios = require('axios');
const API_URL = 'https://attendance-api.hyperlinq.xyz/api/v1';

async function test() {
    try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'shoaib.khan@hyperlinq.in',
            password: 'Hyperlinq3b$'
        });
        const token = loginRes.data.data.tokens ? loginRes.data.data.tokens.accessToken : loginRes.data.data.token;

        // Fetch ALL users
        const usersRes = await axios.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { limit: 100 }
        });

        const users = usersRes.data.data;
        console.log('Total baseline users fetched:', users.length);
        console.log('List:', users.map(u => u.fullName).join(', '));

    } catch (err) {
        if (err.response) {
            console.error('API Error:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('Error:', err.message);
        }
    }
}
test();
