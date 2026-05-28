import React from "react";
import { View, Text, useColorScheme } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { CategoryExpenseItem } from "@/hooks/use-spending-insights";

interface ExpenseRowProps {
    item: CategoryExpenseItem;
}

export function ExpenseRow({ item }: ExpenseRowProps) {
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
