import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { createPaymentMethod, deletePaymentMethod, getAllPaymentMethods, updatePaymentMethod } from '@/data/paymentMethods';
import Topbar from '@/components/Topbar';
import AccountsSectionTabs from '@/components/accounts/AccountsSectionTabs';
import PaymentMethodCard, { PaymentMethodCardItem } from '@/components/payments/PaymentMethodCard';
import PaymentMethodFormModal, { PaymentMethodFormData } from '@/components/payments/PaymentMethodFormModal';
import DeletePaymentMethodModal from '@/components/payments/DeletePaymentMethodModal';
import { useSync } from '@/context/syncContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/themeContext';

export default function PaymentsScreen() {
	const { t } = useTranslation();
	const { triggerSync } = useSync();
	const db = useSQLiteContext();
	const { theme } = useTheme();
	const colors = Colors[theme];

	const [paymentMethods, setPaymentMethods] = useState<PaymentMethodCardItem[]>([]);
	const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethodCardItem | null>(null);
	const [deletingPaymentMethod, setDeletingPaymentMethod] = useState<PaymentMethodCardItem | null>(null);

	const [isLoading, setIsLoading] = useState(true);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const loadPaymentMethods = useCallback(async () => {
		setIsLoading(true);
		try {
			const data = await getAllPaymentMethods(db);
			setPaymentMethods(
				data.map((paymentMethod) => ({
					id: paymentMethod.id,
					name: paymentMethod.name,
					icon: paymentMethod.icon,
				}))
			);
		} catch (e) {
			setPaymentMethods([]);
			Toast.show({ text1: `${t("payments.load_failed")}: ${e}`, type: 'error' });
		} finally {
			setIsLoading(false);
		}
	}, [db]);

	useFocusEffect(
		useCallback(() => {
			loadPaymentMethods();
		}, [loadPaymentMethods])
	);

	const openAdd = () => {
		setEditingPaymentMethod(null);
		setIsFormOpen(true);
	};

	const openEdit = (item: PaymentMethodCardItem) => {
		setEditingPaymentMethod(item);
		setIsFormOpen(true);
	};

	const openDelete = (item: PaymentMethodCardItem) => {
		setDeletingPaymentMethod(item);
		setIsDeleteOpen(true);
	};

	const handleSave = async (data: PaymentMethodFormData) => {
		try {
			if (editingPaymentMethod) {
				await updatePaymentMethod(db, editingPaymentMethod.id, data);
				Toast.show({ text1: t("payments.update_success"), type: 'success' });
			} else {
				await createPaymentMethod(db, data);
			Toast.show({ text1: t("payments.create_success"), type: 'success' });
			}
			setIsFormOpen(false);
			await loadPaymentMethods();
			triggerSync();
		} catch (e) {
			Toast.show({ text1: `${e}`, type: 'error' });
		}
	};

	const handleDelete = async () => {
		if (!deletingPaymentMethod) return;

		setIsDeleting(true);
		try {
			await deletePaymentMethod(db, deletingPaymentMethod.id);
			Toast.show({ text1: t("payments.delete_success"), type: 'success' });
			setIsDeleteOpen(false);
			setDeletingPaymentMethod(null);
			await loadPaymentMethods();
			triggerSync();
		} catch (e) {
			Toast.show({ text1: `${e}`, type: 'error' });
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-transparent">
			<Topbar title={t("tabs.payments")} />
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
						data={paymentMethods}
						keyExtractor={(item) => item.id}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ paddingBottom: 24 }}
						ListEmptyComponent={<Text className="pt-4 text-lg text-theme-icon mb-4">{t("payments.no_payments")}</Text>}
						renderItem={({ item, index }) => (
							<PaymentMethodCard
								item={item}
								index={index}
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
									<Text className="text-xl font-semibold text-theme-textLight">{t("payments.add_new")}</Text>
								</TouchableOpacity>
								<View className="py-20" />
							</View>
						}
					/>
				)}
			</View>

			<PaymentMethodFormModal
				visible={isFormOpen}
				editingPaymentMethod={editingPaymentMethod}
				onClose={() => setIsFormOpen(false)}
				onSave={handleSave}
			/>

			<DeletePaymentMethodModal
				visible={isDeleteOpen}
				name={deletingPaymentMethod?.name}
				isDeleting={isDeleting}
				onClose={() => setIsDeleteOpen(false)}
				onConfirm={handleDelete}
			/>
		</SafeAreaView>
	);
}