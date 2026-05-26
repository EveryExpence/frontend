import {
	createCategoryEndpoint,
	deleteCategoryEndpoint,
	getCategoryEndpoint,
	putCategoryEndpoint,
} from "@/constants/endpoints";
import { apiFetch } from "@/utils/apiFetch";

import type { Category, CategoryInputDTO } from "@/types/data/category";

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

export async function createCategory(accessToken: string, categoryDTO: CategoryInputDTO) {
	const response = await apiFetch(createCategoryEndpoint, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify(categoryDTO),
	});

	return await requestJson<Category>(response);
}

export async function getCategories(accessToken: string, type?: string) {
	const url = type && type.trim().length > 0
		? `${getCategoryEndpoint}?type=${encodeURIComponent(type)}`
		: getCategoryEndpoint;

	const response = await apiFetch(url, {
		method: "GET",
		headers: {
			Accept: "application/json",
			Authorization: `Bearer ${accessToken}`,
		},
	});

	return await requestJson<Category[]>(response);
}

export async function updateCategory(accessToken: string, id: string, categoryDTO: CategoryInputDTO) {
	const response = await apiFetch(putCategoryEndpoint(id), {
		method: "PUT",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify(categoryDTO),
	});

	return await requestJson<Category>(response);
}

export async function deleteCategory(accessToken: string, id: string) {
	const response = await apiFetch(deleteCategoryEndpoint(id), {
		method: "DELETE",
		headers: {
			Accept: "application/json",
			Authorization: `Bearer ${accessToken}`,
		},
	});

	return await requestJson(response);
}

