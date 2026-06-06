import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import {
  useBalanceTrendDetails,
  BalanceDataPoint,
} from "@/hooks/use-balance-trend-details";
import { useFocusEffect } from "expo-router";
import { CartesianChart, Line, Area } from "victory-native";
import { DateRangePicker } from "@/components/spending-insights/DateRangePicker";
import { matchFont, DashPathEffect } from "@shopify/react-native-skia";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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

const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("salary") || n.includes("work") || n.includes("pay"))
    return "briefcase";
  if (n.includes("invest") || n.includes("stock") || n.includes("dividend"))
    return "cash-multiple";
  if (n.includes("return") || n.includes("refund")) return "history";
  if (n.includes("gift")) return "gift";
  if (n.includes("sell") || n.includes("sale")) return "tag-outline";
  if (
    n.includes("food") ||
    n.includes("rest") ||
    n.includes("eat") ||
    n.includes("grocery")
  )
    return "food";
  if (
    n.includes("transport") ||
    n.includes("car") ||
    n.includes("bus") ||
    n.includes("taxi") ||
    n.includes("fuel")
  )
    return "bus";
  if (n.includes("shop") || n.includes("cloth") || n.includes("buy"))
    return "cart";
  if (
    n.includes("bill") ||
    n.includes("rent") ||
    n.includes("utilit") ||
    n.includes("tax")
  )
    return "file-document";
  if (n.includes("health") || n.includes("pharm") || n.includes("doctor"))
    return "medical-bag";
  if (
    n.includes("fun") ||
    n.includes("entert") ||
    n.includes("game") ||
    n.includes("movie")
  )
    return "controller-classic";
  if (n.includes("edu") || n.includes("school") || n.includes("book"))
    return "school";
  if (n.includes("home") || n.includes("house") || n.includes("furnit"))
    return "home";

  return "label-outline";
};

const BalanceTrendDetailsScreen: React.FC = () => {
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];
  const defaults = getDefaultDateRange();

  const [startDate, setStartDate] = useState<Date>(defaults.start);
  const [endDate, setEndDate] = useState<Date>(defaults.end);

  const {
    data,
    percentageChange,
    incomeSources,
    spendingSources,
    loading,
    error,
    refetch,
  } = useBalanceTrendDetails(startDate, endDate);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const font = matchFont({
    fontFamily: "sans-serif",
    fontSize: 12,
    fontWeight: "normal",
  });

  const isPositive = percentageChange >= 0;

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
          Spending Insights
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

        {loading && data.length === 0 ? (
          <View className="items-center py-10">
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        ) : error ? (
          <View className="py-4">
            <Text className="text-theme-error text-center">{error}</Text>
          </View>
        ) : (
          <>
            <View className="flex-row items-center mb-4">
              <Text
                className={`text-[28px] font-bold ${isPositive ? "text-[#208c05]" : "text-red-600"}`}
              >
                {isPositive ? "+" : "-"}
                {Math.abs(percentageChange).toFixed(0)}%
              </Text>
              <Text className="ml-3 text-[24px] text-theme-text opacity-80">
                vs previous period
              </Text>
            </View>

            <View style={{ height: 250, width: "100%", marginBottom: 30 }}>
              {data.length > 0 ? (
                <CartesianChart<BalanceDataPoint, "day", "balance">
                  data={data}
                  xKey="day"
                  yKeys={["balance"]}
                  xAxis={{
                    font,
                    labelColor: colors.text,
                    lineColor: colors.text + "15",
                  }}
                  yAxis={[
                    {
                      font,
                      labelColor: colors.text,
                      lineColor: colors.text + "15",
                      linePathEffect: <DashPathEffect intervals={[4, 4]} />,
                    },
                  ]}
                >
                  {({ points, chartBounds }) => (
                    <>
                      <Area
                        points={points.balance}
                        y0={chartBounds.bottom}
                        color={colors.tint}
                        opacity={0.15}
                        animate={{ type: "timing", duration: 500 }}
                      />
                      <Line
                        points={points.balance}
                        color={colors.tint}
                        strokeWidth={2}
                        animate={{ type: "timing", duration: 500 }}
                      />
                    </>
                  )}
                </CartesianChart>
              ) : (
                <View className="flex-1 items-center justify-center bg-theme-surface rounded-xl">
                  <Text className="text-theme-text opacity-60">
                    No data for this period
                  </Text>
                </View>
              )}
            </View>

            <View className="bg-theme-surface rounded-xl p-4">
              <Text className="text-[24px] font-bold text-theme-text mb-4">
                Major sources of income
              </Text>

              {incomeSources.length === 0 ? (
                <Text className="text-theme-text opacity-60 italic">
                  No income records found for this period.
                </Text>
              ) : (
                incomeSources.map((source, index) => (
                  <View
                    key={source.categoryId}
                    className={`flex-row items-center justify-between py-3 ${index < incomeSources.length - 1 ? "border-b border-black/5" : ""}`}
                  >
                    <View className="flex-row items-center flex-1">
                      <View className="h-11 w-11 items-center justify-center rounded-full bg-theme-tint">
                        <MaterialCommunityIcons
                          name={getCategoryIcon(source.categoryName)}
                          size={20}
                          color={colors.textLight}
                        />
                      </View>
                      <Text
                        className="ml-3 text-[20px] font-medium text-theme-text flex-1"
                        numberOfLines={1}
                      >
                        {source.categoryName}
                      </Text>
                    </View>
                    <Text className="text-[20px] font-bold text-theme-text">
                      +{source.displayAmount}
                    </Text>
                  </View>
                ))
              )}
            </View>

            <View className="bg-theme-surface rounded-xl p-4 mt-6">
              <Text className="text-[24px] font-bold text-theme-text mb-4">
                Major sources of spending
              </Text>

              {spendingSources.length === 0 ? (
                <Text className="text-theme-text opacity-60 italic">
                  No spending records found for this period.
                </Text>
              ) : (
                spendingSources.map((source, index) => (
                  <View
                    key={source.categoryId}
                    className={`flex-row items-center justify-between py-3 ${index < spendingSources.length - 1 ? "border-b border-black/5" : ""}`}
                  >
                    <View className="flex-row items-center flex-1">
                      <View className="h-11 w-11 items-center justify-center rounded-full bg-theme-tint">
                        <MaterialCommunityIcons
                          name={getCategoryIcon(source.categoryName)}
                          size={20}
                          color={colors.textLight}
                        />
                      </View>
                      <Text
                        className="ml-3 text-[20px] font-medium text-theme-text flex-1"
                        numberOfLines={1}
                      >
                        {source.categoryName}
                      </Text>
                    </View>
                    <Text className="text-[20px] font-bold text-theme-text">
                      -{source.displayAmount}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BalanceTrendDetailsScreen;
