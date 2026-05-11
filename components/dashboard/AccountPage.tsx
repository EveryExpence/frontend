import React from "react";
import { View, Text, Dimensions } from "react-native";
import { formatCurrency } from "@/utils/formatCurrency";
import { Account } from "@/types/data/account";

const { width } = Dimensions.get("window");

export type AccountWithComputed = Account & { computedBalance: number };

interface AccountPageProps {
  account: AccountWithComputed;
}

export const AccountPage: React.FC<AccountPageProps> = ({ account }) => {
  return (
    <View style={{ width, padding: 24 }}>
      <Text className="text-4xl mb-6 mt-28 text-center text-[#03060D] dark:text-white">
        {account.name}
      </Text>
      <Text className="text-6xl mt-4 text-center text-[#03060D] dark:text-white">
        {formatCurrency(
          account.computedBalance ?? account.balance,
          account.currency,
        )}
      </Text>
    </View>
  );
};
