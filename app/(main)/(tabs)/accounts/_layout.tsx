import { Stack } from 'expo-router';

export default function AccountsNestedLayout() {
	return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }} />;
}