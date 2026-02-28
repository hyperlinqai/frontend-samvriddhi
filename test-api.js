const { getApiClient } = require('./utils/apiClient');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mockReq = { cookies: {} };

async function testApi() {
    try {
        const roles = await prisma.roleRecord.findMany({ take: 1, include: { rolePermissions: true } });
        const perms = await prisma.permission.findMany({ take: 2 });

        const roleId = roles[0].id;
        const permIds = perms.map(p => p.id);

        console.log("Updating role", roleId, "with perms:", permIds);

        const api = getApiClient(mockReq);
        // Overriding baseUrl to local backend port
        api.defaults.baseURL = 'http://localhost:5001/api';

        // We do not have user context here, so this request will fail if it requires Auth.
        // Wait, the API requires Auth Middleware: roleRouter.use(authenticate)
        // I can just login if I have an admin user or generate a test token.
    } catch (e) {
        console.error(e.message);
    } finally {
        await prisma.$disconnect()
    }
}
testApi();
