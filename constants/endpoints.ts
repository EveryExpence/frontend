
const base = process.env.EXPO_PUBLIC_API_URL;

export const loginEndpoint = `${base}/auth/login`;
export const getUserDataEndpoint = `${base}/user`;
export const logoutEndpoint = `${base}/auth/logout`;
export const registerEndpoint = `${base}/auth/register`;
export const refreshEndpoint = `${base}/auth/refresh`
