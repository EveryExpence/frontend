import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/authContext";
import SettingsProfileRow from "@/components/settings/SettingsProfileRow";
import SettingsPreferenceRow from "@/components/settings/SettingsPreferenceRow";
import SettingsToggleRow from "@/components/settings/SettingsToggleRow";
import SettingsActionRow from "@/components/settings/SettingsActionRow";
import Topbar from "@/components/Topbar";
import { useTheme } from "@/context/themeContext";
import Toast from 'react-native-toast-message';
import { scheduleDailyReminder, cancelDailyReminder, checkNotificationStatus } from "@/utils/notifications";
import { useTranslation } from "react-i18next";
import CustomModal from "@/components/Modal";

const Divider = () => <View className="h-px bg-theme-icon opacity-20 mx-6" />;

const SettingsScreen = () => {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    (async () => {
      const isEnabled = await checkNotificationStatus();
      setNotificationsEnabled(isEnabled);
    })();
  }, []);
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error: any) {
      Toast.show({ text1: t('auth.logout_failed'), text2: error?.message, type: "error" });
    } finally {
      router.replace("/(auth)/login");
    }
  };

  const currentLanguageName = () => {
    switch (i18n.language) {
      case "pl": return t("settings.polish");
      case "be": return t("settings.belarusian");
      default: return t("settings.english");
    }
  };

  const changeLanguage = async (lng: string) => {
    await i18n.changeLanguage(lng);
    setIsLanguageModalVisible(false);
    
    if (notificationsEnabled) {
      const newT = i18n.getFixedT(lng);
      await scheduleDailyReminder(
        newT("settings.reminder_title"), 
        newT("settings.reminder_body")
      );
    }
  };

  return (
    <SafeAreaView>
      <Topbar title={t("settings.title")} />
      <ScrollView className="px-4">
        <Text className="text-2xl font-bold text-theme-text" selectable={false}>
          {t("settings.profile")}
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
          {t("settings.appearance")}
        </Text>
        <View className="rounded-md overflow-hidden bg-theme-surface">
          <SettingsPreferenceRow
            title={t("settings.language")}
            iconName="language-outline"
            currentValue={currentLanguageName()}
            onPress={() => setIsLanguageModalVisible(true)}
          />
          <Divider />
          <SettingsPreferenceRow
            title={t("settings.dark_mode")}
            iconName="contrast-outline"
            currentValue={theme === "light" ? "Light" : "Dark"}
            onPress={toggleTheme}
          />
        </View>

        <View className="h-2.5 bg-theme-background" />

        <Text className="text-2xl font-bold text-theme-text" selectable={false}>
          {t("settings.notifications")}
        </Text>
        <View className="rounded-md overflow-hidden bg-theme-surface">
          <SettingsToggleRow
            title={t("settings.daily_reminders")}
            iconName="notifications-outline"
            isEnabled={notificationsEnabled}
            onToggle={async () => {
              if (notificationsEnabled) {
                await cancelDailyReminder();
                setNotificationsEnabled(false);
              } else {
                const title = t("settings.reminder_title");
                const body = t("settings.reminder_body");
                const success = await scheduleDailyReminder(title, body);
                setNotificationsEnabled(success);
              }
            }}
          />
        </View>

        {user ? (
          <>
            <View className="h-2.5 bg-theme-background" />

            <Text className="text-2xl font-bold text-theme-text" selectable={false}>
              {t("settings.security")}
            </Text>
            <View className="rounded-md overflow-hidden bg-theme-surface">
              <SettingsActionRow
                title={t("settings.change_password")}
                iconName="lock-closed-outline"
                showChevron
                onPress={() => router.push("/change-password")}
              />
              <Divider />
              <SettingsActionRow
                title={t("settings.logout")}
                iconName="log-out-outline"
                tone="danger"
                onPress={handleLogout}
              />
            </View>
          </>
        ) : null}
      </ScrollView>

      <CustomModal
        isVisible={isLanguageModalVisible}
        setIsVisible={setIsLanguageModalVisible}
        title={t("settings.select_language")}
        cancelAction={
          <TouchableOpacity onPress={() => setIsLanguageModalVisible(false)}>
            <Text className="text-xl text-theme-text">{t("common.cancel")}</Text>
          </TouchableOpacity>
        }
        confirmAction={null}
      >
        <View className="w-full gap-4">
          <TouchableOpacity 
            onPress={() => changeLanguage("en")}
            className={`p-4 rounded-md ${i18n.language === "en" ? "bg-theme-tint" : "bg-theme-surface"}`}
          >
            <Text className={`text-xl ${i18n.language === "en" ? "text-theme-textLight" : "text-theme-text"}`}>
              {t("settings.english")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => changeLanguage("pl")}
            className={`p-4 rounded-md ${i18n.language === "pl" ? "bg-theme-tint" : "bg-theme-surface"}`}
          >
            <Text className={`text-xl ${i18n.language === "pl" ? "text-theme-textLight" : "text-theme-text"}`}>
              {t("settings.polish")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => changeLanguage("be")}
            className={`p-4 rounded-md ${i18n.language === "be" ? "bg-theme-tint" : "bg-theme-surface"}`}
          >
            <Text className={`text-xl ${i18n.language === "be" ? "text-theme-textLight" : "text-theme-text"}`}>
              {t("settings.belarusian")}
            </Text>
          </TouchableOpacity>
        </View>
      </CustomModal>
    </SafeAreaView>
  );
};

export default SettingsScreen;
