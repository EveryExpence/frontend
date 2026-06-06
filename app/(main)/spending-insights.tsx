import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, useColorScheme, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import { useSpendingInsights } from "@/hooks/use-spending-insights";
import { useFocusEffect } from "expo-router";
import { PolarChart, Pie } from "victory-native";
import { DateRangePicker } from "@/components/spending-insights/DateRangePicker";
import { CategorySection } from "@/components/spending-insights/CategorySection";
import { useTranslation } from "react-i18next";

function getDefaultDateRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );
  return { start, end };
}

const SpendingInsightsScreen: React.FC = () => {
  const { t } = useTranslation();
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];
  const defaults = getDefaultDateRange();

  const [startDate, setStartDate] = useState<Date>(defaults.start);
  const [endDate, setEndDate] = useState<Date>(defaults.end);

  const { categoryGroups, chartData, totalDisplayLines, loading, error, refetch } =
    useSpendingInsights(startDate, endDate);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  return (
    <SafeAreaView className="flex-1 bg-theme-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: 40,
        }}
      >
        <Text className="text-[32px] font-bold text-theme-text mb-4">
          {t("dashboard.spending_insights")}
        </Text>

        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          backgroundColor={colors.surface}
          textColor={colors.text}
          iconColor={colors.icon}
        />

        {loading ? (
          <View className="items-center py-10">
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        ) : error ? (
          <View className="py-4">
            <Text className="text-theme-error text-center">{error}</Text>
          </View>
        ) : (
          <>
            <View className="items-center mb-6">
              <View style={{ width: 220, height: 220, position: "relative" }}>
                {chartData.length === 0 ? (
                  <View className="flex-1 items-center justify-center">
                    <Text className="text-theme-text text-[16px]">
                      {t("dashboard.no_expenses")}
                    </Text>
                  </View>
                ) : (
                  <PolarChart<
                    { label: string; value: number; color: string },
                    "label",
                    "value",
                    "color"
                  >
                    data={chartData}
                    labelKey="label"
                    valueKey="value"
                    colorKey="color"
                  >
                    <Pie.Chart innerRadius="75%" />
                  </PolarChart>
                )}

                {chartData.length > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    pointerEvents="none"
                  >
                    <Text className="text-theme-text text-[11px] mb-0.5">
                      {t("common.total")}:
                    </Text>
                    {totalDisplayLines.map((line) => (
                      <Text
                        key={line}
                        className="text-theme-text text-[13px] font-bold"
                      >
                        {line}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {categoryGroups.map((group) => (
              <CategorySection key={group.categoryId} group={group} />
            ))}

            {categoryGroups.length === 0 && !loading && (
              <View className="items-center py-10">
                <Text className="text-theme-text text-[16px]">
                  {t("balance_trend.no_spending")}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SpendingInsightsScreen;
