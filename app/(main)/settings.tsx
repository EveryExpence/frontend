import React, { memo, useMemo, useState } from "react";
import { View, Text, SectionList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SETTINGS_SECTIONS } from "@/constants/settingsSections";
import { useAuth } from "@/context/authContext";
import { AppTheme, Language, SettingItem, SettingItemType } from "@/types/settings";

type SettingsItemProps = {
  item: SettingItem;
  isFirst: boolean;
  isLast: boolean;
  onPress: () => void;
  currentLanguage: Language;
  currentTheme: AppTheme;
  currentNotifications: boolean;
};

const SettingsItem = memo(
  ({
    item,
    isFirst,
    isLast,
    onPress,
    currentLanguage,
    currentTheme,
    currentNotifications,
  }: SettingsItemProps) => {
    const cornerStyle =
      isFirst && isLast
        ? "rounded-md"
        : isFirst
        ? "rounded-t-md"
        : isLast
        ? "rounded-b-md"
        : "";

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        className={`h-[80px] bg-[#e3e3ed] mx-4 flex-row items-center px-3 justify-between ${cornerStyle}`}
        onPress={onPress}
      >
        <View className="flex-row items-center">
          {item.type === "profile" ? (
            <View className="w-14 h-14 rounded-full bg-white mr-3 items-center justify-center overflow-hidden">
              <Ionicons
                name={item.icon as any}
                size={40}
                color="#000000"
              />
            </View>
          ) : (
            <View style={{ marginRight: 12 }}>
              <Ionicons
                name={item.icon as any}
                size={30}
                color={item.type === "logout" ? "#dc2626" : "#000000"}
              />
            </View>
          )}
          <View>
            <Text
              className={`text-xl font-bold ${
                item.type === "logout" ? "text-red-600" : "text-black"
              }`}
              selectable={false}
            >
              {item.title}
            </Text>

            {item.type === "profile" && (
              <Text
                className="text-base text-gray-500 mt-1 font-semibold"
                selectable={false}
              >
                {item.subtitle}
              </Text>
            )}
          </View>
        </View>

        <View className="flex-row items-center">
          {(item.type === "profile" || item.type === "password") && (
            <Ionicons name="chevron-forward" size={28} color="#000000" />
          )}

          {item.type === "language" && (
            <React.Fragment>
              <Text
                className="text-xl font-semibold text-gray-400"
                selectable={false}
              >
                {currentLanguage === "eng" ? "English" : "Polish"}
              </Text>

              <Ionicons name="chevron-forward" size={28} color="#000000" />
            </React.Fragment>
          )}

          {item.type === "theme" && (
            <React.Fragment>
              <Text
                className="text-xl font-semibold text-gray-400"
                selectable={false}
              >
                {currentTheme === "light" ? "Light" : "Dark"}
              </Text>

              <Ionicons name="chevron-forward" size={28} color="#000000" />
            </React.Fragment>
          )}

          {item.type === "switch" && (
            <View
              className={`w-12 h-6 rounded-full px-1 justify-center ${
                currentNotifications ? "bg-blue-500" : "bg-gray-400"
              }`}
            >
              <View
                className={`w-6 h-5 rounded-full bg-white ${
                  currentNotifications ? "self-end" : "self-start"
                }`}
              />
            </View>
          )}
        </View>

        {!isLast && (
          <View className="absolute bottom-0 left-6 right-6 h-px bg-[#8e8e98]" />
        )}
      </TouchableOpacity>
    );
  },
);

const SettingsScreen = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [currentLanguage, setLanguage] = useState<Language>("eng");
  const [currentTheme, setTheme] = useState<AppTheme>("light");
  const [currentNotifications, setNotifications] = useState(true);

  const sections = useMemo(
    () =>
      SETTINGS_SECTIONS.map((section) => {
        if (section.title !== "Account") {
          return section;
        }

        return {
          ...section,
          data: section.data.map((item) => {
            if (item.type !== "profile") {
              return item;
            }

            return {
              ...item,
              title: user?.publicUsername ?? user?.email ?? item.title,
              subtitle: user?.email ?? item.subtitle,
            };
          }),
        };
      }),
    [user],
  );

  const handlers: Record<SettingItemType, () => void> = {
    language: () => setLanguage((prev) => (prev === "eng" ? "pl" : "eng")),
    theme: () => setTheme((prev) => (prev === "light" ? "dark" : "light")),
    switch: () => setNotifications((prev) => !prev),
    logout: async () => {
      try {
        await logout();
      } finally {
        router.replace("/(auth)/login");
      }
    },
    password: () => router.push("/change-password"),
    profile: () => router.push("/profile"),
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <SectionList
        style={{ marginTop: 25 }}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <Text className="text-2xl text-black font-bold pl-4" selectable={false}>
            {title}
          </Text>
        )}
        renderItem={({ item, index, section }) => (
          <SettingsItem
            item={item}
            isFirst={index === 0}
            isLast={index === section.data.length - 1}
            onPress={handlers[item.type]}
            currentLanguage={currentLanguage}
            currentTheme={currentTheme}
            currentNotifications={currentNotifications}
          />
        )}
        SectionSeparatorComponent={() => <View style={{ height: 10, backgroundColor: "#ffffff" }} />}
      />
    </SafeAreaView>
  );
};

export default SettingsScreen;
