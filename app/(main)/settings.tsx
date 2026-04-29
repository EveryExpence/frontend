import React, { useState } from "react";
import { View, Text, SectionList, TouchableOpacity, useColorScheme } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from '@/constants/theme';
import { getSettingsSections } from "@/constants/settingsSections";
import { useAuth } from "@/context/authContext";
import { AppTheme, Language, SettingItem, SettingItemType } from "@/types/settings";

type ThemeColors = (typeof Colors)[keyof typeof Colors];

type SettingsItemProps = {
  item: SettingItem;
  isFirst: boolean;
  isLast: boolean;
  onPress: () => void;
  currentLanguage: Language;
  currentTheme: AppTheme;
  currentNotifications: boolean;
  colors: ThemeColors;
};

const SettingsItem =
  ({
    item,
    isFirst,
    isLast,
    onPress,
    currentLanguage,
    currentTheme,
    currentNotifications,
    colors,
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
        className={`h-[75px] mx-4 flex-row items-center px-3 justify-between ${cornerStyle}`}
        onPress={onPress}
        style={{ backgroundColor: colors.surface }}
      >
        <View className="flex-row items-center">
          {item.type === "profile" ? (
            <View className="w-14 h-14 rounded-full mr-3 items-center justify-center overflow-hidden" style={{ backgroundColor: colors.textLight }}>
              <Ionicons name={item.icon as any} size={40} color={colors.icon} />
            </View>
          ) : (
            <View style={{ marginRight: 12 }}>
              <Ionicons name={item.icon as any} size={30} color={item.type === "logout" ? colors.error : colors.icon} />
            </View>
          )}
          <View>
            <Text selectable={false} className="text-xl font-bold" style={{ color: item.type === "logout" ? colors.error : colors.text }}>
              {item.title}
            </Text>

            {item.type === "profile" && (
              <Text selectable={false} className="text-base mt-1 font-semibold" style={{ color: colors.icon }}>
                {item.subtitle}
              </Text>
            )}
          </View>
        </View>

        <View className="flex-row items-center">
          {(item.type === "profile" || item.type === "password") && (
            <Ionicons name="chevron-forward" size={28} color={colors.icon} />
          )}

          {item.type === "language" && (
            <React.Fragment>
              <Text selectable={false} className="text-xl font-semibold" style={{ color: colors.icon }}>
                {currentLanguage === "eng" ? "English" : "Polish"}
              </Text>

              <Ionicons name="chevron-forward" size={28} color={colors.icon} />
            </React.Fragment>
          )}

          {item.type === "theme" && (
            <React.Fragment>
              <Text selectable={false} className="text-xl font-semibold" style={{ color: colors.icon }}>
                {currentTheme === "light" ? "Light" : "Dark"}
              </Text>

              <Ionicons name="chevron-forward" size={28} color={colors.icon} />
            </React.Fragment>
          )}

          {item.type === "switch" && (
            <View style={{ width: 48, height: 24, borderRadius: 12, padding: 2, justifyContent: 'center', backgroundColor: currentNotifications ? colors.tint : colors.icon }}>
              <View style={{ width: 24, height: 20, borderRadius: 10, backgroundColor: colors.textLight, alignSelf: currentNotifications ? 'flex-end' : 'flex-start' }} />
            </View>
          )}
        </View>

        {!isLast && (
          <View style={{ position: 'absolute', bottom: 0, left: 24, right: 24, height: 1, backgroundColor: colors.icon, opacity: 0.16 }} />
        )}
      </TouchableOpacity>
    );
}

const SettingsScreen = () => {
  const router = useRouter();
  const { logout, user } = useAuth();
  const insets = useSafeAreaInsets();
  const theme = useColorScheme() || 'light';
  const colors = Colors[theme];

  const sections = getSettingsSections(user?.email);
  const [currentLanguage, setLanguage] = useState<Language>("eng");
  const [currentTheme, setTheme] = useState<AppTheme>("light");
  const [currentNotifications, setNotifications] = useState(true);

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
    <SafeAreaView 
    style={{ flex: 1, backgroundColor: colors.background}}
    >
      <SectionList
        style={{ marginTop: 25 }}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <Text className="text-2xl font-bold pl-4" selectable={false} style={{ color: colors.text }}>
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
            colors={colors}
          />
        )}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        SectionSeparatorComponent={() => <View style={{ height: 10, backgroundColor: colors.background }} />}
      />
    </SafeAreaView>
  );
};

export default SettingsScreen;
