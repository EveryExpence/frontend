import { apiFetch } from "@/utils/apiFetch";
import { updateUserEmailEndpoint } from "@/constants/endpoints";

export async function updateUserEmail(accessToken: string, email: string){
    const response = await apiFetch(updateUserEmailEndpoint, {
        method: "PUT",
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

    return await response.json();
}