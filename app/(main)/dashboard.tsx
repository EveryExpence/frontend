import React from "react";
import { useAuth } from "@/context/authContext";
import { TouchableOpacity, Text } from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

const Main = () => {
  const { user, logout } = useAuth();
  const colorScheme: "light" | "dark" = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const onPress = async () => {
    try {
      await logout();
    } catch (error) {
      Toast.show({ text1: `${error}`, type: "error" });
    }
  };

  return (
    <LinearGradient
      colors={[colors.surface, colors.tint]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex flex-1"
    >
      <SafeAreaView className="flex flex-1 justify-center items-center"></SafeAreaView>
    </LinearGradient>
  );
};

export default Main;
