import React from "react";
import { View, Text, useColorScheme } from "react-native";
import { DashboardWidgetCard } from "./DashboardWidgetCard";
import { useBalanceTrend, BalanceDataPoint } from "@/hooks/use-balance-trend";
import { CartesianChart, Line } from "victory-native";
import { Colors } from "@/constants/theme";
import { formatCurrency } from "@/utils/formatCurrency";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const BalanceTrendWidget: React.FC<{ onShowMore?: () => void }> = ({
  onShowMore,
}) => {
  const { data, percentageChange, currency, loading, error } = useBalanceTrend();
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];

  const latestBalance = data.length > 0 ? data[data.length - 1].balance : 0;
  const isPositive = percentageChange >= 0;

  return (
    <DashboardWidgetCard
      title="Balance trend"
      actionLabel="Show more"
      onActionPress={onShowMore}
    >
      <View className="flex-row items-baseline justify-between">
        <View>
          <Text className="text-theme-text text-3xl font-bold">
            {formatCurrency(latestBalance, currency)}
          </Text>
          <Text className="text-theme-text opacity-60 text-sm">
            Total Balance
          </Text>
        </View>
        <View
          className={`flex-row items-center px-2 py-1 rounded-full ${isPositive ? "bg-green-100" : "bg-red-100"}`}
        >
          <MaterialCommunityIcons
            name={isPositive ? "arrow-up" : "arrow-down"}
            size={16}
            color={isPositive ? "#16a34a" : "#dc2626"}
          />
          <Text
            style={{ color: isPositive ? "#16a34a" : "#dc2626" }}
            className="font-semibold ml-1"
          >
            {Math.abs(percentageChange).toFixed(1)}%
          </Text>
        </View>
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
            axisOptions={{
              tickCount: 5,
              labelColor: colors.text,
              lineColor: colors.text + "20",
            }}
          >
            {({ points }) => (
              <Line
                points={points.balance}
                color={colors.tint}
                strokeWidth={3}
                animate={{ type: "timing", duration: 500 }}
              />
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
