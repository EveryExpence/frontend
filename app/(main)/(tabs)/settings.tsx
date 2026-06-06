import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/authContext";
import SettingsProfileRow from "@/components/settings/SettingsProfileRow";
import SettingsPreferenceRow from "@/components/settings/SettingsPreferenceRow";
import SettingsToggleRow from "@/components/settings/SettingsToggleRow";
import SettingsActionRow from "@/components/settings/SettingsActionRow";
import Topbar from "@/components/Topbar";
import { useTheme } from "@/context/themeContext";
import { scheduleDailyReminder, cancelDailyReminder, checkNotificationStatus } from "@/utils/notifications";

type Language = "eng" | "pl";

const Divider = () => <View className="h-px bg-theme-icon opacity-20 mx-6" />;

const SettingsScreen = () => {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [currentLanguage, setLanguage] = useState<Language>("eng");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      const isEnabled = await checkNotificationStatus();
      setNotificationsEnabled(isEnabled);
    })();
  }, []);

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
            userName={user === null ? "Not logged in" : (user.publicUsername ?? "User")}
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
            currentValue={theme === "light" ? "Light" : "Dark"}
            onPress={toggleTheme}
          />
        </View>

        <View className="h-2.5 bg-theme-background" />

        <Text className="text-2xl font-bold text-theme-text" selectable={false}>
          Notifications
        </Text>
        <View className="rounded-md overflow-hidden bg-theme-surface">
          <SettingsToggleRow
            title="Daily Reminders"
            iconName="notifications-outline"
            isEnabled={notificationsEnabled}
            onToggle={async () => {
              if (notificationsEnabled) {
                await cancelDailyReminder();
                setNotificationsEnabled(false);
              } else {
                const success = await scheduleDailyReminder();
                setNotificationsEnabled(success);
              }
            }}
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
