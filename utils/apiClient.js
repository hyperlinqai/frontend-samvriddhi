const axios = require('axios');

const apiClient = axios.create({
    baseURL: process.env.API_BASE_URL || 'https://attendance-api.hyperlinq.xyz/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// A function to attach the token for server-side requests
// We'll call this passing in the req whenever we need to make an authenticated request
const getApiClient = (req) => {
    const instance = axios.create({
        baseURL: process.env.API_BASE_URL || 'https://attendance-api.hyperlinq.xyz/api',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (req && req.cookies && req.cookies.jwt_backend) {
        instance.defaults.headers.common['Authorization'] = `Bearer ${req.cookies.jwt_backend}`;
    }

    return instance;
};

module.exports = { apiClient, getApiClient };
