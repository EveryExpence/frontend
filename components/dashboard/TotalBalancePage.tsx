import { View, Text, Dimensions } from "react-native";
import { formatCurrency } from "@/utils/formatCurrency";
import React from "react";

const { width } = Dimensions.get("window");

interface TotalBalancePageProps {
  totalsByCurrency: Record<string, number>;
  textColor: string;
}

export const TotalBalancePage: React.FC<TotalBalancePageProps> = ({
  totalsByCurrency,
  textColor,
}) => {
  return (
    <View style={{ width, padding: 24 }}>
      <Text
        style={{ color: textColor }}
        className="text-4xl mb-6 mt-8 text-center"
      >
        Total Balance
      </Text>
      {Object.keys(totalsByCurrency).length === 0 ? (
        <Text style={{ color: textColor }}>No accounts</Text>
      ) : (
        Object.entries(totalsByCurrency).map(([currency, value]) => (
          <Text
            key={currency}
            style={{ color: textColor }}
            className="text-6xl mt-4 text-center"
          >
            {formatCurrency(value, currency)}
          </Text>
        ))
      )}
    </View>
  );
};
