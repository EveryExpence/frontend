import EncryptedStorage from 'react-native-encrypted-storage';
import { accessTokenKey, refreshTokenKey } from "@/constants/encryptedStorageKeys";
import { refreshEndpoint } from "@/constants/endpoints";
import { router } from 'expo-router';

export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let token = await EncryptedStorage.getItem(accessTokenKey);
    
    const headers: Record<string, string> = {};
    if (init?.headers) {
        if (init.headers instanceof Headers) {
            init.headers.forEach((value, key) => {
                headers[key] = value;
            });
        } else if (Array.isArray(init.headers)) {
            init.headers.forEach(([key, value]) => {
                headers[key] = value;
            });
        } else {
            Object.assign(headers, init.headers);
        }
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    let response = await fetch(input, { ...init, headers });

    if (response.status === 401 || response.status === 403) {
        const refreshToken = await EncryptedStorage.getItem(refreshTokenKey);

        if (!refreshToken) {
            await EncryptedStorage.removeItem(accessTokenKey);
            router.replace('/login');
            return response;
        }

        const refreshRes = await fetch(refreshEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        });

        if (!refreshRes.ok) {
            await EncryptedStorage.removeItem(accessTokenKey);
            await EncryptedStorage.removeItem(refreshTokenKey);
            router.replace('/login');
            return response;
        }

        const { accessToken, refreshToken: newRefreshToken } = await refreshRes.json();

        await EncryptedStorage.setItem(accessTokenKey, accessToken);
        await EncryptedStorage.setItem(refreshTokenKey, newRefreshToken);

        headers["Authorization"] = `Bearer ${accessToken}`;
        
        response = await fetch(input, { ...init, headers });
    }

    return response;
};