import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { createCategory, deleteCategory, getAllCategories, updateCategory } from '@/data/categories';
import Topbar from '@/components/Topbar';
import AccountsSectionTabs from '@/components/accounts/AccountsSectionTabs';
import CategoryCard, { CategoryCardItem } from '@/components/categories/CategoryCard';
import CategoryFormModal, { CategoryFormData } from '@/components/categories/CategoryFormModal';
import DeleteCategoryModal from '@/components/categories/DeleteCategoryModal';
import { useSync } from '@/context/syncContext';
import { useTranslation } from 'react-i18next';

export default function CategoriesScreen() {
	const { t } = useTranslation();
	const { triggerSync } = useSync();
	const db = useSQLiteContext();
	const scheme = useColorScheme() ?? 'light';
	const colors = Colors[scheme];

	const [categories, setCategories] = useState<CategoryCardItem[]>([]);
	const [editingCategory, setEditingCategory] = useState<CategoryCardItem | null>(null);
	const [deletingCategory, setDeletingCategory] = useState<CategoryCardItem | null>(null);

	const [isLoading, setIsLoading] = useState(true);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const loadCategories = useCallback(async () => {
		setIsLoading(true);
		try {
			const data = await getAllCategories(db);
			setCategories(
				data.map((category) => ({
					id: category.id,
					name: category.name,
					type: category.type,
				}))
			);
		} catch (e: any) {
			setCategories([]);
			Toast.show({ text1: `${t('categories.load_failed')}: ${e?.message ?? String(e)}`, type: 'error' });
		} finally {
			setIsLoading(false);
		}
	}, [db]);

	useFocusEffect(
		useCallback(() => {
			loadCategories();
		}, [loadCategories])
	);

	const openAdd = () => {
		setEditingCategory(null);
		setIsFormOpen(true);
	};

	const openEdit = (item: CategoryCardItem) => {
		setEditingCategory(item);
		setIsFormOpen(true);
	};

	const openDelete = (item: CategoryCardItem) => {
		setDeletingCategory(item);
		setIsDeleteOpen(true);
	};

	const handleSave = async (data: CategoryFormData) => {
		try {
			if (editingCategory) {
				await updateCategory(db, editingCategory.id, data);
				Toast.show({ text1: t('categories.update_success'), type: 'success' });
			} else {
				await createCategory(db, data);
				Toast.show({ text1: t('categories.create_success'), type: 'success' });
			}
			setIsFormOpen(false);
			await loadCategories();
			triggerSync();
		} catch (e) {
			Toast.show({ text1: `${e}`, type: 'error' });
		}
	};

	const handleDelete = async () => {
		if (!deletingCategory) return;

		setIsDeleting(true);
		try {
			await deleteCategory(db, deletingCategory.id);
			Toast.show({ text1: t('categories.delete_success'), type: 'success' });
			setIsDeleteOpen(false);
			setDeletingCategory(null);
			await loadCategories();
			triggerSync();
		} catch (e) {
			Toast.show({ text1: `${e}`, type: 'error' });
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-theme-background">
			<Topbar title={t("tabs.categories")} />
			<View className="px-4 pt-2">
				<AccountsSectionTabs />
			</View>
			<View className="flex-1 px-4 pt-4">
				{isLoading ? (
					<View className="flex-1 items-center justify-center">
						<ActivityIndicator size={32} color={colors.tint} />
					</View>
				) : (
					<FlatList
						data={categories}
						keyExtractor={(item) => item.id}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ paddingBottom: 24 }}
						ListEmptyComponent={<Text className="pt-4 text-lg text-theme-icon mb-4">{t("categories.no_categories")}</Text>}
						renderItem={({ item }) => (
							<CategoryCard
								item={item}
								onEdit={() => openEdit(item)}
								onDelete={() => openDelete(item)}
							/>
						)}
						ListFooterComponent={
							<View>
								<TouchableOpacity
									activeOpacity={0.85}
									className="w-full flex-row items-center justify-center py-4 bg-theme-tint rounded-lg mt-4"
									onPress={openAdd}
								>
									<MaterialCommunityIcons name="plus" size={22} color={colors.textLight} style={{ marginRight: 8 }} />
									<Text className="text-xl font-semibold text-theme-textLight">{t("categories.add_new")}</Text>
								</TouchableOpacity>
								<View className="py-20" />
							</View>
						}
					/>
				)}
			</View>

			<CategoryFormModal
				visible={isFormOpen}
				editingCategory={editingCategory}
				onClose={() => setIsFormOpen(false)}
				onSave={handleSave}
			/>

			<DeleteCategoryModal
				visible={isDeleteOpen}
				name={deletingCategory?.name}
				isDeleting={isDeleting}
				onClose={() => setIsDeleteOpen(false)}
				onConfirm={handleDelete}
			/>
		</SafeAreaView>
	);
}