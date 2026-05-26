import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";
import Topbar from "@/components/Topbar";
import AccountsSectionTabs from "@/components/accounts/AccountsSectionTabs";

export default function PaymentsScreen() {
	return (
		<SafeAreaView className="flex-1 bg-theme-background">
			<Topbar title="Payment Methods" />
			<View className="px-4 pt-2">
				<AccountsSectionTabs />
			</View>
			<View className="flex-1 items-center justify-center px-4">
				<Text className="text-lg text-theme-icon text-center">
					Payment methods page
				</Text>
			</View>
		</SafeAreaView>
	);
}
