import { apiFetch } from "@/utils/apiFetch";
import { updateAvatarEndpoint, updateUserEmailEndpoint, updateUserNameEndpoint } from "@/constants/endpoints";

export async function updateUserEmail(accessToken: string, email: string){
    const response = await apiFetch(updateUserEmailEndpoint, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ email })
    })

    if(!response.ok){
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail ?? errorData.message ?? errorData.title;
        throw new Error(errorMessage || "Request failed");
    }

    if (response.status === 204) {
        return null;
    }

    return await response.json();
}

export async function updateUserName(accessToken: string, name: string){
    const response = await apiFetch(updateUserNameEndpoint, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ newPublicUsername: name })
    })

    if(!response.ok){
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail ?? errorData.message ?? errorData.title;
        throw new Error(errorMessage || "Request failed");
    }

    if (response.status === 204) {
        return null;
    }

    return await response.json();
}

export async function updateUserAvatar(accessToken: string, avatarUrl: string){
    const response = await apiFetch(updateAvatarEndpoint, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ avatarUrl })
    })

    if(!response.ok){
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail ?? errorData.message ?? errorData.title;
        throw new Error(errorMessage || "Request failed");
    }

    if (response.status === 204) {
        return null;
    }

    return await response.json();
}