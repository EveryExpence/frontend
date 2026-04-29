import React, { useState } from "react";
import { View, Text, SectionList, TouchableOpacity, useColorScheme } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from '@/constants/theme';
import { getSettingsSections } from "@/constants/settingsSections";
import { useAuth } from "@/context/authContext";
import { AppTheme, Language, SettingItem } from "@/types/settings";

type ThemeColors = (typeof Colors)[keyof typeof Colors];

type SettingsItemProps = {
  item: SettingItem;
  isFirst: boolean;
  isLast: boolean;
  colors: ThemeColors;
};

const SettingsItem =
  ({
    item,
    isFirst,
    isLast,
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

    const titleColor = item.titleTone === "danger" ? colors.error : colors.text;
    const iconColor = item.iconTone === "danger" ? colors.error : colors.icon;
    
    const leftElement = item.leftElement ?? (
      <View style={{ marginRight: 12 }}>
        <Ionicons name={item.icon as any} size={30} color={iconColor} />
      </View>
    );

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        className={`h-[75px] mx-4 flex-row items-center px-3 justify-between ${cornerStyle}`}
        onPress={item.onPress}
        disabled={!item.onPress}
        style={{ backgroundColor: colors.surface }}
      >
        <View className="flex-row items-center">
          {leftElement}
          <View>
            <Text selectable={false} className="text-xl font-bold" style={{ color: titleColor }}>
              {item.title}
            </Text>

            {item.subtitle && (
              <Text selectable={false} className="text-base mt-1 font-semibold" style={{ color: colors.icon }}>
                {item.subtitle}
              </Text>
            )}
          </View>
        </View>

        {item.rightElement && (
          <View className="flex-row items-center">
            {item.rightElement}
          </View>
        )}

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

  const [currentLanguage, setLanguage] = useState<Language>("eng");
  const [currentTheme, setTheme] = useState<AppTheme>("light");
  const [currentNotifications, setNotifications] = useState(true);

  const chevron = <Ionicons name="chevron-forward" size={28} color={colors.icon} />;

  const itemOverrides: Record<string, Partial<SettingItem>> = {
    profile: {
      onPress: () => router.push("/profile"),
      leftElement: (
        <View className="w-14 h-14 rounded-full mr-3 items-center justify-center overflow-hidden" style={{ backgroundColor: colors.textLight }}>
          <Ionicons name="person-outline" size={40} color={colors.icon} />
        </View>
      ),
      rightElement: chevron,
    },
    language: {
      onPress: () => setLanguage((prev) => (prev === "eng" ? "pl" : "eng")),
      rightElement: (
        <React.Fragment>
          <Text selectable={false} className="text-xl font-semibold" style={{ color: colors.icon }}>
            {currentLanguage === "eng" ? "English" : "Polish"}
          </Text>
          {chevron}
        </React.Fragment>
      ),
    },
    theme: {
      onPress: () => setTheme((prev) => (prev === "light" ? "dark" : "light")),
      rightElement: (
        <React.Fragment>
          <Text selectable={false} className="text-xl font-semibold" style={{ color: colors.icon }}>
            {currentTheme === "light" ? "Light" : "Dark"}
          </Text>
          {chevron}
        </React.Fragment>
      ),
    },
    "push-notifications": {
      onPress: () => setNotifications((prev) => !prev),
      rightElement: (
        <View style={{ width: 48, height: 24, borderRadius: 12, padding: 2, justifyContent: 'center', backgroundColor: currentNotifications ? colors.tint : colors.icon }}>
          <View style={{ width: 24, height: 20, borderRadius: 10, backgroundColor: colors.textLight, alignSelf: currentNotifications ? 'flex-end' : 'flex-start' }} />
        </View>
      ),
    },
    "change-password": {
      onPress: () => router.push("/change-password"),
      rightElement: chevron,
    },
    logout: {
      onPress: async () => {
        try {
          await logout();
        } finally {
          router.replace("/(auth)/login");
        }
      },
      titleTone: "danger",
      iconTone: "danger",
    },
  };

  const sections = getSettingsSections(user?.email).map((section) => ({
    ...section,
    data: section.data.map((item) => ({
      ...item,
      ...itemOverrides[item.id],
    })),
  }));

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
