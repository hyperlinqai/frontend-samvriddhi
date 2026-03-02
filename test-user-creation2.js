const axios = require('axios');
const API_URL = 'https://attendance-api.hyperlinq.xyz/api/v1';

async function test() {
    try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'shoaib.khan@hyperlinq.in',
            password: 'Hyperlinq3b$'
        });
        const token = loginRes.data.data.tokens ? loginRes.data.data.tokens.accessToken : loginRes.data.data.token;

        const userId = '9bc12d3e-343e-4ce2-a916-790458d184d6';

        // Fetch specific user
        try {
            const userRes = await axios.get(`${API_URL}/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('User object:', JSON.stringify(userRes.data.data, null, 2));
        } catch (e) {
            console.log('Error fetching user directly:', e.response ? e.response.status : e.message);
        }

        // Fetch ALL users and see if there are missing params
        const usersRes = await axios.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { limit: 50, isActive: false }
        });

        const users = usersRes.data.data;
        console.log('Total inactive users fetched:', users.length);

        const usersResAll = await axios.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { limit: 50, isActive: 'all' }
        });

        console.log('Total ALL users fetched (isActive=all):', usersResAll.data.data.length);

    } catch (err) {
        if (err.response) {
            console.error('API Error:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('Error:', err.message);
        }
    }
}
test();
