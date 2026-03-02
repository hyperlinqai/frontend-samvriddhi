const axios = require('axios');
const fs = require('fs');

async function testAuthAndEntities() {
    try {
        const loginRes = await axios.post('http://localhost:5001/api/v1/auth/login', {
            email: 'shoaib.khan@hyperlinq.in',
            password: 'Hyperlinq3b$'
        });
        
        let token;
        if (loginRes.data.data && loginRes.data.data.tokens) token = loginRes.data.data.tokens.accessToken;
        else if (loginRes.data.data && loginRes.data.data.token) token = loginRes.data.data.token;
        else token = loginRes.data.token;
        
        fs.writeFileSync('test-out.log', "Got token: " + !!token + "\n");
        
        const tryFetch = async (label, url) => {
            try {
                const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` }});
                fs.appendFileSync('test-out.log', `${label}: ${res.data.data.length} items. First: ${res.data.data[0] ? res.data.data[0].status : 'N/A'}\n`);
            } catch (e) {
                fs.appendFileSync('test-out.log', `${label} failed: ${e.response?.data?.message || e.message}\n`);
            }
        };

        await tryFetch('No status', 'http://localhost:5001/api/v1/entities?limit=100');
        await tryFetch('status=all', 'http://localhost:5001/api/v1/entities?status=all&limit=100');
        await tryFetch('status=true', 'http://localhost:5001/api/v1/entities?status=true&limit=100');
        await tryFetch('status=false', 'http://localhost:5001/api/v1/entities?status=false&limit=100');

    } catch (err) {
        fs.writeFileSync('test-out.log', "Error: " + (err.response ? JSON.stringify(err.response.data) : err.message) + "\n");
    }
}
testAuthAndEntities();
