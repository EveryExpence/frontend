import { API_URL } from '@env';

const base = API_URL;

export const loginEndpoint = `${base}/auth/login`;
export const getUserDataEndpoint = `${base}/user`;
export const logoutEndpoint = `${base}/auth/logout`