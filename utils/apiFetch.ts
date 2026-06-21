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

        const headers = new Headers(init?.headers);

        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        let response: Response;
        try {
            response = await fetch(input, { ...init, headers });
        } catch (networkError) {
            console.error("Network request failed:", networkError);
            return new Response(JSON.stringify({ message: "Network request failed. Please check your internet connection." }), {
                status: 0,
                statusText: "Network Error",
                headers: { "Content-Type": "application/json" },
            });
        }

        if (response.status === 401 || response.status === 403) {
            let refreshToken: string | null = null;
            try {
                refreshToken = await EncryptedStorage.getItem(refreshTokenKey);
            } catch (storageError) {
                console.warn("Failed to read refresh token from storage:", storageError);
            }

            if (!refreshToken) {
                try {
                    await EncryptedStorage.removeItem(accessTokenKey);
                } catch { }
                router.replace('/login');
                return response;
            }

            let refreshRes: Response;
            try {
                refreshRes = await fetch(refreshEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ refreshToken })
                });
            } catch (refreshNetworkError) {
                console.error("Token refresh network error:", refreshNetworkError);
                return response;
            }

            if (!refreshRes.ok) {
                try {
                    await EncryptedStorage.removeItem(accessTokenKey);
                    await EncryptedStorage.removeItem(refreshTokenKey);
                } catch { }
                router.replace('/login');
                return response;
            }

            const { accessToken, refreshToken: newRefreshToken } = await refreshRes.json();

            try {
                await EncryptedStorage.setItem(accessTokenKey, accessToken);
                await EncryptedStorage.setItem(refreshTokenKey, newRefreshToken);
            } catch (storageError) {
                console.warn("Failed to save refreshed tokens:", storageError);
            }

            headers.set("Authorization", `Bearer ${accessToken}`);

            try {
                response = await fetch(input, { ...init, headers });
            } catch (retryNetworkError) {
                console.error("Retry request failed after token refresh:", retryNetworkError);
                return new Response(JSON.stringify({ message: "Network request failed after token refresh." }), {
                    status: 0,
                    statusText: "Network Error",
                    headers: { "Content-Type": "application/json" },
                });
            }
        }

        return response;
    } catch (unexpectedError) {
        console.error("Unexpected error in apiFetch:", unexpectedError);
        return new Response(JSON.stringify({ message: "An unexpected error occurred." }), {
            status: 0,
            statusText: "Unexpected Error",
            headers: { "Content-Type": "application/json" },
        });

    }
};