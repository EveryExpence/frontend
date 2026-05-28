import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors } from "@/constants/theme";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  useSpendingInsights,
  CategoryGroup,
  CategoryExpenseItem,
} from "@/hooks/use-spending-insights";
import { useFocusEffect } from "expo-router";

import { PolarChart, Pie } from "victory-native";

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

function formatDateDisplay(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function ExpenseRow({ item }: { item: CategoryExpenseItem }) {
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];

  return (
    <View className="flex-row items-center justify-between py-2.5">
      <View className="flex-row items-center gap-3 flex-1 pr-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-theme-tint">
          <MaterialCommunityIcons
            name="swap-vertical"
            size={20}
            color={colors.textLight}
          />
        </View>
        <Text className="flex-1 text-[16px] text-theme-text" numberOfLines={1}>
          {item.description}
        </Text>
      </View>
      <Text className="text-[16px] text-theme-text font-medium">
        {item.amount.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })}{" "}
        {item.currency}
      </Text>
    </View>
  );
}

function CategorySection({ group }: { group: CategoryGroup }) {
  return (
    <View className="mt-4">
      <View className="flex-row items-center justify-between mb-2 px-1">
        <View className="flex-row items-center">
          <View
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: group.color,
            }}
          />
          <Text className="ml-3 text-[20px] font-semibold text-theme-text">
            {group.categoryName}
          </Text>
        </View>
        <Text className="text-[20px] font-semibold text-theme-text">
          {group.displayAmount}
        </Text>
      </View>

      <Card>
        <CardContent className="px-4 py-2">
          {group.items.map((item, index) => (
            <View key={item.id}>
              <ExpenseRow item={item} />
              {index < group.items.length - 1 ? (
                <Separator className="my-0.5" />
              ) : null}
            </View>
          ))}
        </CardContent>
      </Card>
    </View>
  );
}

const SpendingInsightsScreen: React.FC = () => {
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];
  const defaults = getDefaultDateRange();

  const [startDate, setStartDate] = useState<Date>(defaults.start);
  const [endDate, setEndDate] = useState<Date>(defaults.end);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const { categoryGroups, chartData, totalDisplay, loading, error, refetch } =
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
          Spending Insights
        </Text>

        <View
          className="flex-row items-stretch mb-6"
          style={{
            backgroundColor: colors.surface,
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              paddingHorizontal: 10,
              justifyContent: "center",
              alignItems: "center",
              borderRightWidth: 1,
              borderRightColor: colors.text,
            }}
          >
            <MaterialCommunityIcons
              name="calendar-month"
              size={20}
              color={colors.icon}
            />
          </View>

          <TouchableOpacity
            onPress={() => setShowStartPicker(true)}
            style={{
              flex: 1,
              paddingVertical: 10,
              justifyContent: "center",
              alignItems: "center",
              borderRightWidth: 1,
              borderRightColor: colors.text,
            }}
          >
            <Text
              style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}
            >
              {formatDateDisplay(startDate)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowEndPicker(true)}
            style={{
              flex: 1,
              paddingVertical: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}
            >
              {formatDateDisplay(endDate)}
            </Text>
          </TouchableOpacity>
        </View>

        {showStartPicker && (
          <DateTimePicker
            display="calendar"
            mode="date"
            value={startDate}
            onChange={(event, value) => {
              if (Platform.OS !== "ios") setShowStartPicker(false);
              if (event.type === "dismissed") return;
              if (!value) return;
              setStartDate(value);
            }}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            display="calendar"
            mode="date"
            value={endDate}
            onChange={(event, value) => {
              if (Platform.OS !== "ios") setShowEndPicker(false);
              if (event.type === "dismissed") return;
              if (!value) return;
              const eod = new Date(value);
              eod.setHours(23, 59, 59, 999);
              setEndDate(eod);
            }}
          />
        )}

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
                      No expenses
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
                    <Text className="text-theme-text text-[14px]">Total:</Text>
                    <Text className="text-theme-text text-[20px] font-bold">
                      {totalDisplay}
                    </Text>
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
                  No expenses for selected period
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
