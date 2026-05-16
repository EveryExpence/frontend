import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/authContext";
import SettingsProfileRow from "@/components/settings/SettingsProfileRow";
import SettingsPreferenceRow from "@/components/settings/SettingsPreferenceRow";
import SettingsToggleRow from "@/components/settings/SettingsToggleRow";
import SettingsActionRow from "@/components/settings/SettingsActionRow";
import Topbar from "@/components/Topbar";

type Language = "eng" | "pl";
type AppTheme = "light" | "dark";

const Divider = () => <View className="h-px bg-theme-icon opacity-20 mx-6" />;

const SettingsScreen = () => {
  const router = useRouter();
  const { logout, user } = useAuth();

  const [currentLanguage, setLanguage] = useState<Language>("eng");
  const [currentTheme, setTheme] = useState<AppTheme>("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.replace("/(auth)/login");
    }
  };

  return (
    <SafeAreaView>
      <Topbar title="Settings" />
      <ScrollView className="px-4">
        <Text className="text-2xl font-bold text-theme-text" selectable={false}>
          Profile
        </Text>
        <View className="rounded-md overflow-hidden bg-theme-surface">
          <SettingsProfileRow
            userName={user?.publicUsername ?? "Not logged in"}
            email={user?.email ?? "Tap to login to access full features"}
            avatarUrl={user?.avatarUrl}
            onPress={() => user ? router.push("/profile") : router.replace("/(auth)/login")}
          />
        </View>

        <View className="h-2.5 bg-theme-background" />

        <Text className="text-2xl font-bold text-theme-text" selectable={false}>
          Preferences
        </Text>
        <View className="rounded-md overflow-hidden bg-theme-surface">
          <SettingsPreferenceRow
            title="Language"
            iconName="language-outline"
            currentValue={currentLanguage === "eng" ? "English" : "Polish"}
            onPress={() => setLanguage((prev) => (prev === "eng" ? "pl" : "eng"))}
          />
          <Divider />
          <SettingsPreferenceRow
            title="Theme"
            iconName="contrast-outline"
            currentValue={currentTheme === "light" ? "Light" : "Dark"}
            onPress={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
          />
        </View>

        <View className="h-2.5 bg-theme-background" />

        <Text className="text-2xl font-bold text-theme-text" selectable={false}>
          Notifications
        </Text>
        <View className="rounded-md overflow-hidden bg-theme-surface">
          <SettingsToggleRow
            title="Push Notifications"
            iconName="notifications-outline"
            isEnabled={notificationsEnabled}
            onToggle={() => setNotificationsEnabled((prev) => !prev)}
          />
        </View>

        {user ? (
          <>
            <View className="h-2.5 bg-theme-background" />

            <Text className="text-2xl font-bold text-theme-text" selectable={false}>
              Security
            </Text>
            <View className="rounded-md overflow-hidden bg-theme-surface">
              <SettingsActionRow
                title="Change Password"
                iconName="lock-closed-outline"
                showChevron
                onPress={() => router.push("/change-password")}
              />
              <Divider />
              <SettingsActionRow
                title="Log Out"
                iconName="log-out-outline"
                tone="danger"
                onPress={handleLogout}
              />
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
