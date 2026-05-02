
const base = process.env.EXPO_PUBLIC_API_URL;

export const loginEndpoint = `${base}/auth/login`;
export const getUserDataEndpoint = `${base}/user`;
export const logoutEndpoint = `${base}/auth/logout`;
export const registerEndpoint = `${base}/auth/register`;
export const refreshEndpoint = `${base}/auth/refresh`

export const getAccountsEndpoint = `${base}/accounts/getAll`;
export const createAccountEndpoint = `${base}/accounts/create`;
export const updateAccountEndpoint = (id: string) => `${base}/accounts/${id}`;
export const deleteAccountEndpoint = (id: string) => `${base}/accounts/${id}`;