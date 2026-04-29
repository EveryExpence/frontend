import React, { useState } from "react";
import { View, Text, TouchableOpacity, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from '@/constants/theme';
import { useAuth } from "@/context/authContext";
import { AppTheme, Language, SettingsRowProps, SettingsSection } from "@/types/settings";

const SettingsRow = ({
  title,
  subtitle,
  iconName,
  leftElement,
  rightElement,
  tone,
  onPress,
  colors,
}: SettingsRowProps) => {
  const titleColor = tone === "danger" ? colors.error : colors.text;
  const iconColor = tone === "danger" ? colors.error : colors.icon;

  const resolvedLeft = leftElement ?? 
  (
    <View style={{ marginRight: 12 }}>
      <Ionicons 
      name={iconName as undefined} 
      size={30} 
      color={iconColor} />
    </View>
  );

  const subtitleELement = subtitle ?
  (
    <Text 
    selectable={false} 
    className="text-base mt-1 font-semibold" 
    style={{ color: colors.icon }}>
      {subtitle}
    </Text>
  ) : null

  const rightElementValid = rightElement ? 
    <View 
    className="flex-row items-center">
      {rightElement}
    </View> : null

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="h-[75px] flex-row items-center px-3 justify-between"
      onPress={onPress}
      disabled={!onPress}
      style={{ backgroundColor: colors.surface }}
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
  
  const theme = useColorScheme() || 'light';
  const colors = Colors[theme];

  const [currentLanguage, setLanguage] = useState<Language>("eng");
  const [currentTheme, setTheme] = useState<AppTheme>("light");
  const [currentNotifications, setNotifications] = useState(true);

  const chevron = <Ionicons name="chevron-forward" size={28} color={colors.icon} />;

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
          title: "User",
          subtitle: user?.email ?? "",
          leftElement: (
            <View className="w-14 h-14 rounded-full mr-3 items-center justify-center overflow-hidden" style={{ backgroundColor: colors.textLight }}>
              <Ionicons name="person-outline" size={40} color={colors.icon} />
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
              <Text selectable={false} className="text-xl font-semibold" style={{ color: colors.icon }}>
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
              <Text selectable={false} className="text-xl font-semibold" style={{ color: colors.icon }}>
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
            <View style={{ width: 48, height: 24, borderRadius: 12, padding: 2, justifyContent: "center", backgroundColor: currentNotifications ? colors.tint : colors.icon }}>
              <View style={{ width: 24, height: 20, borderRadius: 10, backgroundColor: colors.textLight, alignSelf: currentNotifications ? "flex-end" : "flex-start" }} />
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ marginTop: 25 }}>

        {sections.map((section) => (
          <View key={section.title}>

            <Text 
            className="text-2xl font-bold pl-4" 
            selectable={false} 
            style={{ color: colors.text }}
            >
              {section.title}
              
            </Text>


            <View 
            className="mx-4 rounded-md overflow-hidden" 
            style={{ backgroundColor: colors.surface }}
            >
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
                    colors={colors}
                  />
                  {index < section.items.length - 1 ? (
                    <View style={{ height: 1, backgroundColor: colors.icon, opacity: 0.16, marginLeft: 24, marginRight: 24 }} />
                  ) : null}
                </React.Fragment>
              ))}
            </View>

            <View style={{ height: 10, backgroundColor: colors.background }} />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;
