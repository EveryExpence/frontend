import React, { useState } from "react";
import { View, Text, TouchableOpacity, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from '@/constants/theme';
import { useAuth } from "@/context/authContext";
import { AppTheme, Language } from "@/types/settings";

type SettingsRowProps = {
  title: string;
  subtitle?: string;
  iconName?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  tone?: "danger";
  onPress?: () => void;
  colors: (typeof Colors)[keyof typeof Colors];
};

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
    <View 
    className="mx-4 rounded-md overflow-hidden" 
    style={{ backgroundColor: colors.surface }}>

      <TouchableOpacity
        activeOpacity={0.8}
        className="h-[75px] flex-row items-center px-3 justify-between"
        onPress={onPress}
        disabled={!onPress}
        style={{ backgroundColor: colors.surface }}
      >
        <View 
        className="flex-row items-center">

          {resolvedLeft}

          <View>
            <Text 
            selectable={false} 
            className="text-xl font-bold" 
            style={{ color: titleColor }}>
              {title}
            </Text>

            {subtitleELement}
            
          </View>
        </View>

        {rightElementValid}

      </TouchableOpacity>

    </View>
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

      <View style={{ marginTop: 25 }}>

        <Text 
        className="text-2xl font-bold pl-4" 
        selectable={false} 
        style={{ color: colors.text }}>
          Account
        </Text>

        <SettingsRow
          title="User"
          subtitle={user?.email ?? ""}
          leftElement=
          {
            <View 
            className="w-14 h-14 rounded-full mr-3 items-center justify-center overflow-hidden" 
            style={{ backgroundColor: colors.textLight }}
            >
              <Ionicons 
              name="person-outline" 
              size={40} 
              color={colors.icon} 
              />
            </View>
          }
          rightElement={chevron}
          onPress={() => router.push("/profile")}
          colors={colors}
        />

        <View style={{ height: 10, backgroundColor: colors.background }} />

        <Text 
        className="text-2xl font-bold pl-4" 
        selectable={false} 
        style={{ color: colors.text }}>
          Preferences
        </Text>

        <SettingsRow
            title="Language"
            iconName="language-outline"
            rightElement=
            {
              <React.Fragment>
                <Text 
                selectable={false} 
                className="text-xl font-semibold" 
                style={{ color: colors.icon }}>
                  {currentLanguage === "eng" ? "English" : "Polish"}
                </Text>
                
                {chevron}

              </React.Fragment>
            }
            onPress={() => setLanguage((prev) => (prev === "eng" ? "pl" : "eng"))}
            colors={colors}
          />

          <View style={{ height: 1, backgroundColor: colors.icon, opacity: 0.16, marginLeft: 24, marginRight: 24 }} />

          <SettingsRow
            title="Theme"
            iconName="contrast-outline"
            rightElement=
            {
              <React.Fragment>
                <Text 
                selectable={false} 
                className="text-xl font-semibold" 
                style={{ color: colors.icon }}
                >
                  {currentTheme === "light" ? "Light" : "Dark"}
                </Text>

                {chevron}
                
              </React.Fragment>
            }
            onPress={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
            colors={colors}
          />

        <View style={{ height: 10, backgroundColor: colors.background }} />

        <Text 
        className="text-2xl font-bold pl-4" 
        selectable={false} 
        style={{ color: colors.text }}>
          Notifications
        </Text>

        <SettingsRow
          title="Push Notifications"
          iconName="notifications-outline"
          rightElement=
          {
            <View style={{ width: 48, height: 24, borderRadius: 12, padding: 2, justifyContent: "center", backgroundColor: currentNotifications ? colors.tint : colors.icon }}>
              <View style={{ width: 24, height: 20, borderRadius: 10, backgroundColor: colors.textLight, alignSelf: currentNotifications ? "flex-end" : "flex-start" }} />
            </View>
          }
          onPress={() => setNotifications((prev) => !prev)}
          colors={colors}
        />

        <View style={{ height: 10, backgroundColor: colors.background }} />

        <Text 
        className="text-2xl font-bold pl-4" 
        selectable={false} 
        style={{ color: colors.text }}>
          Security
        </Text>

        <SettingsRow
          title="Change Password"
          iconName="lock-closed-outline"
          rightElement={chevron}
          onPress={() => router.push("/change-password")}
          colors={colors}
        />

        <View style={{ height: 1, backgroundColor: colors.icon, opacity: 0.16, marginLeft: 24, marginRight: 24 }} />

        <SettingsRow
          title="Log Out"
          iconName="log-out-outline"
          tone="danger"
          onPress={handleLogout}
          colors={colors}
        />
        
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;
