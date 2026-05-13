
const base = process.env.EXPO_PUBLIC_API_URL;

export const loginEndpoint = `${base}/auth/login`;
export const getUserDataEndpoint = `${base}/user`;
export const logoutEndpoint = `${base}/auth/logout`;
export const registerEndpoint = `${base}/auth/register`;
export const refreshEndpoint = `${base}/auth/refresh`

export const updateUserEmailEndpoint = `${base}/user/changeEmail`
export const updateUserNameEndpoint = `${base}/user/changePublicUsername`
export const updateAvatarEndpoint = `${base}/user/changeAvatar`
export const updatePasswordEndpoint = `${base}/user/changePassword`
export const getAccountsEndpoint = `${base}/accounts/getAll`;
export const createAccountEndpoint = `${base}/accounts/create`;
export const updateAccountEndpoint = (id: string) => `${base}/accounts/${id}`;
export const deleteAccountEndpoint = (id: string) => `${base}/accounts/${id}`;
