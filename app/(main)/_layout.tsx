import { Stack } from "expo-router";

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
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