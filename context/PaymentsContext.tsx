
import { createPaymentMethodEndpoint, deletePaymentMethodEndpoint, getPaymentMethodEndpoint, getPaymentMethodsEndpoint, patchPaymentMethodEndpoint, } from "@/constants/endpoints";
import { apiFetch } from "@/utils/apiFetch";

import type {
    CreatePaymentMethodRequestDTO,
    PaymentMethodResponseDTO,
    RenamePaymentMethodRequestDTO,
} from "@/types/data/paymentMethod";

async function requestJson<T>(response: Response): Promise<T | null> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail ?? errorData.message ?? errorData.title;
        throw new Error(errorMessage || "Request failed");
    }

    if (response.status === 204) {
        return null;
    }

    return await response.json();
}

export async function createPaymentMethod(accessToken: string, createPaymentMethodRequestDTO: CreatePaymentMethodRequestDTO) {
    const response = await apiFetch(createPaymentMethodEndpoint, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(createPaymentMethodRequestDTO),
    });

    return await requestJson<PaymentMethodResponseDTO>(response);
}

export async function getPaymentMethods(accessToken: string) {
    const response = await apiFetch(getPaymentMethodsEndpoint, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });

    return await requestJson(response);
}

export async function getPaymentMethod(accessToken: string, id: string) {
    const response = await apiFetch(getPaymentMethodEndpoint(id), {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });

    return await requestJson<PaymentMethodResponseDTO>(response);
}

export async function deletePaymentMethod(accessToken: string, id: string) {
    const response = await apiFetch(deletePaymentMethodEndpoint(id), {
        method: "DELETE",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });

    return await requestJson(response);
}

export async function renamePaymentMethod(accessToken: string, id: string, renamePaymentMethodRequestDTO: RenamePaymentMethodRequestDTO) {
    const response = await apiFetch(patchPaymentMethodEndpoint(id), {
        method: "PATCH",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(renamePaymentMethodRequestDTO),
    });

    return await requestJson<PaymentMethodResponseDTO>(response);
}

export async function patchPaymentMethod(accessToken: string, id: string, renamePaymentMethodRequestDTO: RenamePaymentMethodRequestDTO) {
    return await renamePaymentMethod(accessToken, id, renamePaymentMethodRequestDTO);
}