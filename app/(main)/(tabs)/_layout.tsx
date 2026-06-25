import { Colors } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeTabs, Label, Icon, VectorIcon } from "expo-router/unstable-native-tabs";
import { useTheme } from "@/context/themeContext";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const { t } = useTranslation();

  return (
    <NativeTabs
      backgroundColor={colors.surface}
      tintColor={colors.tint}
      iconColor={{ default: colors.tabIconDefault, selected: colors.tabIconSelected }}
      labelStyle={{ color: colors.tabIconDefault }}
    >
      <NativeTabs.Trigger name="dashboard">
        <Label>{t("tabs.dashboard")}</Label>
        <Icon src={<VectorIcon family={MaterialCommunityIcons} name="view-dashboard-outline" />} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="accounts">
        <Label>{t("tabs.accounts")}</Label>
        <Icon src={<VectorIcon family={MaterialCommunityIcons} name="wallet-outline" />} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="new-expense">
        <Label>{t("tabs.new_expense")}</Label>
        <Icon src={<VectorIcon family={MaterialCommunityIcons} name="plus-circle-outline" />} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Label>{t("tabs.settings")}</Label>
        <Icon src={<VectorIcon family={MaterialCommunityIcons} name="cog-outline" />} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
