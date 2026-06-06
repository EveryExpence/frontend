import React from "react";
import { View, Text } from "react-native";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CategoryGroup } from "@/hooks/use-spending-insights";
import { ExpenseRow } from "./ExpenseRow";

interface CategorySectionProps {
    group: CategoryGroup;
}

export function CategorySection({ group }: CategorySectionProps) {
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
