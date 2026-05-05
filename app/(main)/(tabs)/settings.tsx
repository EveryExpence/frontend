import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getUserData, useAuth } from "@/context/authContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { AppTheme, Language, SettingsRowProps, SettingsSection } from "@/types/settings";
import EncryptedStorage from "react-native-encrypted-storage";
import { accessTokenKey } from "@/constants/encryptedStorageKeys";

const SettingsRow = ({
  title,
  subtitle,
  iconName,
  leftElement,
  rightElement,
  tone,
  onPress,
}: SettingsRowProps) => {
  const titleColor = useThemeColor({}, tone === "danger" ? "error" : "text");
  const iconColor = useThemeColor({}, tone === "danger" ? "error" : "icon");

  const resolvedLeft =
    leftElement ?? (
      <View style={{ marginRight: 12 }}>
        <Ionicons name={iconName as undefined} size={30} color={iconColor} />
      </View>
    );

  const subtitleELement = subtitle ? (
    <Text selectable={false} className="text-base mt-1 font-semibold text-theme-icon">
      {subtitle}
    </Text>
  ) : null;

  const rightElementValid = rightElement ? <View className="flex-row items-center">{rightElement}</View> : null;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="h-[75px] flex-row items-center px-3 justify-between bg-theme-surface"
      onPress={onPress}
      disabled={!onPress}
    >
      <View className="flex-row items-center">
        {resolvedLeft}

        <View>
          <Text selectable={false} className="text-xl font-bold" style={{ color: titleColor }}>
            {title}
          </Text>

          {subtitleELement}
        </View>
      </View>

      {rightElementValid}
    </TouchableOpacity>
  );
};

const SettingsScreen = () => {
  const router = useRouter();
  const { logout, user } = useAuth();
  const iconColor = useThemeColor({}, "icon");

  const [currentLanguage, setLanguage] = useState<Language>("eng");
  const [currentTheme, setTheme] = useState<AppTheme>("light");
  const [currentNotifications, setNotifications] = useState(true);

  const chevron = <Ionicons name="chevron-forward" size={28} color={iconColor} />;

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.replace("/(auth)/login");
    }
  };

  const sections: SettingsSection[] = [
    {
      title: "Account",
      items: [
        {
          id: "profile",
          title: user?.publicUsername ?? "User",
          subtitle: user?.email ?? "",
          leftElement: (
            <View
              className="w-14 h-14 rounded-full mr-3 items-center justify-center overflow-hidden bg-theme-surface"
            >
              <Ionicons name="person-outline" size={40} color={iconColor} />
            </View>
          ),
          rightElement: chevron,
          onPress: () => router.push("/profile"),
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          id: "language",
          title: "Language",
          iconName: "language-outline",
          rightElement: (
            <React.Fragment>
              <Text selectable={false} className="text-xl font-semibold text-theme-icon">
                {currentLanguage === "eng" ? "English" : "Polish"}
              </Text>
              {chevron}
            </React.Fragment>
          ),
          onPress: () => setLanguage((prev) => (prev === "eng" ? "pl" : "eng")),
        },
        {
          id: "theme",
          title: "Theme",
          iconName: "contrast-outline",
          rightElement: (
            <React.Fragment>
              <Text selectable={false} className="text-xl font-semibold text-theme-icon">
                {currentTheme === "light" ? "Light" : "Dark"}
              </Text>
              {chevron}
            </React.Fragment>
          ),
          onPress: () => setTheme((prev) => (prev === "light" ? "dark" : "light")),
        },
      ],
    },
    {
      title: "Notifications",
      items: [
        {
          id: "push-notifications",
          title: "Push Notifications",
          iconName: "notifications-outline",
          rightElement: (
            <View
              className={`w-12 h-6 rounded-full p-0.5 justify-center ${
                currentNotifications ? "bg-theme-tint" : "bg-theme-icon"
              }`}
            >
              <View
                className={`w-6 h-5 rounded-full bg-theme-textLight ${
                  currentNotifications ? "self-end" : "self-start"
                }`}
              />
            </View>
          ),
          onPress: () => setNotifications((prev) => !prev),
        },
      ],
    },
    {
      title: "Security",
      items: [
        {
          id: "change-password",
          title: "Change Password",
          iconName: "lock-closed-outline",
          rightElement: chevron,
          onPress: () => router.push("/change-password"),
        },
        {
          id: "logout",
          title: "Log Out",
          iconName: "log-out-outline",
          tone: "danger",
          onPress: handleLogout,
        },
      ],
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-theme-background">
      <ScrollView className="mt-[25px]">
        {sections.map((section) => (
          <View key={section.title}>
            <Text className="text-2xl font-bold pl-4 text-theme-text" selectable={false}>
              {section.title}
            </Text>

            <View className="mx-4 rounded-md overflow-hidden bg-theme-surface">
              {section.items.map((item, index) => (
                <React.Fragment key={item.id}>
                  <SettingsRow
                    title={item.title}
                    subtitle={item.subtitle}
                    iconName={item.iconName}
                    leftElement={item.leftElement}
                    rightElement={item.rightElement}
                    tone={item.tone}
                    onPress={item.onPress}
                  />
                  {index < section.items.length - 1 ? (
                    <View
                      className="h-px bg-theme-icon opacity-20 mx-6"
                    />
                  ) : null}
                </React.Fragment>
              ))}
            </View>

            <View className="h-2.5 bg-theme-background" />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
