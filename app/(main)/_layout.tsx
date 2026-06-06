import { Colors } from "@/constants/theme";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function MainLayout() {
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="records" />
      <Stack.Screen name="spending-insights" />
      <Stack.Screen name="balance-trend" />
      <Stack.Screen name="(settings)/change-password" />
      <Stack.Screen name="(settings)/profile" />
    </Stack>
  );
}