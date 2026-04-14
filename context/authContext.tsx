import { refreshTokenKey } from "@/constants/encryptedStorageKeys";
import { getUserDataEndpoint, loginEndpoint, logoutEndpoint } from "@/constants/endpoints";
import { GetUserDataDTO } from "@/types/auth/dto";
import { User } from "@/types/User";
import { createContext, useContext, useState } from "react";
import EncryptedStorage from 'react-native-encrypted-storage';

export interface IAuthContext {
    user: User | null;
    login: (email: string, password: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<IAuthContext | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    const getUserData = async (accessToken: string): Promise<GetUserDataDTO> => {
        const response = await fetch(getUserDataEndpoint, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || response.statusText;
            throw new Error(`${errorMessage} (${response.status})`);
        }

        return await response.json();
    }
    
    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(loginEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || response.statusText;
                throw new Error(`${errorMessage} (${response.status})`);
            }

            const { accessToken, refreshToken } = await response.json();

            const userData = await getUserData(accessToken);
            setUser({ ...userData, accessToken });
            
            await EncryptedStorage.setItem(
                refreshTokenKey,
                refreshToken
            );
        } catch (error) {
            console.error(`Failed to login: ${error}`);
        }
    }

    const logout = async () => {
        try {
            const refreshToken = await EncryptedStorage.getItem(refreshTokenKey);
            if (refreshToken === null) {
                return;
            }

            const response = await fetch(logoutEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => {});
                const errorMessage = errorData.message || response.statusText;
                throw new Error(`${errorMessage} (${response.status})`);
            }

            await EncryptedStorage.removeItem(refreshTokenKey);
        } catch (error) {
            console.error(`Failed to logout: ${error}`)
        }
    };

    return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
};

export const useAuth = () => {
    return useContext(AuthContext);
}
