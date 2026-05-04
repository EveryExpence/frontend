import { refreshTokenKey, accessTokenKey } from "@/constants/encryptedStorageKeys";
import { getUserDataEndpoint, loginEndpoint, logoutEndpoint, registerEndpoint } from "@/constants/endpoints";
import { GetUserDataDTO } from "@/types/auth/dto";
import { User } from "@/types/User";
import { apiFetch } from "@/utils/apiFetch";
import { createContext, useContext, useState, useEffect } from "react";
import EncryptedStorage from 'react-native-encrypted-storage';

export interface IAuthContext {
    user: User | null;
    isInitializing: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<IAuthContext>({} as IAuthContext);

export const getUserData = async (accessToken: string): Promise<GetUserDataDTO> => {
    const response = await apiFetch(getUserDataEndpoint, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail ?? errorData.message ?? errorData.title;
        throw errorMessage;
    }

    return await response.json();
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isInitializing, setIsInitializing] = useState<boolean>(true); 
    const [isLoading, setIsLoading] = useState<boolean>(false); 
    
    useEffect(() => {
        const checkSessionOnBoot = async () => {
            try {
                const accessToken = await EncryptedStorage.getItem(accessTokenKey);
                
                if (accessToken) {
                    const userData = await getUserData(accessToken);
                    setUser({ ...userData });
                }
            } catch (error) {
                await EncryptedStorage.removeItem(refreshTokenKey);
                await EncryptedStorage.removeItem(accessTokenKey);
                setUser(null);
            } finally {
                setIsInitializing(false);
            }
        };

        checkSessionOnBoot();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        setUser(null);

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
                const errorMessage = errorData.detail ?? errorData.message ?? errorData.title;
                throw errorMessage;
            }
    
            const { accessToken, refreshToken } = await response.json();
    
            await EncryptedStorage.setItem(refreshTokenKey, refreshToken);
            await EncryptedStorage.setItem(accessTokenKey, accessToken);

            const userData = await getUserData(accessToken);
            setUser({ ...userData });
        } finally {
            setIsLoading(false);
        }
    }

    const logout = async () => {
        setIsLoading(true);
        try {
            const refreshToken = await EncryptedStorage.getItem(refreshTokenKey);
            if (refreshToken === null) {
                return;
            }

            await fetch(logoutEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
            });

            await EncryptedStorage.removeItem(refreshTokenKey);
            await EncryptedStorage.removeItem(accessTokenKey);
            setUser(null);
        } catch (error) {
            await EncryptedStorage.removeItem(refreshTokenKey);
            await EncryptedStorage.removeItem(accessTokenKey);
            setUser(null);
            throw error;
        } finally {
            await EncryptedStorage.removeItem("loggedIn")
            setIsLoading(false);
        }
    };

    const register = async (email: string, password: string) => {
        setIsLoading(true);

        try {
            const response = await fetch(registerEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });
    
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail ?? errorData.message ?? errorData.title;
                throw errorMessage;
            }
        } finally {
            setIsLoading(false);
        }
    }

    return <AuthContext.Provider value={{ user, isInitializing, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
};

export const useAuth = () => {
    return useContext(AuthContext);
}