import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SpendingInsightsScreen: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 bg-theme-background">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-[26px] font-semibold text-theme-text">
          Spending Insights
        </Text>
        <Text className="mt-3 text-center text-[16px] text-theme-textLight">
          This page is coming soon.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default SpendingInsightsScreen;
