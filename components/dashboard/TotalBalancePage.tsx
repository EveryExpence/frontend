import { View, Text, Dimensions } from "react-native";
import { formatCurrency } from "@/utils/formatCurrency";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAutoFitText } from "@/hooks/useAutoFitText";

const { width } = Dimensions.get("window");
const MAX_BALANCE_FONT_SIZE = 60;
const MAX_TITLE_FONT_SIZE = 36;
const HORIZONTAL_PADDING = 48;

const AutoFitText: React.FC<{
  text: string;
  maxFontSize: number;
  className?: string;
  numberOfLines?: number;
}> = ({ text, maxFontSize, className, numberOfLines }) => {
  const { fontSize, onLayout } = useAutoFitText(text, maxFontSize, {
    weight: "bold",
  });
  return (
    <Text
      onLayout={onLayout}
      numberOfLines={numberOfLines ?? 1}
      allowFontScaling
      style={{ fontSize, lineHeight: fontSize * 1.1 }}
      className={className}
    >
      {text}
    </Text>
  );
};

interface TotalBalancePageProps {
  totalsByCurrency: Record<string, number>;
}

export const TotalBalancePage: React.FC<TotalBalancePageProps> = ({
  totalsByCurrency,
}) => {
  const { t } = useTranslation();

  return (
    <View style={{ width, paddingHorizontal: 24, paddingVertical: 24 }}>
      <AutoFitText
        text={t("dashboard.total_balance")}
        maxFontSize={MAX_TITLE_FONT_SIZE}
        className="mb-6 mt-8 text-center text-theme-text"
      />
      {Object.keys(totalsByCurrency).length === 0 ? (
        <Text className="text-theme-text text-center">
          {t("dashboard.no_accounts")}
        </Text>
      ) : (
        <>
          {Object.entries(totalsByCurrency)
            .slice(0, 3)
            .map(([currency, value]) => (
              <AutoFitText
                key={currency}
                text={formatCurrency(value, currency)}
                maxFontSize={MAX_BALANCE_FONT_SIZE}
                className="mt-4 text-center text-theme-text"
              />
            ))}
          {Object.entries(totalsByCurrency).length > 3 && (
            <Text className="text-2xl mt-4 text-center text-theme-text opacity-70">
              +{Object.entries(totalsByCurrency).length - 3}{" "}
              {t("dashboard.others", "others")}
            </Text>
          )}
        </>
      )}
    </View>
  );
};
