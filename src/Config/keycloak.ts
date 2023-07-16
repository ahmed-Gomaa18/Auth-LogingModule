import KcAdminClient from '@keycloak/keycloak-admin-client';
import { RoleMappingPayload } from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation.js';
import { Credentials, GrantTypes } from '@keycloak/keycloak-admin-client/lib/utils/auth';


const ConnectionConfig = {
    realmName: process.env.KEYCLOAK_REALM_NAME,
    baseUrl: process.env.KEYCLOAK_URL,
}
const keycloakAdmin = new KcAdminClient(ConnectionConfig);

export const KcAdminCredentials: Credentials = {
    username: process.env.KEYCLOAK_ADMIN_USERNAME,
    password: process.env.KEYCLOAK_ADMIN_PASSWORD,
    clientId: process.env.KEYCLOAK_CLIENT_ID,
    grantType: 'password' as GrantTypes
}

export default keycloakAdmin;
