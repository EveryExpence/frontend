import React from "react";
import { View, Text, Dimensions } from "react-native";
import { formatCurrency } from "@/utils/formatCurrency";
import { Account } from "@/types/data/account";
import { useAutoFitText } from "@/hooks/useAutoFitText";

const { width } = Dimensions.get("window");
const MAX_BALANCE_FONT_SIZE = 60;
const MAX_TITLE_FONT_SIZE = 36;

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

export type AccountWithComputed = Account & { computedBalance: number };

interface AccountPageProps {
  account: AccountWithComputed;
}

export const AccountPage: React.FC<AccountPageProps> = ({ account }) => {
  return (
    <View style={{ width, paddingHorizontal: 24, paddingVertical: 24 }}>
      <AutoFitText
        text={account.name}
        maxFontSize={MAX_TITLE_FONT_SIZE}
        className="mb-6 mt-8 text-center text-theme-text"
      />
      <AutoFitText
        text={formatCurrency(
          account.computedBalance ?? account.balance,
          account.currency,
        )}
        maxFontSize={MAX_BALANCE_FONT_SIZE}
        className="mt-4 text-center text-theme-text"
      />
    </View>
  );
};
