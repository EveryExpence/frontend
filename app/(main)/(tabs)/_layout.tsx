import { Colors } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeTabs, Label, Icon, VectorIcon } from "expo-router/unstable-native-tabs";
import { useColorScheme } from "react-native";

export default function TabLayout() {
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];

  return (
    <NativeTabs
      backgroundColor={colors.surface}
      tintColor={colors.tint}
      iconColor={{ default: colors.tabIconDefault, selected: colors.tabIconSelected }}
      labelStyle={{ color: colors.tabIconDefault }}
    >
      <NativeTabs.Trigger name="dashboard">
        <Label>Dashboard</Label>
        <Icon src={<VectorIcon family={MaterialCommunityIcons} name="view-dashboard-outline" />} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="balances">
        <Label>Balances</Label>
        <Icon src={<VectorIcon family={MaterialCommunityIcons} name="wallet-outline" />} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="new-expense">
        <Label>New Expense</Label>
        <Icon src={<VectorIcon family={MaterialCommunityIcons} name="plus-circle-outline" />} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Label>Settings</Label>
        <Icon src={<VectorIcon family={MaterialCommunityIcons} name="cog-outline" />} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
