import React from "react";
import { View, Text, useColorScheme } from "react-native";
import { DashboardWidgetCard } from "./DashboardWidgetCard";
import { useBalanceTrend } from "@/hooks/use-balance-trend";
import { BalanceDataPoint } from "@/utils/trendCalculations";
import { CartesianChart, Line, Area } from "victory-native";
import { Colors } from "@/constants/theme";
import { formatCurrency } from "@/utils/formatCurrency";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { matchFont, DashPathEffect } from "@shopify/react-native-skia";
import { useRouter } from "expo-router";

export const BalanceTrendWidget: React.FC<{ onShowMore?: () => void }> = ({
  onShowMore,
}) => {
  const router = useRouter();
  const { data, percentageChange, currency, loading, error } = useBalanceTrend();
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];

  const isPositive = percentageChange >= 0;
  
  const font = matchFont({
    fontFamily: "sans-serif",
    fontSize: 12,
    fontWeight: "normal",
  });

  return (
    <DashboardWidgetCard
      title="Balance Trend"
      actionLabel="Show More"
      onActionPress={() => router.push("/balance-trend")}
    >
      <View className="flex-row items-center">
        <Text
          className={`text-[20px] font-bold ${isPositive ? "text-[#208c05]" : "text-red-600"}`}
        >
          {isPositive ? "+" : "-"}
          {Math.abs(percentageChange).toFixed(0)}%
        </Text>
        <Text className="ml-2 text-[18px] text-theme-text opacity-80">
          vs previous period
        </Text>
      </View>

      <View style={{ height: 200, width: "100%", marginTop: 16 }}>
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-theme-text">Loading...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-red-500">{error}</Text>
          </View>
        ) : data.length > 0 ? (
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
          <View className="flex-1 items-center justify-center">
            <Text className="text-theme-text">No data available</Text>
          </View>
        )}
      </View>
    </DashboardWidgetCard>
  );
};

export default BalanceTrendWidget;
