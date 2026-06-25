import { Stack } from 'expo-router';

export default function AccountsNestedLayout() {
	return <Stack screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: 'transparent' } }} />;
}