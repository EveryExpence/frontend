import { View, Text, Dimensions } from "react-native";
import { formatCurrency } from "@/utils/formatCurrency";
import React from "react";

const { width } = Dimensions.get("window");

interface TotalBalancePageProps {
  totalsByCurrency: Record<string, number>;
}

export const TotalBalancePage: React.FC<TotalBalancePageProps> = ({
  totalsByCurrency,
}) => {
  return (
    <View style={{ width, padding: 24 }}>
      <Text className="text-4xl mb-6 mt-8 text-center text-[#03060D] dark:text-white">
        Total Balance
      </Text>
      {Object.keys(totalsByCurrency).length === 0 ? (
        <Text className="text-[#03060D] dark:text-white">No accounts</Text>
      ) : (
        Object.entries(totalsByCurrency).map(([currency, value]) => (
          <Text
            key={currency}
            className="text-6xl mt-4 text-center text-[#03060D] dark:text-white"
          >
            {formatCurrency(value, currency)}
          </Text>
        ))
      )}
    </View>
  );
};
