import { View, Text, Dimensions } from "react-native";
import { formatCurrency } from "@/utils/formatCurrency";
import React from "react";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

interface TotalBalancePageProps {
  totalsByCurrency: Record<string, number>;
}

export const TotalBalancePage: React.FC<TotalBalancePageProps> = ({
  totalsByCurrency,
}) => {
  const { t } = useTranslation();

  return (
    <View style={{ width, padding: 24 }}>
      <Text className="text-4xl mb-6 mt-8 text-center text-theme-text">
        {t("dashboard.total_balance")}
      </Text>
      {Object.keys(totalsByCurrency).length === 0 ? (
        <Text className="text-theme-text text-center">{t("dashboard.no_accounts")}</Text>
      ) : (
        Object.entries(totalsByCurrency).map(([currency, value]) => (
          <Text
            key={currency}
            className="text-6xl mt-4 text-center text-theme-text"
          >
            {formatCurrency(value, currency)}
          </Text>
        ))
      )}
    </View>
  );
};
