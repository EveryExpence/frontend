
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

export const updateCategoryEndpoint = (id: string) => `${base}/categories/${id}`;
export const deleteCategoryEndpoint = (id: string) => `${base}/categories/${id}`;
export const createCategoryEndpoint = `${base}/categories/create`;
export const getCategoryEndpoint = `${base}/categories/getAll`;

export const getPaymentMethodsEndpoint = `${base}/paymentMethod/getAll`;
export const createPaymentMethodEndpoint = `${base}/paymentMethod/create`;
export const updatePaymentMethodEndpoint = (id: string) => `${base}/paymentMethod/${id}`;
export const deletePaymentMethodEndpoint = (id: string) => `${base}/paymentMethod/${id}`;

export const getExpenseRecordsEndpoint = `${base}/expenseRecord/getAll`;
export const createExpenseRecordEndpoint = `${base}/expenseRecord/create`;
export const updateExpenseRecordEndpoint = (id: string) => `${base}/expenseRecord/${id}`;
export const deleteExpenseRecordEndpoint = (id: string) => `${base}/expenseRecord/${id}`;

export const analyzeReceiptEndpoint = `${base}/receipts/analyze`;

export const exchangeRatesEndpoint = (baseCurrency: string) => `${base}/exchange-rates/${baseCurrency}`;

const domain = (base || "").split('/api')[0];
export const uploadFileEndpoint = `${domain}/api/files/upload`;

